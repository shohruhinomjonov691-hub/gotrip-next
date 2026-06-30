import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from '@apollo/client';
import { Button, IconButton, Stack, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import BookmarkRemoveRoundedIcon from '@mui/icons-material/BookmarkRemoveRounded';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { motion, useReducedMotion } from 'framer-motion';
import { GET_MY_WISHLIST } from '../../../apollo/user/query';
import { TOGGLE_WISHLIST } from '../../../apollo/user/mutation';
import { Direction } from '../../enums/common.enum';
import { WishlistGroup } from '../../enums/tour.enum';
import { Wishlist } from '../../types/wishlist/wishlist';
import { Tour } from '../../types/tour/tour';
import { T } from '../../types/common';
import { REACT_APP_API_URL } from '../../config';
import { formatterStr } from '../../utils';
import { getFallbackImage } from '../homepage/homepageFallbacks';

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

const SavedTours = () => {
	const shouldReduceMotion = useReducedMotion();
	const [items, setItems] = useState<Wishlist[]>([]);
	const [removingTourId, setRemovingTourId] = useState('');
	const input = useMemo(
		() => ({
			page: 1,
			limit: 12,
			sort: 'createdAt',
			direction: Direction.DESC,
			search: { wishlistGroup: WishlistGroup.TOUR },
		}),
		[],
	);
	const [toggleWishlist] = useMutation(TOGGLE_WISHLIST);
	const { loading, error, refetch } = useQuery(GET_MY_WISHLIST, {
		fetchPolicy: 'cache-and-network',
		variables: { input },
		onCompleted: (data: T) => setItems(data?.getMyWishlist?.list ?? []),
	});

	const savedTours = items.filter((item) => item.tourData);

	const containerMotion = {
		hidden: {},
		visible: {
			transition: {
				staggerChildren: shouldReduceMotion ? 0 : 0.06,
				delayChildren: shouldReduceMotion ? 0 : 0.08,
			},
		},
	};

	const itemMotion = {
		hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 18 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: shouldReduceMotion ? 0.18 : 0.38, ease: easeOutExpo },
		},
	};

	const removeHandler = async (tourId: string) => {
		try {
			setRemovingTourId(tourId);
			await toggleWishlist({ variables: { input: { wishlistGroup: WishlistGroup.TOUR, wishlistRefId: tourId } } });
			const result = await refetch({ input });
			setItems(result?.data?.getMyWishlist?.list ?? []);
		} finally {
			setRemovingTourId('');
		}
	};

	const renderTourCard = (tour: Tour, wishlistId: string) => {
		const fallbackImage = getFallbackImage(tour._id || tour.tourTitle);
		const image = tour.tourImages?.[0] ? `${REACT_APP_API_URL}/${tour.tourImages[0]}` : fallbackImage;

		return (
			<motion.article
				className="saved-tour-card"
				key={wishlistId}
				variants={itemMotion}
				whileHover={shouldReduceMotion ? undefined : { y: -6 }}
			>
				<div className="saved-tour-media">
					<Link href={`/tour/detail?id=${tour._id}`} aria-label={`View ${tour.tourTitle}`}>
						<img
							src={image}
							alt={tour.tourTitle}
							loading="lazy"
							onError={(event) => {
								if (event.currentTarget.src.includes(fallbackImage)) return;
								event.currentTarget.src = fallbackImage;
							}}
						/>
					</Link>
					<div className="saved-tour-gradient" />
					<IconButton
						className="saved-tour-remove"
						aria-label={`Remove ${tour.tourTitle} from saved tours`}
						onClick={() => removeHandler(tour._id)}
						disabled={removingTourId === tour._id}
					>
						<BookmarkRemoveRoundedIcon />
					</IconButton>
					<div className="saved-tour-overlay">
						<Stack className="saved-tour-tags">
							<span>{tour.tourCategory}</span>
							<span>{tour.tourDifficulty || 'Curated'}</span>
						</Stack>
						<Link href={`/tour/detail?id=${tour._id}`}>
							<Typography className="saved-tour-title">{tour.tourTitle}</Typography>
						</Link>
						<Typography className="saved-tour-location">
							<LocationOnRoundedIcon />
							{tour.tourLocation} · {tour.tourDuration} day{tour.tourDuration === 1 ? '' : 's'}
						</Typography>
						<div className="saved-tour-bottom">
							<div className="saved-tour-price">
								<span>From</span>
								<strong>${formatterStr(tour.tourPrice)}</strong>
							</div>
							<Link href={`/tour/detail?id=${tour._id}`}>
								<Button className="saved-tour-cta" endIcon={<ArrowForwardRoundedIcon />}>
									Book now
								</Button>
							</Link>
						</div>
					</div>
				</div>
				<Stack className="saved-tour-body">
					<Typography className="saved-tour-desc">
						{tour.tourDesc || 'A curated GoTrip experience with local guidance and thoughtfully planned stops.'}
					</Typography>
					<Stack className="saved-tour-meta">
						<span>
							<GroupsOutlinedIcon />
							{tour.tourMinPeople}-{tour.tourMaxPeople} travelers
						</span>
						<span>
							<EventAvailableOutlinedIcon />
							{tour.tourAvailableSeats} seats
						</span>
						<span>
							<VisibilityOutlinedIcon />
							{formatterStr(tour.tourViews) || tour.tourViews}
						</span>
					</Stack>
				</Stack>
			</motion.article>
		);
	};

	return (
		<motion.section id="my-saved-page" variants={containerMotion} initial="hidden" animate="visible">
			<motion.div className="saved-hero" variants={itemMotion}>
				<Stack className="saved-copy">
					<Typography className="saved-kicker">Wishlist</Typography>
					<Typography className="main-title">Saved Tours</Typography>
					<Typography className="sub-title">Your handpicked shortlist for the next GoTrip journey.</Typography>
				</Stack>
				<Stack className="saved-summary">
					<strong>{savedTours.length}</strong>
					<span>{savedTours.length === 1 ? 'tour saved' : 'tours saved'}</span>
				</Stack>
			</motion.div>

			{loading && savedTours.length === 0 && (
				<div className="saved-skeleton-grid" aria-label="Loading saved tours">
					{[0, 1, 2].map((item) => (
						<div className="saved-skeleton-card" key={item}>
							<div />
							<span />
							<span />
							<span />
						</div>
					))}
				</div>
			)}

			{error && savedTours.length === 0 && (
				<motion.div className="saved-state-card error" variants={itemMotion} role="alert">
					<Typography className="state-title">Saved tours could not load</Typography>
					<Typography className="state-copy">Please refresh the list and try again.</Typography>
					<Button className="state-button" onClick={() => refetch({ input })} startIcon={<RefreshRoundedIcon />}>
						Refresh saved tours
					</Button>
				</motion.div>
			)}

			{!loading && !error && savedTours.length === 0 && (
				<motion.div className="saved-state-card" variants={itemMotion}>
					<Typography className="state-title">Your wishlist is empty</Typography>
					<Typography className="state-copy">
						Start with a destination that catches your eye, then save the tours you want to compare later.
					</Typography>
					<Link href="/tour">
						<Button className="state-button" endIcon={<ArrowForwardRoundedIcon />}>
							Explore tours
						</Button>
					</Link>
				</motion.div>
			)}

			{savedTours.length > 0 && (
				<motion.div className="saved-tour-grid" variants={containerMotion}>
					{savedTours.map((item) => renderTourCard(item.tourData!, item._id))}
				</motion.div>
			)}
		</motion.section>
	);
};

export default SavedTours;
