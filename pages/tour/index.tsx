import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutGth from '../../libs/components/layout/LayoutGth';
import TourCard from '../../libs/components/homepage-html/TourCard';
import { useTranslation } from '../../libs/i18n/useTranslation';
import { GET_TOURS, GET_DESTINATIONS } from '../../apollo/user/query';
import { LIKE_TARGET_TOUR } from '../../apollo/user/mutation';
import { Direction, Message } from '../../libs/enums/common.enum';
import { TourCategory, TourLocation } from '../../libs/enums/tour.enum';
import { Range, ToursInquiry } from '../../libs/types/tour/tour.input';
import { Tour } from '../../libs/types/tour/tour';
import { Destination, Destinations } from '../../libs/types/destination/destination';
import { T } from '../../libs/types/common';
import { userVar } from '../../apollo/store';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const initialInput: ToursInquiry = {
	page: 1,
	limit: 9,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

const sortOptions = [
	{ label: 'Newest first', sort: 'createdAt', direction: Direction.DESC },
	{ label: 'Most popular', sort: 'tourRank', direction: Direction.DESC },
	{ label: 'Most viewed', sort: 'tourViews', direction: Direction.DESC },
	{ label: 'Price low to high', sort: 'tourPrice', direction: Direction.ASC },
	{ label: 'Price high to low', sort: 'tourPrice', direction: Direction.DESC },
];

const skeletonItems = Array.from({ length: 6 }, (_, index) => index);

/** Debounce for the live keyword search — long enough to coalesce typing. */
const SEARCH_DEBOUNCE_MS = 300;

const DESTINATIONS_INPUT = {
	page: 1,
	limit: 50,
	sort: 'destinationRank',
	direction: Direction.DESC,
	search: {},
};

const CloseIcon = () => (
	<svg viewBox="0 0 24 24">
		<path d="M18 6L6 18M6 6l12 12" />
	</svg>
);

const TourListPage: NextPage = () => {
	const { t } = useTranslation();
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const [input, setInput] = useState<ToursInquiry>(initialInput);
	const [filtersOpen, setFiltersOpen] = useState(false);
	const [text, setText] = useState<string>('');

	const [likeTargetTour] = useMutation(LIKE_TARGET_TOUR);

	useEffect(() => {
		if (!router.isReady) return;
		const nextSearch: T = {};
		if (router.query.text) nextSearch.text = router.query.text as string;
		if (router.query.category) nextSearch.categoryList = [router.query.category as TourCategory];
		if (router.query.location) nextSearch.locationList = [router.query.location as TourLocation];
		if (router.query.destination) nextSearch.destinationId = router.query.destination as string;
		setText((router.query.text as string) ?? '');
		setInput({ ...initialInput, search: nextSearch });
	}, [router.isReady, router.query.text, router.query.category, router.query.location, router.query.destination]);

	/*
	 * `PricesRange` requires both bounds server-side, so a half-filled range is
	 * completed here with an open sentinel instead of changing the DTO:
	 *   min only  -> everything at or above min
	 *   max only  -> everything at or below max
	 * The UI state keeps only what the user actually typed.
	 */
	const queryInput = useMemo(() => {
		const search: T = { ...input.search };
		for (const key of ['pricesRange', 'durationRange'] as const) {
			const range = search[key];
			if (!range) continue;
			const hasStart = typeof range.start === 'number' && !Number.isNaN(range.start);
			const hasEnd = typeof range.end === 'number' && !Number.isNaN(range.end);
			if (!hasStart && !hasEnd) {
				delete search[key];
				continue;
			}
			search[key] = {
				start: hasStart ? range.start : 0,
				// GraphQL Int is 32-bit signed; this is its ceiling.
				end: hasEnd ? range.end : 2147483647,
			};
		}
		return { ...input, search };
	}, [input]);

	// Read straight off `data` rather than mirroring it into state via onCompleted:
	// with cache-and-network + notifyOnNetworkStatusChange, onCompleted does not fire
	// reliably, which left the list stuck on its loading skeleton.
	const { data, loading, error, refetch } = useQuery(GET_TOURS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: queryInput },
	});

	const tours: Tour[] = data?.getTours?.list ?? [];
	const total: number = data?.getTours?.metaCounter?.[0]?.total ?? 0;

	const applyTextSearch = useCallback(
		(raw: string) => {
			const normalized = raw.trim();
			setInput((prev) => {
				// Nothing changed — skip the state update so Apollo isn't re-queried.
				if ((prev.search.text ?? '') === normalized) return prev;
				const nextSearch = { ...prev.search };
				if (normalized) nextSearch.text = normalized;
				else delete nextSearch.text;
				return { ...prev, page: 1, search: nextSearch };
			});
		},
		[],
	);

	/*
	 * Live keyword search: every keystroke schedules a single debounced commit, so
	 * the list updates as you type without a Search button and without firing a
	 * request per character. Clearing the field restores the full list on the same
	 * path. Results already fetched stay served from the Apollo cache.
	 */
	useEffect(() => {
		const id = setTimeout(() => applyTextSearch(text), SEARCH_DEBOUNCE_MS);
		return () => clearTimeout(id);
	}, [text, applyTextSearch]);

	const { data: destinationsData } = useQuery<{ getDestinations: Destinations }>(GET_DESTINATIONS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: DESTINATIONS_INPUT },
	});
	const destinations: Destination[] = destinationsData?.getDestinations?.list ?? [];

	const activeFilterCount = useMemo(() => {
		const search = input.search;
		return [
			search.text,
			search.categoryList?.[0],
			search.locationList?.[0],
			search.destinationId,
			search.pricesRange,
			search.durationRange,
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
		if (rawValue === '' || Number.isNaN(value)) delete nextRange[edge];
		else nextRange[edge] = value;
		// Compare against undefined, not falsiness — 0 is a legitimate bound.
		if (nextRange.start === undefined && nextRange.end === undefined) delete (nextSearch as T)[key];
		else (nextSearch as T)[key] = nextRange;
		setInput({ ...input, page: 1, search: nextSearch });
	};

	/** "$200+", "up to $800", "$200 – $800" */
	const rangeLabel = (range: Range | undefined, prefix = '', suffix = '') => {
		if (!range) return '';
		const has = (v: unknown) => typeof v === 'number' && !Number.isNaN(v);
		const lo = has(range.start) ? `${prefix}${range.start}${suffix}` : null;
		const hi = has(range.end) ? `${prefix}${range.end}${suffix}` : null;
		if (lo && hi) return `${lo} – ${hi}`;
		if (lo) return `${lo}+`;
		return t('up to {{value}}', { value: hi });
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

	const paginationHandler = (value: number) => {
		setInput({ ...input, page: value });
		if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const likeHandler = async (tourId: string) => {
		try {
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetTour({ variables: { tourId } });
			await refetch({ input: queryInput });
			await sweetTopSmallSuccessAlert(t('success'), 800);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const pageCount = Math.ceil(total / input.limit);
	const destinationTitle = destinations.find((item) => item._id === input.search.destinationId)?.destinationTitle;

	return (
		<section className="pg-sec">
			<div className="wrap pg-layout">
				{/* ---------------- Filter sidebar ---------------- */}
				<aside className={filtersOpen ? 'pg-side open' : 'pg-side'}>
					<button className="btn btn-outline fl-toggle" onClick={() => setFiltersOpen((v) => !v)} type="button">
						{filtersOpen ? t('Hide filters') : activeFilterCount ? t('Filters ({{count}})', { count: activeFilterCount }) : t('Filters')}
					</button>

					<div className="pg-panel">
						<h3 className="pg-panel-title">{t('Refine search')}</h3>

						<div className="fl-field">
							<label htmlFor="fl-text">{t('Keyword')}</label>
							<div className="fl-search">
								<input
									aria-describedby="fl-text-hint"
									id="fl-text"
									onChange={(e) => setText(e.target.value)}
									// Enter commits immediately rather than waiting out the debounce.
									onKeyDown={(e) => e.key === 'Enter' && applyTextSearch(text)}
									placeholder={t('Tour name…') as string}
									type="search"
									value={text}
								/>
								{text && (
									<button aria-label={t('Clear keyword') as string} className="fl-search-clear" onClick={() => setText('')} type="button">
										<CloseIcon />
									</button>
								)}
							</div>
							<small className="fl-hint" id="fl-text-hint">
								{t('Results update as you type.')}
							</small>
						</div>

						<div className="fl-field">
							<label htmlFor="fl-cat">{t('Categories')}</label>
							<select
								id="fl-cat"
								onChange={(e) => updateSearch('categoryList', e.target.value)}
								value={(input.search.categoryList?.[0] as string) ?? ''}
							>
								<option value="">{t('All categories')}</option>
								{Object.values(TourCategory).map((category) => (
									<option key={category} value={category}>
										{t(category)}
									</option>
								))}
							</select>
						</div>

						<div className="fl-field">
							<label htmlFor="fl-dest">{t('Destination')}</label>
							<select
								id="fl-dest"
								onChange={(e) => updateSearch('destinationId', e.target.value)}
								value={input.search.destinationId ?? ''}
							>
								<option value="">{t('All destinations')}</option>
								{destinations.map((destination) => (
									<option key={destination._id} value={destination._id}>
										{destination.destinationTitle}
									</option>
								))}
							</select>
						</div>

						<div className="fl-field">
							<label htmlFor="fl-loc">{t('Locations')}</label>
							<select
								id="fl-loc"
								onChange={(e) => updateSearch('locationList', e.target.value)}
								value={(input.search.locationList?.[0] as string) ?? ''}
							>
								<option value="">{t('All Locations')}</option>
								{Object.values(TourLocation).map((location) => (
									<option key={location} value={location}>
										{t(location)}
									</option>
								))}
							</select>
						</div>

						<div className="fl-field">
							<label>{t('Price range ($)')}</label>
							<div className="fl-duo">
								<input
									onChange={(e) => updateRangeSearch('pricesRange', 'start', e.target.value)}
									placeholder={t('Min') as string}
									type="number"
									value={input.search.pricesRange?.start ?? ''}
								/>
								<input
									onChange={(e) => updateRangeSearch('pricesRange', 'end', e.target.value)}
									placeholder={t('Max') as string}
									type="number"
									value={input.search.pricesRange?.end ?? ''}
								/>
							</div>
						</div>

						<div className="fl-field">
							<label>{t('Duration (days)')}</label>
							<div className="fl-duo">
								<input
									onChange={(e) => updateRangeSearch('durationRange', 'start', e.target.value)}
									placeholder={t('Min') as string}
									type="number"
									value={input.search.durationRange?.start ?? ''}
								/>
								<input
									onChange={(e) => updateRangeSearch('durationRange', 'end', e.target.value)}
									placeholder={t('Max') as string}
									type="number"
									value={input.search.durationRange?.end ?? ''}
								/>
							</div>
						</div>

						<div className="fl-actions">
							<button className="btn btn-outline" onClick={clearAllFilters} type="button">
								{t('Reset')}
							</button>
						</div>
					</div>
				</aside>

				{/* ---------------- Results ---------------- */}
				<div>
					<div className="pg-toolbar">
						<div className="pg-count">
							{loading && !total ? t('Finding tours…') : <b>{t('{{count}} tours found', { count: total })}</b>}
							<small>
								{activeFilterCount
									? t('{{count}} active filters', { count: activeFilterCount })
									: t('Browsing every published route')}
							</small>
						</div>
						<div className="pg-sort">
							<span>{t('Sort by')}</span>
							<select onChange={(e) => sortHandler(e.target.value)} value={currentSort}>
								{sortOptions.map((item) => (
									<option key={item.label} value={item.label}>
										{t(item.label)}
									</option>
								))}
							</select>
						</div>
					</div>

					{activeFilterCount > 0 && (
						<div className="fl-chips">
							{input.search.text && (
								<button className="fl-chip" onClick={() => clearFilter('text')} type="button">
									“{input.search.text}” <CloseIcon />
								</button>
							)}
							{input.search.categoryList?.[0] && (
								<button className="fl-chip" onClick={() => clearFilter('categoryList')} type="button">
									{t(input.search.categoryList[0])} <CloseIcon />
								</button>
							)}
							{input.search.destinationId && (
								<button className="fl-chip" onClick={() => clearFilter('destinationId')} type="button">
									{destinationTitle ?? t('Destination')} <CloseIcon />
								</button>
							)}
							{input.search.locationList?.[0] && (
								<button className="fl-chip" onClick={() => clearFilter('locationList')} type="button">
									{t(input.search.locationList[0])} <CloseIcon />
								</button>
							)}
							{input.search.pricesRange && (
								<button className="fl-chip" onClick={() => clearFilter('pricesRange')} type="button">
									{rangeLabel(input.search.pricesRange, '$')} <CloseIcon />
								</button>
							)}
							{input.search.durationRange && (
								<button className="fl-chip" onClick={() => clearFilter('durationRange')} type="button">
									{rangeLabel(input.search.durationRange, '', ` ${t('days')}`)} <CloseIcon />
								</button>
							)}
						</div>
					)}

					{error && !loading && tours.length === 0 && (
						<div className="pg-state">
							<h3>{t('Tours could not be loaded')}</h3>
							<p>{t('Please try again in a moment.')}</p>
							<button className="btn btn-sky" onClick={() => refetch({ input: queryInput })} type="button">
								{t('Try again')}
							</button>
						</div>
					)}

					{loading && tours.length === 0 && !error && (
						<div className="pg-grid">
							{skeletonItems.map((item) => (
								<div className="pg-skeleton" key={item} />
							))}
						</div>
					)}

					{!loading && !error && tours.length === 0 && (
						<div className="pg-state">
							<h3>{t('No tours match these filters')}</h3>
							<p>{t('Reset your filters or search for another destination style.')}</p>
							<button className="btn btn-sky" onClick={clearAllFilters} type="button">
								{t('Clear filters')}
							</button>
						</div>
					)}

					{tours.length > 0 && (
						<div className="pg-grid">
							{tours.map((tour) => (
								<TourCard detailed key={tour._id} onLike={likeHandler} tour={tour} />
							))}
						</div>
					)}

					{pageCount > 1 && (
						<div className="pg-pager">
							<button disabled={input.page === 1} onClick={() => paginationHandler(input.page - 1)} type="button">
								{t('Prev')}
							</button>
							{Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
								<button
									className={page === input.page ? 'on' : ''}
									key={page}
									onClick={() => paginationHandler(page)}
									type="button"
								>
									{page}
								</button>
							))}
							<button
								disabled={input.page === pageCount}
								onClick={() => paginationHandler(input.page + 1)}
								type="button"
							>
								{t('Next')}
							</button>
						</div>
					)}
				</div>
			</div>
		</section>
	);
};

export default withLayoutGth(TourListPage);
