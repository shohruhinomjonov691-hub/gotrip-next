import React from 'react';
import Link from 'next/link';
import Moment from 'react-moment';
import {
	Avatar,
	Button,
	IconButton,
	Menu,
	MenuItem,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tooltip,
	Typography,
} from '@mui/material';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { motion, useReducedMotion } from 'framer-motion';
import { BoardArticle } from '../../../types/board-article/board-article';
import { BoardArticleUpdate } from '../../../types/board-article/board-article.update';
import { REACT_APP_API_URL } from '../../../config';
import { BoardArticleStatus } from '../../../enums/board-article.enum';

interface CommunityArticleListProps {
	articles: BoardArticle[];
	anchorEl: Record<string, HTMLElement | null>;
	menuIconClickHandler: (event: React.MouseEvent<HTMLElement>, key: string) => void;
	menuIconCloseHandler: () => void;
	updateArticleHandler: (input: BoardArticleUpdate) => void;
	removeArticleHandler: (id: string) => void;
	loading?: boolean;
}

interface ArticleStatusActionsProps {
	article: BoardArticle;
	statusKey: string;
	anchorEl: Record<string, HTMLElement | null>;
	menuIconClickHandler: (event: React.MouseEvent<HTMLElement>, key: string) => void;
	menuIconCloseHandler: () => void;
	updateArticleHandler: (input: BoardArticleUpdate) => void;
	removeArticleHandler: (id: string) => void;
	mobile?: boolean;
}

interface CommunityArticleRowProps extends Omit<ArticleStatusActionsProps, 'article' | 'statusKey' | 'mobile'> {
	article: BoardArticle;
}

interface CommunityArticleMobileCardProps extends CommunityArticleRowProps {
	index: number;
	reduceMotion: boolean;
}

interface CommunityArticleContentProps extends Omit<CommunityArticleListProps, 'loading'> {
	reduceMotion: boolean;
}

const articleStatusClass = (status?: string) => `admin-status admin-status--${(status ?? 'hold').toLowerCase()}`;

const getAvailableStatuses = (currentStatus: BoardArticleStatus): BoardArticleStatus[] =>
	(Object.values(BoardArticleStatus) as BoardArticleStatus[]).filter((status) => status !== currentStatus);

const CommunityArticleLoadingState = (): React.ReactElement => {
	const skeletonRows: React.ReactElement[] = Array.from({ length: 6 }, (_, index) => <span key={index} />);

	return (
		<div className="admin-table-skeleton" role="status" aria-label="Loading community articles">
			{skeletonRows}
		</div>
	);
};

const CommunityArticleEmptyState = (): React.ReactElement => (
	<div className="admin-state admin-state--empty">No community articles match these controls.</div>
);

const CommunityArticleStatusActions = ({
	article,
	statusKey,
	anchorEl,
	menuIconClickHandler,
	menuIconCloseHandler,
	updateArticleHandler,
	removeArticleHandler,
	mobile = false,
}: ArticleStatusActionsProps): React.ReactElement => {
	if (article.articleStatus === BoardArticleStatus.DELETE) {
		return mobile ? (
			<Button className="admin-action-button admin-action-button--danger" onClick={() => removeArticleHandler(article._id)}>
				Remove
			</Button>
		) : (
			<Button
				className="admin-icon-action admin-icon-action--danger"
				aria-label="Permanently remove article"
				onClick={() => removeArticleHandler(article._id)}
			>
				<DeleteOutlineRoundedIcon />
			</Button>
		);
	}

	return (
		<>
			<Button className={articleStatusClass(article.articleStatus)} onClick={(event) => menuIconClickHandler(event, statusKey)}>
				{article.articleStatus}
			</Button>
			{mobile && (
				<Button
					component={Link}
					href={`/community/detail?articleCategory=${article.articleCategory}&id=${article._id}`}
					className="admin-action-button"
				>
					View
				</Button>
			)}
			<Menu anchorEl={anchorEl[statusKey]} open={Boolean(anchorEl[statusKey])} onClose={menuIconCloseHandler}>
				{getAvailableStatuses(article.articleStatus).map((status) => (
					<MenuItem key={status} onClick={() => updateArticleHandler({ _id: article._id, articleStatus: status })}>
						{status}
					</MenuItem>
				))}
			</Menu>
		</>
	);
};

const CommunityArticleTableRow = ({ article, ...actions }: CommunityArticleRowProps): React.ReactElement => {
	const statusKey = `${article._id}-status`;
	const authorImage = article.memberData?.memberImage
		? `${REACT_APP_API_URL}/${article.memberData.memberImage}`
		: '/img/profile/defaultUser.svg';

	return (
		<TableRow key={article._id}>
			<TableCell>
				<div className="admin-article-cell">
					<Typography component="strong">{article.articleTitle}</Typography>
					<Stack direction="row" spacing={0.75}>
						<Typography component="span">{article._id}</Typography>
						{article.articleStatus === BoardArticleStatus.ACTIVE && (
							<Tooltip title="Open public article">
								<IconButton
									component={Link}
									href={`/community/detail?articleCategory=${article.articleCategory}&id=${article._id}`}
									aria-label="Open public article"
								>
									<OpenInNewRoundedIcon />
								</IconButton>
							</Tooltip>
						)}
					</Stack>
				</div>
			</TableCell>
			<TableCell>{article.articleCategory}</TableCell>
			<TableCell>
				<Stack className="admin-person" direction="row" alignItems="center" spacing={1}>
					<Avatar src={authorImage} alt={article.memberData?.memberNick || 'Article author'} />
					<Link href={`/member?memberId=${article.memberData?._id}`}>{article.memberData?.memberNick || 'Unknown member'}</Link>
				</Stack>
			</TableCell>
			<TableCell align="center">
				<div className="admin-metric-pair">
					<span>{article.articleViews} views</span>
					<span>{article.articleLikes} likes</span>
				</div>
			</TableCell>
			<TableCell>
				<Moment format="DD MMM YYYY">{article.createdAt}</Moment>
			</TableCell>
			<TableCell>
				<CommunityArticleStatusActions article={article} statusKey={statusKey} {...actions} />
			</TableCell>
		</TableRow>
	);
};

const CommunityArticleMobileCard = ({ article, index, reduceMotion, ...actions }: CommunityArticleMobileCardProps): React.ReactElement => {
	const statusKey = `${article._id}-mobile-status`;

	return (
		<motion.article
			className="admin-mobile-card"
			initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.18, delay: reduceMotion ? 0 : Math.min(index * 0.025, 0.12) }}
		>
			<div className="admin-mobile-card__title">
				<Typography component="strong">{article.articleTitle}</Typography>
				<span className={articleStatusClass(article.articleStatus)}>{article.articleStatus}</span>
			</div>
			<Typography component="p">
				{article.articleCategory} · <Moment format="DD MMM YYYY">{article.createdAt}</Moment>
			</Typography>
			<div className="admin-mobile-card__meta">
				<span>{article.articleViews} views</span>
				<span>{article.articleLikes} likes</span>
				<span>{article.memberData?.memberNick || 'Unknown member'}</span>
			</div>
			<Stack direction="row" spacing={1}>
				<CommunityArticleStatusActions article={article} statusKey={statusKey} mobile {...actions} />
			</Stack>
		</motion.article>
	);
};

const CommunityArticleContent = ({
	articles,
	anchorEl,
	menuIconClickHandler,
	menuIconCloseHandler,
	updateArticleHandler,
	removeArticleHandler,
	reduceMotion,
}: CommunityArticleContentProps): React.ReactElement => {
	const actionHandlers: Omit<ArticleStatusActionsProps, 'article' | 'statusKey' | 'mobile'> = {
		anchorEl,
		menuIconClickHandler,
		menuIconCloseHandler,
		updateArticleHandler,
		removeArticleHandler,
	};
	const tableRows: React.ReactElement[] = articles.map((article) => (
		<CommunityArticleTableRow key={article._id} article={article} {...actionHandlers} />
	));
	const mobileCards: React.ReactElement[] = articles.map((article, index) => (
		<CommunityArticleMobileCard key={article._id} article={article} index={index} reduceMotion={reduceMotion} {...actionHandlers} />
	));

	return (
		<motion.div
			initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.2 }}
		>
			<TableContainer className="admin-data-table">
				<Table aria-label="Community articles">
					<TableHead>
						<TableRow>
							<TableCell>Article</TableCell>
							<TableCell>Category</TableCell>
							<TableCell>Author</TableCell>
							<TableCell align="center">Reach</TableCell>
							<TableCell>Published</TableCell>
							<TableCell>Status</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>{tableRows}</TableBody>
				</Table>
			</TableContainer>
			<div className="admin-mobile-cards">{mobileCards}</div>
		</motion.div>
	);
};

const CommunityArticleList = ({ loading = false, ...contentProps }: CommunityArticleListProps): React.ReactElement => {
	const reduceMotion = Boolean(useReducedMotion());

	if (loading) return <CommunityArticleLoadingState />;
	if (!contentProps.articles.length) return <CommunityArticleEmptyState />;

	return <CommunityArticleContent {...contentProps} reduceMotion={reduceMotion} />;
};

export default CommunityArticleList;
