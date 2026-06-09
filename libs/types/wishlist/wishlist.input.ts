import { Direction } from '../../enums/common.enum';
import { WishlistGroup } from '../../enums/tour.enum';

export interface WishlistInput {
	wishlistGroup: WishlistGroup;
	wishlistRefId: string;
}

interface WISearch {
	wishlistGroup?: WishlistGroup;
}

export interface WishlistsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: WISearch;
}
