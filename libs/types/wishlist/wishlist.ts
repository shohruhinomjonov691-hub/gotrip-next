import { WishlistGroup } from '../../enums/tour.enum';
import { Destination } from '../destination/destination';
import { TotalCounter } from '../shared';
import { Tour } from '../tour/tour';

export interface Wishlist {
	_id: string;
	wishlistGroup: WishlistGroup;
	wishlistRefId: string;
	memberId: string;
	createdAt: Date;
	updatedAt: Date;
	tourData?: Tour;
	destinationData?: Destination;
}

export interface Wishlists {
	list: Wishlist[];
	metaCounter: TotalCounter[];
}
