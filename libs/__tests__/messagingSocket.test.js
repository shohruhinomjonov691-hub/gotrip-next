/**
 * Socket identity: a changed token replaces the socket, a replaced socket can
 * neither reconnect nor confirm an owner, and a socket is "ready" for a member
 * only after the server's `connected` frame names that member.
 * Fake WebSocket class only — no network.
 */

jest.mock('../auth', () => ({ getJwtToken: jest.fn() }));
jest.mock('../config', () => ({ resolveWsUrl: () => 'ws://gotrip.test' }));

class FakeWebSocket extends EventTarget {
	static CONNECTING = 0;
	static OPEN = 1;
	static CLOSING = 2;
	static CLOSED = 3;
	static instances = [];

	constructor(url) {
		super();
		this.url = url;
		this.readyState = FakeWebSocket.CONNECTING;
		this.closeCalls = 0;
		FakeWebSocket.instances.push(this);
	}

	open() {
		this.readyState = FakeWebSocket.OPEN;
		this.onopen?.();
	}

	serverSays(payload) {
		this.dispatchEvent(new MessageEvent('message', { data: JSON.stringify(payload) }));
	}

	close() {
		this.closeCalls += 1;
		this.readyState = FakeWebSocket.CLOSED;
		this.onclose?.();
	}
}

let auth;
let store;
let messaging;

const connectedAs = (ws, memberId) => ws.serverSays({ event: 'connected', totalClients: 1, memberData: { _id: memberId, memberNick: memberId } });

beforeEach(() => {
	jest.useFakeTimers();
	jest.resetModules();
	FakeWebSocket.instances = [];
	global.WebSocket = FakeWebSocket;
	auth = require('../auth');
	store = require('../../apollo/store');
	messaging = require('../messagingSocket');
});

afterEach(() => {
	jest.useRealTimers();
});

it('is ready for a member only once open AND confirmed by the server as that member', () => {
	auth.getJwtToken.mockReturnValue('token-A');
	messaging.ensureMessagingSocket();
	const ws = FakeWebSocket.instances[0];
	expect(store.socketVar()).toBe(ws);

	expect(messaging.isSocketReadyFor(ws, 'A')).toBe(false); // connecting
	ws.open();
	expect(messaging.isSocketReadyFor(ws, 'A')).toBe(false); // open but unconfirmed
	connectedAs(ws, 'A');
	expect(messaging.isSocketReadyFor(ws, 'A')).toBe(true);
	expect(messaging.isSocketReadyFor(ws, 'B')).toBe(false);
	expect(messaging.isSocketReadyFor(ws, '')).toBe(false);
});

it('replaces the socket when the token changes, and the old socket can neither reconnect nor confirm', () => {
	auth.getJwtToken.mockReturnValue('token-A');
	messaging.ensureMessagingSocket();
	const socketA = FakeWebSocket.instances[0];
	socketA.open();
	connectedAs(socketA, 'A');

	auth.getJwtToken.mockReturnValue('token-B');
	messaging.ensureMessagingSocket();

	expect(FakeWebSocket.instances).toHaveLength(2);
	const socketB = FakeWebSocket.instances[1];
	expect(socketA.closeCalls).toBe(1);
	expect(store.socketVar()).toBe(socketB);
	expect(socketB.url).toContain('token-B');
	expect(messaging.isSocketReadyFor(socketA, 'A')).toBe(false); // no longer the current socket

	// A late frame on the replaced socket must not confirm anything.
	connectedAs(socketA, 'B');
	expect(messaging.isSocketReadyFor(socketB, 'B')).toBe(false);

	// Its close must not have scheduled a reconnect.
	jest.advanceTimersByTime(30000);
	expect(FakeWebSocket.instances).toHaveLength(2);

	socketB.open();
	connectedAs(socketB, 'B');
	expect(messaging.isSocketReadyFor(socketB, 'B')).toBe(true);
});

it('keeps the same socket when the token has not changed (idempotent)', () => {
	auth.getJwtToken.mockReturnValue('token-A');
	messaging.ensureMessagingSocket();
	FakeWebSocket.instances[0].open();
	messaging.ensureMessagingSocket();
	messaging.ensureMessagingSocket();
	expect(FakeWebSocket.instances).toHaveLength(1);
});

it('closes and unpublishes the socket after logout (token gone)', () => {
	auth.getJwtToken.mockReturnValue('token-A');
	messaging.ensureMessagingSocket();
	const socketA = FakeWebSocket.instances[0];
	socketA.open();

	auth.getJwtToken.mockReturnValue(null);
	messaging.ensureMessagingSocket();

	expect(socketA.closeCalls).toBe(1);
	expect(store.socketVar()).toBeNull();
	jest.advanceTimersByTime(30000);
	expect(FakeWebSocket.instances).toHaveLength(1);
});

it('still reconnects the current socket after an unexpected drop', () => {
	auth.getJwtToken.mockReturnValue('token-A');
	messaging.ensureMessagingSocket();
	const first = FakeWebSocket.instances[0];
	first.open();
	first.readyState = FakeWebSocket.CLOSED;
	first.onclose();

	jest.advanceTimersByTime(1000);
	expect(FakeWebSocket.instances).toHaveLength(2);
	expect(store.socketVar()).toBe(FakeWebSocket.instances[1]);
});
