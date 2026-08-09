/**
 * GoTrip AI — shared frontend types.
 *
 * Phase 4.1 scope: UI only. Nothing here calls a real AI provider — see
 * `useGoTripAI.ts` for the single, clearly-marked stub that Phase 4.2 will
 * replace with a real streaming call. Everything else (message shape,
 * conversation shape, provider contract) is designed so that swap is the
 * only change required.
 */

/** Who a message is attributed to. 'system' is reserved for transparent,
 *  non-conversational notices (e.g. "not connected yet") — never used to
 *  fake an AI answer. */
export type GoTripAIRole = 'user' | 'assistant' | 'system';

export interface GoTripAIMessageData {
	id: string;
	role: GoTripAIRole;
	content: string;
	createdAt: number;
	/** True while content is still being appended (streaming/typing reveal). */
	streaming?: boolean;
}

export interface GoTripAIConversation {
	id: string;
	title: string;
	messages: GoTripAIMessageData[];
	createdAt: number;
	updatedAt: number;
}

export interface GoTripAISuggestion {
	/** Translation key for the label AND the icon lookup — see SUGGESTION_ICON_MAP. */
	key: string;
}

/**
 * Content sources GoTrip AI will be able to ground its answers in once a
 * provider is connected (Phase 4.2). Not wired to any query yet — this only
 * gives the request-shaping code below somewhere real to slot each source in,
 * so Phase 4.2 is "fill in the fetchers", not "invent the plumbing".
 */
export type GoTripAIContextSource = 'tours' | 'articles' | 'guides' | 'faq' | 'notices';

/**
 * The provider-agnostic request/response contract, mirroring the backend's
 * TranslationProvider pattern (apps/gotrip-api .../translation/providers) —
 * same "one interface, swappable implementations" shape, applied here to
 * chat instead of translation. Phase 4.2 implements this once (OpenAI,
 * Claude, Gemini, ...) and nothing above this file needs to change.
 */
export interface GoTripAIRequest {
	conversationId: string;
	messages: GoTripAIMessageData[];
	/** Which of the 5 context sources to ground the reply in; UI-selectable later, unused today. */
	contextSources?: GoTripAIContextSource[];
	locale: string;
}

export interface GoTripAIStreamChunk {
	delta: string;
	done: boolean;
}

export interface GoTripAIProvider {
	readonly name: string;
	/** Streaming contract Phase 4.2 fills in — the message/typing UI already renders incremental `delta`s. */
	streamReply(request: GoTripAIRequest, onChunk: (chunk: GoTripAIStreamChunk) => void): Promise<void>;
}
