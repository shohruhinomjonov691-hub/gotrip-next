/**
 * Regression tests for GoTrip AI account isolation and guest chat state.
 * Network is a hand-driven ApolloLink: every operation stays pending until the
 * test resolves it, so "late" responses can be delivered after an identity
 * change / New chat exactly when the bug would bite. No real backend or AI call.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { ApolloClient, ApolloLink, ApolloProvider, InMemoryCache, Observable } from '@apollo/client';
import { userVar, socketVar } from '../../../../apollo/store';
import { useGoTripAIState } from '../useGoTripAI';

jest.mock('next/router', () => ({ useRouter: () => ({ pathname: '/' }) }));
jest.mock('../../../messagingSocket', () => ({ ensureMessagingSocket: jest.fn() }));
jest.mock('../../../i18n/useTranslation', () => {
	// Stable references (the hook memoizes on `t`); `T:` prefix proves a string went through translation.
	const t = (key, opts) => `T:${key}${opts?.count !== undefined ? `|${opts.count}` : ''}`;
	const value = { t, i18n: { language: 'en' } };
	return { useTranslation: () => value };
});

global.IS_REACT_ACT_ENVIRONMENT = true;

const ACTIVE_ID_KEY = 'gotrip-ai-active-conversation-v2';
const ACTIVE_OWNER_KEY = 'gotrip-ai-active-conversation-owner';
const GENERIC_ERROR = 'T:GoTrip AI could not respond just now. Please try again.';

let pending;
let client;
let root;
let result;

const asMember = (_id) => ({ ...userVar(), _id });

const flush = () => act(async () => {
	await new Promise((resolve) => setTimeout(resolve, 0));
});

/** Pending operations with this name, oldest first. */
const ops = (name) => pending.filter((p) => p.operation.operationName === name);

const respond = async (entry, data) => {
	pending.splice(pending.indexOf(entry), 1);
	await act(async () => {
		entry.observer.next({ data });
		entry.observer.complete();
	});
	await flush();
};

const fail = async (entry, message) => {
	pending.splice(pending.indexOf(entry), 1);
	await act(async () => {
		entry.observer.error(new Error(message));
	});
	await flush();
};

const aiMessage = (overrides = {}) => ({
	_id: 'msg-1',
	conversationId: 'chatA',
	memberId: 'A',
	role: 'ASSISTANT',
	content: 'reply',
	status: 'COMPLETE',
	createdAt: new Date().toISOString(),
	...overrides,
});

const conversationList = (title, id) => ({
	getGoTripAIConversations: {
		list: [{ _id: id, title, status: 'ACTIVE', messageCount: 2, lastMessageAt: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
		metaCounter: [{ total: 1 }],
	},
});

const setIdentity = async (id) => {
	await act(async () => {
		userVar(asMember(id));
	});
	await flush();
};

/** Starts a send and returns once it is in flight — never awaits the (deliberately pending) network reply. */
const send = async (text) => {
	await act(async () => {
		result.current.sendMessage(text);
	});
	await flush();
};

beforeEach(async () => {
	window.localStorage.clear();
	pending = [];
	client = new ApolloClient({
		cache: new InMemoryCache({ addTypename: false }),
		link: new ApolloLink((operation) => new Observable((observer) => {
			pending.push({ operation, observer });
		})),
	});
	userVar(asMember(''));
	socketVar(null);
	result = { current: null };
	const Probe = () => {
		result.current = useGoTripAIState();
		return null;
	};
	root = createRoot(document.createElement('div'));
	await act(async () => {
		root.render(<ApolloProvider client={client}><Probe /></ApolloProvider>);
	});
	await flush();
});

afterEach(async () => {
	await act(async () => root.unmount());
});

describe('account isolation (authenticated)', () => {
	it('drops A\'s late reply, list and conversation id after switching to B, and loads B\'s own list', async () => {
		await setIdentity('A');
		const listA = ops('GetGoTripAIConversations')[0];
		await send('hello from A');
		const sendA = ops('SendGoTripAIMessage')[0];
		expect(sendA).toBeDefined();

		await setIdentity('B');
		const listsInFlight = ops('GetGoTripAIConversations');
		expect(listsInFlight).toHaveLength(2); // B's refetch is its own request, not deduplicated onto A's
		const listB = listsInFlight[1];
		expect(result.current.isSending).toBe(false);

		await respond(sendA, { sendGoTripAIMessage: aiMessage({ content: 'secret reply for A' }) });
		await respond(listA, conversationList('A secret title', 'chatA'));

		expect(result.current.activeConversation.id).toBe('draft');
		expect(result.current.activeConversation.messages).toEqual([]);
		expect(result.current.conversations).toEqual([]);
		expect(window.localStorage.getItem(ACTIVE_ID_KEY)).toBeNull();
		expect(ops('GetGoTripAIConversations')).toEqual([listB]); // A's reply did not trigger a list refresh either

		await respond(listB, conversationList('B chat', 'chatB'));
		expect(result.current.conversations.map((c) => c.title)).toEqual(['B chat']);
	});

	it('drops a late reply and a late error after logout', async () => {
		await setIdentity('A');
		await send('first');
		const sendA = ops('SendGoTripAIMessage')[0];

		await setIdentity('');
		await respond(sendA, { sendGoTripAIMessage: aiMessage() });
		expect(result.current.isGuest).toBe(true);
		expect(result.current.activeConversation.messages).toEqual([]);
		expect(window.localStorage.getItem(ACTIVE_ID_KEY)).toBeNull();

		await setIdentity('A');
		await send('second');
		const sendA2 = ops('SendGoTripAIMessage')[0];
		await setIdentity('');
		await fail(sendA2, 'network down');
		expect(result.current.activeConversation.messages).toEqual([]);
	});

	it('ignores stream frames from a previous identity\'s socket', async () => {
		const socket = new EventTarget();
		socket.readyState = WebSocket.OPEN;
		await act(async () => {
			socketVar(socket);
		});
		await setIdentity('A');
		await send('stream please');
		expect(ops('StreamGoTripAIMessage')).toHaveLength(1);

		await setIdentity('B');
		await act(async () => {
			socket.dispatchEvent(new MessageEvent('message', {
				data: JSON.stringify({ event: 'gotripAiStream', conversationId: 'chatA', messageId: 'm1', delta: 'A private delta', done: false }),
			}));
		});
		expect(result.current.activeConversation.messages).toEqual([]);
	});

	it('resumes only the stored conversation its owner saved', async () => {
		window.localStorage.setItem(ACTIVE_ID_KEY, 'chatA');
		window.localStorage.setItem(ACTIVE_OWNER_KEY, 'A');

		await setIdentity('B');
		expect(result.current.activeConversation.id).toBe('draft');
		expect(ops('GetGoTripAIMessages')).toHaveLength(0);

		// A real logout clears the pointer (verified below), so re-seed it as A's own before A signs in.
		await setIdentity('');
		expect(window.localStorage.getItem(ACTIVE_ID_KEY)).toBeNull();
		window.localStorage.setItem(ACTIVE_ID_KEY, 'chatA');
		window.localStorage.setItem(ACTIVE_OWNER_KEY, 'A');
		await setIdentity('A');
		expect(result.current.activeConversation.id).toBe('chatA');
		expect(ops('GetGoTripAIMessages')).toHaveLength(1);
	});

	it('New chat during an authenticated send frees the input and keeps the old reply out', async () => {
		await setIdentity('A');
		await send('old question');
		const oldSend = ops('SendGoTripAIMessage')[0];

		await act(async () => result.current.startNewConversation());
		expect(result.current.isSending).toBe(false);

		await respond(oldSend, { sendGoTripAIMessage: aiMessage({ content: 'old reply' }) });
		expect(result.current.activeConversation.id).toBe('draft');
		expect(result.current.activeConversation.messages).toEqual([]);
	});
});

describe('guest chat', () => {
	it('pending request -> New chat -> resend: old reply and old finally do not leak into the new chat', async () => {
		await send('first question');
		const first = ops('SendGoTripAIGuestMessage')[0];
		expect(result.current.isSending).toBe(true);

		await act(async () => result.current.startNewConversation());
		expect(result.current.isSending).toBe(false);
		expect(result.current.isTyping).toBe(false);

		await send('second question');
		const second = ops('SendGoTripAIGuestMessage').find((p) => p.operation.variables.input.content === 'second question');
		expect(second).toBeDefined();
		expect(second).not.toBe(first);
		expect(second.operation.variables.input.history).toEqual([]);

		await respond(first, { sendGoTripAIGuestMessage: { role: 'ASSISTANT', content: 'stale answer', status: 'COMPLETE' } });
		expect(result.current.isSending).toBe(true); // old finally must not clear the new request's state
		expect(result.current.activeConversation.messages.map((m) => m.content)).toEqual(['second question']);

		await respond(second, { sendGoTripAIGuestMessage: { role: 'ASSISTANT', content: 'fresh answer', status: 'COMPLETE' } });
		expect(result.current.isSending).toBe(false);
		expect(result.current.activeConversation.messages.map((m) => m.content)).toEqual(['second question', 'fresh answer']);
	});

	it('sends history but never currentPage', async () => {
		await send('q1');
		await respond(ops('SendGoTripAIGuestMessage')[0], { sendGoTripAIGuestMessage: { role: 'ASSISTANT', content: 'a1', status: 'COMPLETE' } });
		await send('q2');

		const input = ops('SendGoTripAIGuestMessage')[0].operation.variables.input;
		expect(input).not.toHaveProperty('currentPage');
		expect(input.history).toEqual([
			{ role: 'USER', content: 'q1' },
			{ role: 'ASSISTANT', content: 'a1' },
		]);
	});

	it('shows a translated error for a FAILED reply, never the backend wording', async () => {
		await send('q');
		await respond(ops('SendGoTripAIGuestMessage')[0], {
			sendGoTripAIGuestMessage: { role: 'SYSTEM', content: 'GoTrip AI could not generate a reply just now. (internal detail)', status: 'FAILED' },
		});

		const last = result.current.activeConversation.messages.at(-1);
		expect(last).toMatchObject({ role: 'system', content: GENERIC_ERROR });
		expect(JSON.stringify(result.current.activeConversation.messages)).not.toContain('internal detail');
	});

	it('maps transport errors to translated messages without internal details', async () => {
		await send('q');
		await fail(ops('SendGoTripAIGuestMessage')[0], 'ThrottlerException: Too Many Requests');
		await send('q2');
		await fail(ops('SendGoTripAIGuestMessage')[0], 'connect ECONNREFUSED 10.0.0.5:3007');

		const notes = result.current.activeConversation.messages.filter((m) => m.role === 'system').map((m) => m.content);
		expect(notes).toEqual([
			"T:You're sending messages too quickly. Please wait a minute and try again.",
			GENERIC_ERROR,
		]);
	});

	it('drops a pending guest reply when the user logs in, and does not migrate the guest chat', async () => {
		await send('guest question');
		const guestSend = ops('SendGoTripAIGuestMessage')[0];

		await setIdentity('A');
		await respond(guestSend, { sendGoTripAIGuestMessage: { role: 'ASSISTANT', content: 'guest answer', status: 'COMPLETE' } });

		expect(result.current.isGuest).toBe(false);
		expect(result.current.activeConversation.messages).toEqual([]);
		expect(ops('SendGoTripAIMessage')).toHaveLength(0);
	});
});
