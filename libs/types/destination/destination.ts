import { MeLiked, TotalCounter } from '../shared';
import { DestinationStatus } from '../../enums/destination.enum';
import { TourLocation } from '../../enums/tour.enum';
import { Member } from '../member/member';
import { TranslationEntry } from '../../i18n/localization';

export interface DestinationCoordinates {
	lat: number;
	lng: number;
}

/** One locale's translated override for a subset of Destination's text fields. */
export interface DestinationTranslation extends TranslationEntry<Destination> {
	destinationTitle?: string;
	destinationDesc?: string;
	destinationHighlights?: string[];
	destinationSeason?: string;
}

export interface Destination {
	_id: string;
	destinationStatus: DestinationStatus;
	memberId: string;
	destinationTitle: string;
	destinationDesc?: string;
	destinationThumbnail: string;
	destinationGallery: string[];
	destinationHighlights?: string[];
	destinationSeason?: string;
	destinationCountry: string;
	destinationCity: string;
	destinationCoordinates?: DestinationCoordinates;
	locationKey?: TourLocation;
	destinationViews: number;
	destinationLikes: number;
	destinationRank: number;
	translations?: DestinationTranslation[];
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	tourCount?: number;
	meLiked?: MeLiked[];
	memberData?: Member;
}

export interface Destinations {
	list: Destination[];
	metaCounter: TotalCounter[];
}
