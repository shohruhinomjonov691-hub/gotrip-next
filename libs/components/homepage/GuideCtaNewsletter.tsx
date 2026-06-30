import React from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { Button, Stack, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import { motion, useReducedMotion } from 'framer-motion';
import { GET_BOARD_ARTICLES, GET_NOTICES } from '../../../apollo/user/query';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { Direction } from '../../enums/common.enum';
import { BoardArticle } from '../../types/board-article/board-article';
import { Notice } from '../../types/notice/notice';
import { T } from '../../types/common';
import { fadeUp, staggerContainer, tapPress } from './motion';

const MotionSection = motion.section;

const GuideCtaNewsletter = () => {
	const reduceMotion = useReducedMotion();
	const {
		loading: articlesLoading,
		error: articlesError,
		data: articlesData,
		refetch: refetchArticles,
	} = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: 1,
				limit: 1,
				sort: 'articleViews',
				direction: Direction.DESC,
				search: { articleCategory: BoardArticleCategory.NEWS },
			},
		},
	});
	const {
		loading: noticesLoading,
		error: noticesError,
		data: noticesData,
		refetch: refetchNotices,
	} = useQuery(GET_NOTICES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 1, sort: 'createdAt', direction: Direction.DESC, search: {} } },
	});
	const article: BoardArticle | undefined = ((articlesData as T)?.getBoardArticles?.list ?? [])[0];
	const notice: Notice | undefined = ((noticesData as T)?.getNotices?.list ?? [])[0];
	const journalLink = article ? `/community/detail?id=${article._id}&articleCategory=${article.articleCategory}` : '/community';
	const noticeLink = notice ? `/cs?tab=${notice.noticeCategory.toLowerCase()}&noticeId=${notice._id}` : '/cs?tab=notice';

	return (
		<MotionSection
			className={'guide-cta-newsletter-section'}
			variants={reduceMotion ? undefined : staggerContainer}
			initial={reduceMotion ? false : 'hidden'}
			whileInView={reduceMotion ? undefined : 'visible'}
			viewport={{ once: true, amount: 0.16 }}
		>
			<Stack className={'premium-section-container'}>
				<motion.div className={'guide-cta-duo'} variants={reduceMotion ? undefined : fadeUp}>
					<motion.div className={'guide-cta-panel'} whileHover={reduceMotion ? undefined : { y: -6 }}>
						<div className={'guide-cta-image'} />
						<Stack className={'guide-cta-copy'}>
							<Typography className={'section-title'}>Join our Concierge Network</Typography>
							<Typography className={'section-copy'}>
								Bring your expertise to discerning travelers seeking exceptional experiences.
							</Typography>
							<Link href={'/agent'}>
								<motion.div whileTap={tapPress}>
									<Button className={'premium-primary-cta'} variant="contained" endIcon={<ArrowForwardRoundedIcon />}>
										Become an Agent
									</Button>
								</motion.div>
							</Link>
						</Stack>
					</motion.div>
					<motion.div className={'homepage-newsletter-panel'} whileHover={reduceMotion ? undefined : { y: -6 }}>
						<Stack className={'newsletter-copy'}>
							<Typography className={'eyebrow'}>Newsletter</Typography>
							<Typography className={'newsletter-title'}>The Luxury Journal</Typography>
							<Typography className={'section-copy'}>
								Receive curated travel inspiration and exclusive destination guides.
							</Typography>
							<Typography id="homepage-newsletter-status" className={'newsletter-unavailable-copy'}>
								Newsletter subscriptions are not available yet.
							</Typography>
						</Stack>
						<div className={'newsletter-form'} aria-describedby="homepage-newsletter-status">
							<MailOutlineRoundedIcon />
							<input type="email" placeholder="Email address" aria-label="Email address" disabled />
							<button type="button" disabled>Subscriptions unavailable</button>
						</div>
						<div className="home-journal-live-grid">
							{articlesLoading && !article ? (
								<div className="home-journal-mini-card is-loading" aria-label="Loading latest journal article" />
							) : articlesError ? (
								<div className="home-journal-mini-card is-state">
									<AutoStoriesOutlinedIcon />
									<span>Journal stories could not be loaded.</span>
									<button type="button" onClick={() => refetchArticles()}>Retry</button>
								</div>
							) : article ? (
								<Link href={journalLink} className="home-journal-mini-card">
									<AutoStoriesOutlinedIcon />
									<span>{article.articleCategory}</span>
									<strong>{article.articleTitle}</strong>
								</Link>
							) : (
								<Link href="/community" className="home-journal-mini-card is-state">
									<AutoStoriesOutlinedIcon />
									<span>Journal stories will appear here soon.</span>
								</Link>
							)}
							{noticesLoading && !notice ? (
								<div className="home-journal-mini-card is-loading" aria-label="Loading latest notice" />
							) : noticesError ? (
								<div className="home-journal-mini-card is-state">
									<CampaignOutlinedIcon />
									<span>Travel notices could not be loaded.</span>
									<button type="button" onClick={() => refetchNotices()}>Retry</button>
								</div>
							) : notice ? (
								<Link href={noticeLink} className="home-journal-mini-card">
									<CampaignOutlinedIcon />
									<span>{notice.noticeCategory}</span>
									<strong>{notice.noticeTitle}</strong>
								</Link>
							) : (
								<Link href="/cs?tab=faq" className="home-journal-mini-card is-state">
									<CampaignOutlinedIcon />
									<span>No new platform notices right now.</span>
								</Link>
							)}
						</div>
					</motion.div>
				</motion.div>
			</Stack>
		</MotionSection>
	);
};

export default GuideCtaNewsletter;
