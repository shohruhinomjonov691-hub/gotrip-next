import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useApolloClient, useMutation, useReactiveVar } from '@apollo/client';
import { useTranslation } from '../../i18n/useTranslation';
import { userVar, socketVar } from '../../../apollo/store';
import { ensureMessagingSocket } from '../../messagingSocket';
import {
	SEND_GOTRIP_AI_MESSAGE,
	STREAM_GOTRIP_AI_MESSAGE,
	UPDATE_GOTRIP_AI_CONVERSATION,
	DELETE_GOTRIP_AI_CONVERSATION,
} from '../../../apollo/user/mutation';
import { GET_GOTRIP_AI_CONVERSATIONS, GET_GOTRIP_AI_MESSAGES } from '../../../apollo/user/query';
import { GoTripAIConversation, GoTripAIMessageData, GoTripAIRole } from './types';

/** Only the pointer to the active conversation is persisted — messages themselves are
 *  always re-read from the backend (MongoDB is the source of truth, same convention as
 *  the private-messaging feature's socket — see libs/messagingSocket.ts's header comment),
 *  so a stale/tampered localStorage entry can never show fabricated history. */
const ACTIVE_ID_KEY = 'gotrip-ai-active-conversation-v2';
const MESSAGE_PAGE_SIZE = 100;
const CONVERSATION_LIST_SIZE = 30;

const uid = (): string =>
	typeof crypto !== 'undefined' && 'randomUUID' in crypto
		? crypto.randomUUID()
		: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const now = () => Date.now();

const readActiveId = (): string | null => {
	if (typeof window === 'undefined') return null;
	try {
		return window.localStorage.getItem(ACTIVE_ID_KEY);
	} catch {
		return null;
	}
};

const writeActiveId = (id: string | null) => {
	if (typeof window === 'undefined') return;
	try {
		if (id) window.localStorage.setItem(ACTIVE_ID_KEY, id);
		else window.localStorage.removeItem(ACTIVE_ID_KEY);
	} catch {
		// Storage can be full/unavailable (private browsing) — resume-after-refresh
		// simply won't work; the in-memory session still works fine.
	}
};

const ROLE_FROM_BACKEND: Record<string, GoTripAIRole> = { USER: 'user', ASSISTANT: 'assistant', SYSTEM: 'system' };

/** Backend AIMessage -> frontend GoTripAIMessageData. TOOL-role rows (no tool exists yet) are filtered by the caller. */
const toUiMessage = (raw: any): GoTripAIMessageData => ({
	id: raw._id,
	role: ROLE_FROM_BACKEND[raw.role] ?? 'assistant',
	content: raw.content ?? '',
	createdAt: raw.createdAt ? new Date(raw.createdAt).getTime() : now(),
	streaming: raw.status === 'STREAMING',
});

export type GoTripAIPanel = 'chat' | 'history';

/**
 * The actual stateful implementation. Not exported directly — GoTripAIButton
 * and GoTripAIWindow must observe the SAME state (open/closed, active
 * conversation, ...), so this is called exactly once, inside
 * GoTripAIProvider, and shared via context. See GoTripAIProvider.tsx for the
 * public `useGoTripAI()` hook every component actually imports.
 *
 * Phase 4.5: replaces the Phase 4.1 fake-timer placeholder with real
 * GraphQL calls (sendGoTripAIMessage / streamGoTripAIMessage /
 * getGoTripAIConversations / getGoTripAIConversation / getGoTripAIMessages /
 * updateGoTripAIConversation / deleteGoTripAIConversation) and the SAME
 * shared WebSocket private messaging already uses (libs/messagingSocket.ts)
 * for incremental stream chunks — no new transport, no new backend surface.
 * `activeMessages` is the single source of truth for what's rendered; the
 * conversations list is a separate, lighter-weight summary query, exactly
 * mirroring how MessagesCenter.tsx keeps conversation list vs. thread
 * history as two independently-fetched, differently-shaped things.
 */
export const useGoTripAIState = () => {
	const { t, i18n } = useTranslation();
	const router = useRouter();
	const apolloClient = useApolloClient();

	const user = useReactiveVar(userVar);
	const socket = useReactiveVar(socketVar);
	const isLoggedIn = !!user?._id;

	const [isOpen, setIsOpen] = useState(false);
	const [panel, setPanel] = useState<GoTripAIPanel>('chat');
	const [conversationSummaries, setConversationSummaries] = useState<GoTripAIConversation[]>([]);
	const [activeId, setActiveIdState] = useState<string | null>(null);
	const [activeMessages, setActiveMessages] = useState<GoTripAIMessageData[]>([]);
	const [draft, setDraft] = useState('');
	const [isSending, setIsSending] = useState(false);
	const [isTyping, setIsTyping] = useState(false); // true only until the first token/response arrives ("Thinking…")

	// Refs mirror the latest activeId/isSending for the socket listener and the
	// stop button, so that effect can stay subscribed to one socket instance
	// instead of re-attaching a listener on every keystroke-driven re-render.
	const activeIdRef = useRef<string | null>(null);
	const sendGenerationRef = useRef(0); // bumped on every new send / stop / conversation switch — stale async work checks this before touching state
	const stoppedGenerationsRef = useRef<Set<number>>(new Set());

	/** LIFECYCLE **/

	useEffect(() => {
		ensureMessagingSocket();
	}, []);

	useEffect(() => {
		const stored = readActiveId();
		if (stored) setActiveIdState(stored);
		// Only ever hydrate once on mount.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		activeIdRef.current = activeId;
	}, [activeId]);

	// Close on route change so navigating away doesn't leave a stale open panel.
	useEffect(() => {
		setIsOpen(false);
	}, [router.pathname]);

	const setActiveId = useCallback((id: string | null) => {
		setActiveIdState(id);
		writeActiveId(id);
	}, []);

	/** CONVERSATION LIST **/

	const refetchConversations = useCallback(async () => {
		if (!isLoggedIn) return;
		try {
			const { data } = await apolloClient.query({
				query: GET_GOTRIP_AI_CONVERSATIONS,
				variables: { input: { page: 1, limit: CONVERSATION_LIST_SIZE, sort: 'lastMessageAt', direction: 'DESC' } },
				fetchPolicy: 'network-only',
			});
			const list = data?.getGoTripAIConversations?.list ?? [];
			setConversationSummaries(
				list.map((c: any) => ({
					id: c._id,
					title: c.title,
					messages: [],
					createdAt: new Date(c.createdAt).getTime(),
					updatedAt: new Date(c.lastMessageAt ?? c.updatedAt).getTime(),
				})),
			);
		} catch {
			// A failed list refresh shouldn't break the active chat — it just leaves
			// the history panel showing whatever it last successfully loaded.
		}
	}, [apolloClient, isLoggedIn]);

	useEffect(() => {
		refetchConversations();
	}, [refetchConversations]);

	/** ACTIVE CONVERSATION HISTORY **/

	useEffect(() => {
		if (!activeId || !isLoggedIn) {
			setActiveMessages([]);
			return;
		}
		let cancelled = false;
		(async () => {
			try {
				const { data } = await apolloClient.query({
					query: GET_GOTRIP_AI_MESSAGES,
					variables: { input: { conversationId: activeId, page: 1, limit: MESSAGE_PAGE_SIZE, direction: 'ASC' } },
					fetchPolicy: 'network-only',
				});
				if (cancelled) return;
				const list = data?.getGoTripAIMessages?.list ?? [];
				setActiveMessages(list.filter((m: any) => m.role !== 'TOOL').map(toUiMessage));
			} catch {
				// Conversation no longer exists / no longer ours (e.g. a stale id from
				// localStorage on another account) — fall back to a fresh, local chat
				// instead of leaving the window stuck on a broken load.
				if (!cancelled) {
					setActiveMessages([]);
					setActiveId(null);
				}
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [activeId, isLoggedIn, apolloClient, setActiveId]);

	/** STREAMING — shared socket, same one private messaging already keeps alive **/

	useEffect(() => {
		if (!socket) return;
		const handler = (event: MessageEvent) => {
			let frame: any;
			try {
				frame = JSON.parse(event.data);
			} catch {
				return;
			}
			if (frame?.event !== 'gotripAiStream') return;

			const generation = sendGenerationRef.current;
			if (stoppedGenerationsRef.current.has(generation)) return; // user hit Stop — ignore further deltas for this turn

			// A brand-new conversation's id isn't known locally until the mutation
			// resolves, so while activeId is still null this member's own in-flight
			// send is accepted unconditionally; once a conversation is selected,
			// frames for any OTHER conversation (e.g. a stream left running for a
			// chat the user has since switched away from) are ignored.
			if (activeIdRef.current && frame.conversationId !== activeIdRef.current) return;

			setIsTyping(false); // first chunk received — no longer just "thinking"
			setActiveMessages((prev) => {
				const idx = prev.findIndex((m) => m.id === frame.messageId);
				if (idx === -1) {
					if (!frame.delta && frame.done) return prev;
					return [...prev, { id: frame.messageId, role: 'assistant', content: frame.delta ?? '', createdAt: now(), streaming: !frame.done }];
				}
				const next = [...prev];
				next[idx] = { ...next[idx], content: next[idx].content + (frame.delta ?? ''), streaming: !frame.done };
				return next;
			});
		};
		socket.addEventListener('message', handler);
		return () => socket.removeEventListener('message', handler);
	}, [socket]);

	/** DERIVED **/

	const conversations = useMemo(
		() =>
			conversationSummaries.map((c) => ({
				...c,
				// The active conversation's real messages are already loaded; every other
				// row only needs enough to render the history-panel preview line, and the
				// title IS that preview (backend sets it from the first message's opening
				// 48 characters — see ConversationInput/resolveConversation) — no per-item
				// message fetch needed just to populate a preview snippet.
				messages: c.id === activeId ? activeMessages : c.title ? [{ id: `${c.id}-preview`, role: 'user' as GoTripAIRole, content: c.title, createdAt: c.updatedAt }] : [],
			})),
		[conversationSummaries, activeId, activeMessages],
	);

	const activeConversation = useMemo((): GoTripAIConversation => {
		if (!activeId) return { id: 'draft', title: t('New chat') as string, messages: activeMessages, createdAt: now(), updatedAt: now() };
		const summary = conversationSummaries.find((c) => c.id === activeId);
		return {
			id: activeId,
			title: summary?.title ?? (t('New chat') as string),
			messages: activeMessages,
			createdAt: summary?.createdAt ?? now(),
			updatedAt: summary?.updatedAt ?? now(),
		};
	}, [activeId, activeMessages, conversationSummaries, t]);

	const isStreaming = activeMessages.some((m) => m.streaming);

	/** MUTATIONS (GraphQL) **/

	const [sendGoTripAIMessage] = useMutation(SEND_GOTRIP_AI_MESSAGE);
	const [streamGoTripAIMessage] = useMutation(STREAM_GOTRIP_AI_MESSAGE);
	const [updateGoTripAIConversationMutation] = useMutation(UPDATE_GOTRIP_AI_CONVERSATION);
	const [deleteGoTripAIConversationMutation] = useMutation(DELETE_GOTRIP_AI_CONVERSATION);

	const appendSystemNote = useCallback((content: string) => {
		setActiveMessages((prev) => [...prev, { id: uid(), role: 'system', content, createdAt: now() }]);
	}, []);

	const sendMessage = useCallback(
		async (text: string) => {
			const trimmed = text.trim();
			if (!trimmed || isSending) return;

			if (!isLoggedIn) {
				appendSystemNote(t('Please log in to chat with GoTrip AI.') as string);
				return;
			}

			const generation = ++sendGenerationRef.current;
			setDraft('');
			setActiveMessages((prev) => [...prev, { id: uid(), role: 'user', content: trimmed, createdAt: now() }]);
			setIsSending(true);
			setIsTyping(true);

			const locale = (i18n.language ?? 'en').split('-')[0];
			const input: Record<string, unknown> = { content: trimmed, locale };
			if (activeId) input.conversationId = activeId;

			// The socket is what delivers token-by-token deltas; without it connected,
			// streamGoTripAIMessage would still work (the backend streams regardless)
			// but nothing would render until the single final mutation response — so a
			// disconnected socket falls back to the plain, non-streaming mutation
			// instead of silently doing nothing until the whole reply is ready.
			const canStream = socket?.readyState === WebSocket.OPEN;

			try {
				const { data } = canStream
					? await streamGoTripAIMessage({ variables: { input } })
					: await sendGoTripAIMessage({ variables: { input } });
				const result = data?.streamGoTripAIMessage ?? data?.sendGoTripAIMessage;
				if (!result) throw new Error('Empty GoTrip AI response');

				if (stoppedGenerationsRef.current.has(generation)) {
					stoppedGenerationsRef.current.delete(generation);
					return; // user already stopped watching this turn; don't resurrect loading state
				}

				if (!activeId) setActiveId(result.conversationId);

				setActiveMessages((prev) => {
					const idx = prev.findIndex((m) => m.id === result._id);
					const finalMessage: GoTripAIMessageData = {
						id: result._id,
						role: 'assistant',
						content: result.content,
						createdAt: new Date(result.createdAt).getTime(),
						streaming: false,
					};
					if (idx === -1) return [...prev, finalMessage];
					const next = [...prev];
					next[idx] = finalMessage;
					return next;
				});
				refetchConversations();
			} catch {
				if (stoppedGenerationsRef.current.has(generation)) {
					stoppedGenerationsRef.current.delete(generation);
					return;
				}
				appendSystemNote(t('GoTrip AI could not respond just now. Please try again.') as string);
			} finally {
				if (sendGenerationRef.current === generation) {
					setIsSending(false);
					setIsTyping(false);
				}
			}
		},
		[isSending, isLoggedIn, activeId, i18n.language, socket, streamGoTripAIMessage, sendGoTripAIMessage, setActiveId, refetchConversations, appendSystemNote, t],
	);

	/**
	 * Client-side "stop": the backend has no cancellation endpoint (adding one
	 * would be a backend change, out of scope here), so this stops RENDERING
	 * further deltas and immediately frees the input — it does not abort
	 * generation server-side. The turn still finishes and is still persisted;
	 * reopening/switching back to this conversation shows the real final
	 * answer from getGoTripAIMessages, nothing is lost, it just isn't
	 * live-updated on screen after Stop is pressed.
	 */
	const stopStreaming = useCallback(() => {
		const generation = sendGenerationRef.current;
		stoppedGenerationsRef.current.add(generation);
		setIsSending(false);
		setIsTyping(false);
		setActiveMessages((prev) => prev.map((m) => (m.streaming ? { ...m, streaming: false } : m)));
	}, []);

	const sendSuggestion = useCallback((label: string) => sendMessage(label), [sendMessage]);

	const startNewConversation = useCallback(() => {
		sendGenerationRef.current += 1; // orphan any in-flight send/stream for the conversation being left
		setActiveId(null);
		setActiveMessages([]);
		setPanel('chat');
		setDraft('');
	}, [setActiveId]);

	const selectConversation = useCallback(
		(id: string) => {
			if (id === activeId) {
				setPanel('chat');
				return;
			}
			sendGenerationRef.current += 1;
			setActiveId(id);
			setPanel('chat');
		},
		[activeId, setActiveId],
	);

	const renameConversation = useCallback(
		async (id: string, title: string) => {
			const trimmed = title.trim();
			if (!trimmed || !isLoggedIn) return;
			setConversationSummaries((prev) => prev.map((c) => (c.id === id ? { ...c, title: trimmed } : c)));
			try {
				await updateGoTripAIConversationMutation({ variables: { input: { _id: id, title: trimmed } } });
			} catch {
				refetchConversations(); // roll back the optimistic title on failure
			}
		},
		[isLoggedIn, updateGoTripAIConversationMutation, refetchConversations],
	);

	const deleteConversation = useCallback(
		async (id: string) => {
			if (!isLoggedIn) return;
			const wasActive = id === activeId;
			setConversationSummaries((prev) => prev.filter((c) => c.id !== id));
			if (wasActive) {
				sendGenerationRef.current += 1;
				setActiveId(null);
				setActiveMessages([]);
			}
			try {
				await deleteGoTripAIConversationMutation({ variables: { conversationId: id } });
			} catch {
				// If the delete failed server-side, the next list refresh brings it back
				// rather than leaving the UI permanently out of sync with the backend.
			} finally {
				refetchConversations();
			}
		},
		[isLoggedIn, activeId, setActiveId, deleteGoTripAIConversationMutation, refetchConversations],
	);

	const toggleOpen = useCallback(() => setIsOpen((prev) => !prev), []);
	const close = useCallback(() => setIsOpen(false), []);
	const openPanel = useCallback((next: GoTripAIPanel) => setPanel(next), []);

	return {
		locale: i18n.language,
		isOpen,
		toggleOpen,
		close,
		panel,
		openPanel,
		conversations,
		activeConversation,
		draft,
		setDraft,
		isTyping,
		isSending,
		isStreaming,
		stopStreaming,
		sendMessage,
		sendSuggestion,
		startNewConversation,
		selectConversation,
		renameConversation,
		deleteConversation,
	};
};

export type GoTripAIStateValue = ReturnType<typeof useGoTripAIState>;
