import React from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { useTranslation } from '../../i18n/useTranslation';
import ArticleCard from './ArticleCard';
import GthSectionState from './GthSectionState';
import { ArrowIcon } from './tourCardIcons';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { BoardArticle, BoardArticles } from '../../types/board-article/board-article';
import { Direction } from '../../enums/common.enum';

const ARTICLES_INPUT = {
	page: 1,
	limit: 3,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

const GthArticles = () => {
	const { t } = useTranslation();
	const { loading, error, data } = useQuery<{ getBoardArticles: BoardArticles }>(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: ARTICLES_INPUT },
	});
	const articles: BoardArticle[] = data?.getBoardArticles?.list ?? [];

	return (
		<section className="art-sec">
			<span className="balloon b1">
				<svg viewBox="0 0 24 32">
					<ellipse cx="12" cy="12" rx="10" ry="12" />
					<path d="M8 24h8M9 24l3 7 3-7" />
				</svg>
			</span>
			<span className="balloon b2">
				<svg viewBox="0 0 24 32">
					<ellipse cx="12" cy="12" rx="10" ry="12" />
					<path d="M8 24h8M9 24l3 7 3-7" />
				</svg>
			</span>
			<span className="balloon b3">
				<svg viewBox="0 0 24 32">
					<ellipse cx="12" cy="12" rx="10" ry="12" />
					<path d="M8 24h8M9 24l3 7 3-7" />
				</svg>
			</span>
			<div className="wrap art-head">
				<div>
					<span className="eyebrow">{t('Blog and Article')}</span>
					<h2>{t('News & Articles From GoTrip')}</h2>
				</div>
				<Link className="btn btn-outline" href="/community">
					{t('See More Articles')}{' '}
					<span className="ar">
						<ArrowIcon className="ico" />
					</span>
				</Link>
			</div>
			<div className="wrap art-grid">
				<GthSectionState
					loading={loading && articles.length === 0}
					error={!!error && articles.length === 0}
					empty={!loading && !error && articles.length === 0}
					loadingText={t('Loading articles…')}
					emptyText={t('No articles published yet — check back soon.')}
				/>
				{articles.map((article) => (
					<ArticleCard article={article} key={article._id} />
				))}
			</div>
		</section>
	);
};

export default GthArticles;
