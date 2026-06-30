import React, { useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Pagination, Stack, TextField, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { motion, useReducedMotion } from 'framer-motion';
import Moment from 'react-moment';
import dynamic from 'next/dynamic';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { userVar } from '../../apollo/store';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { T } from '../../libs/types/common';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { CREATE_COMMENT, LIKE_TARGET_BOARD_ARTICLE, UPDATE_COMMENT } from '../../apollo/user/mutation';
import { GET_BOARD_ARTICLE, GET_COMMENTS } from '../../apollo/user/query';
import { Messages, REACT_APP_API_URL } from '../../libs/config';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetMixinSuccessAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { CommentUpdate } from '../../libs/types/comment/comment.update';

const ToastViewerComponent = dynamic(() => import('../../libs/components/community/TViewer'), { ssr: false });
const easeOutExpo = [0.16, 1, 0.3, 1] as const;
export const getStaticProps = async ({ locale }: any) => ({ props: { ...(await serverSideTranslations(locale, ['common'])) } });

const CommunityDetail: NextPage = ({ initialInput }: T) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const shouldReduceMotion = useReducedMotion();
	const articleId = router.query.id as string;
	const articleCategory = router.query.articleCategory as string;
	const [boardArticle, setBoardArticle] = useState<BoardArticle>();
	const [comments, setComments] = useState<Comment[]>([]);
	const [total, setTotal] = useState(0);
	const [comment, setComment] = useState('');
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [updatedComment, setUpdatedComment] = useState('');
	const [updatedCommentId, setUpdatedCommentId] = useState('');
	const searchFilter = useMemo<CommentsInquiry>(() => ({ ...initialInput, search: { commentGroup: CommentGroup.ARTICLE, commentRefId: articleId || '' } }), [articleId, initialInput]);
	const [commentPage, setCommentPage] = useState(1);
	const commentInput = useMemo(() => ({ ...searchFilter, page: commentPage }), [searchFilter, commentPage]);
	const [likeTargetBoardArticle, { loading: likeLoading }] = useMutation(LIKE_TARGET_BOARD_ARTICLE);
	const [createComment, { loading: creatingComment }] = useMutation(CREATE_COMMENT);
	const [updateComment] = useMutation(UPDATE_COMMENT);
	const articleQuery = useQuery(GET_BOARD_ARTICLE, { fetchPolicy: 'network-only', variables: { input: articleId }, skip: !articleId, onCompleted: (data: T) => setBoardArticle(data?.getBoardArticle) });
	const commentsQuery = useQuery(GET_COMMENTS, { fetchPolicy: 'cache-and-network', variables: { input: commentInput }, skip: !articleId, notifyOnNetworkStatusChange: true, onCompleted: (data: T) => { setComments(data?.getComments?.list ?? []); setTotal(data?.getComments?.metaCounter?.[0]?.total ?? 0); } });
	useEffect(() => { setCommentPage(1); }, [articleId]);

	const itemMotion = { hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 18 }, visible: { opacity: 1, y: 0, transition: { duration: shouldReduceMotion ? 0.18 : 0.4, ease: easeOutExpo } } };
	const imagePath = boardArticle?.articleImage ? `${REACT_APP_API_URL}/${boardArticle.articleImage}` : '/img/community/communityImg.png';
	const memberImage = boardArticle?.memberData?.memberImage ? `${REACT_APP_API_URL}/${boardArticle.memberData.memberImage}` : '/img/profile/defaultUser.svg';
	const getCommentMemberImage = (image?: string) => image ? `${REACT_APP_API_URL}/${image}` : '/img/profile/defaultUser.svg';
	const goMemberPage = (id?: string) => { if (!id) return; router.push(id === user._id ? '/mypage' : `/member?memberId=${id}`); };
	const likeHandler = async () => { try { if (!user._id) throw new Error(Messages.error2); if (!articleId) return; await likeTargetBoardArticle({ variables: { input: articleId } }); await articleQuery.refetch({ input: articleId }); await sweetTopSmallSuccessAlert('success', 800); } catch (error: any) { sweetMixinErrorAlert(error.message).then(); } };
	const createCommentHandler = async () => { try { if (!comment.trim()) return; if (!user._id) throw new Error(Messages.error2); const input: CommentInput = { commentGroup: CommentGroup.ARTICLE, commentRefId: articleId, commentContent: comment.trim() }; await createComment({ variables: { input } }); await commentsQuery.refetch({ input: commentInput }); await articleQuery.refetch({ input: articleId }); setComment(''); await sweetMixinSuccessAlert('Successfully commented!'); } catch (error: any) { await sweetMixinErrorAlert(error.message); } };
	const updateCommentHandler = async (commentId: string, status?: CommentStatus.DELETE) => { try { if (!user._id) throw new Error(Messages.error2); if (status && !(await sweetConfirmAlert('Do you want to delete the comment?'))) return; const input: CommentUpdate = { _id: commentId, ...(status ? { commentStatus: status } : { commentContent: updatedComment.trim() }) }; await updateComment({ variables: { input } }); await commentsQuery.refetch({ input: commentInput }); await sweetMixinSuccessAlert(status ? 'Successfully deleted!' : 'Successfully updated!'); setEditDialogOpen(false); } catch (error: any) { await sweetMixinErrorAlert(error.message); } };

	if (articleQuery.loading && !boardArticle) return <div id="community-detail-page" className="journal-detail-page"><div className="journal-detail-shell"><div className="journal-detail-skeleton" /></div></div>;
	if (articleQuery.error && !boardArticle) return <div id="community-detail-page" className="journal-detail-page"><div className="journal-detail-shell"><div className="journal-state error" role="alert"><Typography component="h2">This story could not load</Typography><Button onClick={() => articleQuery.refetch({ input: articleId })}>Try again</Button></div></div></div>;

	return <div id="community-detail-page" className="journal-detail-page"><main className="journal-detail-shell">
		<motion.button className="journal-back" variants={itemMotion} initial="hidden" animate="visible" onClick={() => router.push({ pathname: '/community', query: { articleCategory: articleCategory || 'FREE' } })}><ArrowBackRoundedIcon />Back to journal</motion.button>
		<motion.article className="journal-article" variants={itemMotion} initial="hidden" animate="visible"><div className="journal-detail-media"><img src={imagePath} alt={boardArticle?.articleTitle || 'GoTrip Journal story'} /><div /></div><div className="journal-detail-copy"><Typography className="journal-kicker">{boardArticle?.articleCategory || 'JOURNAL'}</Typography><Typography component="h1" className="journal-detail-title">{boardArticle?.articleTitle}</Typography>
			<div className="journal-author-row"><button onClick={() => goMemberPage(boardArticle?.memberData?._id)}><img src={memberImage} alt="" /><span><strong>{boardArticle?.memberData?.memberNick || 'GoTrip traveler'}</strong><Moment format="MMM D, YYYY">{boardArticle?.createdAt}</Moment></span></button><div><span><RemoveRedEyeOutlinedIcon />{boardArticle?.articleViews}</span><span><ChatBubbleOutlineRoundedIcon />{total}</span><Button className="journal-like-button" onClick={likeHandler} disabled={likeLoading} startIcon={boardArticle?.meLiked?.[0]?.myFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}>{boardArticle?.articleLikes}</Button></div></div>
			<div className="journal-article-content"><ToastViewerComponent markdown={boardArticle?.articleContent} className="ytb_play" /></div></div></motion.article>
		<motion.section className="journal-comments" variants={itemMotion} initial="hidden" animate="visible"><header><Typography component="h2">Conversation</Typography><Typography>{total} {total === 1 ? 'comment' : 'comments'}</Typography></header><div className="journal-comment-compose"><label htmlFor="article-comment">Add your perspective</label><textarea id="article-comment" value={comment} maxLength={100} onChange={(event) => setComment(event.target.value)} placeholder="Share a thoughtful response" /><div><span>{comment.length}/100</span><Button onClick={createCommentHandler} disabled={!comment.trim() || creatingComment} endIcon={<SendRoundedIcon />}>{creatingComment ? 'Posting...' : 'Post comment'}</Button></div></div>
			{commentsQuery.loading && comments.length === 0 && <div className="journal-comment-loading">Loading conversation...</div>}{commentsQuery.error && <div className="journal-comment-error" role="alert">Comments could not load. <button onClick={() => commentsQuery.refetch({ input: commentInput })}>Try again</button></div>}{!commentsQuery.loading && !commentsQuery.error && comments.length === 0 && <div className="journal-comment-empty">No responses yet. Start the conversation.</div>}
			<div className="journal-comment-list">{comments.map((commentData) => <article key={commentData._id} className="journal-comment"><button className="journal-comment-member" onClick={() => goMemberPage(commentData.memberData?._id)}><img src={getCommentMemberImage(commentData.memberData?.memberImage)} alt="" /><span><strong>{commentData.memberData?.memberNick}</strong><Moment format="MMM D, YYYY · HH:mm">{commentData.createdAt}</Moment></span></button>{commentData.memberId === user._id && <div className="journal-comment-actions"><IconButton aria-label="Edit comment" onClick={() => { setUpdatedCommentId(commentData._id); setUpdatedComment(commentData.commentContent); setEditDialogOpen(true); }}><EditOutlinedIcon /></IconButton><IconButton aria-label="Delete comment" onClick={() => updateCommentHandler(commentData._id, CommentStatus.DELETE)}><DeleteOutlineRoundedIcon /></IconButton></div>}<Typography>{commentData.commentContent}</Typography></article>)}</div>
			{total > 0 && <Pagination count={Math.ceil(total / commentInput.limit) || 1} page={commentPage} shape="rounded" color="primary" onChange={(event, page) => setCommentPage(page)} />}</motion.section>
	</main><Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="sm"><DialogTitle>Edit comment</DialogTitle><DialogContent><TextField autoFocus multiline minRows={3} fullWidth value={updatedComment} inputProps={{ maxLength: 100, 'aria-label': 'Edit comment' }} onChange={(event) => setUpdatedComment(event.target.value)} helperText={`${updatedComment.length}/100`} /></DialogContent><DialogActions><Button onClick={() => setEditDialogOpen(false)}>Cancel</Button><Button disabled={!updatedComment.trim()} onClick={() => updateCommentHandler(updatedCommentId)}>Save changes</Button></DialogActions></Dialog></div>;
};

CommunityDetail.defaultProps = { initialInput: { page: 1, limit: 5, sort: 'createdAt', direction: 'DESC', search: { commentRefId: '' } } };
export default withLayoutBasic(CommunityDetail);
