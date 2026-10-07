import { socketVar } from '../apollo/store';
import { getJwtToken } from './auth';
import { resolveWsUrl } from './config';

/**
 * Self-healing WebSocket for realtime message delivery.
 *
 * BUG THIS FIXES (reproduced in the browser): the messaging channel used to be
 * the socket created inside Apollo's `LoggingWebSocket`, i.e. the transport
 * owned by subscriptions-transport-ws. The app defines no GraphQL
 * subscriptions, so that client has nothing to keep alive and never reconnects
 * after a drop. Verified by restarting the API: the sender's tab kept working,
 * but the receiver's tab stopped receiving messages entirely and only recovered
 * on a full page reload.
 *
 * Messaging now owns its socket. `socketVar` remains the published handle, so
 * MessagesCenter and Chat are unchanged — they just now observe a socket that
 * comes back on its own.
 *
 * MongoDB is still the source of truth: a frame only tells the client to
 * re-read, so a gap during a disconnect costs nothing — the reconnect triggers
 * a refetch and any messages sent while offline appear then.
 */

let socket: WebSocket | null = null;
/* The JWT the current socket was opened with — compared, never logged. A
   change (login, logout, account switch) means the open socket authenticates
   someone else, so it is replaced instead of reused. */
let socketToken: string | null = null;
let retry = 0;
let closedByApp = false;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
/* Member id the SERVER says a socket belongs to (the gateway's `connected`
   frame, sent after it authenticated the token). Until that frame arrives a
   socket is not treated as anyone's. */
const confirmedOwners = new WeakMap<WebSocket, string>();

/** 1s → 2s → 4s → 8s, capped at 10s, so a long outage doesn't hammer the server. */
const backoffMs = () => Math.min(1000 * 2 ** retry, 10000);

/** Closes the current socket without triggering a reconnect and unpublishes it. */
const dropSocket = () => {
	const old = socket;
	socket = null;
	socketToken = null;
	if (reconnectTimer) {
		clearTimeout(reconnectTimer);
		reconnectTimer = null;
	}
	try {
		old?.close();
	} catch {
		/* Already closed. */
	}
	if (old && socketVar() === old) socketVar(null as unknown as WebSocket);
};

const connect = () => {
	if (typeof window === 'undefined') return;
	const token = getJwtToken() || null;
	if (socket && socketToken !== token) dropSocket(); /* Identity changed — never keep a socket authenticated as someone else. */
	if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return;
	if (!token) return; /* Signed out — nothing to listen for. */

	/* In production with no REACT_APP_API_WS configured, resolveWsUrl already logged the
	   misconfiguration once — retrying a connection that can never succeed would just be
	   noise, so skip it entirely instead of scheduling a doomed reconnect loop. */
	const base = resolveWsUrl();
	if (!base) return;

	let ws: WebSocket;
	try {
		ws = new WebSocket(`${base}?token=${token}`);
	} catch {
		scheduleReconnect();
		return;
	}
	socket = ws;
	socketToken = token;

	/* Publish immediately so consumers bind their listener to this instance. */
	socketVar(ws);

	/* Every handler ignores events from a socket that has since been replaced, so
	   a closing old-identity socket can neither reconnect nor confirm an owner. */
	ws.addEventListener('message', (event: MessageEvent) => {
		if (ws !== socket) return;
		try {
			const frame = JSON.parse(event.data);
			if (frame?.event === 'connected' && frame.memberData?._id) confirmedOwners.set(ws, String(frame.memberData._id));
		} catch {
			/* Not JSON — not ours to interpret. */
		}
	});

	ws.onopen = () => {
		if (ws !== socket) return;
		retry = 0;
		/* Consumers re-read on the next frame; the open itself is also a signal
		   that anything missed while offline should be refetched. */
		window.dispatchEvent(new CustomEvent('gt-socket-open'));
	};

	ws.onclose = () => {
		if (ws !== socket || closedByApp) return;
		scheduleReconnect();
	};

	ws.onerror = () => {
		try {
			ws.close();
		} catch {
			/* close() on an already-dead socket is not actionable. */
		}
	};
};

/**
 * True only for the current, open socket whose owner the server has confirmed
 * as `memberId`. GoTrip AI streams over a socket only when this holds and
 * otherwise falls back to the plain (non-streaming) mutation.
 */
export const isSocketReadyFor = (ws: WebSocket | null | undefined, memberId: string): boolean =>
	!!ws && !!memberId && ws === socket && ws.readyState === WebSocket.OPEN && confirmedOwners.get(ws) === memberId;

const scheduleReconnect = () => {
	if (reconnectTimer) return; /* One timer at a time — avoids a reconnect storm. */
	const delay = backoffMs();
	retry += 1;
	reconnectTimer = setTimeout(() => {
		reconnectTimer = null;
		connect();
	}, delay);
};

/** Idempotent — safe to call from every consumer's mount effect, and again after a login/logout/account switch (a changed token replaces the socket). */
export const ensureMessagingSocket = (): void => {
	closedByApp = false;
	connect();
};

/** Called on logout so a signed-out tab stops reconnecting. */
export const closeMessagingSocket = (): void => {
	closedByApp = true;
	dropSocket();
};
