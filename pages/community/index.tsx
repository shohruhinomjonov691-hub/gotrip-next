import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useReactiveVar } from '@apollo/client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutGth from '../../libs/components/layout/LayoutGth';
import ArticleCard from '../../libs/components/homepage-html/ArticleCard';
import { useTranslation } from '../../libs/i18n/useTranslation';
import { getLocalizedField } from '../../libs/i18n/localization';
import { GET_BOARD_ARTICLES } from '../../apollo/user/query';
import { BoardArticle, BoardArticles } from '../../libs/types/board-article/board-article';
import { BoardArticlesInquiry } from '../../libs/types/board-article/board-article.input';
import { BoardArticleCategory } from '../../libs/enums/board-article.enum';
import { Direction } from '../../libs/enums/common.enum';
import { T } from '../../libs/types/common';
import { userVar } from '../../apollo/store';
import { ARTICLE_CATEGORY_LABELS } from '../../libs/constants/articleCategory';

export const getStaticProps = async ({ locale }: any) => ({
	props: { ...(await serverSideTranslations(locale, ['common'])) },
});

const CATEGORY_TABS: { value: BoardArticleCategory | ''; label: string }[] = [
	{ value: '', label: 'All' },
	{ value: BoardArticleCategory.FREE, label: ARTICLE_CATEGORY_LABELS[BoardArticleCategory.FREE] },
	{ value: BoardArticleCategory.RECOMMEND, label: ARTICLE_CATEGORY_LABELS[BoardArticleCategory.RECOMMEND] },
	{ value: BoardArticleCategory.NEWS, label: ARTICLE_CATEGORY_LABELS[BoardArticleCategory.NEWS] },
	{ value: BoardArticleCategory.HUMOR, label: ARTICLE_CATEGORY_LABELS[BoardArticleCategory.HUMOR] },
];

const sortOptions = [
	{ label: 'Newest first', sort: 'createdAt', direction: Direction.DESC },
	{ label: 'Oldest first', sort: 'createdAt', direction: Direction.ASC },
	{ label: 'Most liked', sort: 'articleLikes', direction: Direction.DESC },
	{ label: 'Most viewed', sort: 'articleViews', direction: Direction.DESC },
];

/** Debounce for the live keyword search — long enough to coalesce typing. */
const SEARCH_DEBOUNCE_MS = 300;

const CloseIcon = () => (
	<svg viewBox="0 0 24 24">
		<path d="M18 6L6 18M6 6l12 12" />
	</svg>
);

const initialInput: BoardArticlesInquiry = {
	page: 1,
	limit: 9,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

// Popular sidebar list — same query, different sort, so no new backend operation.
const POPULAR_INPUT: BoardArticlesInquiry = {
	page: 1,
	limit: 4,
	sort: 'articleViews',
	direction: Direction.DESC,
	search: {},
};

const skeletonItems = Array.from({ length: 6 }, (_, i) => i);

const CommunityPage: NextPage = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const locale = router.locale ?? 'en';
	const user = useReactiveVar(userVar);
	const writeArticleHref = user?._id
		? '/mypage?category=writeArticle'
		: '/account/join?referrer=/mypage?category=writeArticle';
	const [input, setInput] = useState<BoardArticlesInquiry>(initialInput);
	const [text, setText] = useState('');

	useEffect(() => {
		if (!router.isReady) return;
		const nextSearch: T = {};
		const cat = router.query.articleCategory as BoardArticleCategory | undefined;
		if (cat && CATEGORY_TABS.some((tab) => tab.value === cat)) nextSearch.articleCategory = cat;
		if (router.query.text) nextSearch.text = router.query.text as string;
		setText((router.query.text as string) ?? '');
		setInput({ ...initialInput, search: nextSearch });
	}, [router.isReady, router.query.articleCategory, router.query.text]);

	// Read straight off `data` — onCompleted is unreliable with cache-and-network.
	const { data, loading, error, refetch } = useQuery<{ getBoardArticles: BoardArticles }>(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: { input },
	});
	const articles: BoardArticle[] = data?.getBoardArticles?.list ?? [];
	const total: number = data?.getBoardArticles?.metaCounter?.[0]?.total ?? 0;

	const { data: popularData } = useQuery<{ getBoardArticles: BoardArticles }>(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: POPULAR_INPUT },
	});
	const popular: BoardArticle[] = popularData?.getBoardArticles?.list ?? [];

	const activeCategory = (input.search.articleCategory as string) ?? '';

	const currentSort = useMemo(() => {
		const m = sortOptions.find((o) => o.sort === input.sort && o.direction === input.direction);
		return m?.label ?? sortOptions[0].label;
	}, [input.sort, input.direction]);

	const selectCategory = (value: string) => {
		const next = { ...input.search };
		if (!value) delete next.articleCategory;
		else next.articleCategory = value as BoardArticleCategory;
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
	 * list filters as you type without a Search button and without a request per
	 * character. Clearing the field restores every article on the same path.
	 */
	useEffect(() => {
		const id = setTimeout(() => applyTextSearch(text), SEARCH_DEBOUNCE_MS);
		return () => clearTimeout(id);
	}, [text, applyTextSearch]);

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
			<div className="wrap">
				{/* Toolbar: tabs + search + write */}
				<div className="cm-bar">
					<div className="cm-tabs">
						{CATEGORY_TABS.map((tab) => (
							<button
								className={activeCategory === tab.value ? 'cm-tab on' : 'cm-tab'}
								key={tab.label}
								onClick={() => selectCategory(tab.value)}
								type="button"
							>
								{t(tab.label)}
							</button>
						))}
					</div>
					{/* Existing route — My Page renders WriteArticle for this category. Logged-out
					    users go through account/join with a referrer so they land back here
					    instead of being bounced to Home by My Page's auth guard. */}
					<Link className="btn btn-sky" href={writeArticleHref}>
						{t('Write article')}
					</Link>
				</div>

				<div className="pg-layout cm-layout">
					<div>
						<div className="pg-toolbar">
							<div className="pg-count">
								{loading && !total ? (
									t('Loading articles…')
								) : (
									<>
										<b>{total}</b> {total === 1 ? t('article') : t('articles')}
									</>
								)}
								<small>
									{activeCategory ? t(CATEGORY_TABS.find((tab) => tab.value === activeCategory)?.label ?? '') : t('All categories')}
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

						{error && !loading && articles.length === 0 && (
							<div className="pg-state">
								<h3>{t('Articles could not be loaded')}</h3>
								<p>{t('Please try again in a moment.')}</p>
								<button className="btn btn-sky" onClick={() => refetch({ input })} type="button">
									{t('Try again')}
								</button>
							</div>
						)}

						{loading && articles.length === 0 && !error && (
							<div className="pg-grid">
								{skeletonItems.map((i) => (
									<div className="pg-skeleton" key={i} style={{ height: 330 }} />
								))}
							</div>
						)}

						{!loading && !error && articles.length === 0 && (
							<div className="pg-state">
								<h3>{t('No articles here yet')}</h3>
								<p>{t('Be the first to share a story with the community.')}</p>
								<Link className="btn btn-sky" href={writeArticleHref}>
									{t('Write an article')}
								</Link>
							</div>
						)}

						{articles.length > 0 && (
							<div className="pg-grid">
								{articles.map((article) => (
									<ArticleCard article={article} key={article._id} />
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

					{/* Sidebar */}
					<aside className="pg-side cm-side">
						<div className="pg-panel">
							<h3 className="pg-panel-title">{t('Search')}</h3>
							<div className="fl-field">
								<div className="fl-search">
									<input
										aria-describedby="cm-text-hint"
										aria-label={t('Search articles') as string}
										onChange={(e) => setText(e.target.value)}
										onKeyDown={(e) => e.key === 'Enter' && applyTextSearch(text)}
										placeholder={t('Article title…')}
										type="search"
										value={text}
									/>
									{text && (
										<button aria-label={t('Clear search') as string} className="fl-search-clear" onClick={() => setText('')} type="button">
											<CloseIcon />
										</button>
									)}
								</div>
								<small className="fl-hint" id="cm-text-hint">
									{t('Results update as you type.')}
								</small>
							</div>
						</div>

						<div className="pg-panel">
							<h3 className="pg-panel-title">{t('Popular articles')}</h3>
							<div className="cm-pop">
								{popular.map((article) => (
									<Link
										className="cm-pop-item"
										href={`/community/detail?id=${article._id}&articleCategory=${article.articleCategory}`}
										key={article._id}
									>
										<span>{getLocalizedField(article, 'articleTitle', locale)}</span>
										<small>{t('{{count}} views', { count: article.articleViews ?? 0 })}</small>
									</Link>
								))}
								{popular.length === 0 && <p style={{ color: 'var(--muted)', margin: 0 }}>{t('Nothing yet.')}</p>}
							</div>
						</div>

						<div className="pg-panel">
							<h3 className="pg-panel-title">{t('Categories')}</h3>
							<div className="cm-cats">
								{CATEGORY_TABS.filter((tab) => tab.value).map((tab) => (
									<button
										className={activeCategory === tab.value ? 'cm-cat on' : 'cm-cat'}
										key={tab.label}
										onClick={() => selectCategory(tab.value)}
										type="button"
									>
										{t(tab.label)}
									</button>
								))}
							</div>
						</div>
					</aside>
				</div>
			</div>
		</section>
	);
};

export default withLayoutGth(CommunityPage);
