import { Direction } from '../../enums/common.enum';
import { DestinationStatus } from '../../enums/tour.enum';

export interface DestinationInput {
	destinationCountry: string;
	destinationCity: string;
	destinationAddress?: string;
	destinationTitle: string;
	destinationDesc?: string;
	destinationImages: string[];
}

interface DISearch {
	country?: string;
	city?: string;
	text?: string;
}

export interface DestinationsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: DISearch;
}

interface ADISearch extends DISearch {
	destinationStatus?: DestinationStatus;
}

export interface AllDestinationsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: ADISearch;
}
