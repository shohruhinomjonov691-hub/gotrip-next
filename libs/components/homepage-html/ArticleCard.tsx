import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from '../../i18n/useTranslation';
import { getLocalizedField } from '../../i18n/localization';
import { ArrowIcon, ClockIcon } from './tourCardIcons';
import { BoardArticle } from '../../types/board-article/board-article';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { getImageUrl } from '../../config';

export const TAG_META: Record<string, { cls: string; label: string }> = {
	[BoardArticleCategory.FREE]: { cls: 'free', label: 'FREE GUIDE' },
	[BoardArticleCategory.NEWS]: { cls: 'news', label: 'NEWS' },
	[BoardArticleCategory.RECOMMEND]: { cls: 'rec', label: 'RECOMMENDED' },
	[BoardArticleCategory.HUMOR]: { cls: 'rec', label: 'HUMOR' },
};

export const formatArticleDate = (value: string | Date) =>
	new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' });

export const readMinutesFor = (content?: string) => {
	const words = (content ?? '').trim().split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(words / 200));
};

export const articleHref = (article: BoardArticle) =>
	`/community/detail?id=${article._id}&articleCategory=${article.articleCategory}`;

interface ArticleCardProps {
	article: BoardArticle;
}

/**
 * Article card shared by the Home "News & Articles" row and the Community grid, so
 * both stay identical from a single definition.
 */
const ArticleCard = ({ article }: ArticleCardProps) => {
	const { t } = useTranslation();
	const { locale } = useRouter();
	const tag = TAG_META[article.articleCategory] ?? { cls: 'rec', label: article.articleCategory };
	const localizedTitle = getLocalizedField(article, 'articleTitle', locale ?? 'en');
	const localizedContent = getLocalizedField(article, 'articleContent', locale ?? 'en');

	return (
		<article className="art-card">
			<div className="art-thumb">
				<img alt={localizedTitle} loading="lazy" src={getImageUrl(article.articleImage)} />
				<span className={`art-tag ${tag.cls}`}>{t(tag.label)}</span>
			</div>
			<div className="art-body">
				<div className="art-meta">
					<span>
						<svg viewBox="0 0 24 24">
							<rect height="17" rx="2.4" width="18" x="3" y="4.5" />
							<path d="M16 2.5v4M8 2.5v4M3 10h18" />
						</svg>
						{formatArticleDate(article.createdAt)}
					</span>
					<span>
						<ClockIcon />
						{t('{{count}} min read', { count: readMinutesFor(localizedContent) })}
					</span>
				</div>
				<h3 className="art-title">{localizedTitle}</h3>
				<div className="art-foot">
					<Link className="art-more" href={articleHref(article)}>
						{t('Read More')} <ArrowIcon />
					</Link>
					{!!article.readers?.length && (
						<div className="art-readers">
							{article.readers.map((reader) => (
								<img alt="" key={reader._id} loading="lazy" src={getImageUrl(reader.memberImage)} />
							))}
							{!!article.readersCount && article.readersCount > article.readers.length && (
								<span className="plus">+</span>
							)}
						</div>
					)}
				</div>
			</div>
		</article>
	);
};

export default ArticleCard;
