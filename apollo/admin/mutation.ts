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

/**************************
 *         MEMBER         *
 *************************/

/**
 * The server argument is `MemberAdminUpdate`, not `MemberUpdate` — the two were
 * split so a member's self-service update can no longer carry memberType /
 * memberStatus. Declaring the variable as `MemberUpdate!` made this operation
 * fail GraphQL *validation* (a variable type that is not usable as the argument
 * type), so it was rejected before ever reaching the resolver and every role and
 * status change from the admin UI failed. The resolver itself was always
 * correct — verified directly against the API with an inline argument.
 *
 * NOTE: comments must stay outside the gql`` literal. GraphQL has no /* *\/
 * comment syntax (it uses #), so putting this inside the template threw a parse
 * error at module load and rendered a blank admin page.
 */
export const UPDATE_MEMBER_BY_ADMIN = gql`
	mutation UpdateMemberByAdmin($input: MemberAdminUpdate!) {
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

/**************************
 *    AGENT (GUIDE) REQUEST
 *************************/

/** Approving flips memberType to AGENT (existing server-side business rule). */
export const APPROVE_AGENT_REQUEST_BY_ADMIN = gql`
	mutation ApproveAgentRequestByAdmin($memberId: String!) {
		approveAgentRequestByAdmin(memberId: $memberId) {
			_id
			memberType
			agentRequestStatus
		}
	}
`;

export const REJECT_AGENT_REQUEST_BY_ADMIN = gql`
	mutation RejectAgentRequestByAdmin($memberId: String!) {
		rejectAgentRequestByAdmin(memberId: $memberId) {
			_id
			memberType
			agentRequestStatus
		}
	}
`;

/**************************
 *  CATALOGUE MODERATION
 *************************/

export const APPROVE_TESTIMONIAL_BY_ADMIN = gql`
	mutation ApproveTestimonialByAdmin($testimonialId: String!) {
		approveTestimonialByAdmin(testimonialId: $testimonialId) {
			_id
			testimonialStatus
		}
	}
`;

export const REJECT_TESTIMONIAL_BY_ADMIN = gql`
	mutation RejectTestimonialByAdmin($testimonialId: String!) {
		rejectTestimonialByAdmin(testimonialId: $testimonialId) {
			_id
			testimonialStatus
		}
	}
`;

export const DELETE_TESTIMONIAL_BY_ADMIN = gql`
	mutation DeleteTestimonialByAdmin($testimonialId: String!) {
		deleteTestimonialByAdmin(testimonialId: $testimonialId) {
			_id
		}
	}
`;

export const UPDATE_CATEGORY_BY_ADMIN = gql`
	mutation UpdateCategoryByAdmin($input: CategoryUpdate!) {
		updateCategoryByAdmin(input: $input) {
			_id
			categoryStatus
			categoryName
			categoryOrder
		}
	}
`;

export const DELETE_CATEGORY_BY_ADMIN = gql`
	mutation DeleteCategoryByAdmin($categoryId: String!) {
		deleteCategoryByAdmin(categoryId: $categoryId) {
			_id
		}
	}
`;

export const UPDATE_DESTINATION_BY_ADMIN = gql`
	mutation UpdateDestinationByAdmin($input: DestinationUpdate!) {
		updateDestinationByAdmin(input: $input) {
			_id
			destinationStatus
			destinationTitle
		}
	}
`;

export const REMOVE_DESTINATION_BY_ADMIN = gql`
	mutation RemoveDestinationByAdmin($destinationId: String!) {
		removeDestinationByAdmin(destinationId: $destinationId) {
			_id
		}
	}
`;

/** categoryKey must match a TourCategory / BoardArticleCategory enum value —
 *  the server enforces that, so the UI offers those keys as a dropdown. */
export const CREATE_CATEGORY_BY_ADMIN = gql`
	mutation CreateCategoryByAdmin($input: CategoryInput!) {
		createCategoryByAdmin(input: $input) {
			_id
			categoryType
			categoryKey
			categoryName
			categoryStatus
			categoryOrder
		}
	}
`;
