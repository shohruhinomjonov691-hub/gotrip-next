import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_CATEGORIES } from '../../../apollo/user/query';
import { Categories, Category } from '../../types/category/category';
import { CategoryType } from '../../enums/category.enum';
import { Direction } from '../../enums/common.enum';
import { getImageUrl } from '../../config';
import { useTranslation } from '../../i18n/useTranslation';
import GthSectionState from './GthSectionState';

const CATEGORIES_INPUT = {
	page: 1,
	limit: 20,
	sort: 'categoryOrder',
	direction: Direction.ASC,
	search: { categoryType: CategoryType.TOUR },
};

const VISIBLE = 2;
const AUTOPLAY_MS = 3200;

const GthCategories = () => {
	const { t } = useTranslation();
	const stageRef = useRef<HTMLDivElement>(null);
	const [pos, setPos] = useState(0);
	const [hoverIdx, setHoverIdx] = useState<number | null>(null);
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const dragRef = useRef({ down: false, sx: 0, dragged: 0 });

	const { loading, error, data } = useQuery<{ getCategories: Categories }>(GET_CATEGORIES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: CATEGORIES_INPUT },
	});
	const categories: Category[] = data?.getCategories?.list ?? [];
	const N = categories.length;

	// Reset to a valid slide whenever the fetched list size changes (e.g. loads in after mount).
	useEffect(() => {
		setPos((p) => (N === 0 ? 0 : p % N));
	}, [N]);

	const step = useCallback(() => {
		const stageEl = stageRef.current;
		const cs = stageEl ? getComputedStyle(stageEl) : null;
		const cw = parseFloat(cs?.getPropertyValue('--cw') || '') || 260;
		const gap = parseFloat(cs?.getPropertyValue('--cgap') || '') || 26;
		return cw + gap;
	}, []);

	// Queries the DOM directly by data-index instead of keeping a parallel ref
	// array in sync with categories.map — simpler and avoids ref/state races.
	const layout = useCallback(() => {
		const stageEl = stageRef.current;
		if (!stageEl || N === 0) return;
		const s = step();
		const half = Math.floor(N / 2);
		const items = Array.from(stageEl.querySelectorAll<HTMLDivElement>('.cat-item'));

		items.forEach((el) => {
			const i = Number(el.dataset.index);
			let d = i - pos;
			if (d > half) d -= N;
			if (d < -half) d += N;

			const x = d * s;
			const ty = Math.min(d * d * 17, 95);
			const rot = d * 3.6;
			const sc = 1 - Math.min(Math.abs(d) * 0.035, 0.12);
			const vis = Math.abs(d) <= VISIBLE;
			const isHv = i === hoverIdx;
			const lift = isHv ? -22 : 0;
			const hsc = isHv ? sc + 0.045 : sc;

			el.style.transform = `translateX(calc(-50% + ${x}px)) translateY(${ty + lift}px) rotate(${isHv ? 0 : rot}deg) scale(${hsc})`;
			el.style.opacity = vis ? '1' : '0';
			el.style.zIndex = String(isHv ? 20 : 10 - Math.abs(d));
			el.style.pointerEvents = vis ? 'auto' : 'none';
			el.classList.toggle('hovered', isHv);
		});
	}, [pos, hoverIdx, step, N]);

	useEffect(() => {
		layout();
	}, [layout]);

	const go = useCallback((n: number) => setPos(N === 0 ? 0 : ((n % N) + N) % N), [N]);

	const play = useCallback(() => {
		if (timerRef.current) clearInterval(timerRef.current);
		if (N < 2) return;
		timerRef.current = setInterval(() => setPos((p) => (p + 1) % N), AUTOPLAY_MS);
	}, [N]);
	const stop = useCallback(() => {
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
	}, []);

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

	const onPointerDown = (e: React.PointerEvent) => {
		dragRef.current = { down: true, sx: e.clientX, dragged: 0 };
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
		const s = step();
		if (Math.abs(dragRef.current.dragged) > s * 0.18) {
			go(dragRef.current.dragged < 0 ? pos + 1 : pos - 1);
		}
		if (hoverIdx === null) play();
		setTimeout(() => {
			dragRef.current.dragged = 0;
		}, 250);
	};

	return (
		<section className="cats-sec">
			<div className="pattern" />
			<div className="rings">
				<span />
				<span />
				<span />
				<span />
			</div>
			<div className="wrap cat-head">
				<span className="eyebrow">{t('Wonderful Place For You')}</span>
				<h2>{t('Tour Categories')}</h2>
			</div>
			<div
				className="cat-stage"
				id="catStage"
				ref={stageRef}
				onPointerDown={onPointerDown}
				onPointerMove={onPointerMove}
				onPointerUp={endDrag}
				onPointerCancel={endDrag}
				onMouseLeave={() => {
					setHoverIdx(null);
					play();
				}}
				style={{ cursor: 'grab', touchAction: 'pan-y' }}
			>
				<GthSectionState
					absolute
					loading={loading && N === 0}
					error={!!error && N === 0}
					empty={!loading && !error && N === 0}
					loadingText={t('Loading categories…')}
					emptyText={t('No tour categories yet — check back soon.')}
				/>
				{categories.map((cat, i) => (
					<Link
						className="cat-item"
						href={`/tour?category=${cat.categoryKey}`}
						key={cat._id}
						data-index={i}
						onMouseEnter={() => {
							setHoverIdx(i);
							stop();
						}}
						onMouseLeave={() => setHoverIdx(null)}
					>
						<div className="cat-ph">
							{cat.categoryImage && <img alt={cat.categoryName} loading="lazy" src={getImageUrl(cat.categoryImage)} />}
							{/* Decorative open-badge that rides the arch on hover/active. */}
							<span aria-hidden="true" className="cat-badge">
								<svg viewBox="0 0 24 24">
									<path d="M8 16L16 8M16 8h-6M16 8v6" />
								</svg>
							</span>
						</div>
						<div className="cat-name">{cat.categoryName}</div>
						<span className="cat-more">
							{t('Read More')}
							<svg aria-hidden="true" viewBox="0 0 24 24">
								<path d="M5 12h13M13 6l6 6-6 6" />
							</svg>
						</span>
					</Link>
				))}
			</div>
			{N > 0 && (
				<div className="cat-dots" id="catDots">
					{categories.map((cat, i) => (
						<button
							aria-label={cat.categoryName}
							className={i === pos ? 'on' : ''}
							key={cat._id}
							onClick={() => {
								go(i);
								play();
							}}
						/>
					))}
				</div>
			)}
		</section>
	);
};

export default GthCategories;
