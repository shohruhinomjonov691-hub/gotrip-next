import React, { useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Button, Stack, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import TourRoundedIcon from '@mui/icons-material/TourRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import CollectionsRoundedIcon from '@mui/icons-material/CollectionsRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { motion, useReducedMotion } from 'framer-motion';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import TourCard from '../../libs/components/tour/TourCard';
import { GET_DESTINATION, GET_TOURS } from '../../apollo/user/query';
import { LIKE_TARGET_DESTINATION, LIKE_TARGET_TOUR, TOGGLE_WISHLIST } from '../../apollo/user/mutation';
import { Direction, Message } from '../../libs/enums/common.enum';
import { WishlistGroup } from '../../libs/enums/tour.enum';
import { Destination } from '../../libs/types/destination/destination';
import { Tour } from '../../libs/types/tour/tour';
import { T } from '../../libs/types/common';
import { REACT_APP_API_URL } from '../../libs/config';
import { userVar } from '../../apollo/store';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { fadeUp, hoverLift, staggerContainer, tapPress } from '../../libs/components/homepage/motion';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const destinationFallbackImages = [
	'/img/banner/cities/JEJU.webp',
	'/img/banner/cities/SEOUL.webp',
	'/img/banner/cities/BUSAN.webp',
	'/img/banner/cities/GYEONGJU.webp',
	'/img/banner/cities/INCHEON.webp',
];

const resolveDestinationImage = (image?: string, fallbackIndex = 0) => {
	const fallback = destinationFallbackImages[fallbackIndex % destinationFallbackImages.length];
	if (!image) return fallback;
	if (image.startsWith('http') || image.startsWith('/')) return image;
	return `${REACT_APP_API_URL}/${image}`;
};

const DestinationDetailPage: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const reduceMotion = useReducedMotion();
	const destinationId = router.query.id as string | undefined;
	const [destination, setDestination] = useState<Destination | null>(null);
	const [tours, setTours] = useState<Tour[]>([]);
	const [likeTargetDestination] = useMutation(LIKE_TARGET_DESTINATION);
	const [likeTargetTour] = useMutation(LIKE_TARGET_TOUR);
	const [toggleWishlist] = useMutation(TOGGLE_WISHLIST);

	const {
		loading: destinationLoading,
		error: destinationError,
		refetch: refetchDestination,
	} = useQuery(GET_DESTINATION, {
		fetchPolicy: 'network-only',
		variables: { destinationId },
		skip: !destinationId,
		onCompleted: (data: T) => setDestination(data?.getDestination ?? null),
	});

	const tourInput = useMemo(
		() => ({
			page: 1,
			limit: 6,
			sort: 'tourRank',
			direction: Direction.DESC,
			search: { destinationId },
		}),
		[destinationId],
	);

	const { loading: toursLoading, refetch: refetchTours } = useQuery(GET_TOURS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: tourInput },
		skip: !destinationId,
		onCompleted: (data: T) => setTours(data?.getTours?.list ?? []),
	});

	useEffect(() => {
		if (!router.isReady || destinationId) return;
		router.push('/destination').then();
	}, [router, destinationId]);

	const galleryImages = useMemo(() => {
		const apiImages = destination?.destinationImages ?? [];
		return Array.from({ length: 5 }).map((_, index) => resolveDestinationImage(apiImages[index], index));
	}, [destination?.destinationImages]);

	const heroImage = galleryImages[0];
	const isLiked = !!destination?.meLiked?.[0]?.myFavorite;
	const cityLabel = destination?.destinationCity || 'this destination';
	const countryLabel = destination?.destinationCountry || 'Destination';
	const overviewCopy =
		destination?.destinationDesc ||
		'This GoTrip destination is shaped for curated guided routes, considered pacing, and travel moments that feel both polished and personal.';

	const likeDestinationHandler = async () => {
		try {
			if (!destinationId) return;
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetDestination({ variables: { destinationId } });
			await refetchDestination({ destinationId });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const likeTourHandler = async (tourId: string) => {
		try {
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetTour({ variables: { tourId } });
			await refetchTours({ input: tourInput });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const saveTourHandler = async (tourId: string) => {
		try {
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			await toggleWishlist({ variables: { input: { wishlistGroup: WishlistGroup.TOUR, wishlistRefId: tourId } } });
			await sweetTopSmallSuccessAlert('Saved tours updated', 900);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	if (!router.isReady || (!destinationId && !destination)) {
		return (
			<Stack className="destination-detail-page gotrip-destination-detail">
				<section className="destination-detail-loading">
					<div className="destination-detail-skeleton hero" />
					<div className="gt-shell destination-detail-skeleton-grid">
						<div className="destination-detail-skeleton" />
						<div className="destination-detail-skeleton" />
						<div className="destination-detail-skeleton" />
					</div>
				</section>
			</Stack>
		);
	}

	if ((destinationLoading && !destination) || (!destinationError && destinationId && !destination)) {
		return (
			<Stack className="destination-detail-page gotrip-destination-detail">
				<section className="destination-detail-loading">
					<div className="destination-detail-skeleton hero" />
					<div className="gt-shell destination-detail-skeleton-grid">
						<div className="destination-detail-skeleton" />
						<div className="destination-detail-skeleton" />
						<div className="destination-detail-skeleton" />
					</div>
				</section>
			</Stack>
		);
	}

	if (destinationError || !destination) {
		return (
			<Stack className="destination-detail-page gotrip-destination-detail">
				<section className="destination-detail-missing gt-shell">
					<Typography component="h1" className="gt-heading">
						Destination could not be loaded
					</Typography>
					<Typography className="gt-muted">Return to destination discovery and choose another place to explore.</Typography>
					<Link href="/destination">
						<Button className="gt-primary-button">Back to destinations</Button>
					</Link>
				</section>
			</Stack>
		);
	}

	return (
		<Stack className="destination-detail-page gotrip-destination-detail">
			<section className="destination-story-hero">
				<motion.div
					className="destination-story-hero-image"
					initial={false}
					animate={reduceMotion ? {} : { y: [0, -16, 0], scale: [1.02, 1.06, 1.02] }}
					transition={reduceMotion ? undefined : { duration: 18, repeat: Infinity, ease: 'easeInOut' }}
				>
					<img
						src={heroImage}
						alt={destination.destinationTitle}
						onError={(event) => {
							event.currentTarget.src = destinationFallbackImages[0];
						}}
					/>
				</motion.div>
				<div className="destination-story-scrim" />
				<motion.div className="destination-story-hero-content gt-shell" variants={staggerContainer} initial="hidden" animate="visible">
					<motion.div variants={fadeUp} className="destination-story-copy">
						<span className="destination-luxury-badge">
							<AutoAwesomeRoundedIcon fontSize="small" />
							{countryLabel} collection
						</span>
						<Typography component="h1" className="gt-heading">
							{destination.destinationTitle}
						</Typography>
						<Typography className="destination-story-location">
							<LocationOnRoundedIcon />
							{destination.destinationCity}
							{destination.destinationAddress ? ` · ${destination.destinationAddress}` : ''}
						</Typography>
						<Typography className="destination-story-desc">{overviewCopy}</Typography>
						<Stack className="destination-story-actions" direction="row">
							<Link href={`/tour?destinationId=${destination._id}`}>
								<Button className="gt-primary-button" endIcon={<ArrowForwardRoundedIcon />}>
									View tours
								</Button>
							</Link>
							<motion.button
								type="button"
								className={isLiked ? 'destination-hero-like active' : 'destination-hero-like'}
								onClick={likeDestinationHandler}
								whileTap={tapPress}
								aria-label="Like destination"
							>
								{isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
								<span>{destination.destinationLikes || 0}</span>
							</motion.button>
						</Stack>
					</motion.div>
				</motion.div>
			</section>

			<main className="destination-story-main">
				<motion.section
					className="destination-stats-band gt-shell"
					variants={staggerContainer}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.25 }}
				>
					{[
						{ icon: <TourRoundedIcon />, label: 'Curated tours', value: destination.destinationTours || tours.length || 0 },
						{ icon: <VisibilityRoundedIcon />, label: 'Traveler views', value: destination.destinationViews || 0 },
						{ icon: <StarRoundedIcon />, label: 'Guest rating', value: destination.destinationRating || 'New' },
						{ icon: <FavoriteIcon />, label: 'Saved moments', value: destination.destinationLikes || 0 },
					].map((stat) => (
						<motion.div className="destination-stat-card" variants={fadeUp} whileHover={reduceMotion ? undefined : hoverLift} key={stat.label}>
							{stat.icon}
							<strong>{stat.value}</strong>
							<span>{stat.label}</span>
						</motion.div>
					))}
				</motion.section>

				<section className="destination-overview-section gt-shell">
					<motion.div className="destination-editorial" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
						<span className="gt-pill">
							<AutoAwesomeRoundedIcon fontSize="small" />
							The GoTrip experience
						</span>
						<Typography component="h2" className="gt-heading">
							A destination for slow mornings, sharp details, and guided discoveries.
						</Typography>
						<Typography className="gt-muted">{overviewCopy}</Typography>
					</motion.div>

					<motion.div
						className="destination-gallery-bento"
						variants={staggerContainer}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, amount: 0.18 }}
					>
						{galleryImages.map((image, index) => (
							<motion.div className={index === 0 ? 'destination-gallery-tile featured' : 'destination-gallery-tile'} variants={fadeUp} key={image + index}>
								<img
									src={image}
									alt={`${destination.destinationTitle} gallery ${index + 1}`}
									loading={index === 0 ? 'eager' : 'lazy'}
									onError={(event) => {
										event.currentTarget.src = destinationFallbackImages[index % destinationFallbackImages.length];
									}}
								/>
								<div>
									<CollectionsRoundedIcon />
									<span>{index === 0 ? 'Signature view' : 'Curated stop'}</span>
								</div>
							</motion.div>
						))}
					</motion.div>
				</section>

				<section className="destination-related-section gt-shell">
					<Stack className="destination-tour-heading" direction={{ xs: 'column', md: 'row' }} justifyContent="space-between">
						<div>
							<span className="gt-pill">
								<TourRoundedIcon fontSize="small" />
								Curated experiences
							</span>
							<Typography component="h2" className="gt-heading">
								Tours in {cityLabel}
							</Typography>
							<Typography className="gt-muted">Continue from destination inspiration into real GoTrip tour availability.</Typography>
						</div>
						<Link href={`/tour?destinationId=${destinationId}`}>
							<Button className="gt-primary-button" endIcon={<ArrowForwardRoundedIcon />}>
								View all tours
							</Button>
						</Link>
					</Stack>

					{toursLoading && !tours.length && (
						<div className="destination-tour-grid destination-related-skeletons">
							{Array.from({ length: 3 }).map((_, index) => (
								<div className="destination-detail-skeleton" key={index} />
							))}
						</div>
					)}

					{tours.length ? (
						<motion.div
							className="destination-tour-grid"
							variants={staggerContainer}
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true, amount: 0.12 }}
						>
							{tours.map((tour) => (
								<motion.div variants={fadeUp} key={tour._id}>
									<TourCard tour={tour} onLike={likeTourHandler} onSave={saveTourHandler} />
								</motion.div>
							))}
						</motion.div>
					) : (
						!toursLoading && (
							<div className="gt-empty-state destination-related-empty">
								<Typography component="h3">No tours are connected to this destination yet.</Typography>
								<Typography>Browse the wider tour collection while new experiences are curated.</Typography>
								<Link href={`/tour?destinationId=${destinationId}`}>
									<Button className="gt-primary-button">Browse tour discovery</Button>
								</Link>
							</div>
						)
					)}
				</section>

				<section className="destination-traveler-stories gt-shell">
					<motion.div className="destination-traveler-heading" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
						<Typography component="h2" className="gt-heading">
							Traveler Stories
						</Typography>
						<div className="destination-story-stars" aria-hidden="true">
							<span>★</span>
							<span>★</span>
							<span>★</span>
							<span>★</span>
							<span>★</span>
						</div>
						<Typography className="gt-muted">Rated by travelers who prefer curated routes and quiet luxury.</Typography>
					</motion.div>
					<motion.div
						className="destination-story-cards"
						variants={staggerContainer}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, amount: 0.2 }}
					>
						{[
							[`The feel of ${cityLabel} stayed with us long after the route ended.`, 'A considered journey with the right pauses, views, and local texture.'],
							['Our guide shaped the day around how we wanted to travel.', 'Nothing felt rushed, and every stop had a reason to be there.'],
						].map(([quote, copy]) => (
							<motion.article className="destination-story-card" variants={fadeUp} whileHover={reduceMotion ? undefined : hoverLift} key={quote}>
								<p>{quote}</p>
								<span>{copy}</span>
							</motion.article>
						))}
					</motion.div>
				</section>
			</main>
		</Stack>
	);
};

export default withLayoutFull(DestinationDetailPage);
