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
				translations {
					locale
					articleTitle
					articleContent
				}
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

/** Guide applications. Defaults to PENDING server-side when no status is given. */
export const GET_AGENT_REQUESTS_BY_ADMIN = gql`
	query GetAgentRequestsByAdmin($input: MembersInquiry!) {
		getAgentRequestsByAdmin(input: $input) {
			list {
				_id
				memberType
				memberStatus
				memberNick
				memberFullName
				memberImage
				memberPhone
				memberAddress
				memberDesc
				agentRequestStatus
				agentRequestMessage
				agentExperience
				memberTours
				memberArticles
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
 *  CATALOGUE MODERATION
 * Backends for these have existed since the category/destination/testimonial
 * modules were built; these documents simply expose them to the admin UI.
 *************************/

export const GET_ALL_TESTIMONIALS_BY_ADMIN = gql`
	query GetAllTestimonialsByAdmin($input: AllTestimonialsInquiry!) {
		getAllTestimonialsByAdmin(input: $input) {
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

export const GET_ALL_CATEGORIES_BY_ADMIN = gql`
	query GetAllCategoriesByAdmin($input: AllCategoriesInquiry!) {
		getAllCategoriesByAdmin(input: $input) {
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

export const GET_ALL_DESTINATIONS_BY_ADMIN = gql`
	query GetAllDestinationsByAdmin($input: AllDestinationsInquiry!) {
		getAllDestinationsByAdmin(input: $input) {
			list {
				_id
				destinationStatus
				memberId
				destinationTitle
				destinationDesc
				destinationThumbnail
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
