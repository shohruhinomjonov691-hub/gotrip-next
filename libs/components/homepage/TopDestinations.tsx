import React, { useState } from 'react';
import Link from 'next/link';
import { Stack, Typography } from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { motion, useReducedMotion } from 'framer-motion';
import { TourLocation } from '../../enums/tour.enum';
import { fadeUp } from './motion';

const MotionSection = motion.section;

interface DestinationItem {
	location: TourLocation;
	label: string;
	country: string;
	image: string;
}

const DESTINATIONS: DestinationItem[] = [
	{ location: TourLocation.SEOUL, label: 'Seoul', country: 'South Korea', image: '/img/banner/cities/SEOUL.webp' },
	{ location: TourLocation.PARIS, label: 'Paris', country: 'France', image: '/img/fiber/img4.jpg' },
	{ location: TourLocation.DUBAI, label: 'Dubai', country: 'UAE', image: '/img/fiber/img5.jpg' },
	{ location: TourLocation.JEJU, label: 'Jeju', country: 'South Korea', image: '/img/banner/cities/JEJU.webp' },
	{ location: TourLocation.TOKYO, label: 'Tokyo', country: 'Japan', image: '/img/fiber/img8.jpg' },
	{
		location: TourLocation.SAMARKAND,
		label: 'Samarkand',
		country: 'Uzbekistan',
		image: '/img/fiber/img6.jpg',
	},
	{ location: TourLocation.BUSAN, label: 'Busan', country: 'South Korea', image: '/img/banner/cities/BUSAN.webp' },
];

const cardVisualStyle = (offset: number): React.CSSProperties => {
	const abs = Math.abs(offset);
	if (abs > 2) {
		return { opacity: 0, pointerEvents: 'none', transform: `translateX(${offset > 0 ? 220 : -220}%) scale(0.6)` };
	}
	const translate = offset * 62;
	const scale = 1 - abs * 0.14;
	const opacity = abs === 0 ? 1 : abs === 1 ? 0.88 : 0.55;
	return {
		transform: `translateX(${translate}%) scale(${scale})`,
		opacity,
		zIndex: 10 - abs,
		filter: abs === 0 ? 'none' : 'brightness(0.82)',
	};
};

const TopDestinations = () => {
	const reduceMotion = useReducedMotion();
	const [active, setActive] = useState(0);
	const total = DESTINATIONS.length;

	const go = (next: number) => setActive((next + total) % total);

	return (
		<MotionSection
			className={'top-destinations-section'}
			variants={reduceMotion ? undefined : fadeUp}
			initial={reduceMotion ? false : 'hidden'}
			whileInView="visible"
			viewport={{ once: true, amount: 0.1 }}
		>
			<Stack className={'home-section-container'}>
				<Stack className={'destinations-head'}>
					<Stack className={'destinations-head-copy'}>
						<Typography className={'home-section-kicker'}>Top destination</Typography>
						<Typography component={'h2'} className={'home-section-title'}>
							Top Destinations
						</Typography>
					</Stack>
					<div className={'destination-tabs'} role="tablist" aria-label="Destinations">
						{DESTINATIONS.map((item, index) => (
							<button
								key={item.location}
								type="button"
								role="tab"
								aria-selected={index === active}
								className={index === active ? 'destination-tab active' : 'destination-tab'}
								onClick={() => setActive(index)}
							>
								{item.label}
							</button>
						))}
					</div>
				</Stack>

				<div className={'destination-stage'}>
					{DESTINATIONS.map((item, index) => {
						const offset = index - active;
						return (
							<article key={item.location} className={'destination-card'} style={cardVisualStyle(offset)}>
								<img src={item.image} alt={`${item.label}, ${item.country}`} loading="lazy" />
								<span className={'destination-card-shade'} aria-hidden="true" />
								<div className={'destination-card-body'}>
									<div>
										<b>{item.label}</b>
										<small>{item.country}</small>
									</div>
									<Link
										href={`/tour?location=${item.location}`}
										className={'destination-view'}
										tabIndex={offset === 0 ? 0 : -1}
									>
										View tours
										<ArrowForwardRoundedIcon fontSize="inherit" />
									</Link>
								</div>
							</article>
						);
					})}

					<div className={'destination-controls'}>
						<button type="button" onClick={() => go(active - 1)} aria-label="Previous destination">
							<ChevronLeftRoundedIcon />
						</button>
						<span>Drag</span>
						<button type="button" onClick={() => go(active + 1)} aria-label="Next destination">
							<ChevronRightRoundedIcon />
						</button>
					</div>
				</div>
			</Stack>
		</MotionSection>
	);
};

export default TopDestinations;
