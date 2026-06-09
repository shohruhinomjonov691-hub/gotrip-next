import { DestinationStatus } from '../../enums/tour.enum';
import { MeLiked, TotalCounter } from '../shared';

export interface Destination {
	_id: string;
	destinationStatus: DestinationStatus;
	destinationCountry: string;
	destinationCity: string;
	destinationAddress?: string;
	destinationTitle: string;
	destinationDesc?: string;
	destinationImages: string[];
	destinationViews: number;
	destinationLikes: number;
	destinationComments: number;
	destinationRating: number;
	destinationTours: number;
	destinationRank: number;
	createdAt: Date;
	updatedAt: Date;
	meLiked?: MeLiked[];
}

export interface Destinations {
	list: Destination[];
	metaCounter: TotalCounter[];
}
