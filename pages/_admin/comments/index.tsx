import React, { useMemo, useState } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { NextPage } from 'next';
import { Button, MenuItem, OutlinedInput, Select, TablePagination, Typography } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { motion, useReducedMotion } from 'framer-motion';
import { useMutation, useQuery } from '@apollo/client';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { CommentModerationList } from '../../../libs/components/admin/comments/CommentModerationList';
import { GET_COMMENTS } from '../../../apollo/user/query';
import { REMOVE_COMMENT_BY_ADMIN } from '../../../apollo/admin/mutation';
import { Comment } from '../../../libs/types/comment/comment';
import { CommentGroup } from '../../../libs/enums/comment.enum';
import { Direction } from '../../../libs/enums/common.enum';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../libs/sweetAlert';
import { T } from '../../../libs/types/common';
import { useTranslation } from '../../../libs/i18n/useTranslation';

interface CommentsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: { commentGroup: CommentGroup; commentRefId: string };
}

interface CommentPageMotionTarget {
	opacity: number;
	y?: number;
}

const ROWS_PER_PAGE_OPTIONS: number[] = [10, 20, 40, 60];

const AdminComments: NextPage = () => {
	const { t } = useTranslation();
	const [selectedGroup, setSelectedGroup] = useState<CommentGroup | ''>('');
	const [targetId, setTargetId] = useState('');
	const [inquiry, setInquiry] = useState<CommentsInquiry | null>(null);
	const [comments, setComments] = useState<Comment[]>([]);
	const [total, setTotal] = useState(0);
	const reduceMotion = Boolean(useReducedMotion());
	const [removeCommentByAdmin, { loading: removingComment }] = useMutation(REMOVE_COMMENT_BY_ADMIN);
	const { loading, error, refetch } = useQuery(GET_COMMENTS, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		skip: !inquiry,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setComments(data?.getComments?.list ?? []);
			setTotal(data?.getComments?.metaCounter?.[0]?.total ?? 0);
		},
	});
	const commentGroups = useMemo<CommentGroup[]>(() => Array.from(new Set(Object.values(CommentGroup))) as CommentGroup[], []);

	const loadCommentsHandler = () => {
		if (!selectedGroup || !targetId.trim()) return;
		setInquiry({ page: 1, limit: 10, sort: 'createdAt', direction: Direction.DESC, search: { commentGroup: selectedGroup, commentRefId: targetId.trim() } });
	};
	const changePageHandler = async (_: unknown, newPage: number) => {
		if (!inquiry) return;
		const next = { ...inquiry, page: newPage + 1 };
		setInquiry(next);
		await refetch({ input: next });
	};
	const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		if (!inquiry) return;
		const next = { ...inquiry, page: 1, limit: parseInt(event.target.value, 10) };
		setInquiry(next);
		await refetch({ input: next });
	};
	const removeCommentHandler = async (comment: Comment) => {
		if (!inquiry) return;
		if (!(await sweetConfirmAlert(t('Permanently remove this comment? This action cannot be undone.') as string))) return;
		try {
			await removeCommentByAdmin({ variables: { input: comment._id } });
			await refetch({ input: inquiry });
		} catch (err: unknown) {
			sweetErrorHandling(err).then();
		}
	};

	const renderHeading = (): React.ReactElement => <div className="admin-page__heading"><div><Typography component="span">{t('Community safety')}</Typography><Typography component="h1">{t('Comment moderation')}</Typography><Typography component="p">{t('Load a specific comment target to review and permanently remove active comments when necessary.')}</Typography></div><Typography className="admin-page__count">{inquiry ? t('{{count}} comments', { count: total }) : t('Target required')}</Typography></div>;
	const renderFilters = (): React.ReactElement => {
		const groupItems: React.ReactElement[] = commentGroups.map((item) => <MenuItem key={item} value={item}>{t(item)}</MenuItem>);
		return <div className="admin-filterbar admin-filterbar--comments"><Select<CommentGroup | ''> value={selectedGroup} onChange={(event: SelectChangeEvent<CommentGroup | ''>) => setSelectedGroup(event.target.value as CommentGroup)} displayEmpty aria-label={t('Select a comment group') as string}><MenuItem value="" disabled>{t('Select comment group')}</MenuItem>{groupItems}</Select><div className="admin-search-controls admin-comment-filters"><OutlinedInput aria-label={t('Comment target ID') as string} placeholder={t('Target ID') as string} value={targetId} onChange={(event) => setTargetId(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && loadCommentsHandler()} /><Button className="admin-primary-action" startIcon={<SearchRoundedIcon />} disabled={!selectedGroup || !targetId.trim()} onClick={loadCommentsHandler}>{t('Load comments')}</Button></div></div>;
	};
	const renderResults = (): React.ReactElement => {
		if (!inquiry) return <div className="admin-state admin-state--empty"><Typography>{t('Choose a comment group and target ID to load the supported moderation scope.')}</Typography></div>;
		if (error) return <div className="admin-state admin-state--error"><Typography>{t('We could not load comments for this target.')}</Typography><Button onClick={() => refetch({ input: inquiry })}>{t('Try again')}</Button></div>;
		return <CommentModerationList comments={comments} loading={loading && !comments.length} removing={removingComment} onRemove={removeCommentHandler} />;
	};

	const initialAnimation: CommentPageMotionTarget = reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 };
	const animateAnimation: CommentPageMotionTarget = { opacity: 1, y: 0 };
	const pageContent: React.ReactElement = <section className="content admin-page">{renderHeading()}<div className="table-wrap admin-surface">{renderFilters()}{renderResults()}{inquiry && <TablePagination rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS} component="div" count={total} rowsPerPage={inquiry.limit} page={inquiry.page - 1} onPageChange={changePageHandler} onRowsPerPageChange={changeRowsPerPageHandler} />}</div></section>;

	return <motion.div initial={initialAnimation} animate={animateAnimation} transition={{ duration: 0.22 }}>{pageContent}</motion.div>;
};

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

export default withAdminLayout(AdminComments);
