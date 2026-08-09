import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutGth from '../../libs/components/layout/LayoutGth';
import GuideCard from '../../libs/components/homepage-html/GuideCard';
import { GET_AGENTS } from '../../apollo/user/query';
import { Member, Members } from '../../libs/types/member/member';
import { AgentsInquiry } from '../../libs/types/member/member.input';
import { Direction } from '../../libs/enums/common.enum';
import { TourCategory, TourLanguage } from '../../libs/enums/tour.enum';
import { T } from '../../libs/types/common';
import { useTranslation } from '../../libs/i18n/useTranslation';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

/** Debounce for the live keyword search — long enough to coalesce typing. */
const SEARCH_DEBOUNCE_MS = 300;

const initialInput: AgentsInquiry = {
	page: 1,
	limit: 9,
	sort: 'memberRank',
	direction: Direction.DESC,
	search: {},
};

const sortOptions = [
	{ label: 'Top rated', sort: 'memberRank', direction: Direction.DESC },
	{ label: 'Newest first', sort: 'createdAt', direction: Direction.DESC },
	{ label: 'Most tours', sort: 'memberTours', direction: Direction.DESC },
	{ label: 'Most liked', sort: 'memberLikes', direction: Direction.DESC },
	{ label: 'Most viewed', sort: 'memberViews', direction: Direction.DESC },
];

const skeletonItems = Array.from({ length: 6 }, (_, i) => i);

const CloseIcon = () => (
	<svg viewBox="0 0 24 24">
		<path d="M18 6L6 18M6 6l12 12" />
	</svg>
);

const GuideListPage: NextPage = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const [input, setInput] = useState<AgentsInquiry>(initialInput);
	const [filtersOpen, setFiltersOpen] = useState(false);
	const [text, setText] = useState('');

	useEffect(() => {
		if (!router.isReady) return;
		const nextSearch: T = {};
		if (router.query.text) nextSearch.text = router.query.text as string;
		if (router.query.specialty) nextSearch.specialties = [router.query.specialty as TourCategory];
		if (router.query.language) nextSearch.languages = [router.query.language as TourLanguage];
		setText((router.query.text as string) ?? '');
		setInput({ ...initialInput, search: nextSearch });
	}, [router.isReady, router.query.text, router.query.specialty, router.query.language]);

	// Read straight off `data` — onCompleted does not fire reliably with
	// cache-and-network, which previously left this list stuck on its empty state.
	const { data, loading, error, refetch } = useQuery<{ getAgents: Members }>(GET_AGENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input },
	});

	const guides: Member[] = data?.getAgents?.list ?? [];
	const total: number = data?.getAgents?.metaCounter?.[0]?.total ?? 0;

	const activeFilterCount = useMemo(() => {
		const s = input.search;
		return [s.text, s.languages?.[0], s.specialties?.[0], s.location].filter(Boolean).length;
	}, [input.search]);

	const currentSort = useMemo(() => {
		const m = sortOptions.find((o) => o.sort === input.sort && o.direction === input.direction);
		return m?.label ?? 'Top rated';
	}, [input.sort, input.direction]);

	const updateSearch = (key: string, value: string) => {
		const next = { ...input.search };
		if (!value) delete (next as T)[key];
		else if (key === 'languages' || key === 'specialties') (next as T)[key] = [value];
		else (next as T)[key] = value;
		setInput({ ...input, page: 1, search: next });
	};

	const applyTextSearch = useCallback((raw: string) => {
		const normalized = raw.trim();
		setInput((prev) => {
			// Unchanged text — skip the update so Apollo isn't re-queried.
			if ((prev.search.text ?? '') === normalized) return prev;
			const next = { ...prev.search };
			if (normalized) next.text = normalized;
			else delete next.text;
			return { ...prev, page: 1, search: next };
		});
	}, []);

	/*
	 * Live keyword search: each keystroke schedules one debounced commit, so the
	 * grid filters as you type without a Search button and without a request per
	 * character. Clearing the field restores every guide on the same path.
	 */
	useEffect(() => {
		const id = setTimeout(() => applyTextSearch(text), SEARCH_DEBOUNCE_MS);
		return () => clearTimeout(id);
	}, [text, applyTextSearch]);

	const clearFilter = (key: string) => {
		const next = { ...input.search };
		delete (next as T)[key];
		if (key === 'text') setText('');
		setInput({ ...input, page: 1, search: next });
	};

	const clearAll = () => {
		setText('');
		setInput({ ...initialInput });
	};

	const sortHandler = (label: string) => {
		const s = sortOptions.find((o) => o.label === label);
		if (!s) return;
		setInput({ ...input, page: 1, sort: s.sort, direction: s.direction });
	};

	const goToPage = (page: number) => {
		setInput({ ...input, page });
		if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const pageCount = Math.ceil(total / input.limit);

	return (
		<section className="pg-sec">
			<div className="wrap pg-layout">
				<aside className={filtersOpen ? 'pg-side open' : 'pg-side'}>
					<button className="btn btn-outline fl-toggle" onClick={() => setFiltersOpen((v) => !v)} type="button">
						{filtersOpen ? t('Hide filters') : activeFilterCount ? t('Filters ({{count}})', { count: activeFilterCount }) : t('Filters')}
					</button>

					<div className="pg-panel">
						<h3 className="pg-panel-title">{t('Find a guide')}</h3>

						<div className="fl-field">
							<label htmlFor="g-text">{t('Keyword')}</label>
							<div className="fl-search">
								<input
									aria-describedby="g-text-hint"
									id="g-text"
									onChange={(e) => setText(e.target.value)}
									onKeyDown={(e) => e.key === 'Enter' && applyTextSearch(text)}
									placeholder={t('Guide name…') as string}
									type="search"
									value={text}
								/>
								{text && (
									<button aria-label={t('Clear keyword') as string} className="fl-search-clear" onClick={() => setText('')} type="button">
										<CloseIcon />
									</button>
								)}
							</div>
							<small className="fl-hint" id="g-text-hint">
								{t('Results update as you type.')}
							</small>
						</div>

						<div className="fl-field">
							<label htmlFor="g-spec">{t('Specialty')}</label>
							<select
								id="g-spec"
								onChange={(e) => updateSearch('specialties', e.target.value)}
								value={(input.search.specialties?.[0] as string) ?? ''}
							>
								<option value="">{t('All specialties')}</option>
								{Object.values(TourCategory).map((c) => (
									<option key={c} value={c}>
										{t(c)}
									</option>
								))}
							</select>
						</div>

						<div className="fl-field">
							<label htmlFor="g-lang">{t('Language')}</label>
							<select
								id="g-lang"
								onChange={(e) => updateSearch('languages', e.target.value)}
								value={(input.search.languages?.[0] as string) ?? ''}
							>
								<option value="">{t('Any language')}</option>
								{Object.values(TourLanguage).map((l) => (
									<option key={l} value={l}>
										{t(l)}
									</option>
								))}
							</select>
						</div>

						<div className="fl-field">
							<label htmlFor="g-loc">{t('Location')}</label>
							<input
								id="g-loc"
								onChange={(e) => updateSearch('location', e.target.value)}
								placeholder={t('City or country…') as string}
								value={input.search.location ?? ''}
							/>
						</div>

						<div className="fl-actions">
							<button className="btn btn-outline" onClick={clearAll} type="button">
								{t('Reset')}
							</button>
						</div>
					</div>
				</aside>

				<div>
					<div className="pg-toolbar">
						<div className="pg-count">
							{loading && !total ? t('Finding guides…') : <b>{t('{{count}} guides available', { count: total })}</b>}
							<small>
								{activeFilterCount
									? t('{{count}} active filters', { count: activeFilterCount })
									: t('Every verified GoTrip guide')}
							</small>
						</div>
						<div className="pg-sort">
							<span>{t('Sort by')}</span>
							<select onChange={(e) => sortHandler(e.target.value)} value={currentSort}>
								{sortOptions.map((o) => (
									<option key={o.label} value={o.label}>
										{t(o.label)}
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
							{input.search.specialties?.[0] && (
								<button className="fl-chip" onClick={() => clearFilter('specialties')} type="button">
									{t(input.search.specialties[0])} <CloseIcon />
								</button>
							)}
							{input.search.languages?.[0] && (
								<button className="fl-chip" onClick={() => clearFilter('languages')} type="button">
									{t(input.search.languages[0])} <CloseIcon />
								</button>
							)}
							{input.search.location && (
								<button className="fl-chip" onClick={() => clearFilter('location')} type="button">
									{input.search.location} <CloseIcon />
								</button>
							)}
						</div>
					)}

					{error && !loading && guides.length === 0 && (
						<div className="pg-state">
							<h3>{t('Guides could not be loaded')}</h3>
							<p>{t('Please try again in a moment.')}</p>
							<button className="btn btn-sky" onClick={() => refetch({ input })} type="button">
								{t('Try again')}
							</button>
						</div>
					)}

					{loading && guides.length === 0 && !error && (
						<div className="pg-grid guides">
							{skeletonItems.map((i) => (
								<div className="pg-skeleton" key={i} style={{ height: 360 }} />
							))}
						</div>
					)}

					{!loading && !error && guides.length === 0 && (
						<div className="pg-state">
							<h3>{t('No guides match these filters')}</h3>
							<p>{t('Try a different specialty, language or location.')}</p>
							<button className="btn btn-sky" onClick={clearAll} type="button">
								{t('Clear filters')}
							</button>
						</div>
					)}

					{guides.length > 0 && (
						<div className="pg-grid guides">
							{guides.map((guide) => (
								<GuideCard guide={guide} key={guide._id} />
							))}
						</div>
					)}

					{pageCount > 1 && (
						<div className="pg-pager">
							<button disabled={input.page === 1} onClick={() => goToPage(input.page - 1)} type="button">
								{t('Prev')}
							</button>
							{Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
								<button className={p === input.page ? 'on' : ''} key={p} onClick={() => goToPage(p)} type="button">
									{p}
								</button>
							))}
							<button disabled={input.page === pageCount} onClick={() => goToPage(input.page + 1)} type="button">
								{t('Next')}
							</button>
						</div>
					)}
				</div>
			</div>
		</section>
	);
};

export default withLayoutGth(GuideListPage);
