import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { Button, Stack, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import { motion } from 'framer-motion';
import { GET_DESTINATIONS } from '../../../apollo/user/query';
import { Destination } from '../../types/destination/destination';
import { Direction } from '../../enums/common.enum';
import { REACT_APP_API_URL } from '../../config';
import { T } from '../../types/common';
import { fadeUp, hoverLift, staggerContainer, tapPress } from './motion';
import { getFallbackImage } from './homepageFallbacks';

const MotionSection = motion.section;
const MotionDiv = motion.div;

const DestinationHighlights = () => {
	const [destinations, setDestinations] = useState<Destination[]>([]);

	const { loading, error, refetch } = useQuery(GET_DESTINATIONS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 6, sort: 'destinationRank', direction: Direction.DESC, search: {} } },
		onCompleted: (data: T) => setDestinations(data?.getDestinations?.list ?? []),
	});
	const destinationSlides = destinations.map((destination, index) => ({
					key: destination._id,
					title: destination.destinationTitle,
					location: destination.destinationCity || destination.destinationCountry,
					count: `${destination.destinationTours || 0} tours available`,
					href: `/destination/detail?id=${destination._id}`,
					image: destination.destinationImages?.[0]
						? `${REACT_APP_API_URL}/${destination.destinationImages[0]}`
						: `/img/fiber/img${(index % 8) + 1}.jpg`,
			  }));
	const featuredDestinations = destinationSlides.slice(0, 3);

	return (
		<MotionSection
			className="destination-highlight-section"
			variants={fadeUp}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, amount: 0.16 }}
		>
			<Stack className="destination-highlight-container" spacing={3}>
				<Stack className="tour-section-heading destination-stitch-heading" direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={2}>
					<Stack spacing={0.7}>
						<Typography className="section-title">Curated Destinations</Typography>
						<Typography className="section-copy">
							Hand-selected iconic locales for unparalleled service.
						</Typography>
					</Stack>
					<Link href="/destination">
						<Button className="section-link" endIcon={<ArrowForwardRoundedIcon />}>
							View All
						</Button>
					</Link>
				</Stack>
				{loading && !destinations.length ? (
					<Stack className="homepage-skeleton-grid destination-skeleton-grid">
						{[0, 1, 2].map((item) => <span key={item} />)}
					</Stack>
				) : error ? (
					<Stack className="homepage-data-state" alignItems="center">
						<Typography>Destinations could not be loaded.</Typography>
						<Button onClick={() => refetch()}>Try again</Button>
					</Stack>
				) : !featuredDestinations.length ? (
					<Stack className="homepage-data-state" alignItems="center">
						<Typography>New destinations will appear here soon.</Typography>
						<Link href="/destination"><Button>Browse destinations</Button></Link>
					</Stack>
				) : (
					<MotionDiv className="destination-stitch-grid" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.12 }}>
						{featuredDestinations.map((destination, index) => (
						<Link href={destination.href} key={destination.key}>
							<MotionDiv
								className={index === 1 ? 'destination-feature-card destination-feature-card-offset' : 'destination-feature-card'}
								variants={fadeUp}
								whileHover={hoverLift}
								whileTap={tapPress}
							>
								<img
									src={destination.image}
									alt={destination.title}
									loading={index > 1 ? 'lazy' : 'eager'}
									onError={(event) => {
										event.currentTarget.src = getFallbackImage(destination.title);
									}}
								/>
								<div className="destination-feature-overlay" />
								<div className="destination-feature-copy">
									<span>
										<PlaceOutlinedIcon fontSize="small" />
										{destination.location}
									</span>
									<strong>{destination.title}</strong>
									<p>{destination.count}</p>
								</div>
							</MotionDiv>
						</Link>
						))}
					</MotionDiv>
				)}
			</Stack>
		</MotionSection>
	);
};

export default DestinationHighlights;
