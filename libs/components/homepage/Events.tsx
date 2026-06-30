import React from 'react';
import Link from 'next/link';
import { Button, Stack, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer, tapPress } from './motion';

const MotionSection = motion.section;
const MotionDiv = motion.div;

const trustItems = [
	{
		icon: <GppGoodOutlinedIcon />,
		title: 'Verified guide network',
		copy: 'Curated operators and local experts give travelers a clearer path from discovery to arrival.',
	},
	{
		icon: <EventAvailableOutlinedIcon />,
		title: 'Booking confidence',
		copy: 'Tour details surface routes, availability, group size, language, and guide context before travelers continue.',
	},
	{
		icon: <FavoriteBorderRoundedIcon />,
		title: 'Wishlist-first planning',
		copy: 'Travelers can shortlist experiences and return to premium tour options without losing momentum.',
	},
];

const metrics = [
	{ value: 'Curated', label: 'tour collections' },
	{ value: 'Secure', label: 'booking journey' },
	{ value: 'Trusted', label: 'guide network' },
];

const Events = () => {
	return (
		<MotionSection
			className={'homepage-trust-section'}
			variants={fadeUp}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, amount: 0.16 }}
		>
			<Stack className={'homepage-trust-container'}>
				<Stack className={'trust-panel dark-panel'}>
					<Typography className={'eyebrow'}>Why choose GoTrip</Typography>
					<Typography className={'trust-title'}>Premium discovery with booking confidence built in.</Typography>
					<Typography className={'trust-copy'}>
						A travel marketplace should feel inspiring and practical. GoTrip keeps guided tours, saved trips, and
						destination discovery moving inside one focused booking journey.
					</Typography>
					<MotionDiv className={'trust-metrics'} variants={staggerContainer} initial="hidden" whileInView="visible">
						{metrics.map((metric) => (
							<motion.div variants={fadeUp} key={metric.value}>
								<strong>{metric.value}</strong>
								<span>{metric.label}</span>
							</motion.div>
						))}
					</MotionDiv>
					<MotionDiv className={'trust-list'} variants={staggerContainer} initial="hidden" whileInView="visible">
						{trustItems.map((item) => (
							<motion.div className={'trust-item'} variants={fadeUp} key={item.title}>
								<span>{item.icon}</span>
								<div>
									<strong>{item.title}</strong>
									<p>{item.copy}</p>
								</div>
							</motion.div>
						))}
					</MotionDiv>
				</Stack>
				<Stack className={'trust-panel image-panel'}>
					<div className={'image-panel-bg'} />
					<Stack className={'image-panel-copy'}>
						<Typography className={'eyebrow'}>Booking journey</Typography>
						<Typography className={'trust-title'}>Move from inspiration to a guide-led day with less friction.</Typography>
						<Typography className={'trust-copy'}>
							The homepage now prioritizes tours, destinations, confidence signals, guides, and stories in the order
							travelers naturally compare and book.
						</Typography>
						<Stack className={'trust-actions'} direction={{ xs: 'column', sm: 'row' }}>
							<Link href={'/tour'}>
								<Button className={'trust-primary'} variant="contained" endIcon={<ArrowForwardRoundedIcon />}>
									Explore tours
								</Button>
							</Link>
							<Link href={'/agent'}>
								<motion.div whileTap={tapPress}>
									<Button className={'trust-secondary'} variant="outlined">
										Meet guides
									</Button>
								</motion.div>
							</Link>
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		</MotionSection>
	);
};

export default Events;
