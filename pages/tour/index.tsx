import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Box, Button, Chip, Collapse, Divider, MenuItem, Pagination, Stack, TextField, Typography, useMediaQuery } from '@mui/material';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SortRoundedIcon from '@mui/icons-material/SortRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { motion, useReducedMotion } from 'framer-motion';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import TourCard from '../../libs/components/tour/TourCard';
import { GET_TOURS } from '../../apollo/user/query';
import { LIKE_TARGET_TOUR, TOGGLE_WISHLIST } from '../../apollo/user/mutation';
import { Direction, Message } from '../../libs/enums/common.enum';
import { TourCategory, TourLocation, WishlistGroup } from '../../libs/enums/tour.enum';
import { Range, ToursInquiry } from '../../libs/types/tour/tour.input';
import { Tour } from '../../libs/types/tour/tour';
import { T } from '../../libs/types/common';
import { userVar } from '../../apollo/store';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { easeOutExpo, staggerContainer, tapPress } from '../../libs/components/homepage/motion';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const initialInput: ToursInquiry = {
	page: 1,
	limit: 8,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

const MotionBox = motion(Box);
const MotionStack = motion(Stack);

const sortOptions = [
	{ label: 'Newest first', sort: 'createdAt', direction: Direction.DESC },
	{ label: 'Most popular', sort: 'tourRank', direction: Direction.DESC },
	{ label: 'Most viewed', sort: 'tourViews', direction: Direction.DESC },
	{ label: 'Price low to high', sort: 'tourPrice', direction: Direction.ASC },
	{ label: 'Price high to low', sort: 'tourPrice', direction: Direction.DESC },
];

const skeletonItems = Array.from({ length: 8 }, (_, index) => index);

const softFadeUp = {
	hidden: { opacity: 0.98, y: 12 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.28, ease: easeOutExpo },
	},
};

const TourListPage: NextPage = () => {
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const reduceMotion = useReducedMotion();
	const compactFilters = useMediaQuery('(max-width: 620px)', { noSsr: true });
	const [input, setInput] = useState<ToursInquiry>(initialInput);
	const [filtersOpen, setFiltersOpen] = useState(false);
	const [text, setText] = useState<string>('');
	const [tours, setTours] = useState<Tour[]>([]);
	const [total, setTotal] = useState<number>(0);

	const [likeTargetTour] = useMutation(LIKE_TARGET_TOUR);
	const [toggleWishlist] = useMutation(TOGGLE_WISHLIST);

	useEffect(() => {
		if (!router.isReady) return;
		const nextSearch: T = {};
		if (router.query.text) nextSearch.text = router.query.text as string;
		if (router.query.category) nextSearch.categoryList = [router.query.category as TourCategory];
		if (router.query.location) nextSearch.locationList = [router.query.location as TourLocation];
		if (router.query.destinationId) nextSearch.destinationId = router.query.destinationId as string;
		setText((router.query.text as string) ?? '');
		setInput({ ...initialInput, search: nextSearch });
	}, [router.isReady, router.query.text, router.query.category, router.query.location, router.query.destinationId]);

	const { loading, error, refetch } = useQuery(GET_TOURS, {
		fetchPolicy: 'cache-and-network',
		variables: { input },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setTours(data?.getTours?.list ?? []);
			setTotal(data?.getTours?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const activeFilterCount = useMemo(() => {
		const search = input.search;
		return [
			search.text,
			search.categoryList?.[0],
			search.locationList?.[0],
			search.destinationId,
			search.pricesRange?.start || search.pricesRange?.end,
			search.durationRange?.start || search.durationRange?.end,
		].filter(Boolean).length;
	}, [input.search]);

	const currentSort = useMemo(() => {
		const matched = sortOptions.find((item) => item.sort === input.sort && item.direction === input.direction);
		return matched?.label ?? 'Newest first';
	}, [input.direction, input.sort]);

	const updateSearch = (key: string, value: string) => {
		const nextSearch = { ...input.search };
		if (!value) delete (nextSearch as T)[key];
		else if (key === 'categoryList') (nextSearch as T)[key] = [value];
		else if (key === 'locationList') (nextSearch as T)[key] = [value];
		else (nextSearch as T)[key] = value;
		setInput({ ...input, page: 1, search: nextSearch });
	};

	const updateRangeSearch = (key: 'pricesRange' | 'durationRange', edge: keyof Range, rawValue: string) => {
		const nextSearch = { ...input.search };
		const nextRange = { ...((nextSearch as T)[key] ?? {}) };
		const value = Number(rawValue);
		if (!rawValue || Number.isNaN(value)) delete nextRange[edge];
		else nextRange[edge] = value;
		if (!nextRange.start && !nextRange.end) delete (nextSearch as T)[key];
		else (nextSearch as T)[key] = nextRange;
		setInput({ ...input, page: 1, search: nextSearch });
	};

	const applyTextSearch = () => {
		const normalized = text.trim();
		const nextSearch = { ...input.search };
		if (normalized) nextSearch.text = normalized;
		else delete nextSearch.text;
		setInput({ ...input, page: 1, search: nextSearch });
	};

	const clearFilter = (key: string) => {
		const nextSearch = { ...input.search };
		delete (nextSearch as T)[key];
		if (key === 'text') setText('');
		setInput({ ...input, page: 1, search: nextSearch });
	};

	const clearAllFilters = () => {
		setText('');
		setInput({ ...initialInput });
	};

	const sortHandler = (label: string) => {
		const selected = sortOptions.find((item) => item.label === label);
		if (!selected) return;
		setInput({ ...input, page: 1, sort: selected.sort, direction: selected.direction });
	};

	const paginationHandler = (_: ChangeEvent<unknown>, value: number) => setInput({ ...input, page: value });

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
			await sweetTopSmallSuccessAlert('Saved tours updated', 900);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const cardContainerVariants = reduceMotion ? undefined : staggerContainer;
	const cardItemVariants = reduceMotion ? undefined : softFadeUp;
	const filtersVisible = !compactFilters || filtersOpen;

	return (
		<Stack className="tour-discovery-page">
			<MotionStack
				className="tour-discovery-shell"
				variants={reduceMotion ? undefined : staggerContainer}
				initial={reduceMotion ? false : 'hidden'}
				animate="visible"
			>
				<MotionStack className="tour-discovery-hero" variants={reduceMotion ? undefined : softFadeUp}>
					<Stack className="tour-discovery-copy">
						<Typography className="tour-discovery-kicker">
							<ExploreRoundedIcon />
							GoTrip curated collection
						</Typography>
						<Typography component="h1" className="tour-discovery-title">
							Explore premium tours crafted by local experts
						</Typography>
						<Typography className="tour-discovery-subtitle">
							Compare guided journeys, private routes, and destination experiences with clear details before you
							book.
						</Typography>
					</Stack>
					<Stack className="tour-discovery-stats" direction="row">
						<div>
							<strong>{loading && !total ? '...' : total}</strong>
							<span>Tours found</span>
						</div>
						<div>
							<strong>{activeFilterCount}</strong>
							<span>Active filters</span>
						</div>
					</Stack>
				</MotionStack>

				<MotionStack className="tour-filter-panel gt-glass" variants={reduceMotion ? undefined : softFadeUp}>
					<Stack className="tour-filter-heading" direction={{ xs: 'column', md: 'row' }}>
						<Stack>
							<Typography className="filter-title">
								<TuneRoundedIcon />
								Refine your journey
							</Typography>
							<Typography className="filter-copy">Search by destination style, city, pace, and budget.</Typography>
						</Stack>
						<Stack className="tour-filter-actions" direction="row">
							{compactFilters && (
								<Button
									className="filter-toggle"
									startIcon={<FilterAltRoundedIcon />}
									onClick={() => setFiltersOpen((current) => !current)}
									aria-expanded={filtersOpen}
								>
									{filtersOpen ? 'Hide filters' : `Filters${activeFilterCount ? ` (${activeFilterCount})` : ''}`}
								</Button>
							)}
							<motion.div whileTap={tapPress}>
								<Button className="filter-reset" startIcon={<RestartAltRoundedIcon />} onClick={clearAllFilters}>
									Clear all
								</Button>
							</motion.div>
						</Stack>
					</Stack>
					<Collapse in={filtersVisible} timeout={reduceMotion ? 0 : 180} className="tour-filter-collapse">
					<Stack className="tour-filter-grid">
						<TextField
							fullWidth
							label="Search tours"
							value={text}
							onChange={(event) => setText(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === 'Enter') applyTextSearch();
							}}
							InputProps={{ startAdornment: <SearchRoundedIcon className="filter-input-icon" /> }}
						/>
						<TextField
							select
							label="Category"
							value={(input.search.categoryList?.[0] as string) ?? ''}
							onChange={(event) => updateSearch('categoryList', event.target.value)}
						>
							<MenuItem value="">All categories</MenuItem>
							{Object.values(TourCategory).map((category) => (
								<MenuItem key={category} value={category}>
									{category}
								</MenuItem>
							))}
						</TextField>
						<TextField
							select
							label="Location"
							value={(input.search.locationList?.[0] as string) ?? ''}
							onChange={(event) => updateSearch('locationList', event.target.value)}
						>
							<MenuItem value="">All locations</MenuItem>
							{Object.values(TourLocation).map((location) => (
								<MenuItem key={location} value={location}>
									{location}
								</MenuItem>
							))}
						</TextField>
						<TextField
							type="number"
							label="Min price"
							value={input.search.pricesRange?.start ?? ''}
							onChange={(event) => updateRangeSearch('pricesRange', 'start', event.target.value)}
						/>
						<TextField
							type="number"
							label="Max price"
							value={input.search.pricesRange?.end ?? ''}
							onChange={(event) => updateRangeSearch('pricesRange', 'end', event.target.value)}
						/>
						<TextField
							type="number"
							label="Max days"
							value={input.search.durationRange?.end ?? ''}
							onChange={(event) => updateRangeSearch('durationRange', 'end', event.target.value)}
							InputProps={{ startAdornment: <CalendarMonthRoundedIcon className="filter-input-icon" /> }}
						/>
						<motion.div whileTap={tapPress} className="tour-filter-submit-wrap">
							<Button className="gt-primary-button tour-filter-submit" onClick={applyTextSearch}>
								Search tours
							</Button>
						</motion.div>
					</Stack>
					{activeFilterCount > 0 && (
						<Stack className="tour-active-filters" direction="row">
							{input.search.text && (
								<Chip label={`Search: ${input.search.text}`} onDelete={() => clearFilter('text')} deleteIcon={<CloseRoundedIcon />} />
							)}
							{input.search.categoryList?.[0] && (
								<Chip
									label={`Category: ${input.search.categoryList[0]}`}
									onDelete={() => clearFilter('categoryList')}
									deleteIcon={<CloseRoundedIcon />}
								/>
							)}
							{input.search.locationList?.[0] && (
								<Chip
									label={`Location: ${input.search.locationList[0]}`}
									onDelete={() => clearFilter('locationList')}
									deleteIcon={<CloseRoundedIcon />}
								/>
							)}
							{input.search.destinationId && (
								<Chip
									label={`Destination: ${input.search.destinationId.slice(0, 8)}...`}
									onDelete={() => clearFilter('destinationId')}
									deleteIcon={<CloseRoundedIcon />}
								/>
							)}
							{input.search.pricesRange && (
								<Chip label="Price range" onDelete={() => clearFilter('pricesRange')} deleteIcon={<CloseRoundedIcon />} />
							)}
							{input.search.durationRange && (
								<Chip label="Duration" onDelete={() => clearFilter('durationRange')} deleteIcon={<CloseRoundedIcon />} />
							)}
						</Stack>
					)}
					</Collapse>
				</MotionStack>

				<MotionStack className="tour-results-toolbar" variants={reduceMotion ? undefined : softFadeUp}>
					<Stack>
						<Typography className="results-eyebrow">Available experiences</Typography>
						<Typography className="results-title">
							{loading && !total ? 'Finding the best tours' : `${total} tour${total === 1 ? '' : 's'} ready to explore`}
						</Typography>
					</Stack>
					<TextField
						select
						size="small"
						className="tour-sort-select"
						label="Sort"
						value={currentSort}
						onChange={(event) => sortHandler(event.target.value)}
						InputProps={{ startAdornment: <SortRoundedIcon className="filter-input-icon" /> }}
					>
						{sortOptions.map((item) => (
							<MenuItem key={item.label} value={item.label}>
								{item.label}
							</MenuItem>
						))}
					</TextField>
				</MotionStack>

				<Divider className="tour-results-divider" />

				{error && !loading && tours.length === 0 && (
					<MotionBox className="tour-discovery-state error" variants={reduceMotion ? undefined : softFadeUp}>
						<Typography className="state-title">Tours could not be loaded</Typography>
						<Typography className="state-copy">Please try again in a moment.</Typography>
						<Button className="gt-primary-button" onClick={() => refetch({ input })}>
							Try again
						</Button>
					</MotionBox>
				)}

				{loading && tours.length === 0 && (
					<div className="tour-results-grid">
						{skeletonItems.map((item) => (
							<div className="tour-card-skeleton listing" key={item}>
								<div className="skeleton-media" />
								<div className="skeleton-line wide" />
								<div className="skeleton-line" />
								<div className="skeleton-pills" />
							</div>
						))}
					</div>
				)}

				{!loading && !error && tours.length === 0 && (
					<MotionBox className="tour-discovery-state" variants={reduceMotion ? undefined : softFadeUp}>
						<Typography className="state-title">No tours match these filters</Typography>
						<Typography className="state-copy">Reset your filters or search for another destination style.</Typography>
						<Button className="gt-primary-button" startIcon={<RestartAltRoundedIcon />} onClick={clearAllFilters}>
							Clear filters
						</Button>
					</MotionBox>
				)}

				{tours.length > 0 && (
					<MotionBox
						className="tour-results-grid"
						variants={cardContainerVariants}
						initial={reduceMotion ? false : 'hidden'}
						animate="visible"
					>
						{tours.map((tour) => (
							<MotionBox key={tour._id} variants={cardItemVariants}>
								<TourCard tour={tour} onLike={likeHandler} onSave={saveHandler} />
							</MotionBox>
						))}
					</MotionBox>
				)}

				{total > input.limit && (
					<Stack className="tour-pagination">
						<Pagination count={Math.ceil(total / input.limit)} page={input.page} onChange={paginationHandler} />
					</Stack>
				)}
			</MotionStack>
		</Stack>
	);
};

export default withLayoutBasic(TourListPage);
