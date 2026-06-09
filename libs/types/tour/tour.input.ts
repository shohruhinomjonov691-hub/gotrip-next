import { Direction } from '../../enums/common.enum';
import { TourCategory, TourDifficulty, TourLanguage, TourLocation, TourStatus } from '../../enums/tour.enum';

export interface TourInput {
	tourCategory: TourCategory;
	tourLocation: TourLocation;
	tourTitle: string;
	tourPrice: number;
	tourDuration: number;
	tourMaxPeople: number;
	tourMinPeople: number;
	tourAvailableSeats: number;
	tourImages: string[];
	tourDesc?: string;
	tourItinerary?: string[];
	tourIncluded?: string[];
	tourExcluded?: string[];
	tourMeetingPoint?: string;
	tourLanguage?: TourLanguage;
	tourDifficulty?: TourDifficulty;
	destinationId?: string;
}

export interface Range {
	start: number;
	end: number;
}

export interface PeriodsRange {
	start: Date | number;
	end: Date | number;
}

interface TISearch {
	memberId?: string;
	destinationId?: string;
	locationList?: TourLocation[];
	categoryList?: TourCategory[];
	pricesRange?: Range;
	periodsRange?: PeriodsRange;
	durationRange?: Range;
	text?: string;
}

export interface ToursInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: TISearch;
}

interface ATISearch {
	tourStatus?: TourStatus;
}

export interface AgentToursInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: ATISearch;
}

interface ALTISearch {
	tourStatus?: TourStatus;
	tourLocationList?: TourLocation[];
	tourCategoryList?: TourCategory[];
}

export interface AllToursInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: ALTISearch;
}

export interface OrdinaryInquiry {
	page: number;
	limit: number;
}
