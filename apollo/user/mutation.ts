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

export const CONTACT_AGENT = gql`
	mutation ContactAgent($input: ContactAgentInput!) {
		contactAgent(input: $input) {
			_id
			notificationType
			notificationStatus
			notificationGroup
			notificationTitle
			notificationDesc
			tourId
			createdAt
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

/**************************
 *       TESTIMONIAL      *
 *************************/

/**
 * Self-service submission. The server derives authorName/authorImage from the
 * logged-in member and starts the record as PENDING for admin approval, so the
 * client only sends the content, an optional rating and an optional tour link.
 */
export const CREATE_TESTIMONIAL = gql`
	mutation CreateTestimonial($input: TestimonialInput!) {
		createTestimonial(input: $input) {
			_id
			testimonialStatus
			testimonialContent
			testimonialRating
			authorName
			createdAt
		}
	}
`;

/**************************
 *    AGENT (GUIDE) REQUEST
 *************************/

/**
 * Self-service guide application. USER only (@Roles(MemberType.USER) server-side).
 * AgentRequestInput accepts exactly these two optional fields — no others exist.
 */
export const REQUEST_AGENT_ROLE = gql`
	mutation RequestAgentRole($input: AgentRequestInput!) {
		requestAgentRole(input: $input) {
			_id
			memberType
			agentRequestStatus
			agentRequestMessage
			agentExperience
			updatedAt
		}
	}
`;

/**************************
 *        MESSAGING       *
 *************************/

export const SEND_MESSAGE = gql`
	mutation SendMessage($input: MessageInput!) {
		sendMessage(input: $input) {
			_id
			conversationId
			senderId
			receiverId
			messageText
			messageImages
			messageFiles {
				url
				fileName
				fileSize
				mimeType
			}
			messageStatus
			readAt
			createdAt
		}
	}
`;

export const START_CONVERSATION = gql`
	mutation StartConversation($partnerId: String!) {
		startConversation(partnerId: $partnerId) {
			_id
			lastActivityAt
		}
	}
`;

export const MARK_CONVERSATION_READ = gql`
	mutation MarkConversationRead($conversationId: String!) {
		markConversationRead(conversationId: $conversationId)
	}
`;

/**************************
 *        GOTRIP AI       *
 *************************/

const GOTRIP_AI_MESSAGE_FIELDS = `
	_id
	conversationId
	memberId
	role
	content
	status
	createdAt
`;

export const SEND_GOTRIP_AI_MESSAGE = gql`
	mutation SendGoTripAIMessage($input: SendMessageInput!) {
		sendGoTripAIMessage(input: $input) {
			${GOTRIP_AI_MESSAGE_FIELDS}
		}
	}
`;

/** Login-free, stateless GoTrip AI turn: nothing is persisted server-side, so the
 *  client replays its own recent turns as `history` (USER/ASSISTANT only). */
export const SEND_GOTRIP_AI_GUEST_MESSAGE = gql`
	mutation SendGoTripAIGuestMessage($input: SendGuestMessageInput!) {
		sendGoTripAIGuestMessage(input: $input) {
			role
			content
			status
		}
	}
`;

/** Persists + returns the final assistant message, same as SEND_GOTRIP_AI_MESSAGE — the
 *  incremental text is delivered separately over the shared messaging WebSocket
 *  (see libs/messagingSocket.ts) as 'gotripAiStream' frames while this is in flight. */
export const STREAM_GOTRIP_AI_MESSAGE = gql`
	mutation StreamGoTripAIMessage($input: SendMessageInput!) {
		streamGoTripAIMessage(input: $input) {
			${GOTRIP_AI_MESSAGE_FIELDS}
		}
	}
`;

export const UPDATE_GOTRIP_AI_CONVERSATION = gql`
	mutation UpdateGoTripAIConversation($input: ConversationUpdate!) {
		updateGoTripAIConversation(input: $input) {
			_id
			title
			status
			updatedAt
		}
	}
`;

export const DELETE_GOTRIP_AI_CONVERSATION = gql`
	mutation DeleteGoTripAIConversation($conversationId: String!) {
		deleteGoTripAIConversation(conversationId: $conversationId) {
			_id
			status
		}
	}
`;
