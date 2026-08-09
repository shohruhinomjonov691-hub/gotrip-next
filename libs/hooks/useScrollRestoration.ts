import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

/**
 * Restores exact scroll position on back/forward navigation across the app,
 * while every other kind of navigation (Link click, router.push, direct
 * load) always starts at the top.
 *
 * These two cases must be told apart explicitly — `router.beforePopState`
 * fires only for browser Back/Forward (it does not fire for `router.push`),
 * so it flags a navigation as "pop" before `routeChangeStart`/`Complete` run
 * for it. Without that flag, restoring "wherever this path was last left"
 * on every arrival means clicking Home after having previously scrolled the
 * Home page lands mid-page instead of at the Hero — which is the bug this
 * hook exists to avoid.
 *
 * The scroll position itself is saved to sessionStorage (keyed by path) on
 * every route change, regardless of navigation kind, since a push away is
 * exactly the moment a later pop back to this path needs a position to
 * restore. The save key comes from a locally-tracked "current path" ref, not
 * `router.asPath` read live inside the `routeChangeStart` handler — for a
 * pop navigation the browser has already rewritten the URL (and therefore
 * `router.asPath`) to the *destination* before that handler runs, so reading
 * it live saves the outgoing page's scroll under the destination's key and
 * clobbers whatever was previously saved there. Tracking the path ourselves,
 * updated only once a navigation actually completes, keeps "the page we're
 * leaving" and "the page we're arriving at" from being conflated.
 *
 * Restoration retries across a few animation frames since async content
 * (images, GraphQL data) can still be growing the page height after the
 * route has technically "completed".
 *
 * Every jump here uses the `{ behavior: 'instant' }` object form of
 * `scrollTo`, not the positional `scrollTo(x, y)` form — `html` carries a
 * global `scroll-behavior: smooth` (scss/foundation/_base.scss), which the
 * positional form inherits. Landing on a saved position should be an
 * instant teleport, not a visible multi-hundred-pixel scroll animation that
 * the next retry (80ms later) would interrupt and restart anyway.
 */
const STORAGE_KEY = 'gt-scroll-positions';
const MAX_ENTRIES = 40;
const RESTORE_ATTEMPTS = 25;
const RESTORE_INTERVAL_MS = 120;

type PositionMap = Record<string, number>;

const readMap = (): PositionMap => {
	if (typeof window === 'undefined') return {};
	try {
		const raw = window.sessionStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as PositionMap) : {};
	} catch {
		return {};
	}
};

const writeMap = (map: PositionMap) => {
	try {
		window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map));
	} catch {
		/* sessionStorage unavailable (private mode, quota) — scroll just won't persist */
	}
};

const savePosition = (key: string, y: number) => {
	const map = readMap();
	map[key] = y;
	const keys = Object.keys(map);
	if (keys.length > MAX_ENTRIES) delete map[keys[0]];
	writeMap(map);
};

export const useScrollRestoration = () => {
	const router = useRouter();
	const restoreTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	/* Set by beforePopState, consumed by the next routeChangeComplete. Not
	 * component state — it must survive without triggering a re-render, and
	 * only ever needs to be read once, synchronously, by this same effect. */
	const isPopNavigation = useRef(false);
	/* The path currently on screen, maintained independently of
	 * `router.asPath` — see the module comment above for why. */
	const currentPath = useRef(router.asPath);

	useEffect(() => {
		if (typeof window === 'undefined' || !('scrollRestoration' in window.history)) return;

		const previousMode = window.history.scrollRestoration;
		window.history.scrollRestoration = 'manual';

		const clearRestoreTimer = () => {
			if (restoreTimer.current) {
				clearTimeout(restoreTimer.current);
				restoreTimer.current = null;
			}
		};

		const attemptRestore = (targetY: number, attemptsLeft: number) => {
			if (attemptsLeft <= 0) return;
			window.scrollTo({ top: targetY, left: 0, behavior: 'instant' });
			const reached = Math.abs(window.scrollY - targetY) < 2;
			const canReach = document.documentElement.scrollHeight - window.innerHeight >= targetY - 2;
			if (reached || (canReach && attemptsLeft <= 1)) return;
			restoreTimer.current = setTimeout(() => attemptRestore(targetY, attemptsLeft - 1), RESTORE_INTERVAL_MS);
		};

		/* Next.js Pages Router calls this only for browser Back/Forward
		 * (including programmatic history.back()/forward()) — never for
		 * router.push/replace or <Link> clicks. Returning true lets the
		 * navigation proceed as normal; this only observes it. */
		const handleBeforePopState = () => {
			isPopNavigation.current = true;
			return true;
		};

		const handleRouteChangeStart = () => {
			clearRestoreTimer();
			savePosition(currentPath.current, window.scrollY);
		};

		const handleRouteChangeComplete = (url: string) => {
			const wasPopNavigation = isPopNavigation.current;
			isPopNavigation.current = false;
			clearRestoreTimer();

			const key = url.split('#')[0];
			currentPath.current = key;

			if (!wasPopNavigation) {
				window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
				return;
			}

			const map = readMap();
			const saved = map[key] ?? map[url];
			if (typeof saved === 'number' && saved > 0) {
				attemptRestore(saved, RESTORE_ATTEMPTS);
			} else {
				window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
			}
		};

		/* A cancelled/failed route change (routeChangeError) must not leave a
		 * stale "pop" flag armed for whatever navigation happens next. */
		const handleRouteChangeError = () => {
			isPopNavigation.current = false;
			clearRestoreTimer();
		};

		router.beforePopState(handleBeforePopState);
		router.events.on('routeChangeStart', handleRouteChangeStart);
		router.events.on('routeChangeComplete', handleRouteChangeComplete);
		router.events.on('routeChangeError', handleRouteChangeError);

		return () => {
			clearRestoreTimer();
			window.history.scrollRestoration = previousMode;
			router.beforePopState(() => true);
			router.events.off('routeChangeStart', handleRouteChangeStart);
			router.events.off('routeChangeComplete', handleRouteChangeComplete);
			router.events.off('routeChangeError', handleRouteChangeError);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
};

export default useScrollRestoration;
