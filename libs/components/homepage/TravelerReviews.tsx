import React from 'react';
import { Stack, Typography } from '@mui/material';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import FormatQuoteRoundedIcon from '@mui/icons-material/FormatQuoteRounded';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from './motion';

const MotionSection = motion.section;
const MotionDiv = motion.div;

const reviews = [
	{
		name: 'Sophia Chen',
		route: 'Singapore',
		copy: 'GoTrip transformed our anniversary into a cinematic journey. Every detail, from the private yacht to the hidden vineyard, was flawless.',
		image: '/img/fiber/img8.jpg',
	},
	{
		name: 'Marcus Rivera',
		route: 'New York',
		copy: 'The concierge team understood our travel style instantly. It felt personal, polished, and completely effortless from search to booking.',
		image: '/img/fiber/img5.jpg',
	},
];

const TravelerReviews = () => {
	return (
		<MotionSection
			className={'traveler-reviews-section'}
			variants={fadeUp}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, amount: 0.16 }}
		>
			<Stack className={'premium-section-container'}>
				<Stack className={'premium-section-heading'}>
					<Typography className={'eyebrow'}>Testimonials</Typography>
					<Typography className={'section-title'}>Voices of Exploration</Typography>
					<Typography className={'section-copy'}>
						Experiences from our distinguished travelers.
					</Typography>
				</Stack>
				<MotionDiv className={'review-card-grid'} variants={staggerContainer} initial="hidden" whileInView="visible">
					{reviews.map((review) => (
						<motion.div className={'review-card-premium'} variants={fadeUp} whileHover={{ y: -8 }} key={review.name}>
							<div className={'review-card-body'}>
								<FormatQuoteRoundedIcon className={'quote-icon'} />
								<div className={'review-card-score'}>
									{[0, 1, 2, 3, 4].map((item) => (
										<StarRoundedIcon fontSize="small" key={item} />
									))}
								</div>
								<p>{review.copy}</p>
								<div className={'review-author'}>
									<img src={review.image} alt={review.name} loading="lazy" />
									<span>
										<strong>{review.name}</strong>
										<small>{review.route}</small>
									</span>
								</div>
							</div>
						</motion.div>
					))}
				</MotionDiv>
			</Stack>
		</MotionSection>
	);
};

export default TravelerReviews;
