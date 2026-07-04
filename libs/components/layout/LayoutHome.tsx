import React, { useEffect } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import Link from 'next/link';
import { Stack } from '@mui/material';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import { useQuery } from '@apollo/client';
import TourHeaderFilter from '../homepage/TourHeaderFilter';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import { motion, useReducedMotion } from 'framer-motion';
import { GET_DESTINATIONS } from '../../../apollo/user/query';
import { Direction } from '../../enums/common.enum';
import { Destination } from '../../types/destination/destination';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

/** TS2590 guard: motion components hoisted to module scope (see docs/ai/DESIGN_SYSTEM.md §1) */
const MotionSection = motion.section;
const MotionSpan = motion.span;
const MotionP = motion.p;
const MotionDiv = motion.div;

/** SamandTour signature easing — mirrors --gt-ease in scss/gotrip-theme.scss */
const gtEase = [0.22, 0.61, 0.36, 1] as const;

const heroUp = (delay: number) => ({
	hidden: { opacity: 0, y: 18 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: gtEase, delay } },
});

const heroRise = (delay: number) => ({
	hidden: { y: '110%' },
	visible: { y: '0%', transition: { duration: 0.95, ease: gtEase, delay } },
});

const heroMotion = {
	eyebrow: heroUp(0.15),
	line1: heroRise(0.3),
	line2: heroRise(0.45),
	sub: heroUp(0.7),
	trending: heroUp(0.85),
	search: heroUp(1.0),
	stats: heroUp(1.15),
};

const heroStats = [
	{ value: '240+', label: 'Live tours' },
	{ value: '30+', label: 'Destinations' },
	{ value: '24/7', label: 'Trip support' },
];

/** Deterministic star field — random positions would cause an SSR hydration mismatch */
const skyStars = [
	{ top: '9%', left: '6%', delay: '0s' },
	{ top: '14%', left: '22%', delay: '1.4s' },
	{ top: '7%', left: '37%', delay: '2.6s' },
	{ top: '18%', left: '48%', delay: '0.8s' },
	{ top: '10%', left: '58%', delay: '3.2s' },
	{ top: '22%', left: '66%', delay: '1.9s' },
	{ top: '6%', left: '74%', delay: '0.4s' },
	{ top: '16%', left: '83%', delay: '2.2s' },
	{ top: '9%', left: '92%', delay: '1.1s' },
	{ top: '28%', left: '12%', delay: '3.6s' },
	{ top: '32%', left: '41%', delay: '0.6s' },
	{ top: '26%', left: '88%', delay: '2.9s' },
	{ top: '38%', left: '71%', delay: '1.7s' },
	{ top: '36%', left: '28%', delay: '2.4s' },
];

/* High arc across the top sky — stays clear of the headline/sub/search copy below */
const HERO_ROUTE_PATH = 'M60 220 Q 620 40 1400 150';

const HomeHero = ({ mobile = false }: { mobile?: boolean }) => {
	const reduceMotion = useReducedMotion();

	/** Same variables as TourHeaderFilter, so both read one Apollo cache entry */
	const { data: destinationsData } = useQuery(GET_DESTINATIONS, {
		fetchPolicy: 'cache-first',
		variables: { input: { page: 1, limit: 20, sort: 'destinationRank', direction: Direction.DESC, search: {} } },
	});
	const trendingDestinations: Destination[] = (destinationsData?.getDestinations?.list ?? []).slice(0, 3);

	return (
		<MotionSection
			className={mobile ? 'header-main gotrip-sunrise-hero mobile-hero' : 'header-main gotrip-sunrise-hero'}
			initial={reduceMotion ? false : 'hidden'}
			animate={reduceMotion ? undefined : 'visible'}
		>
			<div className={'sunrise-sky'} aria-hidden="true" />
			<div className={'sunrise-stars'} aria-hidden="true">
				{skyStars.map((star, index) => (
					<i key={index} style={{ top: star.top, left: star.left, animationDelay: star.delay }} />
				))}
			</div>

			<svg className={'sunrise-skyline'} viewBox="0 0 1440 220" preserveAspectRatio="none" aria-hidden="true">
				<path
					fill="#0a1326"
					opacity="0.95"
					d="M0 220V150h60v-30h40v30h36V96h22v54h30v-40h26v40h40V70h20v80h34v-26h26v26h40V120h22v30h30V100h28v50h34v-70h18v70h40v-34h24v34h40V90h22v60h32v-30h28v30h40V58h16v92h36v-40h26v40h40V120h22v30h34V96h24v54h40V140h60v80z"
				/>
				<path
					fill="var(--gt-ink)"
					d="M120 220v-46h30v46zM360 220v-60h22v60zM640 220v-52h26v52zM900 220v-66h20v66zM1180 220v-50h26v50z"
				/>
			</svg>

			{!mobile && (
				<svg className={'sunrise-route'} viewBox="0 0 1440 760" preserveAspectRatio="none" aria-hidden="true">
					<defs>
						<linearGradient id="gt-route-gradient" x1="0" y1="1" x2="1" y2="0">
							<stop offset="0" style={{ stopColor: 'var(--gt-gold)' }} />
							<stop offset="1" style={{ stopColor: 'var(--gt-coral)' }} />
						</linearGradient>
					</defs>
					<path id="gt-route-path" className={'route-glow'} stroke="url(#gt-route-gradient)" d={HERO_ROUTE_PATH} />
					<path className={'route-dashed'} d={HERO_ROUTE_PATH} />
					{!reduceMotion && (
						<>
							<circle className={'route-dot'} r="5">
								<animateMotion dur="6s" repeatCount="indefinite" rotate="auto">
									<mpath href="#gt-route-path" />
								</animateMotion>
							</circle>
							<g>
								<path d="M-14 0l28 -8 -10 8 10 8z" fill="#fff" />
								<animateMotion dur="6s" repeatCount="indefinite" rotate="auto">
									<mpath href="#gt-route-path" />
								</animateMotion>
							</g>
						</>
					)}
				</svg>
			)}

			<Stack className={'container sunrise-hero-inner'}>
				<div className={'sunrise-hero-grid'}>
					<Stack className={'sunrise-hero-copy'}>
						<MotionSpan className={'sunrise-hero-eyebrow'} variants={reduceMotion ? undefined : heroMotion.eyebrow}>
							Tours · Destinations · Local guides
						</MotionSpan>
						<h1>
							<span className={'line'}>
								<MotionSpan variants={reduceMotion ? undefined : heroMotion.line1}>Your next journey</MotionSpan>
							</span>
							<span className={'line'}>
								<MotionSpan variants={reduceMotion ? undefined : heroMotion.line2}>
									starts <em>here</em>
								</MotionSpan>
							</span>
						</h1>
						<MotionP className={'sunrise-hero-sub'} variants={reduceMotion ? undefined : heroMotion.sub}>
							Browse live tours, compare destinations and book with trusted local guides — all in one place.
						</MotionP>
						{trendingDestinations.length > 0 && (
							<MotionDiv className={'sunrise-hero-trending'} variants={reduceMotion ? undefined : heroMotion.trending}>
								<strong>Trending now</strong>
								{trendingDestinations.map((destination) => (
									<Link
										href={`/tour?destinationId=${destination._id}`}
										className={'hero-trend-tag'}
										key={destination._id}
									>
										{destination.destinationTitle}
									</Link>
								))}
							</MotionDiv>
						)}
					</Stack>
					{!mobile && <div className={'sunrise-hero-side'} aria-hidden="true" />}
				</div>
				<MotionDiv className={'sunrise-hero-search'} variants={reduceMotion ? undefined : heroMotion.search}>
					<TourHeaderFilter />
				</MotionDiv>
				<MotionDiv className={'sunrise-hero-stats'} variants={reduceMotion ? undefined : heroMotion.stats}>
					{heroStats.map((item) => (
						<div className={'sunrise-hero-stat'} key={item.label}>
							<b>{item.value}</b>
							<span>{item.label}</span>
						</div>
					))}
				</MotionDiv>
			</Stack>

			{!mobile && (
				<>
					<div className={'hero-chip chip-1'}>
						<span className={'ic'}>
							<StarRoundedIcon fontSize="small" />
						</span>
						<span>
							<b>4.9 / 5</b>
							<small>traveler reviews</small>
						</span>
					</div>
					<div className={'hero-chip chip-2'}>
						<span className={'ic'}>
							<VerifiedRoundedIcon fontSize="small" />
						</span>
						<span>
							<b>Verified guides</b>
							<small>every tour vetted</small>
						</span>
					</div>
					<div className={'sunrise-scroll-cue'} aria-hidden="true">
						<span className={'mouse'} />
						<span>Scroll</span>
					</div>
				</>
			)}
		</MotionSection>
	);
};

const withLayoutMain = (Component: any) => {
	return (props: any) => {
		const device = useDeviceDetect();

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		/** HANDLERS **/

		if (device == 'mobile') {
			return (
				<>
					<Head>
						<title>GoTrip</title>
						<meta name={'title'} content={`GoTrip`} />
					</Head>
					<Stack id="mobile-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>

						<HomeHero mobile />

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
				</>
			);
		} else {
			return (
				<>
					<Head>
						<title>GoTrip</title>
						<meta name={'title'} content={`GoTrip`} />
					</Head>
					<Stack id="pc-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>

						<HomeHero />

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<Chat />

						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
				</>
			);
		}
	};
};

export default withLayoutMain;
