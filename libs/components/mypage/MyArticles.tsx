import React, { useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useQuery, useReactiveVar } from '@apollo/client';
import ArticleCard from '../homepage-html/ArticleCard';
import { userVar } from '../../../apollo/store';
import { T } from '../../types/common';
import { BoardArticle } from '../../types/board-article/board-article';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { Direction } from '../../enums/common.enum';
import { useTranslation } from '../../i18n/useTranslation';

/* The page renders <MyArticles /> with no props, so these defaults keep the
   inquiry valid (page/limit/sort are required by BoardArticlesInquiry). */
const DEFAULT_INPUT = { page: 1, limit: 9, sort: 'createdAt', direction: Direction.DESC };

const MyArticles: NextPage = ({ initialInput, ...props }: T) => {
	const { t } = useTranslation();
	const user = useReactiveVar(userVar);
	const [searchCommunity, setSearchCommunity] = useState({
		...DEFAULT_INPUT,
		...initialInput,
		search: { memberId: user._id },
	});

	/** APOLLO REQUESTS **/
	const {
		loading: boardArticlesLoading,
		data: boardArticlesData,
		error: getBoardArticlesError,
		refetch: boardArticlesRefetch,
	} = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: searchCommunity,
		},
		notifyOnNetworkStatusChange: true,
	});

	const boardArticles: BoardArticle[] = boardArticlesData?.getBoardArticles?.list ?? [];
	const totalCount: number = boardArticlesData?.getBoardArticles?.metaCounter?.[0]?.total ?? 0;
	const totalPages = Math.ceil(totalCount / searchCommunity.limit) || 1;

	/** HANDLERS **/
	const paginationHandler = (value: number) => {
		setSearchCommunity({ ...searchCommunity, page: value });
	};

	return (
		<div className="acc-panel">
			<div className="pg-toolbar acc-toolbar">
				<div className="pg-count">{t('{{count}} articles published', { count: totalCount })}</div>
				<Link className="btn btn-sky" href={{ pathname: '/mypage', query: { category: 'writeArticle' } }}>
					{t('Write article')}
				</Link>
			</div>

			{boardArticlesLoading && boardArticles.length === 0 && (
				<div className="pg-grid">
					{Array.from({ length: 3 }, (_, i) => (
						<div className="pg-skeleton" key={i} style={{ height: 380 }} />
					))}
				</div>
			)}

			{getBoardArticlesError && boardArticles.length === 0 && !boardArticlesLoading && (
				<div className="pg-state">
					<h3>{t('Could not load your articles')}</h3>
					<p>{t('Please try again in a moment.')}</p>
					<button className="btn btn-sky" onClick={() => boardArticlesRefetch({ input: searchCommunity })} type="button">
						{t('Try again')}
					</button>
				</div>
			)}

			{!boardArticlesLoading && !getBoardArticlesError && boardArticles.length === 0 && (
				<div className="pg-state">
					<h3>{t('You have not written anything yet')}</h3>
					<p>{t('Share a route, a packing tip or a story from your last trip.')}</p>
					<Link className="btn btn-sky" href={{ pathname: '/mypage', query: { category: 'writeArticle' } }}>
						{t('Write your first article')}
					</Link>
				</div>
			)}

			{boardArticles.length > 0 && (
				<>
					<div className="pg-grid">
						{boardArticles.map((article) => (
							<ArticleCard article={article} key={article._id} />
						))}
					</div>

					{totalPages > 1 && (
						<nav aria-label={t('Article pages') as string} className="pg-pager">
							<button
								disabled={searchCommunity.page <= 1}
								onClick={() => paginationHandler(searchCommunity.page - 1)}
								type="button"
							>
								{t('Prev')}
							</button>
							{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
								<button
									aria-current={p === searchCommunity.page ? 'page' : undefined}
									className={p === searchCommunity.page ? 'on' : ''}
									key={p}
									onClick={() => paginationHandler(p)}
									type="button"
								>
									{p}
								</button>
							))}
							<button
								disabled={searchCommunity.page >= totalPages}
								onClick={() => paginationHandler(searchCommunity.page + 1)}
								type="button"
							>
								{t('Next')}
							</button>
						</nav>
					)}
				</>
			)}
		</div>
	);
};

export default MyArticles;
