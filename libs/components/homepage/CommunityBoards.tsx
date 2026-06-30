import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Stack, Typography } from '@mui/material';
import CommunityCard from './CommunityCard';
import { BoardArticle } from '../../types/board-article/board-article';
import { useQuery } from '@apollo/client';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { T } from '../../types/common';

const CommunityBoards = () => {
	const searchCommunity = {
		page: 1,
		sort: 'articleViews',
		direction: 'DESC',
	};
	const [newsArticles, setNewsArticles] = useState<BoardArticle[]>([]);
	const [freeArticles, setFreeArticles] = useState<BoardArticle[]>([]);

	/** APOLLO REQUESTS **/
	const { loading: newsLoading, error: newsError, refetch: refetchNews } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: { input: { ...searchCommunity, limit: 6, search: { articleCategory: BoardArticleCategory.NEWS } } },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setNewsArticles(data?.getBoardArticles?.list ?? []);
		},
	});

	const { loading: freeLoading, error: freeError, refetch: refetchFree } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: { input: { ...searchCommunity, limit: 3, search: { articleCategory: BoardArticleCategory.FREE } } },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setFreeArticles(data?.getBoardArticles?.list ?? []);
		},
	});

	return (
		<Stack className={'community-board'}>
			<Stack className={'container'}>
				<Stack className={'community-heading'}>
					<Typography className={'eyebrow'}>The GoTrip journal</Typography>
					<Typography variant={'h1'}>Travel stories and community notes</Typography>
					<Typography className={'section-copy'}>
						Read destination inspiration, guide updates, and traveler discussions from the GoTrip community.
					</Typography>
				</Stack>
				<Stack className="community-main">
					<Stack className={'community-left'}>
						<Stack className={'content-top'}>
							<Link href={'/community?articleCategory=NEWS'}>
								<span>Travel news</span>
							</Link>
							<img src="/img/icons/arrowBig.svg" alt="" />
						</Stack>
						{newsLoading && !newsArticles.length ? (
							<Stack className="homepage-skeleton-grid journal-skeleton-grid"><span /><span /><span /></Stack>
						) : newsError ? (
							<Stack className="homepage-data-state"><Typography>Travel news could not be loaded.</Typography><Button onClick={() => refetchNews()}>Try again</Button></Stack>
						) : newsArticles.length === 0 ? (
							<Stack className="homepage-data-state"><Typography>Fresh travel stories are on their way.</Typography><Link href="/community?articleCategory=NEWS"><Button>Browse the Journal</Button></Link></Stack>
						) : (
							<Stack className={'card-wrap'}>
								{newsArticles.map((article, index) => {
									return <CommunityCard vertical={true} article={article} index={index} key={article?._id} />;
								})}
							</Stack>
						)}
					</Stack>
					<Stack className={'community-right'}>
						<Stack className={'content-top'}>
							<Link href={'/community?articleCategory=FREE'}>
								<span>Traveler board</span>
							</Link>
							<img src="/img/icons/arrowBig.svg" alt="" />
						</Stack>
						{freeLoading && !freeArticles.length ? (
							<Stack className="homepage-skeleton-grid journal-skeleton-grid compact"><span /><span /></Stack>
						) : freeError ? (
							<Stack className="homepage-data-state"><Typography>Traveler notes could not be loaded.</Typography><Button onClick={() => refetchFree()}>Try again</Button></Stack>
						) : freeArticles.length === 0 ? (
							<Stack className="homepage-data-state"><Typography>Traveler conversations will appear here soon.</Typography><Link href="/community?articleCategory=FREE"><Button>Visit the community</Button></Link></Stack>
						) : (
							<Stack className={'card-wrap vertical'}>
								{freeArticles.map((article, index) => {
									return <CommunityCard vertical={false} article={article} index={index} key={article?._id} />;
								})}
							</Stack>
						)}
					</Stack>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default CommunityBoards;
