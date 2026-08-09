import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import moment from 'moment';
import withLayoutGth from '../../libs/components/layout/LayoutGth';
import TourCard from '../../libs/components/homepage-html/TourCard';
import {
	FacebookIcon,
	InstagramIcon,
	LinkedInIcon,
	XIcon,
	YouTubeIcon,
} from '../../libs/components/homepage-html/socialIcons';
import { GET_COMMENTS, GET_MEMBER, GET_TOURS } from '../../apollo/user/query';
import { CREATE_COMMENT, LIKE_TARGET_MEMBER, LIKE_TARGET_TOUR } from '../../apollo/user/mutation';
import { Member } from '../../libs/types/member/member';
import { Tour, Tours } from '../../libs/types/tour/tour';
import { Comment, Comments } from '../../libs/types/comment/comment';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { getImageUrl } from '../../libs/config';
import { userVar } from '../../apollo/store';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { useTranslation } from '../../libs/i18n/useTranslation';
import { getLocalizedField } from '../../libs/i18n/localization';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const SOCIAL_KEYS = [
	{ key: 'facebook', label: 'Facebook', cls: 'fb', Icon: FacebookIcon },
	{ key: 'twitter', label: 'X (Twitter)', cls: 'tw', Icon: XIcon },
	{ key: 'linkedin', label: 'LinkedIn', cls: 'li', Icon: LinkedInIcon },
	{ key: 'youtube', label: 'YouTube', cls: 'yt', Icon: YouTubeIcon },
	{ key: 'instagram', label: 'Instagram', cls: 'ig', Icon: InstagramIcon },
] as const;

const GuideDetailPage: NextPage = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	// `router.query` is empty until the router hydrates on a statically-optimised page —
	// fall back to the URL so a direct load resolves on the first client render.
	const queryId = router.query.agentId as string | undefined;
	const agentId =
		queryId ??
		(typeof window !== 'undefined'
			? new URLSearchParams(window.location.search).get('agentId') ?? undefined
			: undefined);

	const [review, setReview] = useState('');
	const [commentInput, setCommentInput] = useState<CommentsInquiry>({
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: { commentGroup: CommentGroup.MEMBER, commentRefId: '' },
	});

	const [createComment] = useMutation(CREATE_COMMENT);
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);
	const [likeTargetTour] = useMutation(LIKE_TARGET_TOUR);

	// Read straight off `data` — onCompleted is unreliable here (documented on the tour pages).
	const {
		data: memberData,
		error: memberError,
		refetch: refetchMember,
	} = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { input: agentId },
		skip: !agentId,
	});
	const guide: Member | null = memberData?.getMember ?? null;
	const locale = router.locale ?? 'en';
	const localizedGuideDesc = guide ? getLocalizedField(guide, 'memberDesc', locale) : undefined;

	const { data: toursData, refetch: refetchTours } = useQuery<{ getTours: Tours }>(GET_TOURS, {
		fetchPolicy: 'cache-and-network',
		skip: !agentId,
		variables: {
			input: {
				page: 1,
				limit: 6,
				sort: 'createdAt',
				direction: Direction.DESC,
				search: { memberId: agentId },
			},
		},
	});
	const guideTours: Tour[] = toursData?.getTours?.list ?? [];
	const tourTotal: number = toursData?.getTours?.metaCounter?.[0]?.total ?? 0;

	const { data: commentsData, refetch: refetchComments } = useQuery<{ getComments: Comments }>(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: commentInput },
		skip: !commentInput.search.commentRefId,
		notifyOnNetworkStatusChange: true,
	});
	const comments: Comment[] = commentsData?.getComments?.list ?? [];
	const commentTotal: number = commentsData?.getComments?.metaCounter?.[0]?.total ?? 0;

	useEffect(() => {
		if (agentId)
			setCommentInput((prev) => ({ ...prev, search: { commentGroup: CommentGroup.MEMBER, commentRefId: agentId } }));
	}, [agentId]);

	const socials = SOCIAL_KEYS.filter(({ key }) => guide?.memberSocial?.[key]);
	const languages = guide?.memberLanguages ?? [];
	const specialties = guide?.memberSpecialties ?? [];
	const guideName = guide?.memberFullName || guide?.memberNick || (t('GoTrip guide') as string);
	const firstName = guideName.split(' ')[0];
	const isSelf = !!user?._id && user._id === agentId;

	const stats = [
		{ label: 'Tours', value: guide?.memberTours ?? 0 },
		{ label: 'Articles', value: guide?.memberArticles ?? 0 },
		{ label: 'Followers', value: guide?.memberFollowers ?? 0 },
		{ label: 'Likes', value: guide?.memberLikes ?? 0 },
	];

	/* Persist tour likes from this page too — the card used to toggle locally
	   only, so nothing was saved and the heart reset on refresh. */
	const likeTourHandler = async (tourId: string) => {
		try {
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetTour({ variables: { tourId } });
			await refetchTours();
			await sweetTopSmallSuccessAlert(t('success'), 800);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const likeHandler = async () => {
		try {
			if (!agentId) return;
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetMember({ variables: { input: agentId } });
			await refetchMember({ input: agentId });
			await sweetTopSmallSuccessAlert(t('success'), 800);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const submitReviewHandler = async () => {
		try {
			if (!agentId) return;
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			// Existing rule: a member cannot review their own profile.
			if (isSelf) throw new Error(t('Cannot write a review for yourself'));
			const input: CommentInput = {
				commentGroup: CommentGroup.MEMBER,
				commentRefId: agentId,
				commentContent: review,
			};
			await createComment({ variables: { input } });
			setReview('');
			await refetchComments({ input: commentInput });
			await sweetTopSmallSuccessAlert(t('Review added'), 900);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const paginationHandler = (value: number) => setCommentInput({ ...commentInput, page: value });
	const commentPages = Math.ceil(commentTotal / commentInput.limit);

	if (!guide && (memberError || (mounted && !agentId))) {
		return (
			<section className="pg-sec">
				<div className="wrap">
					<div className="pg-state">
						<h3>{t('Guide could not be loaded')}</h3>
						<p>{t('This profile may be unavailable or the link is incomplete.')}</p>
						<Link className="btn btn-sky" href="/agent">
							{t('Back to guides')}
						</Link>
					</div>
				</div>
			</section>
		);
	}

	if (!guide) {
		return (
			<section className="pg-sec">
				<div className="wrap td-layout">
					<div className="pg-skeleton" style={{ height: 460 }} />
					<div className="pg-skeleton" style={{ height: 320 }} />
				</div>
			</section>
		);
	}

	return (
		<section className="pg-sec">
			<div className="wrap td-layout">
				<div>
					<div className="gd-head">
						<div className="gd-cover">
							{guide.memberCoverImage && <img alt="" src={getImageUrl(guide.memberCoverImage)} />}
						</div>
						<div className="gd-id">
							<img alt={guideName} className="gd-av" src={getImageUrl(guide.memberImage)} />
							<div className="gd-idtext">
								<h1 className="tdp-title gd-name">{guideName}</h1>
								{guide.agentExperience && <p className="gd-role">{guide.agentExperience}</p>}
								<div className="tdp-submeta gd-meta">
									{guide.memberAddress && <span>{guide.memberAddress}</span>}
									<span>{t('{{count}} views', { count: guide.memberViews ?? 0 })}</span>
									<span>{t('Joined {{date}}', { date: moment(guide.createdAt).format('MMMM YYYY') })}</span>
								</div>
							</div>
						</div>
					</div>

					{localizedGuideDesc && (
						<div className="tdp-block">
							<h2>{t('About {{name}}', { name: firstName })}</h2>
							<p>{localizedGuideDesc}</p>
						</div>
					)}

					{(specialties.length > 0 || languages.length > 0) && (
						<div className="tdp-block">
							<h2>{t('Expertise')}</h2>
							<div className="tdp-duo">
								{specialties.length > 0 && (
									<div>
										<h3 className="pg-panel-title">{t('Specialities')}</h3>
										<div className="gd-tags">
											{specialties.map((s) => (
												<span className="tdp-badge soft" key={s}>
													{t(s)}
												</span>
											))}
										</div>
									</div>
								)}
								{languages.length > 0 && (
									<div>
										<h3 className="pg-panel-title">{t('Languages spoken')}</h3>
										<div className="gd-tags">
											{languages.map((l) => (
												<span className="tdp-badge soft" key={l}>
													{t(l)}
												</span>
											))}
										</div>
									</div>
								)}
							</div>
						</div>
					)}

					<div className="tdp-block">
						<h2>{t('Tours by {{name}} ({{count}})', { name: firstName, count: tourTotal })}</h2>
						{guideTours.length === 0 ? (
							<p>{t('This guide has no published tours yet.')}</p>
						) : (
							<div className="pg-grid">
								{guideTours.map((tour) => (
									<TourCard key={tour._id} onLike={likeTourHandler} tour={tour} />
								))}
							</div>
						)}
					</div>

					<div className="tdp-block">
						<h2>{t('Reviews ({{count}})', { count: commentTotal })}</h2>

						{comments.length === 0 && <p>{t('No reviews yet — be the first to share your experience.')}</p>}

						{comments.map((comment) => (
							<div className="tdp-review" key={comment._id}>
								<img alt="" loading="lazy" src={getImageUrl(comment.memberData?.memberImage)} />
								<div>
									<b>{comment.memberData?.memberFullName || comment.memberData?.memberNick || t('Traveller')}</b>
									<time>{moment(comment.createdAt).format('MMMM D, YYYY')}</time>
									<p>{comment.commentContent}</p>
								</div>
							</div>
						))}

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

						{!isSelf && (
							<div className="tdp-reply">
								<textarea
									onChange={(e) => setReview(e.target.value)}
									placeholder={(user?._id ? t('Share your experience with {{name}}…', { name: guideName }) : t('Log in to leave a review')) as string}
									value={review}
								/>
								<button className="btn btn-sky" disabled={!review.trim()} onClick={submitReviewHandler} type="button">
									{t('Post review')}
								</button>
							</div>
						)}
					</div>
				</div>

				<aside className="tdp-side">
					<div className="tdp-book">
						<div className="gd-stats">
							{stats.map((s) => (
								<div key={s.label}>
									<b>{s.value}</b>
									<small>{t(s.label)}</small>
								</div>
							))}
						</div>

						<Link className="btn btn-sky" href={`/member?memberId=${guide._id}`}>
							{t('View profile')}
						</Link>
						{!isSelf && (
							<button className="btn btn-outline" onClick={likeHandler} type="button">
								{guide.meLiked?.[0]?.myFavorite ? t('Liked') : t('Like this guide')}
							</button>
						)}

						{socials.length > 0 && (
							<div className="tg-soc gd-soc">
								{socials.map(({ key, label, cls, Icon }) => (
									<a
										aria-label={t(label) as string}
										className={cls}
										href={guide.memberSocial?.[key]}
										key={key}
										rel="noopener noreferrer"
										target="_blank"
									>
										<Icon />
									</a>
								))}
							</div>
						)}
					</div>

					<div className="pg-panel" style={{ marginTop: 22 }}>
						<h3 className="pg-panel-title">{t('Contact')}</h3>
						<div className="tdp-rows" style={{ marginTop: 18, marginBottom: 0 }}>
							{guide.memberPhone && (
								<div>
									<span>{t('Phone')}</span>
									<b>{guide.memberPhone}</b>
								</div>
							)}
							{guide.memberAddress && (
								<div>
									<span>{t('Based in')}</span>
									<b>{guide.memberAddress}</b>
								</div>
							)}
							<div>
								<span>{t('Member since')}</span>
								<b>{moment(guide.createdAt).format('MMM YYYY')}</b>
							</div>
						</div>
					</div>
				</aside>
			</div>
		</section>
	);
};

export default withLayoutGth(GuideDetailPage);
