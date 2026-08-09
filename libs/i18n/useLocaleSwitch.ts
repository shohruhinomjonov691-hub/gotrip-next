import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

/**
 * The single source of truth for which locales the app supports. `id` is the
 * actual next-i18next/Next.js routing locale (must match next-i18next.config.js
 * and public/locales/<id>); `code`/`label` are purely for display and are free
 * to differ from `id` (e.g. Korean's routing id is `ko`, its badge stays `KR`).
 */
export const LOCALES = [
	{ id: 'en', code: 'EN', label: 'English' },
	{ id: 'uz', code: 'UZ', label: "O'zbekcha" },
	{ id: 'ko', code: 'KR', label: '한국어' },
	{ id: 'ru', code: 'RU', label: 'Русский' },
] as const;

const STORAGE_KEY = 'locale';
const isSupportedLocale = (value: string | null | undefined): value is string =>
	!!value && LOCALES.some((locale) => locale.id === value);

/**
 * Locale selection + persistence, shared by every language switcher in the
 * app (desktop nav, mobile nav, home header).
 *
 * Persistence: the choice is written to localStorage on every change, and to
 * the `NEXT_LOCALE` cookie automatically by `router.push(..., { locale })` —
 * two independent, standard persistence layers.
 *
 * Startup loading: once the router has fully hydrated (`router.isReady`), if
 * a previously saved locale differs from the locale the current page
 * actually rendered with (`router.locale`), this replaces the current route
 * with the same path under the saved locale. This is what makes "the app
 * starts in the last-selected language" true — without it, only the
 * switcher's own UI would show the saved language as selected while the page
 * content stayed in whatever locale it was served in. `next-i18next.config.js`
 * has `localeDetection: false`, so Next.js will not do this automatically;
 * this hook is the mechanism that replaces it. The `router.isReady` guard
 * matters: acting on `router.locale`/`router.pathname` before the router has
 * hydrated can silently no-op the replace instead of navigating.
 */
export const useLocaleSwitch = () => {
	const router = useRouter();
	const [lang, setLang] = useState<string>(router.locale ?? 'en');

	useEffect(() => {
		if (typeof window === 'undefined' || !router.isReady) return;

		let saved: string | null = null;
		try {
			saved = localStorage.getItem(STORAGE_KEY);
		} catch {
			/* localStorage unavailable (private mode, quota) — falls through to router.locale */
		}

		if (isSupportedLocale(saved) && saved !== router.locale) {
			setLang(saved);
			router.replace({ pathname: router.pathname, query: router.query }, router.asPath, { locale: saved });
			return;
		}

		const resolved = isSupportedLocale(saved) ? saved : (router.locale ?? 'en');
		setLang(resolved);
		try {
			localStorage.setItem(STORAGE_KEY, resolved);
		} catch {
			/* non-fatal — persistence just won't survive this session */
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router.isReady, router.locale]);

	const changeLang = useCallback(
		async (nextLang: string) => {
			if (!isSupportedLocale(nextLang)) return;
			setLang(nextLang);
			try {
				localStorage.setItem(STORAGE_KEY, nextLang);
			} catch {
				/* non-fatal */
			}
			await router.push(router.asPath, router.asPath, { locale: nextLang });
		},
		[router],
	);

	return { lang, changeLang };
};

export default useLocaleSwitch;
