import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import {
	Box,
	Button,
	Chip,
	Divider,
	IconButton,
	Pagination,
	Rating,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import moment from 'moment';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { GET_COMMENTS, GET_TOUR, GET_TOUR_SCHEDULES } from '../../apollo/user/query';
import { CREATE_COMMENT, LIKE_TARGET_TOUR, TOGGLE_WISHLIST } from '../../apollo/user/mutation';
import { Tour } from '../../libs/types/tour/tour';
import { TourSchedule } from '../../libs/types/tour/tour-schedule';
import { Comment } from '../../libs/types/comment/comment';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { WishlistGroup } from '../../libs/enums/tour.enum';
import { REACT_APP_API_URL } from '../../libs/config';
import { formatterStr } from '../../libs/utils';
import { T } from '../../libs/types/common';
import { userVar } from '../../apollo/store';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const TourDetailPage: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const tourId = router.query.id as string | undefined;
	const [tour, setTour] = useState<Tour | null>(null);
	const [schedules, setSchedules] = useState<TourSchedule[]>([]);
	const [comments, setComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState<number>(0);
	const [review, setReview] = useState<string>('');
	const [rating, setRating] = useState<number | null>(5);
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

	const { refetch: refetchTour } = useQuery(GET_TOUR, {
		fetchPolicy: 'network-only',
		variables: { tourId },
		skip: !tourId,
		onCompleted: (data: T) => setTour(data?.getTour ?? null),
	});

	useQuery(GET_TOUR_SCHEDULES, {
		fetchPolicy: 'cache-and-network',
		variables: { tourId },
		skip: !tourId,
		onCompleted: (data: T) => setSchedules(data?.getTourSchedules?.list ?? []),
	});

	const { refetch: refetchComments } = useQuery(GET_COMMENTS, {
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
		if (tourId) setCommentInput((prev) => ({ ...prev, search: { commentGroup: CommentGroup.TOUR, commentRefId: tourId } }));
	}, [tourId]);

	const image = tour?.tourImages?.[0] ? `${REACT_APP_API_URL}/${tour.tourImages[0]}` : '/img/banner/header1.svg';
	const isLiked = !!tour?.meLiked?.[0]?.myFavorite;

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

	const paginationHandler = (_: ChangeEvent<unknown>, value: number) => setCommentInput({ ...commentInput, page: value });

	return (
		<Stack sx={{ width: '100%', bgcolor: '#fff', minHeight: '100vh' }}>
			<Box sx={{ height: { xs: 340, md: 460 }, bgcolor: '#eee' }}>
				<img src={image} alt={tour?.tourTitle ?? 'Tour'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
			</Box>
			<Stack sx={{ width: '100%', maxWidth: 1180, mx: 'auto', px: 2, py: 4 }} spacing={3}>
				<Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
					<Stack spacing={1}>
						<Stack direction="row" spacing={1} flexWrap="wrap">
							{tour?.tourCategory && <Chip label={tour.tourCategory} />}
							{tour?.tourDifficulty && <Chip label={tour.tourDifficulty} variant="outlined" />}
							{tour?.tourLanguage && <Chip label={tour.tourLanguage} variant="outlined" />}
						</Stack>
						<Typography fontSize={36} fontWeight={800} lineHeight={1.15}>
							{tour?.tourTitle ?? 'Tour'}
						</Typography>
						<Typography color="text.secondary">
							{tour?.tourLocation} · {tour?.tourDuration} days · {tour?.tourMinPeople}-{tour?.tourMaxPeople} travelers
						</Typography>
					</Stack>
					<Stack spacing={1} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
						<Typography fontSize={28} fontWeight={800}>
							${formatterStr(tour?.tourPrice)}
						</Typography>
						<Stack direction="row" spacing={1}>
							<IconButton aria-label="Like tour" onClick={likeHandler}>
								{isLiked ? <FavoriteIcon color="primary" /> : <FavoriteBorderIcon />}
							</IconButton>
							<IconButton aria-label="Save tour" onClick={saveHandler}>
								<BookmarkAddOutlinedIcon />
							</IconButton>
						</Stack>
					</Stack>
				</Stack>
				<Divider />
				<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
					<Stack spacing={3}>
						<Stack spacing={1}>
							<Typography fontSize={22} fontWeight={700}>
								Overview
							</Typography>
							<Typography color="text.secondary">{tour?.tourDesc ?? 'No tour description has been added yet.'}</Typography>
						</Stack>
						<Stack spacing={1}>
							<Typography fontSize={22} fontWeight={700}>
								Itinerary
							</Typography>
							{tour?.tourItinerary?.length ? (
								tour.tourItinerary.map((item, index) => (
									<Typography key={`${item}-${index}`} color="text.secondary">
										{index + 1}. {item}
									</Typography>
								))
							) : (
								<Typography color="text.secondary">Itinerary will be confirmed by the operator.</Typography>
							)}
						</Stack>
						<Stack spacing={1}>
							<Typography fontSize={22} fontWeight={700}>
								Reviews
							</Typography>
							<Stack spacing={1.5}>
								<Rating value={rating} onChange={(_, value) => setRating(value)} />
								<TextField
									multiline
									minRows={3}
									fullWidth
									placeholder="Share your tour experience"
									value={review}
									onChange={(event) => setReview(event.target.value)}
								/>
								<Button variant="contained" onClick={submitReviewHandler} disabled={!review.trim()}>
									Post review
								</Button>
							</Stack>
							{comments.map((comment) => (
								<Stack key={comment._id} sx={{ borderBottom: '1px solid #eee', py: 1.5 }}>
									<Stack direction="row" justifyContent="space-between">
										<Typography fontWeight={700}>{comment.memberData?.memberNick ?? 'Traveler'}</Typography>
										<Typography color="text.secondary" fontSize={13}>
											{moment(comment.createdAt).fromNow()}
										</Typography>
									</Stack>
									{!!comment.rating && <Rating value={comment.rating} readOnly size="small" />}
									<Typography color="text.secondary">{comment.commentContent}</Typography>
								</Stack>
							))}
							{commentTotal > commentInput.limit && (
								<Pagination
									count={Math.ceil(commentTotal / commentInput.limit)}
									page={commentInput.page}
									onChange={paginationHandler}
								/>
							)}
						</Stack>
					</Stack>
					<Stack spacing={2} sx={{ border: '1px solid #e7e7e7', borderRadius: '8px', p: 2, height: 'fit-content' }}>
						<Typography fontSize={20} fontWeight={700}>
							Availability
						</Typography>
						<Typography color="text.secondary">{tour?.tourAvailableSeats ?? 0} seats currently available</Typography>
						<Typography color="text.secondary">Meeting point: {tour?.tourMeetingPoint ?? 'Shared after booking'}</Typography>
						<Divider />
						{schedules.length ? (
							schedules.map((schedule) => (
								<Stack key={schedule._id} spacing={0.5}>
									<Typography fontWeight={700}>
										{moment(schedule.startDate).format('MMM D')} - {moment(schedule.endDate).format('MMM D, YYYY')}
									</Typography>
									<Typography color="text.secondary">
										{schedule.availableSeats - schedule.reservedSeats} seats · ${formatterStr(schedule.price)}
									</Typography>
								</Stack>
							))
						) : (
							<Typography color="text.secondary">No scheduled dates are published yet.</Typography>
						)}
					</Stack>
				</Box>
			</Stack>
		</Stack>
	);
};

export default withLayoutFull(TourDetailPage);
