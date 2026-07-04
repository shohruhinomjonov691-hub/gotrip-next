import { useEffect, useRef } from 'react';

/**
 * Scroll-reveal companion for the `.gt-reveal` foundation utility
 * (scss/foundation/_utilities.scss).
 *
 * Usage:
 *   const ref = useScrollReveal<HTMLDivElement>();
 *   <div ref={ref} className="gt-reveal">…</div>
 *
 * Adds `is-inview` once when the element enters the viewport. Under
 * `prefers-reduced-motion` (or when IntersectionObserver is unavailable)
 * the class is applied immediately, so content is never hidden.
 */
export const useScrollReveal = <T extends HTMLElement = HTMLElement>(threshold = 0.15) => {
	const ref = useRef<T | null>(null);

	useEffect(() => {
		const node = ref.current;
		if (!node) return;

		const reduceMotion =
			typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		if (reduceMotion || typeof IntersectionObserver === 'undefined') {
			node.classList.add('is-inview');
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add('is-inview');
						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold, rootMargin: '0px 0px -8% 0px' },
		);

		observer.observe(node);
		return () => observer.disconnect();
	}, [threshold]);

	return ref;
};

export default useScrollReveal;
