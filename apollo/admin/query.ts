import { gql } from '@apollo/client';

export const GET_ALL_TOURS_BY_ADMIN = gql`
	query GetAllToursByAdmin($input: AllToursInquiry!) {
		getAllToursByAdmin(input: $input) {
			list {
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
				memberId
				destinationId
				createdAt
				updatedAt
				memberData {
					_id
					memberNick
					memberType
					memberImage
					memberTours
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_AGENT_REQUESTS_BY_ADMIN = gql`
	query GetAgentRequestsByAdmin($input: MembersInquiry!) {
		getAgentRequestsByAdmin(input: $input) {
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
				memberTours
				memberRank
				memberLikes
				memberViews
				agentRequestStatus
				agentRequestMessage
				agentExperience
				agentApprovedAt
				agentRejectedAt
				isVerifiedAgent
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_ALL_DESTINATIONS_BY_ADMIN = gql`
	query GetAllDestinationsByAdmin($input: AllDestinationsInquiry!) {
		getAllDestinationsByAdmin(input: $input) {
			list {
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
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_ALL_NOTICES_BY_ADMIN = gql`
	query GetAllNoticesByAdmin($input: AllNoticesInquiry!) {
		getAllNoticesByAdmin(input: $input) {
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

export const GET_ALL_TOUR_SCHEDULES_BY_ADMIN = gql`
	query GetAllTourSchedulesByAdmin($input: AllTourSchedulesInquiry!) {
		getAllTourSchedulesByAdmin(input: $input) {
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

export const GET_ALL_BOOKINGS_BY_ADMIN = gql`
	query GetAllBookingsByAdmin($input: AllBookingsInquiry!) {
		getAllBookingsByAdmin(input: $input) {
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

export const GET_ALL_PAYMENTS_BY_ADMIN = gql`
	query GetAllPaymentsByAdmin($input: AllPaymentsInquiry!) {
		getAllPaymentsByAdmin(input: $input) {
			list {
				_id
				paymentStatus
				paymentMethod
				paymentAmount
				bookingId
				memberId
				tourId
				transactionId
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_ALL_NOTIFICATIONS_BY_ADMIN = gql`
	query GetAllNotificationsByAdmin($input: AllNotificationsInquiry!) {
		getAllNotificationsByAdmin(input: $input) {
			list {
				_id
				notificationType
				notificationStatus
				notificationGroup
				notificationTitle
				notificationDesc
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

export const GET_ALL_MEMBERS_BY_ADMIN = gql`
	query GetAllMembersByAdmin($input: MembersInquiry!) {
		getAllMembersByAdmin(input: $input) {
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
				memberArticles
				memberPoints
				memberLikes
				memberViews
				deletedAt
				createdAt
				updatedAt
				accessToken
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const GET_ALL_BOARD_ARTICLES_BY_ADMIN = gql`
	query GetAllBoardArticlesByAdmin($input: AllBoardArticlesInquiry!) {
		getAllBoardArticlesByAdmin(input: $input) {
			list {
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
