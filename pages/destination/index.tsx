import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Button, Pagination, Stack, TextField, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded';
import TravelExploreRoundedIcon from '@mui/icons-material/TravelExploreRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { motion, useReducedMotion } from 'framer-motion';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { GET_DESTINATIONS } from '../../apollo/user/query';
import { LIKE_TARGET_DESTINATION } from '../../apollo/user/mutation';
import { Direction, Message } from '../../libs/enums/common.enum';
import { Destination } from '../../libs/types/destination/destination';
import { DestinationsInquiry } from '../../libs/types/destination/destination.input';
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

const initialInput: DestinationsInquiry = {
	page: 1,
	limit: 9,
	sort: 'destinationRank',
	direction: Direction.DESC,
	search: {},
};

const localDestinationImages = [
	'/img/banner/cities/JEJU.webp',
	'/img/banner/cities/SEOUL.webp',
	'/img/banner/cities/BUSAN.webp',
	'/img/banner/cities/GYEONGJU.webp',
	'/img/banner/cities/INCHEON.webp',
	'/img/banner/cities/GWANGJU.webp',
];

type DestinationFilterOption = {
	key: string;
	label: string;
	type: 'all' | 'country' | 'city';
	value?: string;
};

const getDestinationImage = (destination: Destination, index = 0) => {
	const image = destination.destinationImages?.[index] || destination.destinationImages?.[0] || localDestinationImages[index % localDestinationImages.length];
	if (!image) return localDestinationImages[index % localDestinationImages.length];
	if (image.startsWith('http') || image.startsWith('/')) return image;
	return `${REACT_APP_API_URL}/${image}`;
};

const DestinationListPage: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const reduceMotion = useReducedMotion();
	const [input, setInput] = useState<DestinationsInquiry>(initialInput);
	const [text, setText] = useState('');
	const [destinations, setDestinations] = useState<Destination[]>([]);
	const [total, setTotal] = useState(0);
	const [likeTargetDestination] = useMutation(LIKE_TARGET_DESTINATION);

	useEffect(() => {
		if (!router.isReady) return;
		const nextSearch: T = {};
		if (router.query.text) nextSearch.text = router.query.text as string;
		if (router.query.country) nextSearch.country = router.query.country as string;
		if (router.query.city) nextSearch.city = router.query.city as string;
		setText((router.query.text as string) ?? '');
		setInput({ ...initialInput, search: nextSearch });
	}, [router.isReady, router.query.text, router.query.country, router.query.city]);

	const { loading, error, refetch } = useQuery(GET_DESTINATIONS, {
		fetchPolicy: 'cache-and-network',
		variables: { input },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setDestinations(data?.getDestinations?.list ?? []);
			setTotal(data?.getDestinations?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const filterOptions = useMemo<DestinationFilterOption[]>(() => {
		const countries = Array.from(new Set(destinations.map((destination) => destination.destinationCountry).filter(Boolean))).slice(0, 5);
		const cities = Array.from(new Set(destinations.map((destination) => destination.destinationCity).filter(Boolean))).slice(0, 6);

		return [
			{ key: 'all', label: 'All destinations', type: 'all' },
			...countries.map(
				(country): DestinationFilterOption => ({ key: `country-${country}`, label: country, type: 'country', value: country }),
			),
			...cities.map((city): DestinationFilterOption => ({ key: `city-${city}`, label: city, type: 'city', value: city })),
		];
	}, [destinations]);

	const resultCount = total;

	const applySearch = () => {
		setInput((prev) => ({ ...prev, page: 1, search: { ...prev.search, text: text.trim() || undefined } }));
	};

	const applyFilter = (type: string, value?: string) => {
		if (type === 'all') {
			setText('');
			setInput({ ...initialInput });
			return;
		}
		setInput((prev) => ({
			...prev,
			page: 1,
			search: {
				...prev.search,
				country: type === 'country' ? value : undefined,
				city: type === 'city' ? value : undefined,
			},
		}));
	};

	const clearFilters = () => {
		setText('');
		setInput({ ...initialInput });
	};

	const paginationHandler = (_: ChangeEvent<unknown>, page: number) => setInput({ ...input, page });

	const likeHandler = async (destinationId: string) => {
		try {
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetDestination({ variables: { destinationId } });
			await refetch({ input });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const isFilterActive = (type: string, value?: string) => {
		if (type === 'all') return !input.search.country && !input.search.city && !input.search.text;
		if (type === 'country') return input.search.country === value;
		if (type === 'city') return input.search.city === value;
		return false;
	};

	return (
		<Stack className="destination-page gotrip-destination-page">
			<section className="destination-discovery-hero">
				<motion.div
					className="destination-hero-image"
					initial={false}
					animate={reduceMotion ? {} : { scale: [1.02, 1.06, 1.02] }}
					transition={reduceMotion ? undefined : { duration: 18, repeat: Infinity, ease: 'easeInOut' }}
				>
					<img src="/img/banner/cities/JEJU.webp" alt="Premium GoTrip destination discovery" />
				</motion.div>
				<div className="destination-hero-overlay" />
				<motion.div className="destination-hero-inner gt-shell" variants={staggerContainer} initial="hidden" animate="visible">
					<motion.div variants={fadeUp} className="destination-hero-copy">
						<span className="gt-pill destination-hero-kicker">
							<TravelExploreRoundedIcon fontSize="small" />
						GoTrip destination guide
						</span>
						<Typography component="h1" className="gt-heading">
							Choose the place first. Let the journey unfold.
						</Typography>
						<Typography className="gt-muted">
							Curated cities, islands, coastlines, and cultural regions matched to real GoTrip tour experiences.
						</Typography>
						<Stack className="destination-hero-highlights" direction="row">
							<span>Private guides</span>
							<span>Curated routes</span>
							<span>Luxury pacing</span>
						</Stack>
					</motion.div>

					<motion.div variants={fadeUp} className="destination-search-panel gt-glass">
						<div>
							<Typography className="destination-panel-label">Where to next?</Typography>
							<Typography className="destination-panel-count">
								{resultCount || 0} destination{resultCount === 1 ? '' : 's'} available
							</Typography>
						</div>
						<div className="destination-search-row">
							<TextField
								fullWidth
								size="small"
								label="Search destinations"
								value={text}
								onChange={(event) => setText(event.target.value)}
								onKeyDown={(event) => {
									if (event.key === 'Enter') applySearch();
								}}
							/>
							<motion.div whileTap={tapPress}>
								<Button className="gt-primary-button" onClick={applySearch} startIcon={<SearchRoundedIcon />}>
									Search
								</Button>
							</motion.div>
						</div>
					</motion.div>
				</motion.div>
			</section>

			<section className="destination-filter-wrap">
				<div className="gt-shell">
					<div className="destination-filter-bar">
						{filterOptions.map((option) => (
							<motion.button
								key={option.key}
								type="button"
								className={isFilterActive(option.type, option.value) ? 'active' : ''}
								whileTap={tapPress}
								onClick={() => applyFilter(option.type, option.value)}
							>
								{option.label}
							</motion.button>
						))}
					</div>
				</div>
			</section>

			<section className="destination-grid-section gt-shell">
				<div className="destination-section-heading">
					<div>
						<span className="gt-pill">
							<AutoAwesomeRoundedIcon fontSize="small" />
							Top destinations
						</span>
						<Typography component="h2" className="gt-heading">
							Places built for memorable travel.
						</Typography>
					</div>
					<Button className="gt-secondary-button" onClick={clearFilters}>
						Clear filters
					</Button>
				</div>

				{loading && !destinations.length && (
					<div className="destination-bento-grid destination-skeleton-grid" aria-label="Loading destinations">
						{Array.from({ length: 6 }).map((_, index) => (
							<div className={index === 0 ? 'destination-skeleton-card featured' : 'destination-skeleton-card'} key={index}>
								<div />
								<span />
								<span />
							</div>
						))}
					</div>
				)}

				{error && !destinations.length && (
					<div className="gt-empty-state destination-error-state">
						<Typography component="h3">Destinations could not be loaded.</Typography>
						<Typography>Keep your filters and try the request again.</Typography>
						<Button className="gt-primary-button" onClick={() => refetch({ input })}>
							Retry
						</Button>
					</div>
				)}

				{!loading && !error && !destinations.length && (
					<div className="gt-empty-state destination-error-state">
						<Typography component="h3">No destinations match these filters.</Typography>
						<Typography>Try a broader city, country, or search phrase.</Typography>
						<Button className="gt-primary-button" onClick={clearFilters}>
							Clear filters
						</Button>
					</div>
				)}

				{destinations.length > 0 && (
					<motion.div
						className="destination-bento-grid"
						variants={staggerContainer}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, amount: 0.12 }}
					>
						{destinations.map((destination, index) => {
							const isLiked = !!destination.meLiked?.[0]?.myFavorite;
							const image = getDestinationImage(destination, index);
							const detailHref = `/destination/detail?id=${destination._id}`;
							const toursHref = `/tour?destinationId=${destination._id}`;

							return (
								<motion.article
									className={index === 0 ? 'destination-bento-card featured' : 'destination-bento-card'}
									key={destination._id}
									variants={fadeUp}
									whileHover={reduceMotion ? undefined : hoverLift}
								>
									<Link href={detailHref} className="destination-bento-media">
										<img
											src={image}
											alt={destination.destinationTitle}
											loading={index === 0 ? 'eager' : 'lazy'}
											onError={(event) => {
												event.currentTarget.src = localDestinationImages[index % localDestinationImages.length];
											}}
										/>
										<div className="destination-bento-scrim" />
										<span className="destination-bento-country">{destination.destinationCountry}</span>
									</Link>

									<div className="destination-bento-body">
										<div className="destination-bento-title-row">
											<Link href={detailHref}>
												<Typography className="destination-title">{destination.destinationTitle}</Typography>
											</Link>
											<motion.button
												type="button"
												className={isLiked ? 'destination-like active' : 'destination-like'}
												whileTap={tapPress}
												onClick={() => likeHandler(destination._id)}
												aria-label="Like destination"
											>
												{isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
											</motion.button>
										</div>

										<Typography className="destination-location">
											<LocationOnRoundedIcon fontSize="small" />
											{destination.destinationCity}
											{destination.destinationAddress ? ` · ${destination.destinationAddress}` : ''}
										</Typography>
										<Typography className="destination-description">
											{destination.destinationDesc || 'A GoTrip destination ready for curated guided experiences.'}
										</Typography>
										<Stack className="destination-stats" direction="row">
											<span>{destination.destinationTours || 0} tours</span>
											<span>{destination.destinationViews || 0} views</span>
											<span>
												<StarRoundedIcon fontSize="small" />
												{destination.destinationRating || 'New'}
											</span>
										</Stack>
										<Link href={toursHref}>
											<Button fullWidth className="gt-primary-button" endIcon={<ArrowForwardRoundedIcon />}>
												Discover tours
											</Button>
										</Link>
									</div>
								</motion.article>
							);
						})}
					</motion.div>
				)}

				{total > input.limit && (
					<Stack alignItems="center" className="destination-pagination">
						<Pagination count={Math.ceil(total / input.limit)} page={input.page} onChange={paginationHandler} />
					</Stack>
				)}
			</section>

			<section className="destination-distinction-section">
				<div className="gt-shell destination-distinction-grid">
					{[
						['Curated Routes', 'Destination-first itineraries designed around mood, pace, and local texture.'],
						['Guide Intelligence', 'Tours surface around city context, traveler intent, and operator quality.'],
						['Effortless Discovery', 'Move from inspiration to available tours without leaving the travel flow.'],
					].map(([title, description]) => (
						<motion.div className="destination-distinction-card" key={title} whileHover={reduceMotion ? undefined : hoverLift}>
							<span>{title}</span>
							<p>{description}</p>
						</motion.div>
					))}
				</div>
			</section>
		</Stack>
	);
};

export default withLayoutBasic(DestinationListPage);
