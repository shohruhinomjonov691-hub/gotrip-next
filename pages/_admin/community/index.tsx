import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { Button, MenuItem, Select, TablePagination, Typography } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import CommunityArticleList from '../../../libs/components/admin/community/CommunityArticleList';
import { AllBoardArticlesInquiry } from '../../../libs/types/board-article/board-article.input';
import { BoardArticle } from '../../../libs/types/board-article/board-article';
import { BoardArticleCategory, BoardArticleStatus } from '../../../libs/enums/board-article.enum';
import { Direction } from '../../../libs/enums/common.enum';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../libs/sweetAlert';
import { BoardArticleUpdate } from '../../../libs/types/board-article/board-article.update';
import { useMutation, useQuery } from '@apollo/client';
import { REMOVE_BOARD_ARTICLE_BY_ADMIN, UPDATE_BOARD_ARTICLE_BY_ADMIN } from '../../../apollo/admin/mutation';
import { GET_ALL_BOARD_ARTICLES_BY_ADMIN } from '../../../apollo/admin/query';
import { T } from '../../../libs/types/common';

type ArticleStatusTab = 'ALL' | BoardArticleStatus;

interface AdminCommunityProps {
	initialInquiry?: AllBoardArticlesInquiry;
}

interface MotionTarget {
	opacity: number;
	y?: number;
}

const articleTabs: Array<{ value: ArticleStatusTab; label: string }> = [{ value: 'ALL', label: 'All articles' }, { value: BoardArticleStatus.ACTIVE, label: 'Active' }, { value: BoardArticleStatus.DELETE, label: 'Deleted' }];
const defaultInquiry: AllBoardArticlesInquiry = { page: 1, limit: 10, sort: 'createdAt', direction: Direction.DESC, search: {} };
const rowsPerPageOptions: number[] = [10, 20, 40, 60];

const AdminCommunity: NextPage<AdminCommunityProps> = ({ initialInquiry = defaultInquiry }) => {
	const [anchorEl, setAnchorEl] = useState<Record<string, HTMLElement | null>>({});
	const [communityInquiry, setCommunityInquiry] = useState<AllBoardArticlesInquiry>(initialInquiry);
	const [articles, setArticles] = useState<BoardArticle[]>([]);
	const [articleTotal, setArticleTotal] = useState(0);
	const [value, setValue] = useState<string>(communityInquiry?.search?.articleStatus || 'ALL');
	const [searchType, setSearchType] = useState('ALL');
	const reduceMotion = Boolean(useReducedMotion());
	const [updateBoardArticleByAdmin] = useMutation(UPDATE_BOARD_ARTICLE_BY_ADMIN);
	const [removeBoardArticleByAdmin] = useMutation(REMOVE_BOARD_ARTICLE_BY_ADMIN);
	const { loading, error, refetch } = useQuery(GET_ALL_BOARD_ARTICLES_BY_ADMIN, {
		fetchPolicy: 'network-only', variables: { input: communityInquiry }, notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => { setArticles(data?.getAllBoardArticlesByAdmin?.list ?? []); setArticleTotal(data?.getAllBoardArticlesByAdmin?.metaCounter?.[0]?.total ?? 0); },
	});

	useEffect(() => { refetch({ input: communityInquiry }).then(); }, [communityInquiry]);
	const changePageHandler = async (_: unknown, newPage: number) => { const next = { ...communityInquiry, page: newPage + 1 }; setCommunityInquiry(next); await refetch({ input: next }); };
	const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement>) => { const next = { ...communityInquiry, page: 1, limit: parseInt(event.target.value, 10) }; setCommunityInquiry(next); await refetch({ input: next }); };
	const menuIconClickHandler = (event: React.MouseEvent<HTMLElement>, key: string) => setAnchorEl({ [key]: event.currentTarget });
	const menuIconCloseHandler = () => setAnchorEl({});
	const tabChangeHandler = (nextValue: string) => { setValue(nextValue); const search = { ...communityInquiry.search }; if (nextValue === 'ALL') delete search.articleStatus; else search.articleStatus = nextValue as BoardArticleStatus; setCommunityInquiry({ ...communityInquiry, page: 1, sort: 'createdAt', search }); };
	const searchTypeHandler = (nextValue: string) => { setSearchType(nextValue); const search = { ...communityInquiry.search }; if (nextValue === 'ALL') delete search.articleCategory; else search.articleCategory = nextValue as BoardArticleCategory; setCommunityInquiry({ ...communityInquiry, page: 1, sort: 'createdAt', search }); };
	const updateArticleHandler = async (updateData: BoardArticleUpdate) => { try { await updateBoardArticleByAdmin({ variables: { input: updateData } }); menuIconCloseHandler(); await refetch({ input: communityInquiry }); } catch (err: any) { menuIconCloseHandler(); sweetErrorHandling(err).then(); } };
	const removeArticleHandler = async (id: string) => { try { if (await sweetConfirmAlert('Remove this article?')) { await removeBoardArticleByAdmin({ variables: { input: id } }); await refetch({ input: communityInquiry }); } } catch (err: any) { sweetErrorHandling(err).then(); } };

	const renderHeading = (): React.ReactElement => (
		<div className="admin-page__heading">
			<div><Typography component="span">Community governance</Typography><Typography component="h1">Article moderation</Typography><Typography component="p">Keep the public travel journal useful, current, and ready for discovery.</Typography></div>
			<Typography className="admin-page__count">{articleTotal} articles</Typography>
		</div>
	);
	const renderFilters = (): React.ReactElement => {
		const tabButtons: React.ReactElement[] = articleTabs.map((tab) => <Button key={tab.value} role="tab" aria-selected={value === tab.value} className={value === tab.value ? 'is-active' : ''} onClick={() => tabChangeHandler(tab.value)}>{tab.label}</Button>);
		const categoryItems: React.ReactElement[] = Object.values(BoardArticleCategory).map((category) => <MenuItem key={category} value={category}>{category}</MenuItem>);
		return <div className="admin-filterbar"><div className="admin-tabs" role="tablist" aria-label="Article status">{tabButtons}</div><div className="admin-search-controls"><Select value={searchType} onChange={(event) => searchTypeHandler(event.target.value)} aria-label="Filter articles by category"><MenuItem value="ALL">All categories</MenuItem>{categoryItems}</Select></div></div>;
	};
	const renderContent = (): React.ReactElement => {
		if (error) return <div className="admin-state admin-state--error"><Typography>We could not load community articles.</Typography><Button onClick={() => refetch({ input: communityInquiry })}>Try again</Button></div>;
		return <CommunityArticleList articles={articles} anchorEl={anchorEl} menuIconClickHandler={menuIconClickHandler} menuIconCloseHandler={menuIconCloseHandler} updateArticleHandler={updateArticleHandler} removeArticleHandler={removeArticleHandler} loading={loading && !articles.length} />;
	};
	const initialAnimation: MotionTarget = reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 };
	const animateAnimation: MotionTarget = { opacity: 1, y: 0 };
	const pageContent: React.ReactElement = <section className="content admin-page">{renderHeading()}<div className="table-wrap admin-surface">{renderFilters()}{renderContent()}<TablePagination rowsPerPageOptions={rowsPerPageOptions} component="div" count={articleTotal} rowsPerPage={communityInquiry.limit} page={communityInquiry.page - 1} onPageChange={changePageHandler} onRowsPerPageChange={changeRowsPerPageHandler} /></div></section>;

	return <motion.div initial={initialAnimation} animate={animateAnimation} transition={{ duration: 0.22 }}>{pageContent}</motion.div>;
};

export default withAdminLayout(AdminCommunity);
