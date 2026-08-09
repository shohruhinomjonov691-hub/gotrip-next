import React, { useRef } from 'react';
import Link from 'next/link';
import { Stack, Typography } from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { motion, useReducedMotion } from 'framer-motion';
import { TourCategory } from '../../enums/tour.enum';
import { fadeUp } from './motion';

const MotionSection = motion.section;

interface CategoryItem {
	category: TourCategory;
	label: string;
	blurb: string;
	image: string;
}

const CATEGORIES: CategoryItem[] = [
	{ category: TourCategory.CRUISE, label: 'Cruises', blurb: 'Open-water escapes', image: '/img/fiber/img7.jpg' },
	{ category: TourCategory.ADVENTURE, label: 'Adventure', blurb: 'Adrenaline & trails', image: '/img/fiber/img1.jpg' },
	{ category: TourCategory.BEACH, label: 'Beach', blurb: 'Sun, sea & sand', image: '/img/fiber/img5.jpg' },
	{ category: TourCategory.MOUNTAIN, label: 'Mountain', blurb: 'Peaks & fresh air', image: '/img/fiber/img2.jpg' },
	{
		category: TourCategory.CULTURAL,
		label: 'Cultural',
		blurb: 'Living traditions',
		image: '/img/fiber/img6.jpg',
	},
	{
		category: TourCategory.HISTORICAL,
		label: 'Historical',
		blurb: 'Landmarks & heritage',
		image: '/img/banner/cities/GYEONGJU.webp',
	},
	{ category: TourCategory.CITY, label: 'City', blurb: 'Urban discoveries', image: '/img/fiber/img4.jpg' },
];

const TourCategories = () => {
	const reduceMotion = useReducedMotion();
	const trackRef = useRef<HTMLDivElement>(null);

	const scrollBy = (direction: number) => {
		const track = trackRef.current;
		if (!track) return;
		const amount = Math.min(track.clientWidth * 0.8, 520);
		track.scrollBy({ left: amount * direction, behavior: 'smooth' });
	};

	return (
		<MotionSection
			className={'tour-categories-section'}
			variants={reduceMotion ? undefined : fadeUp}
			initial={reduceMotion ? false : 'hidden'}
			whileInView="visible"
			viewport={{ once: true, amount: 0.12 }}
		>
			<Stack className={'home-section-container'}>
				<Stack className={'home-section-heading'}>
					<Typography className={'home-section-kicker'}>Wonderful places for you</Typography>
					<Typography component={'h2'} className={'home-section-title'}>
						Tour Categories
					</Typography>
					<Typography className={'home-section-copy'}>
						Pick a style of travel — each category opens straight to its live tours.
					</Typography>
				</Stack>

				<div className={'category-carousel'}>
					<button
						type="button"
						className={'category-nav prev'}
						onClick={() => scrollBy(-1)}
						aria-label="Previous categories"
					>
						<ChevronLeftRoundedIcon />
					</button>

					<div className={'category-track'} ref={trackRef}>
						{CATEGORIES.map((item) => (
							<Link
								key={item.category}
								href={`/tour?category=${item.category}`}
								className={'category-card'}
								aria-label={`Explore ${item.label} tours`}
							>
								<span className={'category-media'}>
									<img src={item.image} alt={item.label} loading="lazy" />
									<span className={'category-shade'} aria-hidden="true" />
								</span>
								<span className={'category-body'}>
									<b>{item.label}</b>
									<small>{item.blurb}</small>
									<span className={'category-cta'}>
										Explore
										<ArrowForwardRoundedIcon fontSize="inherit" />
									</span>
								</span>
							</Link>
						))}
					</div>

					<button
						type="button"
						className={'category-nav next'}
						onClick={() => scrollBy(1)}
						aria-label="Next categories"
					>
						<ChevronRightRoundedIcon />
					</button>
				</div>
			</Stack>
		</MotionSection>
	);
};

export default TourCategories;
