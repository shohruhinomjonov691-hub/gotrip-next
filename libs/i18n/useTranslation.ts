import { useTranslation as useNextI18nTranslation } from 'next-i18next';

/** The one namespace this project loads today — see next-i18next.config.js
 *  and public/locales/<locale>/common.json. */
export const DEFAULT_NAMESPACE = 'common';

/**
 * Project-level translation hook. Thin wrapper around next-i18next's
 * `useTranslation`, defaulted to this app's single namespace so call sites
 * don't need to repeat `useTranslation('common')` everywhere.
 *
 * Usage: `const { t } = useTranslation();`
 *
 * Existing components that already call `useTranslation('common')` directly
 * from `next-i18next` are untouched by this addition — this hook is the
 * recommended path for new code, not a forced migration.
 */
export const useTranslation = (namespace: string | string[] = DEFAULT_NAMESPACE) => useNextI18nTranslation(namespace);

export default useTranslation;
