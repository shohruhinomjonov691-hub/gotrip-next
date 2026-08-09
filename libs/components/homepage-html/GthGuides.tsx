import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@apollo/client';
import GuideCard from './GuideCard';
import GthSectionState from './GthSectionState';
import { GET_AGENTS } from '../../../apollo/user/query';
import { Member, Members } from '../../types/member/member';
import { Direction } from '../../enums/common.enum';
import { useTranslation } from '../../i18n/useTranslation';

const AGENTS_INPUT = {
	page: 1,
	limit: 20,
	sort: 'memberRank',
	direction: Direction.DESC,
	search: {},
};

/** Pointer travel (px) beyond which the gesture counts as a drag, not a click. */
const DRAG_SLOP = 6;

const GthGuides = () => {
	const { t } = useTranslation();
	const scrollRef = useRef<HTMLDivElement>(null);
	const [onIdx, setOnIdx] = useState(0);
	const [activeDot, setActiveDot] = useState(0);
	const [maxDot, setMaxDot] = useState(0);
	const [atStart, setAtStart] = useState(true);
	const [atEnd, setAtEnd] = useState(false);
	const [grabbing, setGrabbing] = useState(false);
	const dragRef = useRef({ down: false, sx: 0, sl: 0, moved: 0, captured: false });

	const { loading, error, data } = useQuery<{ getAgents: Members }>(GET_AGENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: AGENTS_INPUT },
	});
	const guides: Member[] = data?.getAgents?.list ?? [];

	const step = useCallback(() => {
		const el = scrollRef.current;
		if (!el || el.children.length < 2) return 0;
		const a = el.children[0] as HTMLElement;
		const b = el.children[1] as HTMLElement;
		return b.offsetLeft - a.offsetLeft;
	}, []);

	const sync = useCallback(() => {
		const el = scrollRef.current;
		const s = step();
		if (!el || !s) return;
		const maxScroll = el.scrollWidth - el.clientWidth;
		const max = Math.max(0, Math.round(maxScroll / s));
		const idx = Math.min(Math.round(el.scrollLeft / s), max);
		setMaxDot(max);
		setActiveDot(idx);
		setAtStart(el.scrollLeft <= 2);
		setAtEnd(el.scrollLeft >= maxScroll - 2);

		const mid = el.scrollLeft + el.clientWidth / 2;
		const cards = Array.from(el.children) as HTMLElement[];
		let best = 0;
		let bd = Infinity;
		cards.forEach((c, i) => {
			const cx = c.offsetLeft + c.offsetWidth / 2;
			const d = Math.abs(cx - mid);
			if (d < bd) {
				bd = d;
				best = i;
			}
		});
		setOnIdx(best);
	}, [step]);

	useEffect(() => {
		sync();
		const el = scrollRef.current;
		if (!el) return;
		let raf: number | null = null;
		const onScroll = () => {
			if (raf) return;
			raf = requestAnimationFrame(() => {
				raf = null;
				sync();
			});
		};
		el.addEventListener('scroll', onScroll);
		window.addEventListener('resize', sync);
		return () => {
			el.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', sync);
			if (raf) cancelAnimationFrame(raf);
		};
	}, [sync, guides.length]);

	const goToDot = (i: number) => {
		const el = scrollRef.current;
		const s = step();
		if (!el || !s) return;
		el.scrollTo({ left: i * s, behavior: 'smooth' });
	};
	const scrollByStep = (dir: 1 | -1) => {
		const el = scrollRef.current;
		const s = step();
		if (!el || !s) return;
		el.scrollBy({ left: dir * s, behavior: 'smooth' });
	};

	const onPointerDown = (e: React.PointerEvent) => {
		if (e.pointerType === 'touch') return;
		const el = scrollRef.current;
		if (!el) return;
		dragRef.current = { down: true, sx: e.clientX, sl: el.scrollLeft, moved: 0, captured: false };
		setGrabbing(true);
		el.style.scrollSnapType = 'none';
		/* Capture is deliberately NOT taken here — capturing on the scroller
		   retargets the following `click` away from the card, so the guide
		   profile never opens. It starts only once a real drag begins. */
	};
	const onPointerMove = (e: React.PointerEvent) => {
		if (!dragRef.current.down) return;
		const el = scrollRef.current;
		if (!el) return;
		const d = e.clientX - dragRef.current.sx;
		dragRef.current.moved = Math.abs(d);
		if (!dragRef.current.captured && dragRef.current.moved > DRAG_SLOP) {
			dragRef.current.captured = true;
			// Never let a rejected capture (stale/released pointer) abort the drag.
			try {
				el.setPointerCapture(e.pointerId);
			} catch {
				dragRef.current.captured = false;
			}
		}
		el.scrollLeft = dragRef.current.sl - d;
	};
	const endDrag = (e?: React.PointerEvent) => {
		if (!dragRef.current.down) return;
		dragRef.current.down = false;
		setGrabbing(false);
		const el = scrollRef.current;
		if (el) {
			el.style.scrollSnapType = '';
			if (dragRef.current.captured && e && el.hasPointerCapture(e.pointerId)) {
				el.releasePointerCapture(e.pointerId);
			}
		}
		dragRef.current.captured = false;
		/* Cleared on a later tick so the click that follows this pointerup can
		   still see that a drag happened and suppress navigation. */
		setTimeout(() => {
			dragRef.current.moved = 0;
		}, 250);
		sync();
	};

	return (
		<section className="tg-sec">
			<div className="doodle" />
			<div className="wrap tg-head">
				<span className="eyebrow">{t('Meet with Guide')}</span>
				<h2>{t('Meet With Tour Guide')}</h2>
			</div>
			<div className="wrap">
				<div className="tg-stage">
					<div
						className={grabbing ? 'tg-scroll grabbing' : 'tg-scroll'}
						id="tgScroll"
						onPointerCancel={endDrag}
						onPointerDown={onPointerDown}
						onPointerMove={onPointerMove}
						onPointerUp={endDrag}
						ref={scrollRef}
					>
						<GthSectionState
							loading={loading && guides.length === 0}
							error={!!error && guides.length === 0}
							empty={!loading && !error && guides.length === 0}
							loadingText={t('Loading guides…')}
							emptyText={t('No guide agents yet — check back soon.')}
						/>
							{guides.map((guide, i) => (
								<GuideCard
									active={i === onIdx}
									canNavigate={() => dragRef.current.moved <= DRAG_SLOP}
									guide={guide}
									key={guide._id}
								/>
							))}
					</div>
					{guides.length > 0 && (
						<>
							<button
								aria-label={t('Previous') as string}
								className="tg-arrow prev"
								disabled={atStart}
								id="tgPrev"
								onClick={() => scrollByStep(-1)}
							>
								<svg viewBox="0 0 24 24">
									<path d="M15 6l-6 6 6 6" />
								</svg>
							</button>
							<button
								aria-label={t('Next') as string}
								className="tg-arrow next"
								disabled={atEnd}
								id="tgNext"
								onClick={() => scrollByStep(1)}
							>
								<svg viewBox="0 0 24 24">
									<path d="M9 6l6 6-6 6" />
								</svg>
							</button>
						</>
					)}
				</div>
				{guides.length > 0 && (
					<div className="tg-dots" id="tgDots">
						{guides.map((guide, i) => (
							<button
								aria-label={String(i + 1)}
								className={i === activeDot ? 'on' : ''}
								key={guide._id}
								onClick={() => goToDot(i)}
								style={{ display: i <= maxDot ? undefined : 'none' }}
							/>
						))}
					</div>
				)}
				<div className="tg-strip">
					<span>🛟</span>
					<span>👒</span>
					<span>🧭</span>
					<span>📍</span>
					<span>⭐</span>
					<span>📷</span>
					<span>🎫</span>
					<span>🛂</span>
				</div>
			</div>
		</section>
	);
};

export default GthGuides;
