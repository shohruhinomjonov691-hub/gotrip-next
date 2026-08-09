import React, { useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import moment from 'moment';
import withLayoutGth from '../../libs/components/layout/LayoutGth';
import { useTranslation } from '../../libs/i18n/useTranslation';
import { getLocalizedField } from '../../libs/i18n/localization';
import ArticleCard, { readMinutesFor } from '../../libs/components/homepage-html/ArticleCard';
import { GET_BOARD_ARTICLE, GET_BOARD_ARTICLES, GET_COMMENTS } from '../../apollo/user/query';
import { CREATE_COMMENT, LIKE_TARGET_BOARD_ARTICLE, UPDATE_COMMENT } from '../../apollo/user/mutation';
import { BoardArticle, BoardArticles } from '../../libs/types/board-article/board-article';
import { Comment, Comments } from '../../libs/types/comment/comment';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { CommentUpdate } from '../../libs/types/comment/comment.update';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { BoardArticleCategory } from '../../libs/enums/board-article.enum';
import { ARTICLE_CATEGORY_LABELS } from '../../libs/constants/articleCategory';
import { Direction, Message } from '../../libs/enums/common.enum';
import { getImageUrl } from '../../libs/config';
import { userVar } from '../../apollo/store';
import { sweetConfirmAlert, sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: { ...(await serverSideTranslations(locale, ['common'])) },
});

// Existing limit enforced by the comment DTO / previous UI.
const COMMENT_MAX = 100;

const ArticleDetailPage: NextPage = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	// `router.query` is empty until hydration on a statically-optimised page.
	const queryId = router.query.id as string | undefined;
	const articleId =
		queryId ??
		(typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('id') ?? undefined : undefined);

	const [comment, setComment] = useState('');
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editingText, setEditingText] = useState('');
	const [commentInput, setCommentInput] = useState<CommentsInquiry>({
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: { commentGroup: CommentGroup.ARTICLE, commentRefId: '' },
	});

	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);
	const [createComment, { loading: creatingComment }] = useMutation(CREATE_COMMENT);
	const [updateComment] = useMutation(UPDATE_COMMENT);

	// Read straight off `data` — onCompleted is unreliable with these fetch policies.
	const {
		data: articleData,
		error: articleError,
		refetch: refetchArticle,
	} = useQuery(GET_BOARD_ARTICLE, {
		fetchPolicy: 'network-only',
		variables: { input: articleId },
		skip: !articleId,
	});
	const article: BoardArticle | null = articleData?.getBoardArticle ?? null;
	const locale = router.locale ?? 'en';
	const localizedArticleTitle = article ? getLocalizedField(article, 'articleTitle', locale) : undefined;
	const localizedArticleContent = article ? getLocalizedField(article, 'articleContent', locale) : undefined;

	const { data: commentsData, refetch: refetchComments } = useQuery<{ getComments: Comments }>(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: commentInput },
		skip: !commentInput.search.commentRefId,
		notifyOnNetworkStatusChange: true,
	});
	const comments: Comment[] = commentsData?.getComments?.list ?? [];
	const commentTotal: number = commentsData?.getComments?.metaCounter?.[0]?.total ?? 0;

	// Related — same category, reusing the existing list query.
	const { data: relatedData } = useQuery<{ getBoardArticles: BoardArticles }>(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		skip: !article?.articleCategory,
		variables: {
			input: {
				page: 1,
				limit: 4,
				sort: 'articleViews',
				direction: Direction.DESC,
				search: { articleCategory: article?.articleCategory as BoardArticleCategory },
			},
		},
	});
	const related: BoardArticle[] = (relatedData?.getBoardArticles?.list ?? [])
		.filter((a) => a._id !== articleId)
		.slice(0, 3);

	useEffect(() => {
		if (articleId)
			setCommentInput((prev) => ({ ...prev, search: { commentGroup: CommentGroup.ARTICLE, commentRefId: articleId } }));
	}, [articleId]);

	const gallery = useMemo(() => (article?.articleImages ?? []).filter(Boolean), [article?.articleImages]);
	const author = article?.memberData;
	const authorName = author?.memberFullName || author?.memberNick || t('GoTrip traveller');
	const localizedAuthorDesc = author ? getLocalizedField(author, 'memberDesc', locale) : undefined;

	const likeHandler = async () => {
		try {
			if (!articleId) return;
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetBoardArticle({ variables: { input: articleId } });
			await refetchArticle({ input: articleId });
			await sweetTopSmallSuccessAlert(t('success'), 800);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const createCommentHandler = async () => {
		try {
			if (!comment.trim() || !articleId) return;
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			const input: CommentInput = {
				commentGroup: CommentGroup.ARTICLE,
				commentRefId: articleId,
				commentContent: comment.trim(),
			};
			await createComment({ variables: { input } });
			setComment('');
			await refetchComments({ input: commentInput });
			await refetchArticle({ input: articleId });
			await sweetTopSmallSuccessAlert(t('Comment posted'), 900);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const updateCommentHandler = async (commentId: string, status?: CommentStatus.DELETE) => {
		try {
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			if (status && !(await sweetConfirmAlert(t('Do you want to delete the comment?')))) return;
			const input: CommentUpdate = {
				_id: commentId,
				...(status ? { commentStatus: status } : { commentContent: editingText.trim() }),
			};
			await updateComment({ variables: { input } });
			await refetchComments({ input: commentInput });
			setEditingId(null);
			setEditingText('');
			await sweetTopSmallSuccessAlert(status ? t('Comment deleted') : t('Comment updated'), 900);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const paginationHandler = (value: number) => setCommentInput({ ...commentInput, page: value });
	const commentPages = Math.ceil(commentTotal / commentInput.limit);

	if (!article && (articleError || (mounted && !articleId))) {
		return (
			<section className="pg-sec">
				<div className="wrap">
					<div className="pg-state">
						<h3>{t('Article could not be loaded')}</h3>
						<p>{t('This story may have been removed or the link is incomplete.')}</p>
						<Link className="btn btn-sky" href="/community">
							{t('Back to community')}
						</Link>
					</div>
				</div>
			</section>
		);
	}

	if (!article) {
		return (
			<section className="pg-sec">
				<div className="wrap td-layout">
					<div className="pg-skeleton" style={{ height: 520 }} />
					<div className="pg-skeleton" style={{ height: 300 }} />
				</div>
			</section>
		);
	}

	return (
		<section className="pg-sec">
			<div className="wrap td-layout">
				<article>
					<div className="tdp-badges">
						<span className="tdp-badge sky">{t(article.articleCategory)}</span>
						<span className="tdp-badge soft">{t('{{count}} min read', { count: readMinutesFor(localizedArticleContent) })}</span>
					</div>

					<h1 className="tdp-title">{localizedArticleTitle}</h1>

					<div className="ad-author">
						{author && (
							<Link className="ad-author-id" href={`/member?memberId=${author._id}`}>
								<img alt="" src={getImageUrl(author.memberImage)} />
								<span>
									<b>{authorName}</b>
									<small>{moment(article.createdAt).format('MMMM D, YYYY')}</small>
								</span>
							</Link>
						)}
						<div className="ad-author-stats">
							<span>{t('{{count}} views', { count: article.articleViews ?? 0 })}</span>
							<span>{t('{{count}} comments', { count: commentTotal })}</span>
							<button className="btn btn-outline ad-like" onClick={likeHandler} type="button">
								{article.meLiked?.[0]?.myFavorite ? '♥' : '♡'} {article.articleLikes ?? 0}
							</button>
						</div>
					</div>

					{article.articleImage && (
						<div className="ad-hero">
							<img alt={localizedArticleTitle} src={getImageUrl(article.articleImage)} />
						</div>
					)}

					<div className="ad-body">
						{(localizedArticleContent ?? '')
							.split(/\n{2,}/)
							.filter(Boolean)
							.map((para, i) => (
								<p key={i}>{para}</p>
							))}
					</div>

					{gallery.length > 1 && (
						<div className="ad-gallery">
							{gallery.slice(1).map((src, i) => (
								<img alt="" key={`${src}-${i}`} loading="lazy" src={getImageUrl(src)} />
							))}
						</div>
					)}

					{!!article.readers?.length && (
						<div className="ad-readers">
							<span>{t('Read by')}</span>
							<div className="art-readers">
								{article.readers.map((r) => (
									<img alt="" key={r._id} loading="lazy" src={getImageUrl(r.memberImage)} />
								))}
								{!!article.readersCount && article.readersCount > article.readers.length && (
									<span className="plus">+</span>
								)}
							</div>
						</div>
					)}

					<div className="tdp-block">
						<h2>{t('Comments ({{count}})', { count: commentTotal })}</h2>

						{comments.length === 0 && <p>{t('No comments yet — start the conversation.')}</p>}

						{comments.map((c) => {
							const isMine = c.memberId === user?._id;
							return (
								<div className="tdp-review" key={c._id}>
									<img alt="" loading="lazy" src={getImageUrl(c.memberData?.memberImage)} />
									<div style={{ flex: 1, minWidth: 0 }}>
										<b>{c.memberData?.memberFullName || c.memberData?.memberNick || t('Traveller')}</b>
										<time>{moment(c.createdAt).format('MMMM D, YYYY · HH:mm')}</time>
										{editingId === c._id ? (
											<div className="tdp-reply" style={{ marginTop: 0 }}>
												<textarea
													maxLength={COMMENT_MAX}
													onChange={(e) => setEditingText(e.target.value)}
													value={editingText}
												/>
												<div className="ad-cmt-actions">
													<button
														className="btn btn-sky"
														disabled={!editingText.trim()}
														onClick={() => updateCommentHandler(c._id)}
														type="button"
													>
														{t('Save')}
													</button>
													<button className="btn btn-outline" onClick={() => setEditingId(null)} type="button">
														{t('Cancel')}
													</button>
												</div>
											</div>
										) : (
											<>
												<p>{c.commentContent}</p>
												{isMine && (
													<div className="ad-cmt-actions">
														<button
															className="fl-chip"
															onClick={() => {
																setEditingId(c._id);
																setEditingText(c.commentContent);
															}}
															type="button"
														>
															{t('Edit')}
														</button>
														<button
															className="fl-chip"
															onClick={() => updateCommentHandler(c._id, CommentStatus.DELETE)}
															type="button"
														>
															{t('Delete')}
														</button>
													</div>
												)}
											</>
										)}
									</div>
								</div>
							);
						})}

						{commentPages > 1 && (
							<div className="pg-pager">
								<button
									disabled={commentInput.page === 1}
									onClick={() => paginationHandler(commentInput.page - 1)}
									type="button"
								>
									{t('Prev')}
								</button>
								{Array.from({ length: commentPages }, (_, i) => i + 1).map((p) => (
									<button
										className={p === commentInput.page ? 'on' : ''}
										key={p}
										onClick={() => paginationHandler(p)}
										type="button"
									>
										{p}
									</button>
								))}
								<button
									disabled={commentInput.page === commentPages}
									onClick={() => paginationHandler(commentInput.page + 1)}
									type="button"
								>
									{t('Next')}
								</button>
							</div>
						)}

						<div className="tdp-reply">
							<textarea
								maxLength={COMMENT_MAX}
								onChange={(e) => setComment(e.target.value)}
								placeholder={user?._id ? t('Share a thoughtful response…') : t('Log in to comment')}
								value={comment}
							/>
							<div className="ad-cmt-actions">
								<span className="ad-count">
									{comment.length}/{COMMENT_MAX}
								</span>
								<button
									className="btn btn-sky"
									disabled={!comment.trim() || creatingComment}
									onClick={createCommentHandler}
									type="button"
								>
									{creatingComment ? t('Posting…') : t('Post comment')}
								</button>
							</div>
						</div>
					</div>
				</article>

				<aside className="tdp-side">
					{author && (
						<div className="tdp-book">
							<h3 className="pg-panel-title">{t('About the author')}</h3>

							<div className="au-card-id">
								<img
									alt={authorName}
									className="au-card-av"
									src={getImageUrl(author.memberImage, '/img/profile/defaultUser.svg')}
								/>
								<b>{authorName}</b>
								{author.memberType && <span className="au-card-role">{t(author.memberType)}</span>}
							</div>

							<div className="au-card-stats">
								<div>
									<b>{author.memberArticles ?? 0}</b>
									<small>{t('Articles')}</small>
								</div>
								<div>
									<b>{author.memberFollowers ?? 0}</b>
									<small>{t('Followers')}</small>
								</div>
								<div>
									<b>{author.memberLikes ?? 0}</b>
									<small>{t('Likes')}</small>
								</div>
							</div>

							{localizedAuthorDesc && <p className="au-card-bio">{localizedAuthorDesc}</p>}

							<Link className="btn btn-sky au-card-cta" href={`/member?memberId=${author._id}`}>
								{t('View profile')}
							</Link>
						</div>
					)}

					<div className="pg-panel" style={{ marginTop: 22 }}>
						<h3 className="pg-panel-title">{t('Browse')}</h3>
						<div className="cm-cats" style={{ marginTop: 16 }}>
							{Object.values(BoardArticleCategory).map((c) => (
								<Link className="cm-cat" href={`/community?articleCategory=${c}`} key={c}>
									{t(ARTICLE_CATEGORY_LABELS[c])}
								</Link>
							))}
						</div>
					</div>
				</aside>
			</div>

			{related.length > 0 && (
				<div className="wrap tdp-related">
					<span className="eyebrow">{t('Keep reading')}</span>
					<h2 style={{ marginBottom: 26 }}>{t('Related articles')}</h2>
					<div className="pg-grid">
						{related.map((a) => (
							<ArticleCard article={a} key={a._id} />
						))}
					</div>
				</div>
			)}
		</section>
	);
};

export default withLayoutGth(ArticleDetailPage);
