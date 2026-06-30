import React, { useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Button, Pagination, Stack, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import CommunityCard from '../../libs/components/common/CommunityCard';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { T } from '../../libs/types/common';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { BoardArticlesInquiry } from '../../libs/types/board-article/board-article.input';
import { BoardArticleCategory } from '../../libs/enums/board-article.enum';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../apollo/user/mutation';
import { useMutation, useQuery } from '@apollo/client';
import { GET_BOARD_ARTICLES } from '../../apollo/user/query';
import { Message } from '../../libs/enums/common.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({ props: { ...(await serverSideTranslations(locale, ['common'])) } });

const categories = [
	{ value: BoardArticleCategory.FREE, label: 'Traveler notes' },
	{ value: BoardArticleCategory.RECOMMEND, label: 'Recommendations' },
	{ value: BoardArticleCategory.NEWS, label: 'Journal news' },
	{ value: BoardArticleCategory.HUMOR, label: 'Light moments' },
];
const easeOutExpo = [0.16, 1, 0.3, 1] as const;

const Community: NextPage = ({ initialInput }: T) => {
	const router = useRouter();
	const shouldReduceMotion = useReducedMotion();
	const routeCategory = router.query.articleCategory as BoardArticleCategory | undefined;
	const activeCategory = categories.some((category) => category.value === routeCategory) ? routeCategory! : BoardArticleCategory.FREE;
	const [searchCommunity, setSearchCommunity] = useState<BoardArticlesInquiry>({ ...initialInput, search: { articleCategory: activeCategory } });
	const [boardArticles, setBoardArticles] = useState<BoardArticle[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	useEffect(() => {
		setSearchCommunity((current) => ({ ...current, page: current.search.articleCategory === activeCategory ? current.page : 1, search: { articleCategory: activeCategory } }));
		if (!routeCategory) router.replace({ pathname: '/community', query: { articleCategory: BoardArticleCategory.FREE } }, undefined, { shallow: true });
	}, [activeCategory, routeCategory]);

	const { loading, error, refetch } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: searchCommunity },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setBoardArticles(data?.getBoardArticles?.list ?? []);
			setTotalCount(data?.getBoardArticles?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const itemMotion = { hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 18 }, visible: { opacity: 1, y: 0, transition: { duration: shouldReduceMotion ? 0.18 : 0.38, ease: easeOutExpo } } };
	const listMotion = { hidden: {}, visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.06, delayChildren: shouldReduceMotion ? 0 : 0.06 } } };
	const activeLabel = useMemo(() => categories.find((category) => category.value === activeCategory)?.label ?? 'Traveler notes', [activeCategory]);

	const tabChangeHandler = async (value: BoardArticleCategory) => {
		setSearchCommunity((current) => ({ ...current, page: 1, search: { articleCategory: value } }));
		await router.push({ pathname: '/community', query: { articleCategory: value } }, undefined, { shallow: true });
	};
	const paginationHandler = (event: React.ChangeEvent<unknown>, page: number) => setSearchCommunity((current) => ({ ...current, page }));
	const likeArticleHandler = async (event: React.MouseEvent, user: T, id: string) => {
		try {
			event.stopPropagation();
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetBoardArticle({ variables: { input: id } });
			await refetch({ input: searchCommunity });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) { sweetMixinErrorAlert(err.message).then(); }
	};

	return (
		<div id="community-list-page" className="journal-page">
			<section className="journal-hero"><div className="journal-hero-image" /><div className="journal-hero-content">
				<Typography className="journal-kicker">GoTrip Journal</Typography><Typography component="h1" className="journal-title">Curated chronicles</Typography>
				<Typography className="journal-lede">Travel intelligence, field notes, and personal stories from the places that stay with you.</Typography>
			</div></section>
			<main className="journal-shell">
				<motion.header className="journal-list-heading" variants={itemMotion} initial="hidden" animate="visible"><div><Typography className="journal-section-label">{activeLabel}</Typography><Typography component="h2" className="journal-section-title">Stories worth carrying forward</Typography></div>
					<Button className="journal-write-button" startIcon={<AddRoundedIcon />} onClick={() => router.push({ pathname: '/mypage', query: { category: 'writeArticle' } })}>Write a story</Button></motion.header>
				<div className="journal-category-tabs" role="tablist" aria-label="Journal categories">{categories.map((category) => <button key={category.value} role="tab" aria-selected={activeCategory === category.value} className={activeCategory === category.value ? 'active' : ''} onClick={() => tabChangeHandler(category.value)}>{category.label}</button>)}</div>
				<AnimatePresence mode="wait"><motion.div key={`${activeCategory}-${searchCommunity.page}`} className="journal-content" variants={listMotion} initial="hidden" animate="visible" exit={{ opacity: 0 }}>
					{loading && boardArticles.length === 0 && <div className="journal-skeleton-grid" aria-label="Loading journal stories">{[0, 1, 2].map((item) => <div className="journal-skeleton-card" key={item}><span /><strong /><em /></div>)}</div>}
					{error && boardArticles.length === 0 && <div className="journal-state error" role="alert"><Typography component="h3">The journal could not load</Typography><Typography>Please refresh the latest stories and try again.</Typography><Button startIcon={<RefreshRoundedIcon />} onClick={() => refetch({ input: searchCommunity })}>Refresh stories</Button></div>}
					{!loading && !error && boardArticles.length === 0 && <div className="journal-state"><Typography component="h3">No stories in this collection yet</Typography><Typography>Be the first traveler to leave a thoughtful note.</Typography><Button startIcon={<AddRoundedIcon />} onClick={() => router.push({ pathname: '/mypage', query: { category: 'writeArticle' } })}>Write a story</Button></div>}
					{boardArticles.length > 0 && <motion.div className="journal-article-grid" variants={listMotion}>{boardArticles.map((article, index) => <motion.div key={article._id} variants={itemMotion} className={index === 0 ? 'journal-featured-wrap' : ''}><CommunityCard boardArticle={article} likeArticleHandler={likeArticleHandler} journal featured={index === 0} /></motion.div>)}</motion.div>}
				</motion.div></AnimatePresence>
				{totalCount > 0 && <div className="journal-pagination"><Pagination count={Math.ceil(totalCount / searchCommunity.limit)} page={searchCommunity.page} shape="rounded" color="primary" onChange={paginationHandler} /><Typography>{totalCount} stories in this collection</Typography></div>}
			</main>
		</div>
	);
};

Community.defaultProps = { initialInput: { page: 1, limit: 6, sort: 'createdAt', direction: 'ASC', search: { articleCategory: BoardArticleCategory.FREE } } };
export default withLayoutBasic(Community);
