import { BoardArticleCategory } from '../enums/board-article.enum';

/**
 * Human-readable, translatable label for each BoardArticleCategory value —
 * the single source of truth for "category browse/filter" UI (community
 * index tabs, article detail's "Browse" sidebar). Pass the label through
 * `t()` at the call site; this file only maps enum -> translation key, it
 * never renders anything itself. The internal enum values stay exactly as
 * the backend expects — only this display label is different from them.
 *
 * Not to be confused with `TAG_META` in `homepage-html/ArticleCard.tsx`,
 * which is a deliberately different, shorter badge-style label for the same
 * enum (e.g. "NEWS" vs "News") — that distinction is intentional (a compact
 * pill tag vs. a full category name) and is preserved, not merged.
 */
export const ARTICLE_CATEGORY_LABELS: Record<BoardArticleCategory, string> = {
	[BoardArticleCategory.FREE]: 'Traveller notes',
	[BoardArticleCategory.RECOMMEND]: 'Recommendations',
	[BoardArticleCategory.NEWS]: 'News',
	[BoardArticleCategory.HUMOR]: 'Light moments',
};
