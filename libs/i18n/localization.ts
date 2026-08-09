/**
 * Generic content-localization helper — the single place "pick the right
 * language for this field" happens, shared by every translatable entity
 * (Tour, Destination, Category, Notice, BoardArticle, and any future content
 * type). The backend only stores and transmits the full `translations` array;
 * selecting which entry to show for the active UI language happens here.
 *
 * A translation entry only needs to override the fields it actually has —
 * missing, null, empty-string or empty-array values transparently fall back
 * to the entity's own base (source-language) field.
 */

/** Shape every entity's translation entries share: a locale tag plus a partial override of that entity's own fields. */
export type TranslationEntry<T> = { locale: string } & Partial<T>;

const isEmptyValue = (value: unknown): boolean =>
	value === undefined ||
	value === null ||
	(typeof value === 'string' && value.trim() === '') ||
	(Array.isArray(value) && value.length === 0);

/**
 * Returns `entity[field]` localized to `locale` if a matching, non-empty
 * translation exists, otherwise the entity's own base field — for any
 * entity shape that carries a `translations?: TranslationEntry<T>[]` array.
 */
export function getLocalizedField<T extends object, K extends keyof T>(
	entity: T & { translations?: TranslationEntry<T>[] | null },
	field: K,
	locale: string,
): T[K] {
	const match = entity.translations?.find((entry) => entry.locale === locale);
	const value = match ? match[field] : undefined;
	return (isEmptyValue(value) ? entity[field] : value) as T[K];
}

/**
 * Returns a shallow copy of `entity` with every field in `fields` replaced by
 * its localized value — convenient when a component reads several
 * translatable fields off the same entity (e.g. title + description).
 */
export function localizeEntity<T extends object, K extends keyof T>(
	entity: T & { translations?: TranslationEntry<T>[] | null },
	fields: K[],
	locale: string,
): T {
	const localized = { ...entity };
	for (const field of fields) {
		localized[field] = getLocalizedField(entity, field, locale);
	}
	return localized;
}
