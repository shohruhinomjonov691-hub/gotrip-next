import React from 'react';
import Link from 'next/link';
import { Stack, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { motion, useReducedMotion } from 'framer-motion';
import { TourLocation } from '../../enums/tour.enum';
import { fadeUp, staggerContainer } from './motion';

const MotionSection = motion.section;
const MotionDiv = motion.div;

interface FeaturedLocation {
	location: TourLocation;
	label: string;
	country: string;
	image: string;
}

const FEATURED_LOCATIONS: FeaturedLocation[] = [
	{ location: TourLocation.SEOUL, label: 'Seoul', country: 'South Korea', image: '/img/banner/cities/SEOUL.webp' },
	{ location: TourLocation.BUSAN, label: 'Busan', country: 'South Korea', image: '/img/banner/cities/BUSAN.webp' },
	{ location: TourLocation.JEJU, label: 'Jeju', country: 'South Korea', image: '/img/banner/cities/JEJU.webp' },
	{
		location: TourLocation.GYEONGJU,
		label: 'Gyeongju',
		country: 'South Korea',
		image: '/img/banner/cities/GYEONGJU.webp',
	},
	{ location: TourLocation.PARIS, label: 'Paris', country: 'France', image: '/img/fiber/img4.jpg' },
	{ location: TourLocation.DUBAI, label: 'Dubai', country: 'UAE', image: '/img/fiber/img5.jpg' },
	{ location: TourLocation.TOKYO, label: 'Tokyo', country: 'Japan', image: '/img/fiber/img8.jpg' },
	{
		location: TourLocation.SAMARKAND,
		label: 'Samarkand',
		country: 'Uzbekistan',
		image: '/img/fiber/img6.jpg',
	},
];

const LocationHighlights = () => {
	const reduceMotion = useReducedMotion();

	return (
		<MotionSection
			className={'location-highlights-section'}
			variants={reduceMotion ? undefined : fadeUp}
			initial={reduceMotion ? false : 'hidden'}
			whileInView="visible"
			viewport={{ once: true, amount: 0.15 }}
		>
			<Stack className={'home-section-container'}>
				<Stack className={'home-section-heading'}>
					<Typography className={'home-section-kicker'}>Destinations</Typography>
					<Typography component={'h2'} className={'home-section-title'}>
						Where do you want to go?
					</Typography>
					<Typography className={'home-section-copy'}>
						Start with a place — every destination links straight to its live tours.
					</Typography>
				</Stack>
				<MotionDiv
					className={'location-grid'}
					variants={reduceMotion ? undefined : staggerContainer}
					initial={reduceMotion ? false : 'hidden'}
					whileInView="visible"
					viewport={{ once: true, amount: 0.1 }}
				>
					{FEATURED_LOCATIONS.map((item) => (
						<MotionDiv variants={reduceMotion ? undefined : fadeUp} key={item.location}>
							<Link href={`/tour?location=${item.location}`} className={'location-card'}>
								<img src={item.image} alt={`${item.label}, ${item.country}`} loading="lazy" />
								<span className={'location-card-shade'} aria-hidden="true" />
								<span className={'location-card-body'}>
									<b>{item.label}</b>
									<small>{item.country}</small>
									<span className={'location-card-cta'}>
										Explore tours
										<ArrowForwardRoundedIcon fontSize="inherit" />
									</span>
								</span>
							</Link>
						</MotionDiv>
					))}
				</MotionDiv>
			</Stack>
		</MotionSection>
	);
};

export default LocationHighlights;
