import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useTranslation } from '../../i18n/useTranslation';
import GthSectionState from './GthSectionState';
import { GET_TESTIMONIALS } from '../../../apollo/user/query';
import { Testimonial, Testimonials } from '../../types/testimonial/testimonial';
import { Direction } from '../../enums/common.enum';
import { getImageUrl } from '../../config';

const TESTIMONIALS_INPUT = {
	page: 1,
	limit: 6,
	sort: 'testimonialOrder',
	direction: Direction.ASC,
};

const GthTestimonials = () => {
	const { t } = useTranslation();
	const videoRef = useRef<HTMLVideoElement>(null);
	const [videoHidden, setVideoHidden] = useState(false);
	const scrollRef = useRef<HTMLDivElement>(null);
	const [activeIdx, setActiveIdx] = useState(0);
	const [grabbing, setGrabbing] = useState(false);
	const dragRef = useRef({ down: false, sx: 0, sl: 0, moved: 0 });

	const { loading, error, data } = useQuery<{ getTestimonials: Testimonials }>(GET_TESTIMONIALS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: TESTIMONIALS_INPUT },
	});
	const testimonials: Testimonial[] = data?.getTestimonials?.list ?? [];

	useEffect(() => {
		const v = videoRef.current;
		if (!v) return;
		const onError = () => setVideoHidden(true);
		v.addEventListener('error', onError);
		const t = setTimeout(() => {
			if (v.readyState === 0) setVideoHidden(true);
		}, 4000);
		return () => {
			v.removeEventListener('error', onError);
			clearTimeout(t);
		};
	}, []);

	const sync = useCallback(() => {
		const el = scrollRef.current;
		if (!el) return;
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
		setActiveIdx(best);
	}, []);

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
	}, [sync, testimonials.length]);

	const goToDot = (i: number) => {
		const el = scrollRef.current;
		if (!el) return;
		const target = el.children[i] as HTMLElement;
		if (!target) return;
		el.scrollTo({ left: target.offsetLeft - (el.clientWidth - target.offsetWidth) / 2, behavior: 'smooth' });
	};

	const onPointerDown = (e: React.PointerEvent) => {
		if (e.pointerType === 'touch') return;
		const el = scrollRef.current;
		if (!el) return;
		dragRef.current = { down: true, sx: e.clientX, sl: el.scrollLeft, moved: 0 };
		setGrabbing(true);
		el.style.scrollSnapType = 'none';
		el.setPointerCapture(e.pointerId);
	};
	const onPointerMove = (e: React.PointerEvent) => {
		if (!dragRef.current.down) return;
		const el = scrollRef.current;
		if (!el) return;
		const d = e.clientX - dragRef.current.sx;
		dragRef.current.moved = Math.abs(d);
		el.scrollLeft = dragRef.current.sl - d;
		sync();
	};
	const endDrag = () => {
		if (!dragRef.current.down) return;
		dragRef.current.down = false;
		setGrabbing(false);
		const el = scrollRef.current;
		if (el) el.style.scrollSnapType = '';
		sync();
	};

	return (
		<section className="ts-sec">
			<div className="ts-media">
				<div className="poster-bg" />
				<video
					autoPlay
					className={videoHidden ? 'hide' : ''}
					id="tsVideo"
					loop
					muted
					playsInline
					poster="https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=60"
					preload="metadata"
					ref={videoRef}
				>
					<source src="https://assets.mixkit.co/videos/preview/mixkit-sailing-through-the-ocean-4192-large.mp4" type="video/mp4" />
					<source src="https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4" type="video/mp4" />
				</video>
			</div>
			<svg className="ts-wave top" preserveAspectRatio="none" viewBox="0 0 1600 100">
				<path
					className="ts-wave-fill-a"
					d="M0,0 L1600,0 L1600,38 C1300,88 1150,8 900,46 C650,84 500,18 260,50 C140,66 60,54 0,40 Z"
				/>
			</svg>
			<svg className="ts-wave bottom" preserveAspectRatio="none" viewBox="0 0 1600 100">
				<path
					className="ts-wave-fill-b"
					d="M0,0 L1600,0 L1600,38 C1350,80 1180,14 920,48 C660,82 480,20 240,52 C130,66 60,52 0,38 Z"
				/>
			</svg>
			<span className="ts-deco plane">
				<svg viewBox="0 0 48 32">
					<path d="M2 20l10-2 12-14 4 1-7 14 10-1 6-5 3 1-4 7 3 3-3 2-8-2-9 7-4-1 5-8-11 1z" />
				</svg>
			</span>
			<span className="ts-deco ring r1" />
			<span className="ts-deco ring r2" />
			<div className="wrap ts-head">
				<span className="eyebrow">{t('Testimonial')}</span>
				<h2>{t('What Client Say About Us')}</h2>
			</div>
			<div className="wrap ts-stage">
				<span className="ts-peek l">99</span>
				<div
					className={grabbing ? 'ts-scroll grabbing' : 'ts-scroll'}
					id="tsScroll"
					onPointerCancel={endDrag}
					onPointerDown={onPointerDown}
					onPointerMove={onPointerMove}
					onPointerUp={endDrag}
					ref={scrollRef}
				>
					<GthSectionState
						loading={loading && testimonials.length === 0}
						error={!!error && testimonials.length === 0}
						empty={!loading && !error && testimonials.length === 0}
						loadingText={t('Loading testimonials…')}
						emptyText={t('No approved testimonials yet — check back soon.')}
					/>
					{testimonials.map((item, i) => (
						<article className={i === activeIdx ? 'ts-card active' : 'ts-card'} key={item._id}>
							<div className="ts-top">
								<div className="ts-who">
									<img
										alt={item.authorName}
										loading="lazy"
										src={getImageUrl(item.authorImage)}
									/>
									<div>
										<h4>{item.authorName}</h4>
										<span>{item.authorRole || t('Traveller')}</span>
									</div>
								</div>
								{!!item.testimonialRating && <div className="ts-stars">{'★'.repeat(item.testimonialRating)}</div>}
							</div>
							<p className="ts-quote">“{item.testimonialContent}”</p>
							<span className="ts-mark">99</span>
						</article>
					))}
				</div>
				<span className="ts-peek r">99</span>
			</div>
			{testimonials.length > 0 && (
				<div className="ts-dots" id="tsDots">
					{testimonials.map((t, i) => (
						<button
							aria-label={String(i + 1)}
							className={i === activeIdx ? 'on' : ''}
							key={t._id}
							onClick={() => goToDot(i)}
						/>
					))}
				</div>
			)}
		</section>
	);
};

export default GthTestimonials;
