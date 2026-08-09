import { TourCategory, TourDifficulty, TourLanguage, TourLocation, TourStatus } from '../../enums/tour.enum';

export interface TourUpdate {
	_id: string;
	tourCategory?: TourCategory;
	tourStatus?: TourStatus;
	tourLocation?: TourLocation;
	tourTitle?: string;
	tourPrice?: number;
	tourDuration?: number;
	tourMaxPeople?: number;
	tourMinPeople?: number;
	tourAvailableSeats?: number;
	tourImages?: string[];
	tourDesc?: string;
	tourItinerary?: string[];
	tourIncluded?: string[];
	tourExcluded?: string[];
	tourMeetingPoint?: string;
	tourLanguage?: TourLanguage;
	tourDifficulty?: TourDifficulty;
	deletedAt?: Date;
}
