import { Member } from '../member/member';
import { MeLiked, TotalCounter } from '../shared';
import { TourCategory, TourDifficulty, TourLanguage, TourLocation, TourStatus } from '../../enums/tour.enum';
import { TranslationEntry } from '../../i18n/localization';

/** One locale's translated override for a subset of Tour's text fields. */
export interface TourTranslation extends TranslationEntry<Tour> {
	tourTitle?: string;
	tourDesc?: string;
	tourMeetingPoint?: string;
	tourItinerary?: string[];
	tourIncluded?: string[];
	tourExcluded?: string[];
}

export interface Tour {
	_id: string;
	tourCategory: TourCategory;
	tourStatus: TourStatus;
	tourLocation: TourLocation;
	tourTitle: string;
	tourPrice: number;
	tourDuration: number;
	tourMaxPeople: number;
	tourMinPeople: number;
	tourAvailableSeats: number;
	tourViews: number;
	tourLikes: number;
	tourComments: number;
	tourRank: number;
	tourRating?: number;
	tourImages: string[];
	tourDesc?: string;
	tourItinerary?: string[];
	tourIncluded?: string[];
	tourExcluded?: string[];
	tourMeetingPoint?: string;
	tourLanguage?: TourLanguage;
	tourDifficulty?: TourDifficulty;
	memberId: string;
	translations?: TourTranslation[];
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	meLiked?: MeLiked[];
	memberData?: Member;
}

export interface Tours {
	list: Tour[];
	metaCounter: TotalCounter[];
}
