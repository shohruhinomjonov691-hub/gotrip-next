import React, { useEffect } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import Link from 'next/link';
import { Button, Stack } from '@mui/material';
import FiberContainer from '../common/FiberContainer';
import TourHeaderFilter from '../homepage/TourHeaderFilter';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '../homepage/motion';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const MotionStack = motion(Stack);

const HomeHero = ({ mobile = false }: { mobile?: boolean }) => (
	<Stack className={mobile ? 'header-main mobile-hero' : 'header-main'}>
		{!mobile && <FiberContainer />}
		<Stack className={'container hero-container'}>
			<MotionStack
				className={'hero-copy'}
				variants={staggerContainer}
				initial="hidden"
				animate="visible"
			>
				<motion.span className={'hero-kicker'} variants={fadeUp}>
					Curated tours, local guides, unforgettable days
				</motion.span>
				<motion.h1 variants={fadeUp}>Book experiences that make the journey feel personal.</motion.h1>
				<motion.p variants={fadeUp}>
					Discover premium city walks, nature escapes, cultural routes, and private guide experiences across top
					destinations.
				</motion.p>
				<motion.div className={'hero-actions'} variants={fadeUp}>
					<Link href={'/tour'}>
						<Button className={'hero-primary'} variant="contained">
							Explore tours
						</Button>
					</Link>
					<Link href={'/agent'}>
						<Button className={'hero-secondary'} variant="outlined">
							Meet guides
						</Button>
					</Link>
				</motion.div>
			</MotionStack>
			<MotionStack className={'hero-search-wrap'} variants={fadeUp} initial="hidden" animate="visible">
				<TourHeaderFilter />
			</MotionStack>
			<MotionStack
				className={'hero-stats'}
				variants={staggerContainer}
				initial="hidden"
				animate="visible"
			>
				<motion.div variants={fadeUp}>
					<strong>120+</strong>
					<span>tour routes</span>
				</motion.div>
				<motion.div variants={fadeUp}>
					<strong>35+</strong>
					<span>destinations</span>
				</motion.div>
				<motion.div variants={fadeUp}>
					<strong>4.9</strong>
					<span>traveler rating</span>
				</motion.div>
			</MotionStack>
		</Stack>
	</Stack>
);

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
