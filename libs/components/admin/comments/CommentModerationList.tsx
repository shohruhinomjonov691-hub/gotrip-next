import React from 'react';
import Moment from 'react-moment';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import { Comment } from '../../../types/comment/comment';

interface CommentModerationListProps {
	comments: Comment[];
	loading?: boolean;
	removing?: boolean;
	onRemove: (comment: Comment) => void;
}

const SKELETON_ROWS: readonly number[] = [0, 1, 2, 3, 4, 5];
const shortId = (value?: string) => value ? value.slice(-8).toUpperCase() : 'Unknown';

export const CommentModerationList = ({ comments, loading = false, removing = false, onRemove }: CommentModerationListProps): React.ReactElement => {
	const reduceMotion = Boolean(useReducedMotion());
	const renderLoadingState = (): React.ReactElement => <div className="admin-table-skeleton" role="status" aria-label="Loading comments">{SKELETON_ROWS.map((index) => <span key={index} />)}</div>;
	const renderDesktopRow = (comment: Comment): React.ReactElement => (
		<TableRow key={comment._id}>
			<TableCell><div className="admin-comment-cell"><strong>{comment.memberData?.memberNick || `Member ${shortId(comment.memberId)}`}</strong><span>Member {shortId(comment.memberId)}</span></div></TableCell>
			<TableCell><div className="admin-id-pair"><span>{comment.commentGroup}</span><span>Target {shortId(comment.commentRefId)}</span></div></TableCell>
			<TableCell><div className="admin-comment-cell"><strong>{comment.commentContent}</strong>{comment.rating !== undefined && <span>Rating {comment.rating}/5</span>}</div></TableCell>
			<TableCell><Moment format="DD MMM YYYY HH:mm">{comment.createdAt}</Moment></TableCell>
			<TableCell align="right"><Button className="admin-action-button admin-action-button--danger" disabled={removing} onClick={() => onRemove(comment)}>Remove</Button></TableCell>
		</TableRow>
	);
	const renderMobileCard = (comment: Comment, index: number): React.ReactElement => (
		<motion.article key={comment._id} className="admin-mobile-card admin-mobile-card--comment" initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18, delay: reduceMotion ? 0 : Math.min(index * 0.025, 0.12) }}>
			<div className="admin-mobile-card__title"><strong>{comment.memberData?.memberNick || `Member ${shortId(comment.memberId)}`}</strong>{comment.rating !== undefined && <span className="admin-status">Rating {comment.rating}/5</span>}</div>
			<p>{comment.commentGroup} · Target {shortId(comment.commentRefId)}</p>
			<div className="admin-mobile-card__copy"><span>{comment.commentContent}</span></div>
			<div className="admin-mobile-card__meta"><span>Member {shortId(comment.memberId)}</span><span><Moment format="DD MMM YYYY HH:mm">{comment.createdAt}</Moment></span></div>
			<div className="admin-mobile-card__actions"><Button className="admin-action-button admin-action-button--danger" disabled={removing} onClick={() => onRemove(comment)}>Remove</Button></div>
		</motion.article>
	);

	if (loading) return renderLoadingState();
	if (!comments.length) return <div className="admin-state admin-state--empty">No active comments were found for this target.</div>;

	const desktopRows: React.ReactElement[] = comments.map(renderDesktopRow);
	const mobileCards: React.ReactElement[] = comments.map(renderMobileCard);
	return <><TableContainer className="admin-data-table"><Table aria-label="Comment moderation"><TableHead><TableRow><TableCell>Author</TableCell><TableCell>Group / target</TableCell><TableCell>Comment</TableCell><TableCell>Created</TableCell><TableCell align="right">Action</TableCell></TableRow></TableHead><TableBody>{desktopRows}</TableBody></Table></TableContainer><div className="admin-mobile-cards">{mobileCards}</div></>;
};
