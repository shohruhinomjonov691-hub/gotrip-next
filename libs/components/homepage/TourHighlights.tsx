import React, { useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import Link from 'next/link';
import { Button, Stack, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { motion } from 'framer-motion';
import TourCard from '../tour/TourCard';
import { GET_TOURS } from '../../../apollo/user/query';
import { LIKE_TARGET_TOUR, TOGGLE_WISHLIST } from '../../../apollo/user/mutation';
import { Tour } from '../../types/tour/tour';
import { ToursInquiry } from '../../types/tour/tour.input';
import { Direction, Message } from '../../enums/common.enum';
import { WishlistGroup } from '../../enums/tour.enum';
import { userVar } from '../../../apollo/store';
import { T } from '../../types/common';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { fadeUp, staggerContainer } from './motion';

const MotionStack = motion(Stack);
const MotionDiv = motion.div;

interface TourHighlightsProps {
	title: string;
	sort: string;
	direction?: Direction;
	limit?: number;
}

const TourHighlights = ({ title, sort, direction = Direction.DESC, limit = 3 }: TourHighlightsProps) => {
	const user = useReactiveVar(userVar);
	const [tours, setTours] = useState<Tour[]>([]);
	const input: ToursInquiry = { page: 1, limit, sort, direction, search: {} };
	const [likeTargetTour] = useMutation(LIKE_TARGET_TOUR);
	const [toggleWishlist] = useMutation(TOGGLE_WISHLIST);
	const { loading, error, refetch } = useQuery(GET_TOURS, {
		fetchPolicy: 'cache-and-network',
		variables: { input },
		onCompleted: (data: T) => setTours(data?.getTours?.list ?? []),
	});

	const likeHandler = async (tourId: string) => {
		try {
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetTour({ variables: { tourId } });
			await refetch({ input });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const saveHandler = async (tourId: string) => {
		try {
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			await toggleWishlist({ variables: { input: { wishlistGroup: WishlistGroup.TOUR, wishlistRefId: tourId } } });
			await refetch({ input });
			await sweetTopSmallSuccessAlert('Saved tours updated', 900);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	return (
		<MotionStack
			className={'tour-highlight-section'}
			variants={fadeUp}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, amount: 0.18 }}
		>
			<Stack className={'tour-highlight-container'} spacing={2.5}>
				<Stack className={'tour-section-heading tour-section-heading-centered'} alignItems="center">
					<Stack spacing={0.7}>
						<Typography className={'eyebrow'}>Elite experiences</Typography>
						<Typography className={'section-title'}>{title}</Typography>
						<Typography className={'section-copy'}>
							Immersive experiences designed for the extraordinary.
						</Typography>
					</Stack>
				</Stack>
				{loading && tours.length === 0 ? (
					<Stack className={'tour-skeleton-grid'}>
						{[0, 1, 2, 3].slice(0, limit).map((item) => (
							<div className={'tour-card-skeleton'} key={item} />
						))}
					</Stack>
				) : error ? (
					<Stack className={'homepage-data-state'} alignItems="center">
						<Typography>Featured tours could not be loaded.</Typography>
						<Button onClick={() => refetch({ input })}>Try again</Button>
					</Stack>
				) : tours.length === 0 ? (
					<Stack className={'homepage-data-state'} alignItems="center">
						<Typography>New curated tours will appear here soon.</Typography>
						<Link href="/tour"><Button>Browse all tours</Button></Link>
					</Stack>
				) : (
					<MotionDiv
						className={'tour-card-grid'}
						variants={staggerContainer}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, amount: 0.12 }}
					>
						{tours.map((tour) => (
							<MotionDiv variants={fadeUp} key={tour._id}>
								<TourCard tour={tour} onLike={likeHandler} onSave={saveHandler} />
							</MotionDiv>
						))}
					</MotionDiv>
				)}
			</Stack>
		</MotionStack>
	);
};

export default TourHighlights;
