/**
 * Parses the `[[GOTRIP_RECS]]{...}[[/GOTRIP_RECS]]` block the backend's
 * PromptBuilderService (RECOMMENDATION_FORMAT_INSTRUCTIONS) instructs the
 * model to append after its prose. This is the one place that convention is
 * decoded — AIMessage.content stays a plain string end to end (no schema
 * change), so the block has to be parsed out of the text on the frontend
 * instead of arriving as structured data.
 */

export type GoTripAIRecommendationType = 'tour' | 'destination' | 'guide' | 'article' | 'notice';

export interface GoTripAIRecommendation {
	type: GoTripAIRecommendationType;
	id: string;
	title: string;
	location?: string;
	price?: number;
	category?: string;
}

const OPEN_MARKER = '[[GOTRIP_RECS]]';
const CLOSE_MARKER = '[[/GOTRIP_RECS]]';

const VALID_TYPES: ReadonlySet<string> = new Set(['tour', 'destination', 'guide', 'article', 'notice']);

function isRecommendation(value: unknown): value is GoTripAIRecommendation {
	if (!value || typeof value !== 'object') return false;
	const item = value as Record<string, unknown>;
	return typeof item.id === 'string' && item.id.length > 0 && typeof item.title === 'string' && VALID_TYPES.has(String(item.type));
}

/**
 * Splits raw assistant content into the visible prose and any parsed
 * recommendations. While the closing marker hasn't arrived yet (mid-stream),
 * `text` is truncated at the opening marker so the raw JSON is never flashed
 * to the traveller, and `items` stays empty until the block is complete.
 */
export function parseGoTripAIContent(raw: string): { text: string; items: GoTripAIRecommendation[] } {
	const openIndex = raw.indexOf(OPEN_MARKER);
	if (openIndex === -1) return { text: raw, items: [] };

	const text = raw.slice(0, openIndex).trimEnd();
	const closeIndex = raw.indexOf(CLOSE_MARKER, openIndex);
	if (closeIndex === -1) return { text, items: [] };

	const jsonSlice = raw.slice(openIndex + OPEN_MARKER.length, closeIndex);
	try {
		const parsed = JSON.parse(jsonSlice) as { items?: unknown[] };
		const items = Array.isArray(parsed.items) ? parsed.items.filter(isRecommendation).slice(0, 5) : [];
		return { text, items };
	} catch {
		return { text, items: [] };
	}
}
