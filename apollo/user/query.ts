import { gql } from '@apollo/client';

export const TOUR_FIELDS = gql`
	fragment TourFields on Tour {
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
		tourViews
		tourLikes
		tourComments
		tourRank
		tourRating
		tourImages
		tourDesc
		tourItinerary
		tourIncluded
		tourExcluded
		tourMeetingPoint
		tourLanguage
		tourDifficulty
		memberId
		translations {
			locale
			tourTitle
			tourDesc
			tourMeetingPoint
			tourItinerary
			tourIncluded
			tourExcluded
		}
		deletedAt
		createdAt
		updatedAt
		meLiked {
			memberId
			likeRefId
			myFavorite
		}
		memberData {
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
			translations {
				locale
				memberDesc
			}
			memberTours
			memberRank
			memberPoints
			memberLikes
			memberViews
		}
	}
`;

export const GET_TOUR = gql`
	${TOUR_FIELDS}
	query GetTour($tourId: String!) {
		getTour(tourId: $tourId) {
			...TourFields
		}
	}
`;

export const GET_TOURS = gql`
	${TOUR_FIELDS}
	query GetTours($input: ToursInquiry!) {
		getTours(input: $input) {
			list {
				...TourFields
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_AGENT_TOURS = gql`
	${TOUR_FIELDS}
	query GetAgentTours($input: AgentToursInquiry!) {
		getAgentTours(input: $input) {
			list {
				...TourFields
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_VISITED_TOURS = gql`
	${TOUR_FIELDS}
	query GetVisitedTours($input: OrdinaryInquiry!) {
		getVisited(input: $input) {
			list {
				...TourFields
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_FAVORITE_TOURS = gql`
	${TOUR_FIELDS}
	query GetFavoriteTours($input: OrdinaryInquiry!) {
		getFavorites(input: $input) {
			list {
				...TourFields
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_NOTICES = gql`
	query GetNotices($input: NoticesInquiry!) {
		getNotices(input: $input) {
			list {
				_id
				noticeCategory
				noticeStatus
				noticeTitle
				noticeContent
				memberId
				translations {
					locale
					noticeTitle
					noticeContent
				}
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_NOTICE = gql`
	query GetNotice($noticeId: String!) {
		getNotice(noticeId: $noticeId) {
			_id
			noticeCategory
			noticeStatus
			noticeTitle
			noticeContent
			memberId
			translations {
				locale
				noticeTitle
				noticeContent
			}
			createdAt
			updatedAt
		}
	}
`;

export const GET_MY_NOTIFICATIONS = gql`
	query GetMyNotifications($input: NotificationsInquiry!) {
		getMyNotifications(input: $input) {
			list {
				_id
				notificationType
				notificationStatus
				notificationGroup
				notificationTitle
				notificationDesc
				notificationLink
				authorId
				receiverId
				tourId
				articleId
				commentId
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *        CATEGORY        *
 *************************/

export const GET_CATEGORIES = gql`
	query GetCategories($input: CategoriesInquiry!) {
		getCategories(input: $input) {
			list {
				_id
				categoryType
				categoryKey
				categoryStatus
				categoryName
				categoryDesc
				categoryImage
				categoryIcon
				categoryOrder
				translations {
					locale
					categoryName
					categoryDesc
				}
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *       DESTINATION      *
 *************************/

export const GET_DESTINATIONS = gql`
	query GetDestinations($input: DestinationsInquiry!) {
		getDestinations(input: $input) {
			list {
				_id
				destinationStatus
				memberId
				destinationTitle
				destinationDesc
				destinationThumbnail
				destinationGallery
				destinationHighlights
				destinationSeason
				destinationCountry
				destinationCity
				locationKey
				translations {
					locale
					destinationTitle
					destinationDesc
					destinationHighlights
					destinationSeason
				}
				destinationViews
				destinationLikes
				destinationRank
				tourCount
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *       TESTIMONIAL      *
 *************************/

export const GET_TESTIMONIALS = gql`
	query GetTestimonials($input: TestimonialsInquiry!) {
		getTestimonials(input: $input) {
			list {
				_id
				testimonialStatus
				testimonialContent
				testimonialRating
				authorName
				authorRole
				authorImage
				memberId
				tourId
				testimonialOrder
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         MEMBER         *
 *************************/

export const GET_AGENTS = gql`
	query GetAgents($input: AgentsInquiry!) {
		getAgents(input: $input) {
			list {
				_id
				memberType
				memberStatus
				memberAuthType
				memberPhone
				memberNick
				memberFullName
				memberImage
				memberCoverImage
				memberAddress
				memberDesc
				translations {
					locale
					memberDesc
				}
				agentExperience
				memberLanguages
				memberSpecialties
				memberSocial {
					facebook
					twitter
					linkedin
					youtube
					instagram
				}
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
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MEMBER = gql(`
  query GetMember($input: String!) {
    getMember(memberId: $input) {
        _id
        memberType
        memberStatus
        memberAuthType
        memberPhone
        memberNick
        memberFullName
        memberImage
        memberCoverImage
        memberAddress
        memberDesc
        translations {
          locale
          memberDesc
        }
        agentExperience
        memberLanguages
        memberSpecialties
        memberSocial {
          facebook
          twitter
          linkedin
          youtube
          instagram
        }
        memberTours
        memberArticles
        memberPoints
        memberLikes
        memberViews
        memberFollowings
				memberFollowers
        memberRank
        memberWarnings
        memberBlocks
        deletedAt
        createdAt
        updatedAt
        accessToken
        meFollowed {
					followingId
					followerId
					myFollowing
				}
    }
  }
`);

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const GET_BOARD_ARTICLE = gql`
	query GetBoardArticle($input: String!) {
		getBoardArticle(articleId: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleImages
			translations {
				locale
				articleTitle
				articleContent
			}
			articleViews
			articleLikes
			articleComments
			memberId
			createdAt
			updatedAt
			memberData {
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
				translations {
					locale
					memberDesc
				}
				memberWarnings
				memberBlocks
				memberTours
				memberArticles
				memberFollowers
				memberFollowings
				memberRank
				memberPoints
				memberLikes
				memberViews
				deletedAt
				createdAt
				updatedAt
			}
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

export const GET_BOARD_ARTICLES = gql`
	query GetBoardArticles($input: BoardArticlesInquiry!) {
		getBoardArticles(input: $input) {
			list {
				_id
				articleCategory
				articleStatus
				articleTitle
				articleContent
				articleImage
				articleImages
				translations {
					locale
					articleTitle
					articleContent
				}
				articleViews
				articleLikes
				articleComments
				memberId
				createdAt
				updatedAt
				readersCount
				readers {
					_id
					memberFullName
					memberNick
					memberImage
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				memberData {
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
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const GET_COMMENTS = gql`
	query GetComments($input: CommentsInquiry!) {
		getComments(input: $input) {
			list {
				_id
				commentStatus
				commentGroup
			commentContent
			commentRefId
			memberId
				createdAt
				updatedAt
				memberData {
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
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         FOLLOW        *
 *************************/
export const GET_MEMBER_FOLLOWERS = gql`
	query GetMemberFollowers($input: FollowInquiry!) {
		getMemberFollowers(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
				followerData {
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
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					memberWarnings
					memberBlocks
					deletedAt
					createdAt
					updatedAt
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MEMBER_FOLLOWINGS = gql`
	query GetMemberFollowings($input: FollowInquiry!) {
		getMemberFollowings(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				updatedAt
				followingData {
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
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					memberWarnings
					memberBlocks
					deletedAt
					createdAt
					updatedAt
					accessToken
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *        MESSAGING       *
 *************************/

export const GET_MY_CONVERSATIONS = gql`
	query GetMyConversations($input: ConversationsInquiry!) {
		getMyConversations(input: $input) {
			list {
				_id
				lastMessageText
				lastMessageAt
				lastMessageSenderId
				lastActivityAt
				unreadCount
				partner {
					_id
					memberNick
					memberImage
					memberType
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MESSAGES = gql`
	query GetMessages($input: MessagesInquiry!) {
		getMessages(input: $input) {
			list {
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
				senderData {
					_id
					memberNick
					memberImage
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_UNREAD_MESSAGE_COUNT = gql`
	query GetUnreadMessageCount {
		getUnreadMessageCount
	}
`;

export const SEARCH_MEMBERS = gql`
	query SearchMembers($input: MemberSearchInquiry!) {
		searchMembers(input: $input) {
			list {
				_id
				memberNick
				memberImage
				memberType
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *        GOTRIP AI       *
 *************************/

export const GET_GOTRIP_AI_CONVERSATIONS = gql`
	query GetGoTripAIConversations($input: AIConversationsInquiry!) {
		getGoTripAIConversations(input: $input) {
			list {
				_id
				title
				locale
				status
				lastMessageAt
				messageCount
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_GOTRIP_AI_CONVERSATION = gql`
	query GetGoTripAIConversation($conversationId: String!) {
		getGoTripAIConversation(conversationId: $conversationId) {
			_id
			title
			locale
			status
			lastMessageAt
			messageCount
			createdAt
			updatedAt
		}
	}
`;

export const GET_GOTRIP_AI_MESSAGES = gql`
	query GetGoTripAIMessages($input: AIMessagesInquiry!) {
		getGoTripAIMessages(input: $input) {
			list {
				_id
				conversationId
				role
				content
				status
				createdAt
			}
			metaCounter {
				total
			}
		}
	}
`;
