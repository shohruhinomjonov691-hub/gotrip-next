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
let retry = 0;
let closedByApp = false;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

/** 1s → 2s → 4s → 8s, capped at 10s, so a long outage doesn't hammer the server. */
const backoffMs = () => Math.min(1000 * 2 ** retry, 10000);

const connect = () => {
	if (typeof window === 'undefined') return;
	if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return;
	if (!getJwtToken()) return; /* Signed out — nothing to listen for. */

	/* In production with no REACT_APP_API_WS configured, resolveWsUrl already logged the
	   misconfiguration once — retrying a connection that can never succeed would just be
	   noise, so skip it entirely instead of scheduling a doomed reconnect loop. */
	const base = resolveWsUrl();
	if (!base) return;

	try {
		socket = new WebSocket(`${base}?token=${getJwtToken()}`);
	} catch {
		scheduleReconnect();
		return;
	}

	/* Publish immediately so consumers bind their listener to this instance. */
	socketVar(socket);

	socket.onopen = () => {
		retry = 0;
		/* Consumers re-read on the next frame; the open itself is also a signal
		   that anything missed while offline should be refetched. */
		window.dispatchEvent(new CustomEvent('gt-socket-open'));
	};

	socket.onclose = () => {
		if (closedByApp) return;
		scheduleReconnect();
	};

	socket.onerror = () => {
		try {
			socket?.close();
		} catch {
			/* close() on an already-dead socket is not actionable. */
		}
	};
};

const scheduleReconnect = () => {
	if (reconnectTimer) return; /* One timer at a time — avoids a reconnect storm. */
	const delay = backoffMs();
	retry += 1;
	reconnectTimer = setTimeout(() => {
		reconnectTimer = null;
		connect();
	}, delay);
};

/** Idempotent — safe to call from every consumer's mount effect. */
export const ensureMessagingSocket = (): void => {
	closedByApp = false;
	connect();
};

/** Called on logout so a signed-out tab stops reconnecting. */
export const closeMessagingSocket = (): void => {
	closedByApp = true;
	if (reconnectTimer) {
		clearTimeout(reconnectTimer);
		reconnectTimer = null;
	}
	try {
		socket?.close();
	} catch {
		/* Already closed. */
	}
	socket = null;
};
