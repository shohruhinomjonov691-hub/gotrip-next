import React, { useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import moment from 'moment';
import withLayoutGth from '../../libs/components/layout/LayoutGth';
import TourCard from '../../libs/components/homepage-html/TourCard';
import { useTranslation } from '../../libs/i18n/useTranslation';
import { getLocalizedField } from '../../libs/i18n/localization';
import { GET_COMMENTS, GET_TOUR, GET_TOURS } from '../../apollo/user/query';
import { CONTACT_AGENT, CREATE_COMMENT, LIKE_TARGET_TOUR } from '../../apollo/user/mutation';
import { Tour, Tours } from '../../libs/types/tour/tour';
import { Comment } from '../../libs/types/comment/comment';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { getImageUrl } from '../../libs/config';
import { T } from '../../libs/types/common';
import { userVar } from '../../apollo/store';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

/* Inline icons keep the detail page on the same stroke style as the Home sections. */
const Ico = ({ d }: { d: string }) => (
	<svg viewBox="0 0 24 24">
		<path d={d} />
	</svg>
);
const CheckIcon = () => <Ico d="M20 6L9 17l-5-5" />;
const CrossIcon = () => <Ico d="M18 6L6 18M6 6l12 12" />;
const PinIcon = () => (
	<svg viewBox="0 0 24 24">
		<path d="M12 21s-7-6.3-7-11a7 7 0 0114 0c0 4.7-7 11-7 11z" />
		<circle cx="12" cy="10" r="2.6" />
	</svg>
);
const EyeIcon = () => (
	<svg viewBox="0 0 24 24">
		<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
		<circle cx="12" cy="12" r="3" />
	</svg>
);
const ChatIcon = () => <Ico d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />;
const ClockIcon = () => (
	<svg viewBox="0 0 24 24">
		<circle cx="12" cy="12" r="9" />
		<path d="M12 7v5l3.4 2" />
	</svg>
);
const GroupIcon = () => (
	<svg viewBox="0 0 24 24">
		<circle cx="9" cy="8" r="3.4" />
		<path d="M3 20c0-3.4 2.7-5.3 6-5.3s6 1.9 6 5.3" />
		<path d="M17 9.4l1.5 1.5L22 7.4" />
	</svg>
);
const TerrainIcon = () => <Ico d="M3 19l6-9 4 5.5L16 11l5 8z" />;
const GlobeIcon = () => (
	<svg viewBox="0 0 24 24">
		<circle cx="12" cy="12" r="9.2" />
		<path d="M2.8 12h18.4" />
		<path d="M12 2.8c2.9 3.2 2.9 15.2 0 18.4M12 2.8c-2.9 3.2-2.9 15.2 0 18.4" />
	</svg>
);
const HeartIcon = () => <Ico d="M20.8 8.6c0 5.2-8.8 10.4-8.8 10.4S3.2 13.8 3.2 8.6a4.8 4.8 0 018.8-2.7 4.8 4.8 0 018.8 2.7z" />;
const StarIcon = () => <Ico d="M12 3l2.4 5.4 5.6.6-4.2 3.9 1.2 5.6L12 15.7 6.9 18.5l1.2-5.6L4 9l5.6-.6z" />;

const TourDetailPage: NextPage = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	// `router.query` is empty until the router hydrates on a statically-optimised page, and
	// `router.isReady` is not reliable to gate on here — read the id straight off the URL as
	// a fallback so a direct load / refresh resolves the tour on the first client render.
	const queryId = router.query.id as string | undefined;
	const tourId =
		queryId ??
		(typeof window !== 'undefined'
			? new URLSearchParams(window.location.search).get('id') ?? undefined
			: undefined);
	const [review, setReview] = useState<string>('');
	const [contactMessage, setContactMessage] = useState<string>('');
	const [contactSent, setContactSent] = useState(false);
	const [activeImage, setActiveImage] = useState(0);
	const [commentInput, setCommentInput] = useState<CommentsInquiry>({
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: { commentGroup: CommentGroup.TOUR, commentRefId: '' },
	});

	const [likeTargetTour] = useMutation(LIKE_TARGET_TOUR);
	const [createComment] = useMutation(CREATE_COMMENT);
	const [contactAgent, { loading: sendingInquiry }] = useMutation(CONTACT_AGENT);

	// Read straight off `data` rather than mirroring it into state via onCompleted:
	// onCompleted does not fire reliably here (same issue already documented on the
	// tour list page), which otherwise leaves the page stuck on its skeleton.
	const {
		data: tourData,
		refetch: refetchTour,
		loading: tourLoading,
		error: tourError,
	} = useQuery(GET_TOUR, {
		fetchPolicy: 'network-only',
		variables: { tourId },
		skip: !tourId,
	});
	const tour: Tour | null = tourData?.getTour ?? null;
	const locale = router.locale ?? 'en';
	const localizedTourTitle = tour ? getLocalizedField(tour, 'tourTitle', locale) : undefined;
	const localizedTourDesc = tour ? getLocalizedField(tour, 'tourDesc', locale) : undefined;
	const localizedMeetingPoint = tour ? getLocalizedField(tour, 'tourMeetingPoint', locale) : undefined;
	const localizedGuideDesc = tour?.memberData ? getLocalizedField(tour.memberData, 'memberDesc', locale) : undefined;

	const { data: commentsData, refetch: refetchComments } = useQuery(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: commentInput },
		skip: !commentInput.search.commentRefId,
		notifyOnNetworkStatusChange: true,
	});
	const comments: Comment[] = commentsData?.getComments?.list ?? [];
	const commentTotal: number = commentsData?.getComments?.metaCounter?.[0]?.total ?? 0;

	// Similar tours — same category, reusing the existing tour query/filters.
	const { data: relatedData } = useQuery<{ getTours: Tours }>(GET_TOURS, {
		fetchPolicy: 'cache-and-network',
		skip: !tour?.tourCategory,
		variables: {
			input: {
				page: 1,
				limit: 4,
				sort: 'tourRank',
				direction: Direction.DESC,
				search: { categoryList: tour?.tourCategory ? [tour.tourCategory] : [] },
			},
		},
	});
	const relatedTours: Tour[] = (relatedData?.getTours?.list ?? []).filter((item) => item._id !== tourId).slice(0, 3);

	useEffect(() => {
		if (tourId)
			setCommentInput((prev) => ({ ...prev, search: { commentGroup: CommentGroup.TOUR, commentRefId: tourId } }));
	}, [tourId]);

	useEffect(() => {
		setContactMessage('');
		setContactSent(false);
		setActiveImage(0);
	}, [tourId]);

	const isLiked = !!tour?.meLiked?.[0]?.myFavorite;
	const galleryImages = useMemo(() => {
		const backendImages = tour?.tourImages?.map((item) => getImageUrl(item)) ?? [];
		return backendImages.length ? backendImages.slice(0, 5) : [getImageUrl(undefined, '/img/banner/cities/JEJU.webp')];
	}, [tour?.tourImages]);
	const guide = tour?.memberData;
	const guideName = guide?.memberFullName || guide?.memberNick || t('GoTrip concierge');
	const guideImage = getImageUrl(guide?.memberImage);
	const includedItems = (tour ? getLocalizedField(tour, 'tourIncluded', locale) : undefined) ?? [];
	const excludedItems = (tour ? getLocalizedField(tour, 'tourExcluded', locale) : undefined) ?? [];
	const itineraryItems = (tour ? getLocalizedField(tour, 'tourItinerary', locale) : undefined) ?? [];

	const facts = [
		{
			icon: <ClockIcon />,
			label: t('Duration'),
			value: tour?.tourDuration ? t('{{count}} days', { count: tour.tourDuration }) : t('Flexible'),
		},
		{
			icon: <GroupIcon />,
			label: t('Group size'),
			value: tour ? t('{{min}}–{{max}} travellers', { min: tour.tourMinPeople, max: tour.tourMaxPeople }) : t('Private group'),
		},
		{ icon: <TerrainIcon />, label: t('Activity'), value: tour?.tourDifficulty ?? t('Moderate') },
		{ icon: <GlobeIcon />, label: t('Language'), value: tour?.tourLanguage ?? t('Local guide') },
	];

	const likeHandler = async () => {
		try {
			if (!tourId) return;
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetTour({ variables: { tourId } });
			await refetchTour({ tourId });
			await sweetTopSmallSuccessAlert(t('success'), 800);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const submitReviewHandler = async () => {
		try {
			if (!tourId) return;
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			const input: CommentInput = {
				commentGroup: CommentGroup.TOUR,
				commentRefId: tourId,
				commentContent: review,
			};
			await createComment({
				variables: { input },
				/*
				 * Bump the count on the normalised Tour entity rather than refetching it.
				 * Apollo keys tours as `Tour:<_id>`, so every query holding this tour —
				 * the detail page, the Tour list, and the Home carousels — re-renders
				 * with the new number straight away, at no extra network cost.
				 */
				update: (cache) => {
					cache.modify({
						id: cache.identify({ __typename: 'Tour', _id: tourId }),
						fields: {
							tourComments: (current) => (typeof current === 'number' ? current + 1 : 1),
						},
					});
				},
			});
			setReview('');
			await refetchComments({ input: commentInput });
			await sweetTopSmallSuccessAlert(t('Review added'), 900);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const contactAgentHandler = async () => {
		try {
			if (!tourId) return;
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			if (!contactMessage.trim()) return;
			await contactAgent({ variables: { input: { tourId, message: contactMessage.trim() } } });
			setContactSent(true);
			setContactMessage('');
			await sweetTopSmallSuccessAlert(t('Inquiry sent to the guide'), 900);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const paginationHandler = (value: number) => setCommentInput({ ...commentInput, page: value });
	const commentPages = Math.ceil(commentTotal / commentInput.limit);

	if (!tour && (tourError || (mounted && !tourId))) {
		return (
			<section className="pg-sec">
				<div className="wrap">
					<div className="pg-state">
						<h3>{t('Tour could not be loaded')}</h3>
						<p>{t('The selected itinerary may be unavailable or the link is incomplete.')}</p>
						<Link className="btn btn-sky" href="/tour">
							{t('Back to tours')}
						</Link>
					</div>
				</div>
			</section>
		);
	}

	// Covers both the pre-hydration frame and the in-flight fetch.
	if (!tour) {
		return (
			<section className="pg-sec">
				<div className="wrap td-layout">
					<div className="pg-skeleton" style={{ height: 520 }} />
					<div className="pg-skeleton" style={{ height: 340 }} />
				</div>
			</section>
		);
	}

	return (
		<section className="pg-sec">
			<div className="wrap td-layout">
				{/* ---------------- Main column ---------------- */}
				<div>
					<div className="tdp-gallery">
						<div className="tdp-main">
							<img alt={localizedTourTitle ?? (t('Tour') as string)} src={galleryImages[activeImage] ?? galleryImages[0]} />
						</div>
						{galleryImages.length > 1 && (
							<div className="tdp-thumbs">
								{galleryImages.map((image, index) => (
									<button
										aria-label={t('Image {{number}}', { number: index + 1 }) as string}
										className={index === activeImage ? 'tdp-thumb on' : 'tdp-thumb'}
										key={`${image}-${index}`}
										onClick={() => setActiveImage(index)}
										type="button"
									>
										<img alt="" loading="lazy" src={image} />
									</button>
								))}
							</div>
						)}
					</div>

					<div className="tdp-badges">
						<span className="tdp-badge sky">{t(tour?.tourCategory ?? '')}</span>
						{!!tour?.tourRating && (
							<span className="tdp-badge">
								<StarIcon /> {tour.tourRating.toFixed(1)}
							</span>
						)}
						<span className="tdp-badge soft">{t(tour?.tourLocation ?? '')}</span>
					</div>

					<h1 className="tdp-title">{localizedTourTitle}</h1>

					<div className="tdp-submeta">
						<span>
							<PinIcon />
							{localizedMeetingPoint || t(tour?.tourLocation ?? '')}
						</span>
						<span>
							<EyeIcon />
							{t('{{count}} views', { count: tour?.tourViews ?? 0 })}
						</span>
						<span>
							<ChatIcon />
							{t('{{count}} reviews', { count: tour?.tourComments ?? 0 })}
						</span>
						<span>
							<HeartIcon />
							{t('{{count}} saved', { count: tour?.tourLikes ?? 0 })}
						</span>
					</div>

					{tour?.tourDesc && (
						<div className="tdp-block">
							<h2>{t('About this tour')}</h2>
							<p>{localizedTourDesc}</p>
						</div>
					)}

					<div className="tdp-block">
						<h2>{t('Basic information')}</h2>
						<div className="tdp-facts">
							{facts.map((fact) => (
								<div className="tdp-fact" key={fact.label}>
									<span className="ic">{fact.icon}</span>
									<span>
										<small>{fact.label}</small>
										<b>{fact.value}</b>
									</span>
								</div>
							))}
						</div>
					</div>

					{(includedItems.length > 0 || excludedItems.length > 0) && (
						<div className="tdp-block">
							<h2>{t('Included and excluded')}</h2>
							<div className="tdp-duo">
								{includedItems.length > 0 && (
									<div>
										<h3 className="pg-panel-title">{t("What's included")}</h3>
										<ul className="tdp-list" style={{ marginTop: 16 }}>
											{includedItems.map((item) => (
												<li key={item}>
													<CheckIcon />
													{item}
												</li>
											))}
										</ul>
									</div>
								)}
								{excludedItems.length > 0 && (
									<div>
										<h3 className="pg-panel-title">{t('Not included')}</h3>
										<ul className="tdp-list excluded" style={{ marginTop: 16 }}>
											{excludedItems.map((item) => (
												<li key={item}>
													<CrossIcon />
													{item}
												</li>
											))}
										</ul>
									</div>
								)}
							</div>
						</div>
					)}

					{itineraryItems.length > 0 && (
						<div className="tdp-block">
							<h2>{t('Schedule')}</h2>
							<ol className="tdp-steps">
								{itineraryItems.map((item, index) => (
									<li key={`${item}-${index}`}>
										<b>{t('Day {{number}}', { number: index + 1 })}</b>
										{item}
									</li>
								))}
							</ol>
						</div>
					)}

					{/* ---------------- Reviews (existing comment system) ---------------- */}
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
								{Array.from({ length: commentPages }, (_, i) => i + 1).map((page) => (
									<button
										className={page === commentInput.page ? 'on' : ''}
										key={page}
										onClick={() => paginationHandler(page)}
										type="button"
									>
										{page}
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
								onChange={(e) => setReview(e.target.value)}
								placeholder={(user?._id ? t('Share your experience of this tour…') : t('Log in to leave a review')) as string}
								value={review}
							/>
							<button className="btn btn-sky" disabled={!review.trim()} onClick={submitReviewHandler} type="button">
								{t('Post review')}
							</button>
						</div>
					</div>
				</div>

				{/* ---------------- Sticky booking sidebar ---------------- */}
				<aside className="tdp-side">
					<div className="tdp-book">
						<div className="tdp-book-top">
							<span className="tdp-price">
								${tour?.tourPrice?.toLocaleString('en-US')}
								<small>/person</small>
							</span>
							{!!tour?.tourRating && (
								<span className="tdp-badge soft">
									<StarIcon /> {tour.tourRating.toFixed(1)}
								</span>
							)}
						</div>

						<div className="tdp-rows">
							<div>
								<span>{t('Duration')}</span>
								<b>{t('{{count}} days', { count: tour?.tourDuration ?? 0 })}</b>
							</div>
							<div>
								<span>{t('Group size')}</span>
								<b>
									{tour?.tourMinPeople}–{tour?.tourMaxPeople}
								</b>
							</div>
							<div>
								<span>{t('Seats left')}</span>
								<b>{tour?.tourAvailableSeats}</b>
							</div>
							<div>
								<span>{t('Location')}</span>
								<b>{t(tour?.tourLocation ?? '')}</b>
							</div>
						</div>

						{guide && (
							<div className="tdp-guide">
								<img alt="" src={guideImage} />
								<span>
									<b>{guideName}</b>
									<small>{t('{{count}} tours · Verified guide', { count: guide.memberTours ?? 0 })}</small>
								</span>
							</div>
						)}

						<textarea
							onChange={(e) => setContactMessage(e.target.value)}
							placeholder={t('Ask the guide about dates, group size or pickup…') as string}
							value={contactMessage}
						/>
						<button
							className="btn btn-sky"
							disabled={sendingInquiry || !contactMessage.trim()}
							onClick={contactAgentHandler}
							type="button"
						>
							{sendingInquiry ? t('Sending…') : t('Send inquiry')}
						</button>
						<button className="btn btn-outline" onClick={likeHandler} type="button">
							{isLiked ? t('Saved to favourites') : t('Save this tour')}
						</button>

						{contactSent && <div className="tdp-sent">{t('Your inquiry was sent to {{name}}.', { name: guideName })}</div>}
					</div>

					{guide && (
						<div className="pg-panel" style={{ marginTop: 22 }}>
							<h3 className="pg-panel-title">{t('Your guide')}</h3>
							<div className="tdp-guide" style={{ marginTop: 18 }}>
								<img alt="" src={guideImage} />
								<span>
									<b>{guideName}</b>
									<small>{guide.memberAddress || t('GoTrip verified guide')}</small>
								</span>
							</div>
							{localizedGuideDesc && <p style={{ color: 'var(--body)', fontSize: '0.92rem', margin: 0 }}>{localizedGuideDesc}</p>}
							<Link className="btn btn-outline" href={`/agent/detail?agentId=${guide._id}`} style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>
								{t('View profile')}
							</Link>
						</div>
					)}
				</aside>
			</div>

			{/* ---------------- Similar tours ---------------- */}
			{relatedTours.length > 0 && (
				<div className="wrap tdp-related">
					<span className="eyebrow">{t('You may also like')}</span>
					<h2 style={{ marginBottom: 26 }}>{t('Similar tours')}</h2>
					<div className="pg-grid">
						{relatedTours.map((item) => (
							<TourCard key={item._id} tour={item} />
						))}
					</div>
				</div>
			)}
		</section>
	);
};

export default withLayoutGth(TourDetailPage);
