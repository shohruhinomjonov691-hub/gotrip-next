import { gql } from '@apollo/client';

export const UPDATE_TOUR_BY_ADMIN = gql`
	mutation UpdateTourByAdmin($input: TourUpdate!) {
		updateTourByAdmin(input: $input) {
			_id
			tourStatus
			tourTitle
			tourPrice
			updatedAt
		}
	}
`;

export const REMOVE_TOUR_BY_ADMIN = gql`
	mutation RemoveTourByAdmin($tourId: String!) {
		removeTourByAdmin(tourId: $tourId) {
			_id
			tourStatus
			deletedAt
		}
	}
`;

export const REVIEW_AGENT_REQUEST_BY_ADMIN = gql`
	mutation ReviewAgentRequestByAdmin($input: AgentRequestReviewInput!) {
		reviewAgentRequestByAdmin(input: $input) {
			_id
			memberType
			agentRequestStatus
			agentRequestMessage
			isVerifiedAgent
			agentApprovedAt
			agentRejectedAt
		}
	}
`;

export const CREATE_DESTINATION_BY_ADMIN = gql`
	mutation CreateDestinationByAdmin($input: DestinationInput!) {
		createDestinationByAdmin(input: $input) {
			_id
			destinationStatus
			destinationTitle
		}
	}
`;

export const UPDATE_DESTINATION_BY_ADMIN = gql`
	mutation UpdateDestinationByAdmin($input: DestinationUpdate!) {
		updateDestinationByAdmin(input: $input) {
			_id
			destinationStatus
			destinationTitle
			updatedAt
		}
	}
`;

export const DELETE_DESTINATION_BY_ADMIN = gql`
	mutation DeleteDestinationByAdmin($destinationId: String!) {
		deleteDestinationByAdmin(destinationId: $destinationId) {
			_id
			destinationStatus
		}
	}
`;

export const CREATE_NOTICE_BY_ADMIN = gql`
	mutation CreateNoticeByAdmin($input: NoticeInput!) {
		createNoticeByAdmin(input: $input) {
			_id
			noticeCategory
			noticeStatus
			noticeTitle
		}
	}
`;

export const UPDATE_NOTICE_BY_ADMIN = gql`
	mutation UpdateNoticeByAdmin($input: NoticeUpdate!) {
		updateNoticeByAdmin(input: $input) {
			_id
			noticeCategory
			noticeStatus
			noticeTitle
			updatedAt
		}
	}
`;

export const DELETE_NOTICE_BY_ADMIN = gql`
	mutation DeleteNoticeByAdmin($noticeId: String!) {
		deleteNoticeByAdmin(noticeId: $noticeId) {
			_id
			noticeStatus
		}
	}
`;

export const UPDATE_BOOKING_BY_ADMIN = gql`
	mutation UpdateBookingByAdmin($input: BookingUpdate!) {
		updateBookingByAdmin(input: $input) {
			_id
			bookingStatus
			updatedAt
		}
	}
`;

export const CANCEL_BOOKING_BY_ADMIN = gql`
	mutation CancelBookingByAdmin($bookingId: String!, $cancelReason: String!) {
		cancelBookingByAdmin(bookingId: $bookingId, cancelReason: $cancelReason) {
			_id
			bookingStatus
			cancelReason
			cancelledAt
		}
	}
`;

export const MARK_PAYMENT_SUCCESS_BY_ADMIN = gql`
	mutation MarkPaymentSuccessByAdmin($paymentId: String!, $transactionId: String!) {
		markPaymentSuccessByAdmin(paymentId: $paymentId, transactionId: $transactionId) {
			_id
			paymentStatus
			transactionId
			paidAt
		}
	}
`;

export const MARK_PAYMENT_FAILED_BY_ADMIN = gql`
	mutation MarkPaymentFailedByAdmin($paymentId: String!) {
		markPaymentFailedByAdmin(paymentId: $paymentId) {
			_id
			paymentStatus
		}
	}
`;

export const REFUND_PAYMENT_BY_ADMIN = gql`
	mutation RefundPaymentByAdmin($paymentId: String!) {
		refundPaymentByAdmin(paymentId: $paymentId) {
			_id
			paymentStatus
			refundedAt
		}
	}
`;

export const CANCEL_PAYMENT_BY_ADMIN = gql`
	mutation CancelPaymentByAdmin($paymentId: String!) {
		cancelPaymentByAdmin(paymentId: $paymentId) {
			_id
			paymentStatus
		}
	}
`;

/**************************
 *         MEMBER         *
 *************************/

export const UPDATE_MEMBER_BY_ADMIN = gql`
	mutation UpdateMemberByAdmin($input: MemberUpdate!) {
		updateMemberByAdmin(input: $input) {
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

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const UPDATE_BOARD_ARTICLE_BY_ADMIN = gql`
	mutation UpdateBoardArticleByAdmin($input: BoardArticleUpdate!) {
		updateBoardArticleByAdmin(input: $input) {
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

export const REMOVE_BOARD_ARTICLE_BY_ADMIN = gql`
	mutation RemoveBoardArticleByAdmin($input: String!) {
		removeBoardArticleByAdmin(articleId: $input) {
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

export const REMOVE_COMMENT_BY_ADMIN = gql`
	mutation RemoveCommentByAdmin($input: String!) {
		removeCommentByAdmin(commentId: $input) {
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
