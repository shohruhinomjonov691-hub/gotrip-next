import React, { useEffect, useRef } from 'react';
import { BADGES } from './BadgeIcons';
import { useTranslation } from '../../i18n/useTranslation';

// One set of badges is far narrower than most viewports, so just two copies leave a visible
// blank gap once the first copy scrolls past the edge of the screen — there's nothing behind it
// yet. Rendering enough copies to comfortably exceed the widest realistic viewport keeps the
// strip continuously full no matter how far it has scrolled.
const REPEAT_COUNT = 6;
const LOOP_BADGES = Array.from({ length: REPEAT_COUNT }, () => BADGES).flat();

const GthBadgeMarquee = () => {
	const { t } = useTranslation();
	const trackRef = useRef<HTMLDivElement>(null);

	// A flex track holding two identical sets always has an ODD gap count (2n items -> 2n-1
	// gaps), so a flat `-50%` transform always lands half a gap short of the true repeat
	// point — a permanent seam/jump at the loop boundary. Measuring the exact pixel offset
	// of the first repeated item and driving the keyframe off that (instead of a percentage)
	// fixes it regardless of badge count or width.
	useEffect(() => {
		const track = trackRef.current;
		if (!track || track.children.length < BADGES.length * 2) return;
		const measure = () => {
			// A backgrounded/not-yet-painted tab (hidden tab, bfcache, prerender) lays out
			// everything at 0 — skip committing a bogus shift in that case; the next trigger
			// (resize or visibility change) will measure once real layout is available.
			if (document.hidden) return;
			const repeatStart = track.children[BADGES.length] as HTMLElement | undefined;
			if (repeatStart && repeatStart.offsetLeft > 0) {
				track.style.setProperty('--mq-shift', `${repeatStart.offsetLeft}px`);
			}
		};
		measure();
		window.addEventListener('resize', measure);
		document.addEventListener('visibilitychange', measure);
		return () => {
			window.removeEventListener('resize', measure);
			document.removeEventListener('visibilitychange', measure);
		};
	}, []);

	return (
		<section aria-label={t('Adventure brands') as string} className="mq-sec">
			<div className="mq-track" id="mqTrack" ref={trackRef}>
				{LOOP_BADGES.map((Badge, i) => (
					<span aria-hidden={i >= BADGES.length} className="mq-badge" key={i}>
						<Badge />
					</span>
				))}
			</div>
		</section>
	);
};

export default GthBadgeMarquee;
