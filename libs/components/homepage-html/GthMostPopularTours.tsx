import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@apollo/client';
import TourCard from './TourCard';
import GthSectionState from './GthSectionState';
import { GET_TOURS } from '../../../apollo/user/query';
import { Tour, Tours } from '../../types/tour/tour';
import { Direction } from '../../enums/common.enum';
import { useTranslation } from '../../i18n/useTranslation';

const TOURS_INPUT = {
	page: 1,
	limit: 6,
	sort: 'tourRank',
	direction: Direction.DESC,
	search: {},
};

const SPEED = 26; // px/s

const GthMostPopularTours = () => {
	const { t } = useTranslation();
	const viewportRef = useRef<HTMLDivElement>(null);
	const trackRef = useRef<HTMLDivElement>(null);
	const [focusIdx, setFocusIdx] = useState<number | null>(null);
	const [dragging, setDragging] = useState(false);

	const { loading, error, data } = useQuery<{ getTours: Tours }>(GET_TOURS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: TOURS_INPUT },
	});
	const tours: Tour[] = data?.getTours?.list ?? [];
	const HALF = tours.length;
	const loopTours = useMemo(() => [...tours, ...tours], [tours]);

	const stateRef = useRef({ x: 0, loopW: 0, step: 0, last: 0, paused: false, hoverIdx: null as number | null });
	const dragRef = useRef({ down: false, sx: 0, startX: 0, moved: 0 });
	const rafRef = useRef<number | null>(null);

	const metrics = useCallback(() => {
		const trackEl = trackRef.current;
		const cs = trackEl ? getComputedStyle(trackEl) : null;
		const cw = parseFloat(cs?.getPropertyValue('--mcw') || '') || 330;
		const gap = parseFloat(cs?.getPropertyValue('--mgap') || '') || 24;
		stateRef.current.loopW = HALF * (cw + gap);
		stateRef.current.step = cw + gap;
	}, [HALF]);

	const applyTransform = useCallback(() => {
		if (trackRef.current) {
			trackRef.current.style.transform = `translate3d(${stateRef.current.x}px,0,0)`;
		}
	}, []);

	const highlight = useCallback(() => {
		const s = stateRef.current;
		if (s.hoverIdx !== null) {
			setFocusIdx(s.hoverIdx);
			return;
		}
		const vp = viewportRef.current;
		if (!vp || !s.step) return;
		const mid = vp.clientWidth / 2;
		let best = -1;
		let bestD = Infinity;
		for (let i = 0; i < loopTours.length; i++) {
			const cx = s.x + i * s.step + s.step / 2;
			const d = Math.abs(cx - mid);
			if (d < bestD) {
				bestD = d;
				best = i;
			}
		}
		setFocusIdx(best);
	}, [loopTours.length]);

	useEffect(() => {
		if (HALF === 0) return;
		metrics();
		highlight();
		let tick = 0;
		const frame = (t: number) => {
			const s = stateRef.current;
			if (!s.last) s.last = t;
			const dt = Math.min((t - s.last) / 1000, 0.05);
			s.last = t;
			if (!s.paused) {
				s.x -= SPEED * dt;
				if (s.x <= -s.loopW) s.x += s.loopW;
				applyTransform();
				tick++;
				if (tick % 5 === 0) highlight();
			}
			rafRef.current = requestAnimationFrame(frame);
		};
		rafRef.current = requestAnimationFrame(frame);

		const onResize = () => {
			metrics();
			highlight();
		};
		window.addEventListener('resize', onResize);
		const onVisibility = () => {
			stateRef.current.paused = document.hidden || stateRef.current.hoverIdx !== null;
			stateRef.current.last = 0;
		};
		document.addEventListener('visibilitychange', onVisibility);

		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
			window.removeEventListener('resize', onResize);
			document.removeEventListener('visibilitychange', onVisibility);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [HALF]);

	const onCardEnter = (i: number) => {
		stateRef.current.hoverIdx = i;
		stateRef.current.paused = true;
		highlight();
	};
	const onCardLeave = () => {
		stateRef.current.hoverIdx = null;
		highlight();
	};

	const onPointerDown = (e: React.PointerEvent) => {
		dragRef.current = { down: true, sx: e.clientX, startX: stateRef.current.x, moved: 0 };
		stateRef.current.paused = true;
		setDragging(true);
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
	};
	const onPointerMove = (e: React.PointerEvent) => {
		if (!dragRef.current.down) return;
		const d = e.clientX - dragRef.current.sx;
		dragRef.current.moved = Math.abs(d);
		const s = stateRef.current;
		s.x = dragRef.current.startX + d;
		while (s.x <= -s.loopW) s.x += s.loopW;
		while (s.x > 0) s.x -= s.loopW;
		applyTransform();
		s.hoverIdx = null;
		highlight();
	};
	const endDrag = () => {
		if (!dragRef.current.down) return;
		dragRef.current.down = false;
		setDragging(false);
		if (stateRef.current.hoverIdx === null) {
			stateRef.current.paused = false;
			stateRef.current.last = 0;
		}
		setTimeout(() => {
			dragRef.current.moved = 0;
		}, 250);
	};
	const onViewportLeave = () => {
		if (!dragRef.current.down) {
			stateRef.current.hoverIdx = null;
			stateRef.current.paused = false;
			stateRef.current.last = 0;
		}
	};
	const onClickCapture = (e: React.MouseEvent) => {
		if (dragRef.current.moved > 6) {
			e.preventDefault();
			e.stopPropagation();
		}
	};

	return (
		<section className="mp-sec">
			<div className="doodle" />
			<div className="wrap mp-head">
				<span className="eyebrow">{t('Best Place For You')}</span>
				<h2>{t('Most Popular Tour')}</h2>
				<p>
					{t(
						'The routes travellers booked most this season — real prices, real seat counts, and a guide agent attached to every one.',
					)}
				</p>
			</div>
			<div
				className={dragging ? 'mp-viewport dragging' : 'mp-viewport'}
				id="mpViewport"
				ref={viewportRef}
				onPointerDown={onPointerDown}
				onPointerMove={onPointerMove}
				onPointerUp={endDrag}
				onPointerCancel={endDrag}
				onMouseLeave={onViewportLeave}
				onClickCapture={onClickCapture}
			>
				<div className="mp-track" id="mpTrack" ref={trackRef}>
					<GthSectionState
						loading={loading && HALF === 0}
						error={!!error && HALF === 0}
						empty={!loading && !error && HALF === 0}
						loadingText={t('Loading tours…')}
						emptyText={t('No tours published yet — check back soon.')}
					/>
					{loopTours.map((tour, i) => (
						<TourCard
							focus={focusIdx === i}
							key={`${tour._id}-${i}`}
							onMouseEnter={() => onCardEnter(i)}
							onMouseLeave={onCardLeave}
							tour={tour}
						/>
					))}
				</div>
			</div>
			<div className="mp-cta">
				<a
					className="btn"
					href="/tour"
					style={{ background: 'var(--ink-solid)', color: '#fff', padding: '15px 32px' }}
				>
					{t('Explore All Tours')}{' '}
					<span className="ar">
						<svg className="ico" viewBox="0 0 24 24">
							<path d="M5 12h14M13 6l6 6-6 6" />
						</svg>
					</span>
				</a>
			</div>
		</section>
	);
};

export default GthMostPopularTours;
