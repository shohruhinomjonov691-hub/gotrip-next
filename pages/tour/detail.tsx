import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import {
	Box,
	Button,
	Chip,
	Divider,
	IconButton,
	MenuItem,
	Pagination,
	Rating,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import BookmarkAddedRoundedIcon from '@mui/icons-material/BookmarkAddedRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import PhotoLibraryRoundedIcon from '@mui/icons-material/PhotoLibraryRounded';
import TerrainRoundedIcon from '@mui/icons-material/TerrainRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import moment from 'moment';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { CHECK_WISHLIST, GET_COMMENTS, GET_TOUR, GET_TOUR_SCHEDULES } from '../../apollo/user/query';
import {
	CREATE_BOOKING,
	CREATE_COMMENT,
	CREATE_PAYMENT,
	LIKE_TARGET_TOUR,
	TOGGLE_WISHLIST,
} from '../../apollo/user/mutation';
import { Tour } from '../../libs/types/tour/tour';
import { TourSchedule } from '../../libs/types/tour/tour-schedule';
import { Comment } from '../../libs/types/comment/comment';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { PaymentMethod, WishlistGroup } from '../../libs/enums/tour.enum';
import { REACT_APP_API_URL } from '../../libs/config';
import { formatterStr } from '../../libs/utils';
import { T } from '../../libs/types/common';
import { userVar } from '../../apollo/store';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { easeOutExpo, fadeUp, hoverLift, staggerContainer, tapPress } from '../../libs/components/homepage/motion';

type BookingStep = 'schedule' | 'traveler' | 'review' | 'payment';
type CreatedBookingSummary = {
	_id: string;
	bookingStatus: string;
	bookingNumber: string;
	tourId: string;
	scheduleId: string;
	peopleCount: number;
	totalPrice: number;
};

type BookingDraft = {
	peopleCount: number;
	travelerName: string;
	travelerEmail: string;
	travelerPhone: string;
	passportNumber: string;
	specialRequest: string;
};

type BookingValidation = Partial<Record<keyof BookingDraft | 'schedule', string>>;

type StatItem = {
	icon: React.ReactNode;
	label: string;
	value: string;
};

const defaultBookingDraft: BookingDraft = {
	peopleCount: 1,
	travelerName: '',
	// TODO(gotrip-backend): hydrate this from member profile when member email is exposed by the backend.
	travelerEmail: '',
	travelerPhone: '',
	passportNumber: '',
	specialRequest: '',
};

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const MotionBox = motion(Box);
const MotionStack = motion(Stack);

const fallbackGalleryImages = [
	'/img/banner/cities/JEJU.webp',
	'/img/banner/cities/BUSAN.webp',
	'/img/events/SEOUL.webp',
	'/img/fiber/img5.jpg',
];

const getImageUrl = (image?: string) => {
	if (!image) return fallbackGalleryImages[0];
	if (image.startsWith('http') || image.startsWith('/')) return image;
	return `${REACT_APP_API_URL}/${image}`;
};

const softFadeUp = {
	hidden: { opacity: 0.98, y: 18 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.34, ease: easeOutExpo },
	},
};

const bookingPanelMotion = {
	initial: { opacity: 0, y: 14 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -10 },
	transition: { duration: 0.28, ease: easeOutExpo },
};

const TourDetailPage: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const reduceMotion = useReducedMotion();
	const tourId = router.query.id as string | undefined;
	const [tour, setTour] = useState<Tour | null>(null);
	const [schedules, setSchedules] = useState<TourSchedule[]>([]);
	const [comments, setComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState<number>(0);
	const [review, setReview] = useState<string>('');
	const [rating, setRating] = useState<number | null>(5);
	const [bookingStep, setBookingStep] = useState<BookingStep>('schedule');
	const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CARD);
	const [createdBooking, setCreatedBooking] = useState<CreatedBookingSummary | null>(null);
	const [bookingDraft, setBookingDraft] = useState(defaultBookingDraft);
	const [bookingValidation, setBookingValidation] = useState<BookingValidation>({});
	const [paymentRequestCreated, setPaymentRequestCreated] = useState(false);
	const [commentInput, setCommentInput] = useState<CommentsInquiry>({
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: { commentGroup: CommentGroup.TOUR, commentRefId: '' },
	});

	const [likeTargetTour] = useMutation(LIKE_TARGET_TOUR);
	const [toggleWishlist] = useMutation(TOGGLE_WISHLIST);
	const [createComment] = useMutation(CREATE_COMMENT);
	const [createBooking, { loading: creatingBooking }] = useMutation(CREATE_BOOKING);
	const [createPayment, { loading: creatingPayment }] = useMutation(CREATE_PAYMENT);

	const {
		refetch: refetchTour,
		loading: tourLoading,
		error: tourError,
	} = useQuery(GET_TOUR, {
		fetchPolicy: 'network-only',
		variables: { tourId },
		skip: !tourId,
		onCompleted: (data: T) => setTour(data?.getTour ?? null),
	});

	const { loading: schedulesLoading, error: schedulesError, refetch: refetchSchedules } = useQuery(GET_TOUR_SCHEDULES, {
		fetchPolicy: 'cache-and-network',
		variables: { tourId },
		skip: !tourId,
		onCompleted: (data: T) => setSchedules(data?.getTourSchedules?.list ?? []),
	});

	const { data: wishlistData, refetch: refetchWishlist } = useQuery(CHECK_WISHLIST, {
		fetchPolicy: 'network-only',
		variables: { input: { wishlistGroup: WishlistGroup.TOUR, wishlistRefId: tourId } },
		skip: !tourId || !user?._id,
	});

	const { refetch: refetchComments, loading: commentsLoading, error: commentsError } = useQuery(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: commentInput },
		skip: !commentInput.search.commentRefId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setComments(data?.getComments?.list ?? []);
			setCommentTotal(data?.getComments?.metaCounter?.[0]?.total ?? 0);
		},
	});

	useEffect(() => {
		if (tourId)
			setCommentInput((prev) => ({ ...prev, search: { commentGroup: CommentGroup.TOUR, commentRefId: tourId } }));
	}, [tourId]);

	useEffect(() => {
		if (!user?._id) return;
		setBookingDraft((prev) => ({
			...prev,
			travelerName: prev.travelerName || user.memberFullName || user.memberNick || '',
			travelerPhone: prev.travelerPhone || user.memberPhone || '',
		}));
	}, [user?._id, user?.memberFullName, user?.memberNick, user?.memberPhone]);

	const isLiked = !!tour?.meLiked?.[0]?.myFavorite;
	const isSaved = !!wishlistData?.checkWishlist;
	const selectedSchedule = schedules.find((schedule) => schedule._id === selectedScheduleId) ?? null;
	const selectedRemainingSeats = selectedSchedule
		? Math.max(selectedSchedule.availableSeats - selectedSchedule.reservedSeats, 0)
		: 0;
	const draftTotal = selectedSchedule ? selectedSchedule.price * bookingDraft.peopleCount : 0;
	const bookingSteps: { key: BookingStep; label: string }[] = [
		{ key: 'schedule', label: 'Schedule' },
		{ key: 'traveler', label: 'Traveler info' },
		{ key: 'review', label: 'Review' },
		{ key: 'payment', label: 'Payment request' },
	];
	const currentStepIndex = bookingSteps.findIndex((step) => step.key === bookingStep);
	const galleryImages = useMemo(() => {
		const backendImages = tour?.tourImages?.map((item) => getImageUrl(item)) ?? [];
		return [...backendImages, ...fallbackGalleryImages].slice(0, 4);
	}, [tour?.tourImages]);
	const guide = tour?.memberData;
	const guideName = guide?.memberFullName || guide?.memberNick || 'GoTrip concierge';
	const guideImage = getImageUrl(guide?.memberImage || '/img/profile/defaultUser.svg');
	const lowestSchedulePrice = schedules.length
		? Math.min(...schedules.map((schedule) => schedule.price))
		: tour?.tourPrice;
	const activeScheduleCount = schedules.filter(
		(schedule) => Math.max(schedule.availableSeats - schedule.reservedSeats, 0) > 0,
	).length;
	const totalRemainingSeats = schedules.length
		? schedules.reduce((sum, schedule) => sum + Math.max(schedule.availableSeats - schedule.reservedSeats, 0), 0)
		: tour?.tourAvailableSeats ?? 0;
	const includedItems = tour?.tourIncluded?.length
		? tour.tourIncluded
		: ['Local guide coordination', 'Curated route planning', 'Traveler support before departure'];
	const excludedItems = tour?.tourExcluded?.length
		? tour.tourExcluded
		: ['Flights and personal insurance', 'Personal shopping expenses', 'Optional activities not listed'];
	const itineraryItems = tour?.tourItinerary?.length
		? tour.tourItinerary
		: ['Your guide will confirm a detailed itinerary after your booking request is reviewed.'];
	const pageVariants = reduceMotion ? undefined : staggerContainer;
	const revealVariants = reduceMotion ? undefined : softFadeUp;
	const galleryVariants = reduceMotion ? undefined : fadeUp;

	const quickStats: StatItem[] = [
		{
			icon: <AccessTimeRoundedIcon />,
			label: 'Duration',
			value: tour?.tourDuration ? `${tour.tourDuration} day${tour.tourDuration === 1 ? '' : 's'}` : 'Flexible',
		},
		{
			icon: <GroupsRoundedIcon />,
			label: 'Group size',
			value: tour ? `${tour.tourMinPeople}-${tour.tourMaxPeople} travelers` : 'Private group',
		},
		{
			icon: <TerrainRoundedIcon />,
			label: 'Activity',
			value: tour?.tourDifficulty ?? 'Moderate',
		},
		{
			icon: <LanguageRoundedIcon />,
			label: 'Language',
			value: tour?.tourLanguage ?? 'Local guide',
		},
	];

	const likeHandler = async () => {
		try {
			if (!tourId) return;
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetTour({ variables: { tourId } });
			await refetchTour({ tourId });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const saveHandler = async () => {
		try {
			if (!tourId) return;
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			await toggleWishlist({ variables: { input: { wishlistGroup: WishlistGroup.TOUR, wishlistRefId: tourId } } });
			await refetchWishlist({ input: { wishlistGroup: WishlistGroup.TOUR, wishlistRefId: tourId } });
			await sweetTopSmallSuccessAlert('Saved tours updated', 900);
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
				rating: rating ?? 5,
			};
			await createComment({ variables: { input } });
			setReview('');
			setRating(5);
			await refetchComments({ input: commentInput });
			await refetchTour({ tourId });
			await sweetTopSmallSuccessAlert('Review added', 900);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const draftChangeHandler = (field: keyof typeof bookingDraft, value: string | number) => {
		setBookingDraft((prev) => ({ ...prev, [field]: value }));
		setBookingValidation((prev) => ({ ...prev, [field]: undefined }));
	};

	const selectScheduleHandler = (scheduleId: string) => {
		setSelectedScheduleId(scheduleId);
		setCreatedBooking(null);
		setPaymentRequestCreated(false);
		setBookingValidation((prev) => ({ ...prev, schedule: undefined }));
	};

	const validateTravelerDraft = () => {
		const nextValidation: BookingValidation = {};
		if (!selectedSchedule) nextValidation.schedule = 'Choose a departure date first.';
		if (!bookingDraft.travelerName.trim()) nextValidation.travelerName = 'Traveler name is required.';
		if (!bookingDraft.travelerEmail.trim()) nextValidation.travelerEmail = 'Traveler email is required.';
		if (!bookingDraft.travelerPhone.trim()) nextValidation.travelerPhone = 'Traveler phone is required.';
		if (bookingDraft.peopleCount < 1) nextValidation.peopleCount = 'Select at least one traveler.';
		if (selectedSchedule && bookingDraft.peopleCount > selectedRemainingSeats) {
			nextValidation.peopleCount = 'Not enough seats are available.';
		}
		setBookingValidation(nextValidation);
		return !Object.keys(nextValidation).length;
	};

	const scheduleContinueHandler = async () => {
		try {
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			if (!selectedSchedule) {
				setBookingValidation((prev) => ({ ...prev, schedule: 'Choose a departure date first.' }));
				return;
			}
			setBookingValidation({});
			setBookingStep('traveler');
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const reviewBookingHandler = async () => {
		try {
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			if (!tourId || !selectedSchedule) throw new Error('Please select a tour schedule.');
			if (!validateTravelerDraft()) return;
			setBookingStep('review');
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const createBookingHandler = async () => {
		try {
			if (!tourId || !selectedSchedule) throw new Error('Please select a tour schedule.');
			const { data } = await createBooking({
				variables: {
					input: {
						tourId,
						scheduleId: selectedSchedule._id,
						peopleCount: bookingDraft.peopleCount,
						travelerName: bookingDraft.travelerName.trim(),
						travelerEmail: bookingDraft.travelerEmail.trim(),
						travelerPhone: bookingDraft.travelerPhone.trim(),
						...(bookingDraft.passportNumber.trim() ? { passportNumber: bookingDraft.passportNumber.trim() } : {}),
						...(bookingDraft.specialRequest.trim() ? { specialRequest: bookingDraft.specialRequest.trim() } : {}),
					},
				},
			});
			setCreatedBooking(data?.createBooking ?? null);
			setPaymentRequestCreated(false);
			setBookingStep('payment');
			await refetchSchedules({ tourId });
			await sweetTopSmallSuccessAlert('Booking is pending payment', 900);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const createPaymentHandler = async () => {
		try {
			if (!createdBooking) throw new Error('Create a pending booking first.');
			await createPayment({
				variables: {
					input: {
						bookingId: createdBooking._id,
						paymentAmount: createdBooking.totalPrice,
						paymentMethod,
					},
				},
			});
			setPaymentRequestCreated(true);
			await sweetTopSmallSuccessAlert('Payment request created', 900);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const paginationHandler = (_: ChangeEvent<unknown>, value: number) =>
		setCommentInput({ ...commentInput, page: value });

	if (tourLoading && !tour) {
		return (
			<Stack className="tour-detail-page">
				<div className="tour-detail-shell">
					<div className="tour-detail-skeleton hero" />
					<div className="tour-detail-grid">
						<Stack spacing={2}>
							<div className="tour-detail-skeleton stats" />
							<div className="tour-detail-skeleton block" />
							<div className="tour-detail-skeleton block small" />
						</Stack>
						<div className="tour-detail-skeleton sidebar" />
					</div>
				</div>
			</Stack>
		);
	}

	if ((tourError || !tourId) && !tour) {
		return (
			<Stack className="tour-detail-page">
				<div className="tour-detail-shell">
					<div className="tour-detail-empty gt-glass">
						<Typography className="state-title">Tour could not be loaded</Typography>
						<Typography className="state-copy">
							The selected itinerary may be unavailable or the link is incomplete.
						</Typography>
						<Button className="gt-primary-button" href="/tour" startIcon={<ArrowBackRoundedIcon />}>
							Back to tours
						</Button>
					</div>
				</div>
			</Stack>
		);
	}

	return (
		<MotionStack
			className="tour-detail-page"
			variants={pageVariants}
			initial={reduceMotion ? false : 'hidden'}
			animate="visible"
		>
			<div className="tour-detail-shell">
				<MotionBox className="tour-detail-heading" variants={revealVariants}>
					<div>
						<div className="tour-detail-breadcrumb">
							<span>Home</span>
							<span>/</span>
							<span>Tours</span>
							<span>/</span>
							<strong>{tour?.tourTitle ?? 'Tour details'}</strong>
						</div>
						<Typography component="h1" className="tour-detail-title">
							{tour?.tourTitle ?? 'Premium GoTrip Experience'}
						</Typography>
						<Stack className="tour-detail-submeta" direction="row">
							<span>
								<LocationOnRoundedIcon />
								{tour?.tourMeetingPoint || tour?.tourLocation || 'Meeting point after booking'}
							</span>
							<span>
								<ChatBubbleOutlineRoundedIcon />
								{tour?.tourComments ?? 0} guest experiences
							</span>
							<span>
								<VisibilityRoundedIcon />
								{tour?.tourViews ?? 0} views
							</span>
						</Stack>
					</div>
					<Stack className="tour-detail-actions" direction="row">
						<motion.div whileTap={tapPress}>
							<Button
								className="tour-detail-action-button"
								onClick={likeHandler}
								startIcon={isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
							>
								{isLiked ? 'Liked' : 'Like'}
							</Button>
						</motion.div>
						<motion.div whileTap={tapPress}>
							<Button
								className="tour-detail-action-button"
								onClick={saveHandler}
								startIcon={isSaved ? <BookmarkAddedRoundedIcon /> : <BookmarkAddOutlinedIcon />}
							>
								{isSaved ? 'Saved' : 'Save'}
							</Button>
						</motion.div>
					</Stack>
				</MotionBox>

				<MotionBox className="tour-detail-gallery" variants={galleryVariants}>
					{galleryImages.map((item, index) => (
						<motion.div
							className={`tour-gallery-tile ${index === 0 ? 'featured' : ''} ${index === 1 ? 'wide' : ''}`}
							key={`${item}-${index}`}
							whileHover={reduceMotion ? undefined : hoverLift}
						>
							<img
								src={item}
								alt={`${tour?.tourTitle ?? 'GoTrip tour'} gallery ${index + 1}`}
								onError={(event) => {
									if (event.currentTarget.src.includes(fallbackGalleryImages[0])) return;
									event.currentTarget.src = fallbackGalleryImages[0];
								}}
							/>
							<div className="tour-gallery-overlay" />
							{index === 3 && (
								<div className="tour-gallery-count">
									<PhotoLibraryRoundedIcon />
									All photos
								</div>
							)}
						</motion.div>
					))}
				</MotionBox>

				<div className="tour-detail-grid">
					<MotionStack className="tour-detail-main" spacing={3} variants={pageVariants}>
						<MotionBox className="tour-quick-stats gt-glass" variants={revealVariants}>
							{quickStats.map((item) => (
								<div className="tour-stat-item" key={item.label}>
									<span>{item.icon}</span>
									<small>{item.label}</small>
									<strong>{item.value}</strong>
								</div>
							))}
						</MotionBox>

						<MotionBox className="tour-detail-section editorial" variants={revealVariants}>
							<Typography className="tour-section-kicker">Exclusive journey</Typography>
							<Typography component="h2" className="tour-section-title">
								Designed for travelers who want more than a checklist
							</Typography>
							<Typography className="tour-section-copy">
								{tour?.tourDesc ??
									'This curated GoTrip experience is prepared by a local operator and tailored around the destination, schedule, and guest needs.'}
							</Typography>
							<Stack className="tour-detail-chips" direction="row">
								{tour?.tourCategory && <Chip label={tour.tourCategory} />}
								{tour?.tourDifficulty && <Chip label={tour.tourDifficulty} />}
								{tour?.tourLanguage && <Chip label={tour.tourLanguage} />}
								{tour?.tourStatus && <Chip label={tour.tourStatus} />}
							</Stack>
						</MotionBox>

						<MotionBox className="tour-detail-section itinerary" variants={revealVariants}>
							<Typography component="h2" className="tour-section-title">
								Curated itinerary
							</Typography>
							<Stack className="tour-itinerary-list">
								{itineraryItems.map((item, index) => (
									<details className="tour-itinerary-item" key={`${item}-${index}`} open={index === 0}>
										<summary>
											<span className="tour-itinerary-index">{index + 1}</span>
											<strong>{item}</strong>
										</summary>
										<p>
											Your concierge will coordinate timing, pace, and meeting details for this part of the journey
											before departure.
										</p>
									</details>
								))}
							</Stack>
						</MotionBox>

						<MotionBox className="tour-detail-section inclusions" variants={revealVariants}>
							<div>
								<Typography component="h2" className="tour-section-title">
									Included in your experience
								</Typography>
								<Stack className="tour-check-list">
									{includedItems.map((item) => (
										<span key={item}>
											<CheckCircleRoundedIcon />
											{item}
										</span>
									))}
								</Stack>
							</div>
							<div>
								<Typography component="h2" className="tour-section-title">
									Not included
								</Typography>
								<Stack className="tour-check-list muted">
									{excludedItems.map((item) => (
										<span key={item}>
											<CancelRoundedIcon />
											{item}
										</span>
									))}
								</Stack>
							</div>
						</MotionBox>

						<MotionBox className="tour-detail-section reviews" variants={revealVariants}>
							<Stack className="tour-section-head" direction={{ xs: 'column', md: 'row' }}>
								<div>
									<Typography className="tour-section-kicker">Guest experiences</Typography>
									<Typography component="h2" className="tour-section-title">
										Traveler reviews
									</Typography>
								</div>
								<Typography className="tour-review-count">{commentTotal} total</Typography>
							</Stack>
							<div className="tour-review-form gt-glass">
								<Rating value={rating} onChange={(_, value) => setRating(value)} />
								<TextField
									multiline
									minRows={3}
									fullWidth
									placeholder="Share your tour experience"
									inputProps={{ 'aria-label': 'Write a tour review' }}
									value={review}
									onChange={(event) => setReview(event.target.value)}
								/>
								<motion.div whileTap={tapPress}>
									<Button className="gt-primary-button" onClick={submitReviewHandler} disabled={!review.trim()}>
										Post review
									</Button>
								</motion.div>
							</div>
							<Stack className="tour-review-list">
								{commentsLoading && !comments.length && <div className="tour-detail-skeleton review" />}
								{commentsError && !comments.length && (
									<div className="tour-detail-empty compact">
										<span>Reviews could not be loaded.</span>
										<Button className="tour-secondary-button" onClick={() => refetchComments({ input: commentInput })}>
											Try again
										</Button>
									</div>
								)}
								{comments.map((comment) => (
									<div className="tour-review-card gt-glass" key={comment._id}>
										<div className="tour-review-author">
											<img
												src={getImageUrl(comment.memberData?.memberImage || '/img/profile/defaultUser.svg')}
												alt={comment.memberData?.memberNick ?? 'Traveler'}
											/>
											<div>
												<strong>
													{comment.memberData?.memberFullName || comment.memberData?.memberNick || 'Traveler'}
												</strong>
											<small>{moment(comment.createdAt).fromNow()}</small>
										</div>
									</div>
									{typeof comment.rating === 'number' && (
										<Rating value={comment.rating} readOnly size="small" aria-label={`${comment.rating} out of 5 stars`} />
									)}
									<Typography>{comment.commentContent}</Typography>
								</div>
								))}
								{!commentsLoading && !commentsError && !comments.length && (
									<div className="tour-detail-empty compact">
										No reviews yet. Be the first traveler to share feedback.
									</div>
								)}
								{commentTotal > commentInput.limit && (
									<Pagination
										count={Math.ceil(commentTotal / commentInput.limit)}
										page={commentInput.page}
										onChange={paginationHandler}
									/>
								)}
							</Stack>
						</MotionBox>
					</MotionStack>

					<MotionStack className="tour-detail-sidebar" spacing={2.5} variants={revealVariants}>
						<Stack className="tour-booking-card gt-glass">
							<Stack className="tour-booking-price" direction="row">
								<div>
									<small>From</small>
									<strong>${formatterStr(lowestSchedulePrice ?? tour?.tourPrice)}</strong>
									<span>/ per person</span>
								</div>
								<Chip label={`${totalRemainingSeats} seats`} />
							</Stack>
							<div className="tour-fast-note">
								<VerifiedRoundedIcon />
								{activeScheduleCount ? `${activeScheduleCount} departures available` : 'Schedule availability pending'}
							</div>
							<Divider />
							<div className="tour-booking-stepper">
								{bookingSteps.map((step, index) => (
									<button
										type="button"
										key={step.key}
										className={`${index === currentStepIndex ? 'active' : ''} ${
											index < currentStepIndex ? 'complete' : ''
										}`}
										onClick={() => {
											if (index < currentStepIndex) setBookingStep(step.key);
										}}
										disabled={index > currentStepIndex}
									>
										<span>{index + 1}</span>
										<small>{step.label}</small>
									</button>
								))}
							</div>
							<AnimatePresence mode="wait">
								{bookingStep === 'schedule' && (
									<motion.div
										key="booking-schedule"
										className="tour-booking-panel"
										{...(reduceMotion ? {} : bookingPanelMotion)}
									>
										<Stack className="tour-schedule-list">
											<div className="booking-panel-head">
												<Typography className="booking-label">Choose departure</Typography>
												<Typography>Pick the date your guide should reserve.</Typography>
											</div>
											{schedulesLoading && !schedules.length && <div className="tour-detail-skeleton schedule" />}
											{schedulesError && !schedules.length ? (
												<div className="tour-booking-empty">
													<CalendarMonthRoundedIcon />
													<strong>Departure dates are unavailable</strong>
													<span>Try loading the operator schedule again.</span>
													<Button className="tour-secondary-button" onClick={() => refetchSchedules({ tourId })}>Try again</Button>
												</div>
											) : schedules.length ? (
												schedules.map((schedule) => {
													const seatsLeft = Math.max(schedule.availableSeats - schedule.reservedSeats, 0);
													const isSelected = selectedScheduleId === schedule._id;
													const isSoldOut = seatsLeft === 0;
													return (
														<motion.button
															type="button"
															className={`tour-schedule-option ${isSelected ? 'selected' : ''} ${
																isSoldOut ? 'sold-out' : ''
															}`}
															key={schedule._id}
															onClick={() => selectScheduleHandler(schedule._id)}
															disabled={isSoldOut}
															whileHover={reduceMotion || isSoldOut ? undefined : { y: -2 }}
															whileTap={isSoldOut ? undefined : tapPress}
														>
															<span className="schedule-date">
																<CalendarMonthRoundedIcon />
																{moment(schedule.startDate).format('MMM D')} -{' '}
																{moment(schedule.endDate).format('MMM D, YYYY')}
															</span>
															<span className="schedule-meta">
																<strong>${formatterStr(schedule.price)}</strong>
																<small>/ person</small>
																<em>{isSoldOut ? 'Sold out' : `${seatsLeft} seats left`}</em>
															</span>
														</motion.button>
													);
												})
											) : (
												<div className="tour-booking-empty">
													<CalendarMonthRoundedIcon />
													<strong>No departures published yet</strong>
													<span>Your guide has not opened scheduled dates for this experience.</span>
												</div>
											)}
											{bookingValidation.schedule && (
												<Typography className="booking-inline-error">{bookingValidation.schedule}</Typography>
											)}
											<motion.div whileTap={tapPress}>
												<Button
													className="gt-primary-button reserve"
													onClick={scheduleContinueHandler}
													disabled={!schedules.length}
												>
													Continue to traveler info
												</Button>
											</motion.div>
										</Stack>
									</motion.div>
								)}

								{bookingStep === 'traveler' && selectedSchedule && (
									<motion.div
										key="booking-traveler"
										className="tour-booking-panel"
										{...(reduceMotion ? {} : bookingPanelMotion)}
									>
										<Stack className="tour-booking-form">
											<div className="booking-panel-head">
												<Typography className="booking-label">Traveler information</Typography>
												<Typography>
													{moment(selectedSchedule.startDate).format('MMM D, YYYY')} departure · {selectedRemainingSeats}{' '}
													seats left
												</Typography>
											</div>
											<TextField
												size="small"
												type="number"
												label="Travelers"
												value={bookingDraft.peopleCount}
												error={!!bookingValidation.peopleCount}
												helperText={bookingValidation.peopleCount || `${selectedRemainingSeats} seats available`}
												inputProps={{ min: 1, max: selectedRemainingSeats }}
												onChange={(event) =>
													draftChangeHandler(
														'peopleCount',
														Math.min(Math.max(Number(event.target.value || 1), 1), selectedRemainingSeats || 1),
													)
												}
											/>
											<TextField
												size="small"
												label="Traveler name"
												value={bookingDraft.travelerName}
												error={!!bookingValidation.travelerName}
												helperText={bookingValidation.travelerName}
												onChange={(event) => draftChangeHandler('travelerName', event.target.value)}
											/>
											<TextField
												size="small"
												type="email"
												label="Traveler email"
												value={bookingDraft.travelerEmail}
												error={!!bookingValidation.travelerEmail}
												helperText={bookingValidation.travelerEmail || 'Used for booking updates from GoTrip.'}
												onChange={(event) => draftChangeHandler('travelerEmail', event.target.value)}
											/>
											<TextField
												size="small"
												label="Traveler phone"
												value={bookingDraft.travelerPhone}
												error={!!bookingValidation.travelerPhone}
												helperText={bookingValidation.travelerPhone}
												onChange={(event) => draftChangeHandler('travelerPhone', event.target.value)}
											/>
											<TextField
												size="small"
												label="Passport number"
												value={bookingDraft.passportNumber}
												helperText="Optional"
												onChange={(event) => draftChangeHandler('passportNumber', event.target.value)}
											/>
											<TextField
												size="small"
												multiline
												minRows={2}
												label="Special request"
												value={bookingDraft.specialRequest}
												helperText="Optional notes for your guide"
												onChange={(event) => draftChangeHandler('specialRequest', event.target.value)}
											/>
											<Stack className="tour-booking-total" direction="row">
												<span>Estimated total</span>
												<strong>${formatterStr(draftTotal)}</strong>
											</Stack>
											<Stack className="booking-action-row" direction="row">
												<Button className="tour-secondary-button" onClick={() => setBookingStep('schedule')}>
													Back
												</Button>
												<motion.div whileTap={tapPress}>
													<Button className="gt-primary-button reserve" onClick={reviewBookingHandler}>
														Review booking
													</Button>
												</motion.div>
											</Stack>
										</Stack>
									</motion.div>
								)}

								{bookingStep === 'review' && selectedSchedule && (
									<motion.div
										key="booking-review"
										className="tour-booking-panel"
										{...(reduceMotion ? {} : bookingPanelMotion)}
									>
										<Stack className="tour-booking-step review">
											<div className="booking-panel-head">
												<Typography className="booking-label">Review before booking</Typography>
												<Typography>Seats are reserved only after creating a pending booking.</Typography>
											</div>
											<div className="booking-review-summary">
												<div>
													<span>Departure</span>
													<strong>
														{moment(selectedSchedule.startDate).format('MMM D')} -{' '}
														{moment(selectedSchedule.endDate).format('MMM D, YYYY')}
													</strong>
												</div>
												<div>
													<span>Travelers</span>
													<strong>
														{bookingDraft.peopleCount} traveler{bookingDraft.peopleCount > 1 ? 's' : ''}
													</strong>
												</div>
												<div>
													<span>Contact</span>
													<strong>{bookingDraft.travelerName}</strong>
													<small>
														{bookingDraft.travelerEmail} · {bookingDraft.travelerPhone}
													</small>
												</div>
												{bookingDraft.specialRequest.trim() && (
													<div>
														<span>Guide note</span>
														<strong>{bookingDraft.specialRequest.trim()}</strong>
													</div>
												)}
											</div>
											<div className="booking-price-breakdown">
												<span>
													${formatterStr(selectedSchedule.price)} x {bookingDraft.peopleCount}
												</span>
												<strong>${formatterStr(draftTotal)}</strong>
											</div>
											<motion.div whileTap={tapPress}>
												<Button
													className="gt-primary-button reserve"
													onClick={createBookingHandler}
													disabled={creatingBooking}
												>
													{creatingBooking ? 'Creating booking...' : 'Create pending booking'}
												</Button>
											</motion.div>
											<Button className="tour-secondary-button" onClick={() => setBookingStep('traveler')}>
												Edit traveler info
											</Button>
										</Stack>
									</motion.div>
								)}

								{bookingStep === 'payment' && createdBooking && (
									<motion.div
										key="booking-payment"
										className="tour-booking-panel"
										{...(reduceMotion ? {} : bookingPanelMotion)}
									>
										<Stack className="tour-booking-step success">
											<div className="payment-pending-card">
												<CheckCircleRoundedIcon />
												<div>
													<span>Booking {createdBooking.bookingStatus}</span>
													<strong>{createdBooking.bookingNumber}</strong>
													<small>${formatterStr(createdBooking.totalPrice)} total</small>
												</div>
											</div>
											<div className="booking-panel-head">
												<Typography className="booking-label">Internal payment request</Typography>
												<Typography>
													Create a GoTrip payment request for internal/admin processing. No external checkout is
													opened in this demo flow.
												</Typography>
											</div>
											<TextField
												select
												size="small"
												label="Payment method"
												value={paymentMethod}
												onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
												disabled={paymentRequestCreated}
											>
												{Object.values(PaymentMethod).map((method) => (
													<MenuItem key={method} value={method}>
														{method}
													</MenuItem>
												))}
											</TextField>
											<motion.div whileTap={paymentRequestCreated ? undefined : tapPress}>
												<Button
													className="gt-primary-button reserve"
													onClick={createPaymentHandler}
													disabled={creatingPayment || paymentRequestCreated}
												>
													{paymentRequestCreated
														? 'Payment request pending'
														: creatingPayment
														? 'Creating payment request...'
														: 'Create payment request'}
												</Button>
											</motion.div>
											<AnimatePresence>
												{paymentRequestCreated && (
													<motion.div
														className="payment-status-reveal"
														initial={reduceMotion ? false : { opacity: 0, y: 12 }}
														animate={{ opacity: 1, y: 0 }}
														exit={{ opacity: 0, y: -8 }}
														transition={{ duration: 0.28, ease: easeOutExpo }}
													>
														<VerifiedRoundedIcon />
														<div>
															<strong>Payment request is pending</strong>
															<span>
																Your booking remains in the internal GoTrip payment lifecycle until it is reviewed.
															</span>
														</div>
													</motion.div>
												)}
											</AnimatePresence>
										</Stack>
									</motion.div>
								)}
							</AnimatePresence>
						</Stack>

						<Stack className="tour-concierge-card gt-card">
							<Typography className="sidebar-title">Your local concierge</Typography>
							<Stack direction="row" className="concierge-profile">
								<img
									src={guideImage}
									alt={guideName}
									onError={(event) => {
										if (event.currentTarget.src.includes('/img/profile/defaultUser.svg')) return;
										event.currentTarget.src = '/img/profile/defaultUser.svg';
									}}
								/>
								<div>
									<strong>{guideName}</strong>
									<span>{guide?.memberAddress || 'GoTrip local operator'}</span>
									{guide?.isVerifiedAgent && (
										<small>
											<VerifiedRoundedIcon />
											Certified guide
										</small>
									)}
								</div>
							</Stack>
							<Typography className="concierge-quote">
								{guide?.memberDesc ||
									'I will help you prepare the details, meeting point, and pace of this experience before departure.'}
							</Typography>
							<Stack className="concierge-stats" direction="row">
								<span>{guide?.memberTours ?? 0} tours</span>
								<span>Rank {guide?.memberRank ?? 'new'}</span>
							</Stack>
						</Stack>

						<div className="tour-location-card gt-card">
							<div className="tour-map-pattern">
								<div className="tour-map-pin">
									<LocationOnRoundedIcon />
								</div>
							</div>
							<div className="tour-location-label">
								<MapRoundedIcon />
								<span>{tour?.tourMeetingPoint || tour?.tourLocation || 'Meeting point after booking'}</span>
							</div>
						</div>
					</MotionStack>
				</div>

				<MotionBox className="tour-detail-cta" variants={revealVariants}>
					<Typography component="h2">Elevate your travel standard</Typography>
					<Typography>
						Save this experience, choose a departure, and let a GoTrip guide prepare the details before you arrive.
					</Typography>
						<Button className="gt-primary-button" onClick={saveHandler} startIcon={isSaved ? <BookmarkAddedRoundedIcon /> : <BookmarkAddOutlinedIcon />}>
							{isSaved ? 'Saved to wishlist' : 'Save this tour'}
					</Button>
				</MotionBox>
			</div>
		</MotionStack>
	);
};

export default withLayoutFull(TourDetailPage);
