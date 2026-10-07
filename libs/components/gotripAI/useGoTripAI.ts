import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useApolloClient, useMutation, useReactiveVar } from '@apollo/client';
import { useTranslation } from '../../i18n/useTranslation';
import { userVar, socketVar } from '../../../apollo/store';
import { ensureMessagingSocket, isSocketReadyFor } from '../../messagingSocket';
import {
	SEND_GOTRIP_AI_MESSAGE,
	SEND_GOTRIP_AI_GUEST_MESSAGE,
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
/** Which member the stored active id belongs to — a pointer left behind by another account (or a guest session) is never resumed. */
const ACTIVE_OWNER_KEY = 'gotrip-ai-active-conversation-owner';
const MESSAGE_PAGE_SIZE = 100;
const CONVERSATION_LIST_SIZE = 30;

/** Mirror the backend's SendGuestMessageInput limits (libs/dto/conversation/conversation.input.ts). */
export const GUEST_CONTENT_MAX_LENGTH = 1000;
const GUEST_HISTORY_MAX_ITEMS = 10;
const GUEST_HISTORY_CONTENT_MAX_LENGTH = 2000;

const uid = (): string =>
	typeof crypto !== 'undefined' && 'randomUUID' in crypto
		? crypto.randomUUID()
		: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const now = () => Date.now();

const readActiveId = (ownerId: string): string | null => {
	if (typeof window === 'undefined' || !ownerId) return null;
	try {
		if (window.localStorage.getItem(ACTIVE_OWNER_KEY) !== ownerId) return null;
		return window.localStorage.getItem(ACTIVE_ID_KEY);
	} catch {
		return null;
	}
};

const writeActiveId = (id: string | null, ownerId: string) => {
	if (typeof window === 'undefined') return;
	try {
		if (id && ownerId) {
			window.localStorage.setItem(ACTIVE_ID_KEY, id);
			window.localStorage.setItem(ACTIVE_OWNER_KEY, ownerId);
		} else {
			window.localStorage.removeItem(ACTIVE_ID_KEY);
			window.localStorage.removeItem(ACTIVE_OWNER_KEY);
		}
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

/** Turns the guest mutation can't take back as history: failed/system notes and anything still streaming. */
const toGuestHistory = (messages: GoTripAIMessageData[]) =>
	messages
		.filter((m) => (m.role === 'user' || m.role === 'assistant') && !m.streaming && m.content.trim())
		.slice(-GUEST_HISTORY_MAX_ITEMS)
		.map((m) => ({
			role: m.role === 'user' ? 'USER' : 'ASSISTANT',
			content: m.content.slice(0, GUEST_HISTORY_CONTENT_MAX_LENGTH),
		}));

const isRateLimitError = (err: unknown): boolean => /too many requests/i.test((err as Error)?.message ?? '');

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
	const memberId = user?._id ?? '';
	const isLoggedIn = !!memberId;

	const [isOpen, setIsOpen] = useState(false);
	const [panel, setPanel] = useState<GoTripAIPanel>('chat');
	const [conversationSummaries, setConversationSummaries] = useState<GoTripAIConversation[]>([]);
	// The active conversation pointer carries the member it belongs to, so in the
	// render between an identity change and its reset effect the previous
	// account's id already reads as null instead of being queried as the new one.
	const [activePointer, setActivePointer] = useState<{ id: string | null; owner: string }>({ id: null, owner: '' });
	const activeId = activePointer.owner === memberId ? activePointer.id : null;
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
	// Bumped on every login/logout/account switch. Every async result (mutation,
	// query, socket frame) captures it up front and is dropped if it changed —
	// nothing from a previous identity may reach state or localStorage.
	const sessionRef = useRef(0);
	// The authenticated streaming send whose socket frames may currently be
	// rendered: frames must match its session, generation, socket and requestId.
	const pendingStreamRef = useRef<{ session: number; generation: number; requestId: string; socket: WebSocket } | null>(null);
	const memberIdRef = useRef(memberId);
	memberIdRef.current = memberId;

	/** Orphans whatever send is in flight and frees the input; its late result/finally then finds a newer generation and does nothing. */
	const abandonInFlight = useCallback(() => {
		sendGenerationRef.current += 1;
		pendingStreamRef.current = null;
		setIsSending(false);
		setIsTyping(false);
	}, []);

	/** LIFECYCLE **/

	useEffect(() => {
		ensureMessagingSocket();
	}, []);

	/**
	 * Login, logout and account switches all show up here as a change of
	 * memberId (userVar is hydrated from the stored token after mount, so a
	 * signed-in refresh is a ''-> id change too). Every such change drops the
	 * in-memory chat — a guest chat is never carried into an account, and one
	 * account's chat never stays on screen for another — then resumes only a
	 * pointer the new member owns.
	 */
	const previousMemberIdRef = useRef<string | null>(null);
	useEffect(() => {
		const previous = previousMemberIdRef.current;
		previousMemberIdRef.current = memberId;
		if (previous === memberId) return;

		sessionRef.current += 1;
		abandonInFlight(); // orphan any in-flight send (and its pending stream) from the previous identity
		// The token changed with the identity: replace a socket still authenticated
		// as the previous member (or close it on logout). Until the new socket's
		// owner is confirmed by the server, sends use the non-streaming mutation.
		ensureMessagingSocket();
		setActiveMessages([]);
		setConversationSummaries([]);
		setDraft('');
		setPanel('chat');

		// Only a real logout (id -> '') clears storage; the initial '' before
		// userVar hydrates must not, or a signed-in refresh could never resume.
		if (previous && !memberId) writeActiveId(null, '');
		setActivePointer({ id: readActiveId(memberId), owner: memberId });
	}, [memberId, abandonInFlight]);

	useEffect(() => {
		activeIdRef.current = activeId;
	}, [activeId]);

	// Close on route change so navigating away doesn't leave a stale open panel.
	useEffect(() => {
		setIsOpen(false);
	}, [router.pathname]);

	const setActiveId = useCallback(
		(id: string | null) => {
			setActivePointer({ id, owner: memberId });
			writeActiveId(id, memberId);
		},
		[memberId],
	);

	/** CONVERSATION LIST **/

	// Keyed on memberId (not just isLoggedIn) so an A -> B switch refetches B's list.
	const refetchConversations = useCallback(async () => {
		if (!memberId) return;
		const session = sessionRef.current;
		try {
			const { data } = await apolloClient.query({
				query: GET_GOTRIP_AI_CONVERSATIONS,
				variables: { input: { page: 1, limit: CONVERSATION_LIST_SIZE, sort: 'lastMessageAt', direction: 'DESC' } },
				fetchPolicy: 'network-only',
				// Same document + variables for every member: with Apollo's default
				// in-flight deduplication, B's refetch right after an A -> B switch would
				// just reuse A's still-pending request and receive A's list.
				context: { queryDeduplication: false },
			});
			if (sessionRef.current !== session) return; // resolved for a previous identity
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
	}, [apolloClient, memberId]);

	useEffect(() => {
		refetchConversations();
	}, [refetchConversations]);

	/** ACTIVE CONVERSATION HISTORY **/

	useEffect(() => {
		if (!activeId || !memberId) {
			setActiveMessages([]);
			return;
		}
		const session = sessionRef.current;
		let cancelled = false;
		const isStale = () => cancelled || sessionRef.current !== session;
		(async () => {
			try {
				const { data } = await apolloClient.query({
					query: GET_GOTRIP_AI_MESSAGES,
					variables: { input: { conversationId: activeId, page: 1, limit: MESSAGE_PAGE_SIZE, direction: 'ASC' } },
					fetchPolicy: 'network-only',
					context: { queryDeduplication: false }, // per-member data — see refetchConversations
				});
				if (isStale()) return;
				const list = data?.getGoTripAIMessages?.list ?? [];
				setActiveMessages(list.filter((m: any) => m.role !== 'TOOL').map(toUiMessage));
			} catch {
				// Conversation no longer exists / no longer ours (e.g. a stale id from
				// localStorage on another account) — fall back to a fresh, local chat
				// instead of leaving the window stuck on a broken load.
				if (!isStale()) {
					setActiveMessages([]);
					setActiveId(null);
				}
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [activeId, memberId, apolloClient, setActiveId]);

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

			// Only frames of the current identity's in-flight streaming send may
			// render: same session and generation, arriving on the very socket that
			// send chose (still confirmed as this member's), and echoing its
			// requestId. A previous account's socket, a stream abandoned by New
			// chat / a switch, or a turn that already resolved never match.
			const pending = pendingStreamRef.current;
			if (!pending || pending.session !== sessionRef.current || pending.generation !== sendGenerationRef.current) return;
			if (event.target !== pending.socket || !isSocketReadyFor(pending.socket, memberIdRef.current)) return;
			if (frame.requestId !== pending.requestId) return;
			if (stoppedGenerationsRef.current.has(pending.generation)) return; // user hit Stop — ignore further deltas for this turn

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
	const [sendGoTripAIGuestMessage] = useMutation(SEND_GOTRIP_AI_GUEST_MESSAGE);
	const [streamGoTripAIMessage] = useMutation(STREAM_GOTRIP_AI_MESSAGE);
	const [updateGoTripAIConversationMutation] = useMutation(UPDATE_GOTRIP_AI_CONVERSATION);
	const [deleteGoTripAIConversationMutation] = useMutation(DELETE_GOTRIP_AI_CONVERSATION);

	const appendSystemNote = useCallback((content: string) => {
		setActiveMessages((prev) => [...prev, { id: uid(), role: 'system', content, createdAt: now() }]);
	}, []);

	/**
	 * Guest turn: stateless on the backend (nothing persisted), so the chat
	 * lives only in activeMessages and is replayed as `history` each turn.
	 * Lost on refresh by design; never migrated into an account on login.
	 */
	const sendGuestMessage = useCallback(
		async (trimmed: string) => {
			if (trimmed.length > GUEST_CONTENT_MAX_LENGTH) {
				appendSystemNote(
					t('Your message is too long. Please keep it under {{count}} characters.', { count: GUEST_CONTENT_MAX_LENGTH }) as string,
				);
				return;
			}

			const session = sessionRef.current;
			const generation = ++sendGenerationRef.current;
			const isCurrent = () =>
				sessionRef.current === session && sendGenerationRef.current === generation && !stoppedGenerationsRef.current.has(generation);
			const history = toGuestHistory(activeMessages);
			setDraft('');
			setActiveMessages((prev) => [...prev, { id: uid(), role: 'user', content: trimmed, createdAt: now() }]);
			setIsSending(true);
			setIsTyping(true);

			const locale = (i18n.language ?? 'en').split('-')[0];

			try {
				// No currentPage: the backend no longer accepts it from guests (it would land in the SYSTEM prompt).
				const { data } = await sendGoTripAIGuestMessage({
					variables: { input: { content: trimmed, locale, history } },
				});
				const result = data?.sendGoTripAIGuestMessage;
				if (!result) throw new Error('Empty GoTrip AI response');
				if (!isCurrent()) return;

				// A FAILED reply carries the backend's English fallback text — show the
				// translated generic error instead, never the server-side wording.
				const failed = result.status === 'FAILED';
				setActiveMessages((prev) => [
					...prev,
					failed
						? { id: uid(), role: 'system', content: t('GoTrip AI could not respond just now. Please try again.') as string, createdAt: now() }
						: { id: uid(), role: ROLE_FROM_BACKEND[result.role] ?? 'assistant', content: result.content, createdAt: now() },
				]);
			} catch (err) {
				if (!isCurrent()) return;
				appendSystemNote(
					(isRateLimitError(err)
						? t("You're sending messages too quickly. Please wait a minute and try again.")
						: t('GoTrip AI could not respond just now. Please try again.')) as string,
				);
			} finally {
				stoppedGenerationsRef.current.delete(generation);
				if (sessionRef.current === session && sendGenerationRef.current === generation) {
					setIsSending(false);
					setIsTyping(false);
				}
			}
		},
		[activeMessages, i18n.language, sendGoTripAIGuestMessage, appendSystemNote, t],
	);

	const sendMessage = useCallback(
		async (text: string) => {
			const trimmed = text.trim();
			if (!trimmed || isSending) return;

			if (!isLoggedIn) {
				await sendGuestMessage(trimmed);
				return;
			}

			const session = sessionRef.current;
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
			// socket that isn't open AND server-confirmed as this member's falls back to
			// the plain, non-streaming mutation instead.
			const streamSocket = socket && isSocketReadyFor(socket, memberId) ? socket : null;
			const canStream = !!streamSocket;
			if (streamSocket) {
				const requestId = uid();
				input.requestId = requestId;
				pendingStreamRef.current = { session, generation, requestId, socket: streamSocket };
			}

			try {
				const { data } = canStream
					? await streamGoTripAIMessage({ variables: { input } })
					: await sendGoTripAIMessage({ variables: { input } });
				// Resolved after a login/logout/account switch: the reply belongs to the
				// previous identity — touch neither state nor the stored active id.
				if (sessionRef.current !== session) return;
				const result = data?.streamGoTripAIMessage ?? data?.sendGoTripAIMessage;
				if (!result) throw new Error('Empty GoTrip AI response');

				if (stoppedGenerationsRef.current.has(generation)) {
					stoppedGenerationsRef.current.delete(generation);
					return; // user already stopped watching this turn; don't resurrect loading state
				}

				// New chat / another conversation was opened meanwhile: the turn is
				// persisted server-side, so only refresh the list — don't pull the
				// old reply (or its conversation id) into the chat now on screen.
				if (sendGenerationRef.current !== generation) {
					refetchConversations();
					return;
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
				if (sessionRef.current !== session || sendGenerationRef.current !== generation) return;
				appendSystemNote(t('GoTrip AI could not respond just now. Please try again.') as string);
			} finally {
				const pending = pendingStreamRef.current;
				if (pending && pending.session === session && pending.generation === generation) pendingStreamRef.current = null;
				if (sessionRef.current === session && sendGenerationRef.current === generation) {
					setIsSending(false);
					setIsTyping(false);
				}
			}
		},
		[isSending, isLoggedIn, memberId, activeId, i18n.language, socket, streamGoTripAIMessage, sendGoTripAIMessage, setActiveId, refetchConversations, appendSystemNote, t, sendGuestMessage],
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
		abandonInFlight(); // orphan any in-flight send/stream for the conversation being left, and free the input
		setActiveId(null);
		setActiveMessages([]);
		setPanel('chat');
		setDraft('');
	}, [setActiveId, abandonInFlight]);

	const selectConversation = useCallback(
		(id: string) => {
			if (id === activeId) {
				setPanel('chat');
				return;
			}
			abandonInFlight();
			setActiveId(id);
			setPanel('chat');
		},
		[activeId, setActiveId, abandonInFlight],
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
				abandonInFlight();
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
		[isLoggedIn, activeId, setActiveId, deleteGoTripAIConversationMutation, refetchConversations, abandonInFlight],
	);

	const toggleOpen = useCallback(() => setIsOpen((prev) => !prev), []);
	const close = useCallback(() => setIsOpen(false), []);
	const openPanel = useCallback((next: GoTripAIPanel) => setPanel(next), []);

	return {
		locale: i18n.language,
		isGuest: !isLoggedIn,
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
