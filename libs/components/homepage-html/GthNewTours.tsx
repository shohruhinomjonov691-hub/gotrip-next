import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import TourCard from './TourCard';
import GthSectionState from './GthSectionState';
import { GET_TOURS } from '../../../apollo/user/query';
import { LIKE_TARGET_TOUR } from '../../../apollo/user/mutation';
import { Tour, Tours } from '../../types/tour/tour';
import { Direction, Message } from '../../enums/common.enum';
import { useTranslation } from '../../i18n/useTranslation';
import { userVar } from '../../../apollo/store';
import { sweetErrorHandling } from '../../sweetAlert';

const TOURS_INPUT = {
	page: 1,
	limit: 6,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

/** Pointer travel (px) beyond which the gesture counts as a drag, not a click. */
const DRAG_SLOP = 6;

const GthNewTours = () => {
	const { t } = useTranslation();
	const scrollRef = useRef<HTMLDivElement>(null);
	const [activeDot, setActiveDot] = useState(0);
	const [maxDot, setMaxDot] = useState(0);
	const [grabbing, setGrabbing] = useState(false);
	const dragRef = useRef({ down: false, sx: 0, sl: 0, moved: 0, captured: false });

	const user = useReactiveVar(userVar);
	const [likeTargetTour] = useMutation(LIKE_TARGET_TOUR);

	const { loading, error, data, refetch } = useQuery<{ getTours: Tours }>(GET_TOURS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: TOURS_INPUT },
	});
	const tours: Tour[] = data?.getTours?.list ?? [];

	/** Same persist-through-GraphQL pattern as the Tour list page — see TourCard's
	 *  onLike doc comment. Without this the heart only toggled local state here. */
	const likeHandler = async (tourId: string) => {
		try {
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetTour({ variables: { tourId } });
			await refetch({ input: TOURS_INPUT });
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

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
		const max = Math.max(0, Math.round((el.scrollWidth - el.clientWidth) / s));
		const idx = Math.min(Math.round(el.scrollLeft / s), max);
		setMaxDot(max);
		setActiveDot(idx);
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
	}, [sync, tours.length]);

	const goToDot = (i: number) => {
		const el = scrollRef.current;
		const s = step();
		if (!el || !s) return;
		el.scrollTo({ left: i * s, behavior: 'smooth' });
	};

	const onPointerDown = (e: React.PointerEvent) => {
		if (e.pointerType === 'touch') return;
		const el = scrollRef.current;
		if (!el) return;
		dragRef.current = { down: true, sx: e.clientX, sl: el.scrollLeft, moved: 0, captured: false };
		setGrabbing(true);
		el.style.scrollSnapType = 'none';
		/* Capture is deliberately NOT taken here. Capturing on the scroller
		   retargets the following `click` to the scroller, so the card's <a>
		   never receives it and the tour never opens. Capture starts only once
		   the pointer has actually travelled (see onPointerMove). */
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
			el.style.scrollSnapType = 'x mandatory';
			if (dragRef.current.captured && e && el.hasPointerCapture(e.pointerId)) {
				el.releasePointerCapture(e.pointerId);
			}
		}
		dragRef.current.captured = false;
		setTimeout(() => {
			dragRef.current.moved = 0;
		}, 250);
	};
	const onClickCapture = (e: React.MouseEvent) => {
		if (dragRef.current.moved > DRAG_SLOP) {
			e.preventDefault();
			e.stopPropagation();
		}
	};

	return (
		<section className="nt-sec">
			<div className="doodle" />
			<div className="wrap nt-head">
				<span className="eyebrow">{t('Just Added')}</span>
				<h2>{t('New Tours')}</h2>
				<p>{t('The newest routes published by our guide agents. Swipe or drag sideways to see them all.')}</p>
			</div>
			<div className="wrap">
				<div
					className={grabbing ? 'nt-scroll grabbing' : 'nt-scroll'}
					id="ntScroll"
					onClickCapture={onClickCapture}
					onPointerCancel={endDrag}
					onPointerDown={onPointerDown}
					onPointerMove={onPointerMove}
					onPointerUp={endDrag}
					ref={scrollRef}
				>
					<GthSectionState
						loading={loading && tours.length === 0}
						error={!!error && tours.length === 0}
						empty={!loading && !error && tours.length === 0}
						loadingText={t('Loading tours…')}
						emptyText={t('No tours published yet — check back soon.')}
					/>
					{tours.map((tour) => (
						<TourCard key={tour._id} onLike={likeHandler} tour={tour} />
					))}
				</div>
				{tours.length > 0 && (
					<div className="nt-dots" id="ntDots">
						{tours.map((tour, i) => (
							<button
								aria-label={String(i + 1)}
								className={i === activeDot ? 'on' : ''}
								key={tour._id}
								onClick={() => goToDot(i)}
								style={{ display: i <= maxDot ? undefined : 'none' }}
							/>
						))}
					</div>
				)}
			</div>
		</section>
	);
};

export default GthNewTours;
