import { Member } from '../member/member';
import { MeLiked, TotalCounter } from '../shared';
import { TourSchedule } from './tour-schedule';
import { TourCategory, TourDifficulty, TourLanguage, TourLocation, TourStatus } from '../../enums/tour.enum';

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
	tourImages: string[];
	tourDesc?: string;
	tourItinerary?: string[];
	tourIncluded?: string[];
	tourExcluded?: string[];
	tourMeetingPoint?: string;
	tourLanguage?: TourLanguage;
	tourDifficulty?: TourDifficulty;
	memberId: string;
	destinationId?: string;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	meLiked?: MeLiked[];
	memberData?: Member;
	schedules?: TourSchedule[];
}

export interface Tours {
	list: Tour[];
	metaCounter: TotalCounter[];
}
