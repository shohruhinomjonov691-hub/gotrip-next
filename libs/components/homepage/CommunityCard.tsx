import React from 'react';
import Link from 'next/link';
import { Box } from '@mui/material';
import Moment from 'react-moment';
import { BoardArticle } from '../../types/board-article/board-article';
import { getFallbackImage } from './homepageFallbacks';

interface CommunityCardProps {
	vertical: boolean;
	article: BoardArticle;
	index: number;
}

const CommunityCard = (props: CommunityCardProps) => {
	const { vertical, article, index } = props;
	const articleImage = article?.articleImage
		? `${process.env.REACT_APP_API_URL}/${article?.articleImage}`
		: getFallbackImage(article?.articleTitle);

	if (vertical) {
		return (
			<Link href={`/community/detail?articleCategory=${article?.articleCategory}&id=${article?._id}`}>
				<Box component={'div'} className={'vertical-card'}>
					<div className={'community-img'} style={{ backgroundImage: `url(${articleImage})` }}>
						<div>{index + 1}</div>
					</div>
					<strong>{article?.articleTitle}</strong>
					<span>{article?.articleCategory || 'Travel journal'}</span>
					<small>
						<Moment format="DD.MM.YY">{article?.createdAt}</Moment>
					</small>
				</Box>
			</Link>
		);
	}

	return (
		<Link href={`/community/detail?articleCategory=${article?.articleCategory}&id=${article?._id}`}>
			<Box component={'div'} className="horizontal-card">
				<img
					src={articleImage}
					alt={article?.articleTitle || 'GoTrip article'}
					onError={(event) => {
						event.currentTarget.src = getFallbackImage(article?.articleTitle);
					}}
				/>
				<div>
					<em>{article?.articleCategory || 'Travel note'}</em>
					<strong>{article.articleTitle}</strong>
					<span>
						<Moment format="DD.MM.YY">{article?.createdAt}</Moment>
					</span>
				</div>
			</Box>
		</Link>
	);
};

export default CommunityCard;
