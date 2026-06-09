import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Stack, Typography } from '@mui/material';
import TourCard from '../tour/TourCard';
import { GET_MY_WISHLIST } from '../../../apollo/user/query';
import { TOGGLE_WISHLIST } from '../../../apollo/user/mutation';
import { Direction } from '../../enums/common.enum';
import { WishlistGroup } from '../../enums/tour.enum';
import { Wishlist } from '../../types/wishlist/wishlist';
import { T } from '../../types/common';

const SavedTours = () => {
	const [items, setItems] = useState<Wishlist[]>([]);
	const input = { page: 1, limit: 12, sort: 'createdAt', direction: Direction.DESC, search: { wishlistGroup: WishlistGroup.TOUR } };
	const [toggleWishlist] = useMutation(TOGGLE_WISHLIST);
	const { refetch } = useQuery(GET_MY_WISHLIST, {
		fetchPolicy: 'cache-and-network',
		variables: { input },
		onCompleted: (data: T) => setItems(data?.getMyWishlist?.list ?? []),
	});

	const removeHandler = async (tourId: string) => {
		await toggleWishlist({ variables: { input: { wishlistGroup: WishlistGroup.TOUR, wishlistRefId: tourId } } });
		await refetch({ input });
	};

	return (
		<Stack spacing={2} sx={{ p: 2 }}>
			<Typography fontSize={28} fontWeight={800}>
				Saved Tours
			</Typography>
			<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
				{items
					.filter((item) => item.tourData)
					.map((item) => (
						<TourCard key={item._id} tour={item.tourData!} onSave={removeHandler} />
					))}
			</div>
			{items.length === 0 && <Typography color="text.secondary">No saved tours yet.</Typography>}
		</Stack>
	);
};

export default SavedTours;
