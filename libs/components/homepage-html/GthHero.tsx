import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from '../../i18n/useTranslation';
import { TourCategory, TourLocation } from '../../enums/tour.enum';
import { useClickOutside } from '../../hooks/useClickOutside';

const SLIDES = [
	{ alt: 'Thailand', src: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=2000&q=85' },
	{ alt: 'Maldives', src: 'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?auto=format&fit=crop&w=2000&q=85' },
	{ alt: 'Mountain lake', src: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=2000&q=85' },
];

const SLIDE_MS = 6000;

const CATEGORY_OPTIONS: { value: TourCategory | ''; label: string; blurb: string }[] = [
	{ value: '', label: 'All Categories', blurb: 'All tour types' },
	{ value: TourCategory.ADVENTURE, label: 'Adventure', blurb: 'Extreme & active' },
	{ value: TourCategory.BEACH, label: 'Beach', blurb: 'Sea & beach' },
	{ value: TourCategory.MOUNTAIN, label: 'Mountain', blurb: 'Mountain trips' },
	{ value: TourCategory.CULTURAL, label: 'Cultural', blurb: 'Culture & tradition' },
	{ value: TourCategory.HISTORICAL, label: 'Historical', blurb: 'Historic landmarks' },
	{ value: TourCategory.CITY, label: 'City', blurb: 'City sightseeing' },
	{ value: TourCategory.CRUISE, label: 'Cruises', blurb: 'Cruise voyages' },
];

const LOCATION_OPTIONS: { value: TourLocation | ''; label: string; sub: string; flag: string }[] = [
	{ value: '', label: 'All Locations', sub: 'All destinations', flag: '' },
	{ value: TourLocation.SEOUL, label: 'Seoul', sub: 'South Korea', flag: '🇰🇷' },
	{ value: TourLocation.JEJU, label: 'Jeju Island', sub: 'South Korea', flag: '🇰🇷' },
	{ value: TourLocation.TOKYO, label: 'Tokyo', sub: 'Japan', flag: '🇯🇵' },
	{ value: TourLocation.BALI, label: 'Bali', sub: 'Indonesia', flag: '🇮🇩' },
	{ value: TourLocation.MALDIVES, label: 'Maldives', sub: 'Maldives', flag: '🇲🇻' },
	{ value: TourLocation.BANGKOK, label: 'Bangkok', sub: 'Thailand', flag: '🇹🇭' },
	{ value: TourLocation.PARIS, label: 'Paris', sub: 'France', flag: '🇫🇷' },
	{ value: TourLocation.DUBAI, label: 'Dubai', sub: 'UAE', flag: '🇦🇪' },
];

const GthHero = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const [slide, setSlide] = useState(0);
	const [paused, setPaused] = useState(false);
	const [catOpen, setCatOpen] = useState(false);
	const [locOpen, setLocOpen] = useState(false);
	const [category, setCategory] = useState<TourCategory | ''>('');
	const [location, setLocation] = useState<TourLocation | ''>('');
	const [text, setText] = useState('');
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const catRef = useRef<HTMLDivElement>(null);
	const locRef = useRef<HTMLDivElement>(null);

	useClickOutside(catRef, catOpen, () => setCatOpen(false));
	useClickOutside(locRef, locOpen, () => setLocOpen(false));

	useEffect(() => {
		if (paused) return;
		timerRef.current = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), SLIDE_MS);
		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, [paused]);

	const goTo = (index: number) => {
		setSlide((index + SLIDES.length) % SLIDES.length);
		setPaused(true);
		setTimeout(() => setPaused(false), SLIDE_MS * 2);
	};

	/** html has `scroll-padding-top` set globally (scss/foundation/_base.scss),
	 * so scrollIntoView already clears the sticky header without a manual offset. */
	const scrollToServices = (e: React.MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault();
		document.getElementById('our-services')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	};

	const activeCategory = CATEGORY_OPTIONS.find((c) => c.value === category) ?? CATEGORY_OPTIONS[0];
	const activeLocation = LOCATION_OPTIONS.find((l) => l.value === location) ?? LOCATION_OPTIONS[0];

	const handleSearch = () => {
		const params = new URLSearchParams();
		if (text.trim()) params.set('text', text.trim());
		if (category) params.set('category', category);
		if (location) params.set('location', location);
		router.push(`/tour${params.toString() ? `?${params.toString()}` : ''}`);
	};

	return (
		<>
			<section className="hero">
				<div className="slides">
					{SLIDES.map((item, index) => (
						<div className={`slide${index === slide ? ' on' : ''}`} key={item.src}>
							<img alt={item.alt} src={item.src} />
						</div>
					))}
				</div>
				<div className="rail">
					<button aria-label={t('Previous') as string} onClick={() => goTo(slide - 1)}>
						<svg viewBox="0 0 24 24">
							<path d="M12 19V5M5 12l7-7 7 7" />
						</svg>
					</button>
					<span className="track">
						<i style={{ top: `${(slide / SLIDES.length) * 100}%` }} />
					</span>
					<button aria-label={t('Next') as string} onClick={() => goTo(slide + 1)}>
						<svg viewBox="0 0 24 24">
							<path d="M12 5v14M19 12l-7 7-7-7" />
						</svg>
					</button>
				</div>
				<div className="wrap hero-inner">
					<span className="eyebrow">{t('Get unforgettable pleasure with us')}</span>
					<h1>
						{t('Natural Wonder')}
						<br />
						{t('Of The World')}
					</h1>
					<div className="hero-btns">
						<a className="btn btn-sky" href="/tour">
							{t('Explore Tours')}{' '}
							<span className="ar">
								<svg className="ico" viewBox="0 0 24 24">
									<path d="M5 12h14M13 6l6 6-6 6" />
								</svg>
							</span>
						</a>
						<a className="btn btn-ghost" href="#our-services" onClick={scrollToServices}>
							{t('Our Services')}{' '}
							<span className="ar">
								<svg className="ico" viewBox="0 0 24 24">
									<path d="M5 12h14M13 6l6 6-6 6" />
								</svg>
							</span>
						</a>
					</div>
				</div>
				<div className="hero-dots">
					{SLIDES.map((item, index) => (
						<button
							aria-label={`${index + 1}`}
							className={index === slide ? 'on' : ''}
							key={item.src}
							onClick={() => goTo(index)}
						/>
					))}
				</div>
			</section>

			<div className="post-hero">
				<div className="wrap search-hold">
					<div className="searchbar">
						<div className="sf">
							<label className="sf-label" htmlFor="gth-q">
								{t('Search')}
							</label>
							<div className="sf-row">
								<svg className="lead" viewBox="0 0 24 24">
									<circle cx="11" cy="11" r="7" />
									<path d="M21 21l-4-4" />
								</svg>
								<input
									autoComplete="off"
									className="sf-input"
									id="gth-q"
									placeholder={t('Tour name, keyword…') as string}
									type="text"
									value={text}
									onChange={(e) => setText(e.target.value)}
									onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
								/>
							</div>
						</div>

						<div className="sf">
							<span className="sf-label">{t('Categories')}</span>
							<div className={`sel${catOpen ? ' open' : ''}`} ref={catRef}>
								<button
									aria-expanded={catOpen}
									aria-haspopup="listbox"
									className="sel-btn"
									type="button"
									onClick={() => {
										setCatOpen((v) => !v);
										setLocOpen(false);
									}}
								>
									<svg className="lead" viewBox="0 0 24 24">
										<rect height="7" rx="1.6" width="7" x="3" y="3" />
										<rect height="7" rx="1.6" width="7" x="14" y="3" />
										<rect height="7" rx="1.6" width="7" x="3" y="14" />
										<rect height="7" rx="1.6" width="7" x="14" y="14" />
									</svg>
									<span className="val">{t(activeCategory.label)}</span>
									<svg className="ca" viewBox="0 0 24 24">
										<path d="M6 9l6 6 6-6" />
									</svg>
								</button>
								<div className="sel-menu" role="listbox">
									<div className="head">{t('Tour Type')}</div>
									{CATEGORY_OPTIONS.map((opt) => (
										<button
											key={opt.value || 'all'}
											className={`opt${opt.value === category ? ' sel-on' : ''}`}
											onClick={() => {
												setCategory(opt.value);
												setCatOpen(false);
											}}
										>
											<span className="ot">
												<b>{t(opt.label)}</b>
												<small>{t(opt.blurb)}</small>
											</span>
											<svg className="chk" viewBox="0 0 24 24">
												<path d="M20 6L9 17l-5-5" />
											</svg>
										</button>
									))}
								</div>
							</div>
						</div>

						<div className="sf">
							<span className="sf-label">{t('Locations')}</span>
							<div className={`sel${locOpen ? ' open' : ''}`} ref={locRef}>
								<button
									aria-expanded={locOpen}
									aria-haspopup="listbox"
									className="sel-btn"
									type="button"
									onClick={() => {
										setLocOpen((v) => !v);
										setCatOpen(false);
									}}
								>
									<svg className="lead" viewBox="0 0 24 24">
										<path d="M12 21s-7-6.3-7-11a7 7 0 0114 0c0 4.7-7 11-7 11z" />
										<circle cx="12" cy="10" r="2.4" />
									</svg>
									<span className="val">{t(activeLocation.label)}</span>
									<svg className="ca" viewBox="0 0 24 24">
										<path d="M6 9l6 6 6-6" />
									</svg>
								</button>
								<div className="sel-menu" role="listbox">
									<div className="head">{t('Destination')}</div>
									{LOCATION_OPTIONS.map((opt) => (
										<button
											key={opt.value || 'all'}
											className={`opt${opt.value === location ? ' sel-on' : ''}`}
											onClick={() => {
												setLocation(opt.value);
												setLocOpen(false);
											}}
										>
											{opt.flag && <span className="oi">{opt.flag}</span>}
											<span className="ot">
												<b>{t(opt.label)}</b>
												{opt.sub && <small>{t(opt.sub)}</small>}
											</span>
											<svg className="chk" viewBox="0 0 24 24">
												<path d="M20 6L9 17l-5-5" />
											</svg>
										</button>
									))}
								</div>
							</div>
						</div>

						<div className="sf sf-go">
							<button type="button" onClick={handleSearch}>
								<svg viewBox="0 0 24 24">
									<circle cx="11" cy="11" r="7" />
									<path d="M21 21l-4-4" />
								</svg>{' '}
								{t('Search')}
							</button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default GthHero;
