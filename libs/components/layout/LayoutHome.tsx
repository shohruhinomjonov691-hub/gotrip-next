import React, { useEffect } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import Link from 'next/link';
import { Button, Stack } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded';
import TourHeaderFilter from '../homepage/TourHeaderFilter';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp, staggerContainer } from '../homepage/motion';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const MotionStack = motion(Stack);
const MotionSection = motion.section;
const MotionDiv = motion.div;

const heroTrends = ['Amalfi Coast', 'Kyoto', 'Maldives'];
const heroStats = [
	{ label: 'Curated routes', value: '240+' },
	{ label: 'Private guides', value: '86' },
];

const HomeHero = ({ mobile = false }: { mobile?: boolean }) => {
	const reduceMotion = useReducedMotion();
	const motionProps = reduceMotion
		? {}
		: {
			variants: staggerContainer,
			initial: 'hidden',
			animate: 'visible',
		  };

	return (
		<MotionSection className={mobile ? 'header-main gotrip-split-hero mobile-hero' : 'header-main gotrip-split-hero'} {...motionProps}>
			<Stack className={'container hero-container'}>
				<MotionStack
					className={'hero-copy hero-copy-panel'}
					variants={reduceMotion ? undefined : fadeUp}
				>
					<motion.h1 variants={reduceMotion ? undefined : fadeUp}>
						Experience the Art of <span>Luxury</span> Travel
					</motion.h1>
					<motion.p variants={reduceMotion ? undefined : fadeUp}>
						Discover exclusive destinations and hand-curated experiences tailored to the most discerning global citizens.
					</motion.p>
					<motion.div className={'hero-trending'} variants={reduceMotion ? undefined : fadeUp}>
						<strong>Trending:</strong>
						{heroTrends.map((trend) => (
							<Link href={`/tour?text=${encodeURIComponent(trend)}`} className={'hero-trend-tag'} key={trend}>
								{trend}
							</Link>
						))}
					</motion.div>
					<motion.div className={'hero-actions'} variants={reduceMotion ? undefined : fadeUp}>
						<Link href="/tour">
							<Button className="hero-primary" endIcon={<ArrowForwardRoundedIcon />}>
								Explore tours
							</Button>
						</Link>
						<Link href="/destination">
							<Button className="hero-secondary" startIcon={<ExploreRoundedIcon />}>
								Discover destinations
							</Button>
						</Link>
					</motion.div>
					<motion.div className={'hero-search-wrap'} variants={reduceMotion ? undefined : fadeUp}>
						<TourHeaderFilter />
					</motion.div>
				</MotionStack>

				<MotionDiv className={'hero-visual'} variants={reduceMotion ? undefined : fadeUp} aria-hidden="true">
					<div className={'hero-collage-main'}>
						<img src="/img/fiber/img8.jpg" alt="" />
						<span>Private coastlines</span>
					</div>
					<div className={'hero-collage-stack'}>
						<div>
							<img src="/img/banner/cities/JEJU.webp" alt="" />
							<span>Island retreats</span>
						</div>
						<div>
							<img src="/img/fiber/img5.jpg" alt="" />
							<span>Curated arrivals</span>
						</div>
					</div>
					<div className={'hero-floating-card'}>
						<span>Signature escape</span>
						<strong>Amalfi Coast</strong>
						<p>Private guide, coastal lunch, sunset cruise</p>
						<div>
							{heroStats.map((item) => (
								<small key={item.label}>
									<b>{item.value}</b>
									{item.label}
								</small>
							))}
						</div>
					</div>
				</MotionDiv>
			</Stack>
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
