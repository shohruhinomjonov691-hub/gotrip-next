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
			memberTours
			memberRank
			memberPoints
			memberLikes
			memberViews
			isVerifiedAgent
		}
		schedules {
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

export const DESTINATION_FIELDS = gql`
	fragment DestinationFields on Destination {
		_id
		destinationStatus
		destinationCountry
		destinationCity
		destinationAddress
		destinationTitle
		destinationDesc
		destinationImages
		destinationViews
		destinationLikes
		destinationComments
		destinationRating
		destinationTours
		destinationRank
		createdAt
		updatedAt
		meLiked {
			memberId
			likeRefId
			myFavorite
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

export const GET_TOUR_SCHEDULES = gql`
	query GetTourSchedules($tourId: String!) {
		getTourSchedules(tourId: $tourId) {
			list {
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
			metaCounter {
				total
			}
		}
	}
`;

export const GET_DESTINATIONS = gql`
	${DESTINATION_FIELDS}
	query GetDestinations($input: DestinationsInquiry!) {
		getDestinations(input: $input) {
			list {
				...DestinationFields
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_DESTINATION = gql`
	${DESTINATION_FIELDS}
	query GetDestination($destinationId: String!) {
		getDestination(destinationId: $destinationId) {
			...DestinationFields
		}
	}
`;

export const GET_MY_WISHLIST = gql`
	${TOUR_FIELDS}
	${DESTINATION_FIELDS}
	query GetMyWishlist($input: WishlistsInquiry!) {
		getMyWishlist(input: $input) {
			list {
				_id
				wishlistGroup
				wishlistRefId
				memberId
				createdAt
				updatedAt
				tourData {
					...TourFields
				}
				destinationData {
					...DestinationFields
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const CHECK_WISHLIST = gql`
	query CheckWishlist($input: WishlistInput!) {
		checkWishlist(input: $input)
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
			createdAt
			updatedAt
		}
	}
`;

export const GET_MY_BOOKINGS = gql`
	query GetMyBookings($input: BookingsInquiry!) {
		getMyBookings(input: $input) {
			list {
				_id
				bookingStatus
				bookingNumber
				tourId
				memberId
				agentId
				scheduleId
				peopleCount
				totalPrice
				bookingDate
				travelerName
				travelerEmail
				travelerPhone
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_AGENT_BOOKINGS = gql`
	query GetAgentBookings($input: BookingsInquiry!) {
		getAgentBookings(input: $input) {
			list {
				_id
				bookingStatus
				bookingNumber
				tourId
				memberId
				agentId
				scheduleId
				peopleCount
				totalPrice
				bookingDate
				travelerName
				travelerEmail
				travelerPhone
				cancelReason
				cancelledAt
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_AGENT_BOOKING = gql`
	query GetAgentBooking($bookingId: String!) {
		getAgentBooking(bookingId: $bookingId) {
			_id
			bookingStatus
			bookingNumber
			tourId
			memberId
			agentId
			scheduleId
			peopleCount
			totalPrice
			bookingDate
			travelerName
			travelerEmail
			travelerPhone
			passportNumber
			specialRequest
			cancelReason
			cancelledAt
			expiresAt
			createdAt
			updatedAt
		}
	}
`;

export const GET_MY_PAYMENTS = gql`
	query GetMyPayments($input: PaymentsInquiry!) {
		getMyPayments(input: $input) {
			list {
				_id
				paymentStatus
				paymentMethod
				paymentAmount
				bookingId
				memberId
				tourId
				transactionId
				paidAt
				refundedAt
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_AGENT_PAYMENTS = gql`
	query GetAgentPayments($input: PaymentsInquiry!) {
		getAgentPayments(input: $input) {
			list {
				_id
				paymentStatus
				paymentMethod
				paymentAmount
				bookingId
				memberId
				tourId
				transactionId
				paidAt
				refundedAt
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_AGENT_PAYMENT = gql`
	query GetAgentPayment($paymentId: String!) {
		getAgentPayment(paymentId: $paymentId) {
			_id
			paymentStatus
			paymentMethod
			paymentAmount
			bookingId
			memberId
			tourId
			transactionId
			paidAt
			refundedAt
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
				authorId
				receiverId
				memberId
				tourId
				bookingId
				paymentId
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
        memberAddress
        memberDesc
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
				articleViews
				articleLikes
				articleComments
				memberId
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
			rating
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
