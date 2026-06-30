import { gql } from '@apollo/client';

export const CREATE_TOUR = gql`
	mutation CreateTour($input: TourInput!) {
		createTour(input: $input) {
			_id
			tourCategory
			tourStatus
			tourLocation
			tourTitle
			tourPrice
			tourDuration
			tourMaxPeople
			tourMinPeople
			tourAvailableSeats
			tourImages
			tourDesc
			tourItinerary
			tourIncluded
			tourExcluded
			tourMeetingPoint
			tourLanguage
			tourDifficulty
			memberId
			destinationId
			createdAt
			updatedAt
		}
	}
`;

export const UPDATE_TOUR = gql`
	mutation UpdateTour($input: TourUpdate!) {
		updateTour(input: $input) {
			_id
			tourCategory
			tourStatus
			tourLocation
			tourTitle
			tourPrice
			tourDuration
			tourMaxPeople
			tourMinPeople
			tourAvailableSeats
			tourImages
			tourDesc
			tourItinerary
			tourIncluded
			tourExcluded
			tourMeetingPoint
			tourLanguage
			tourDifficulty
			memberId
			destinationId
			createdAt
			updatedAt
		}
	}
`;

export const LIKE_TARGET_TOUR = gql`
	mutation LikeTargetTour($tourId: String!) {
		likeTargetTour(tourId: $tourId) {
			_id
			tourLikes
		}
	}
`;

export const TOGGLE_WISHLIST = gql`
	mutation ToggleWishlist($input: WishlistInput!) {
		toggleWishlist(input: $input) {
			_id
			wishlistGroup
			wishlistRefId
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const LIKE_TARGET_DESTINATION = gql`
	mutation LikeTargetDestination($destinationId: String!) {
		likeTargetDestination(destinationId: $destinationId) {
			_id
			destinationLikes
		}
	}
`;

export const CREATE_TOUR_SCHEDULE = gql`
	mutation CreateTourSchedule($input: TourScheduleInput!) {
		createTourSchedule(input: $input) {
			_id
			scheduleStatus
			tourId
			startDate
			endDate
			availableSeats
			reservedSeats
			price
			createdAt
			updatedAt
		}
	}
`;

export const UPDATE_TOUR_SCHEDULE = gql`
	mutation UpdateTourSchedule($input: TourScheduleUpdate!) {
		updateTourSchedule(input: $input) {
			_id
			scheduleStatus
			tourId
			startDate
			endDate
			availableSeats
			reservedSeats
			price
			createdAt
			updatedAt
		}
	}
`;

export const DELETE_TOUR_SCHEDULE = gql`
	mutation DeleteTourSchedule($scheduleId: String!) {
		deleteTourSchedule(scheduleId: $scheduleId) {
			_id
			scheduleStatus
		}
	}
`;

export const CREATE_BOOKING = gql`
	mutation CreateBooking($input: BookingInput!) {
		createBooking(input: $input) {
			_id
			bookingStatus
			bookingNumber
			tourId
			scheduleId
			peopleCount
			totalPrice
		}
	}
`;

export const CANCEL_BOOKING = gql`
	mutation CancelBooking($bookingId: String!, $cancelReason: String!) {
		cancelBooking(bookingId: $bookingId, cancelReason: $cancelReason) {
			_id
			bookingStatus
			cancelReason
			cancelledAt
		}
	}
`;

export const UPDATE_AGENT_BOOKING_STATUS = gql`
	mutation UpdateAgentBookingStatus($bookingId: String!, $bookingStatus: BookingStatus!) {
		updateAgentBookingStatus(bookingId: $bookingId, bookingStatus: $bookingStatus) {
			_id
			bookingStatus
			cancelReason
			cancelledAt
			updatedAt
		}
	}
`;

export const CREATE_PAYMENT = gql`
	mutation CreatePayment($input: PaymentInput!) {
		createPayment(input: $input) {
			_id
			paymentStatus
			paymentMethod
			paymentAmount
			bookingId
			tourId
		}
	}
`;

export const MARK_NOTIFICATION_READ = gql`
	mutation MarkNotificationRead($notificationId: String!) {
		markNotificationRead(notificationId: $notificationId) {
			_id
			notificationStatus
		}
	}
`;

export const MARK_ALL_NOTIFICATIONS_READ = gql`
	mutation MarkAllNotificationsRead {
		markAllNotificationsRead
	}
`;

export const DELETE_NOTIFICATION = gql`
	mutation DeleteNotification($notificationId: String!) {
		deleteNotification(notificationId: $notificationId) {
			_id
			notificationStatus
		}
	}
`;

/**************************
 *         MEMBER         *
 *************************/

export const SIGN_UP = gql`
	mutation Signup($input: MemberInput!) {
		signup(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberWarnings
			memberBlocks
			memberTours
			memberRank
			memberArticles
			memberPoints
			memberLikes
			memberViews
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

export const LOGIN = gql`
	mutation Login($input: LoginInput!) {
		login(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberWarnings
			memberBlocks
			memberTours
			memberRank
			memberPoints
			memberLikes
			memberViews
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

export const UPDATE_MEMBER = gql`
	mutation UpdateMember($input: MemberUpdate!) {
		updateMember(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberTours
			memberRank
			memberArticles
			memberPoints
			memberLikes
			memberViews
			memberWarnings
			memberBlocks
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

export const LIKE_TARGET_MEMBER = gql`
	mutation LikeTargetMember($input: String!) {
		likeTargetMember(memberId: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberWarnings
			memberBlocks
			memberTours
			memberRank
			memberPoints
			memberLikes
			memberViews
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const CREATE_BOARD_ARTICLE = gql`
	mutation CreateBoardArticle($input: BoardArticleInput!) {
		createBoardArticle(input: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const UPDATE_BOARD_ARTICLE = gql`
	mutation UpdateBoardArticle($input: BoardArticleUpdate!) {
		updateBoardArticle(input: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const LIKE_TARGET_BOARD_ARTICLE = gql`
	mutation LikeTargetBoardArticle($input: String!) {
		likeTargetBoardArticle(articleId: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			memberId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const CREATE_COMMENT = gql`
	mutation CreateComment($input: CommentInput!) {
		createComment(input: $input) {
			_id
			commentStatus
			commentGroup
			commentContent
			commentRefId
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const UPDATE_COMMENT = gql`
	mutation UpdateComment($input: CommentUpdate!) {
		updateComment(input: $input) {
			_id
			commentStatus
			commentGroup
			commentContent
			commentRefId
			memberId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *         FOLLOW        *
 *************************/

export const SUBSCRIBE = gql`
	mutation Subscribe($input: String!) {
		subscribe(input: $input) {
			_id
			followingId
			followerId
			createdAt
			updatedAt
		}
	}
`;

export const UNSUBSCRIBE = gql`
	mutation Unsubscribe($input: String!) {
		unsubscribe(input: $input) {
			_id
			followingId
			followerId
			createdAt
			updatedAt
		}
	}
`;
