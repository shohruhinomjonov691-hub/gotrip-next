import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_DESTINATIONS } from '../../../apollo/user/query';
import { Destination, Destinations } from '../../types/destination/destination';
import { Direction } from '../../enums/common.enum';
import { getImageUrl } from '../../config';
import { useTranslation } from '../../i18n/useTranslation';
import GthSectionState from './GthSectionState';

const DESTINATIONS_INPUT = {
	page: 1,
	limit: 20,
	sort: 'destinationRank',
	direction: Direction.DESC,
	search: {},
};

const AUTOPLAY_MS = 3000;

const visCount = () => {
	if (typeof window === 'undefined') return 4;
	const w = window.innerWidth;
	if (w <= 640) return 2;
	if (w <= 900) return 3;
	return 4;
};

const GthDestinations = () => {
	const { t } = useTranslation();
	const railRef = useRef<HTMLDivElement>(null);
	const [start, setStart] = useState(0);
	const [hover, setHover] = useState<number | null>(null);
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const dragRef = useRef({ down: false, sx: 0, dragged: 0 });

	const { loading, error, data } = useQuery<{ getDestinations: Destinations }>(GET_DESTINATIONS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: DESTINATIONS_INPUT },
	});
	const destinations: Destination[] = data?.getDestinations?.list ?? [];
	const N = destinations.length;

	const rel = useCallback((i: number) => (N === 0 ? 0 : (i - start + N) % N), [start, N]);

	const layout = useCallback(() => {
		const railEl = railRef.current;
		if (!railEl || N === 0) return;
		const VIS = visCount();
		const cards = Array.from(railEl.querySelectorAll<HTMLDivElement>('.td-card'));

		let act = cards.findIndex((_, i) => rel(i) === VIS - 1);
		if (hover !== null && rel(hover) < VIS) act = hover;

		cards.forEach((c, i) => {
			const d = rel(i);
			c.style.order = String(d);
			c.classList.toggle('hid', d >= VIS);
			c.classList.toggle('on', i === act);
		});
	}, [rel, hover, N]);

	useEffect(() => {
		layout();
	}, [layout]);

	useEffect(() => {
		setStart((s) => (N === 0 ? 0 : s % N));
	}, [N]);

	const stop = useCallback(() => {
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
	}, []);
	const play = useCallback(() => {
		stop();
		if (N < 2) return;
		timerRef.current = setInterval(() => setStart((s) => (s + 1) % N), AUTOPLAY_MS);
	}, [stop, N]);

	useEffect(() => {
		play();
		return stop;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [play]);

	useEffect(() => {
		const onResize = () => layout();
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	}, [layout]);

	const onCardEnter = (i: number) => {
		setHover(i);
		stop();
	};
	const onRailLeave = () => {
		setHover(null);
		play();
	};

	const onPointerDown = (e: React.PointerEvent) => {
		dragRef.current = { down: true, sx: e.clientX, dragged: 0 };
		setHover(null);
		stop();
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
	};
	const onPointerMove = (e: React.PointerEvent) => {
		if (!dragRef.current.down) return;
		dragRef.current.dragged = e.clientX - dragRef.current.sx;
	};
	const endDrag = () => {
		if (!dragRef.current.down) return;
		dragRef.current.down = false;
		const railEl = railRef.current;
		const cardW = railEl ? railEl.clientWidth / visCount() : 0;
		const steps = cardW ? Math.round(-dragRef.current.dragged / (cardW * 0.6)) : 0;
		if (steps !== 0 && N > 0) setStart((s) => (s + steps + N * 10) % N);
		play();
		setTimeout(() => {
			dragRef.current.dragged = 0;
		}, 250);
	};

	return (
		<section className="td-sec">
			<div className="topo" />
			<span className="deco d1">🛂</span>
			<span className="deco d2">👒</span>
			<span className="deco d3">🛟</span>
			<span className="deco d4">🧭</span>
			<div className="wrap td-head">
				<span className="eyebrow">{t('Top Destination')}</span>
				<h2>{t('Popular Destination')}</h2>
			</div>
			<div className="wrap">
				<div
					className="td-rail"
					id="tdRail"
					ref={railRef}
					onPointerDown={onPointerDown}
					onPointerMove={onPointerMove}
					onPointerUp={endDrag}
					onPointerCancel={endDrag}
					onMouseLeave={onRailLeave}
					style={{ cursor: 'grab', touchAction: 'pan-y' }}
				>
					<GthSectionState
						absolute
						loading={loading && N === 0}
						error={!!error && N === 0}
						empty={!loading && !error && N === 0}
						loadingText={t('Loading destinations…')}
						emptyText={t('No destinations published yet — check back soon.')}
					/>
					{destinations.map((dest, i) => (
						<div
							className="td-card"
							data-i={i}
							key={dest._id}
							onMouseEnter={() => onCardEnter(i)}
							onFocus={() => onCardEnter(i)}
						>
							<img alt={dest.destinationTitle} loading="lazy" src={getImageUrl(dest.destinationThumbnail)} />
							{dest.destinationSeason && <span className="td-season">{dest.destinationSeason}</span>}
							<div className="td-vert">
								<b>{dest.destinationTitle}</b>
								<span>{t('{{count}} Listing', { count: dest.tourCount ?? 0 })}</span>
							</div>
							<div className="td-open">
								<div>
									<div className="nm">{dest.destinationTitle}</div>
									<div className="ls">
										{t('{{count}} Listing', { count: dest.tourCount ?? 0 })} ·{' '}
										{dest.destinationHighlights?.length
											? dest.destinationHighlights.join(', ')
											: `${dest.destinationCity}, ${dest.destinationCountry}`}
									</div>
								</div>
								<Link className="view" href={`/tour?destination=${dest._id}`}>
									{t('View All')}
									<svg className="ico" viewBox="0 0 24 24">
										<path d="M5 12h14M13 6l6 6-6 6" />
									</svg>
								</Link>
							</div>
						</div>
					))}
				</div>
				<div className="td-cta">
					<Link className="btn" href="/tour" style={{ background: 'var(--ink-solid)', color: '#fff', padding: '15px 32px' }}>
						{t('View All Destinations')}{' '}
						<span className="ar">
							<svg className="ico" viewBox="0 0 24 24">
								<path d="M5 12h14M13 6l6 6-6 6" />
							</svg>
						</span>
					</Link>
				</div>
			</div>
		</section>
	);
};

export default GthDestinations;
