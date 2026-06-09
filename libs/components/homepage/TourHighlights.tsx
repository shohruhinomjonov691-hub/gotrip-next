import React, { useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import Link from 'next/link';
import { Button, Stack, Typography } from '@mui/material';
import TourCard from '../tour/TourCard';
import { GET_TOURS } from '../../../apollo/user/query';
import { LIKE_TARGET_TOUR, TOGGLE_WISHLIST } from '../../../apollo/user/mutation';
import { Tour } from '../../types/tour/tour';
import { ToursInquiry } from '../../types/tour/tour.input';
import { Direction, Message } from '../../enums/common.enum';
import { WishlistGroup } from '../../enums/tour.enum';
import { userVar } from '../../../apollo/store';
import { T } from '../../types/common';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../sweetAlert';

interface TourHighlightsProps {
	title: string;
	sort: string;
	direction?: Direction;
	limit?: number;
}

const TourHighlights = ({ title, sort, direction = Direction.DESC, limit = 3 }: TourHighlightsProps) => {
	const user = useReactiveVar(userVar);
	const [tours, setTours] = useState<Tour[]>([]);
	const input: ToursInquiry = { page: 1, limit, sort, direction, search: {} };
	const [likeTargetTour] = useMutation(LIKE_TARGET_TOUR);
	const [toggleWishlist] = useMutation(TOGGLE_WISHLIST);

	const { loading, refetch } = useQuery(GET_TOURS, {
		fetchPolicy: 'cache-and-network',
		variables: { input },
		onCompleted: (data: T) => setTours(data?.getTours?.list ?? []),
	});

	const likeHandler = async (tourId: string) => {
		try {
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetTour({ variables: { tourId } });
			await refetch({ input });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const saveHandler = async (tourId: string) => {
		try {
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			await toggleWishlist({ variables: { input: { wishlistGroup: WishlistGroup.TOUR, wishlistRefId: tourId } } });
			await sweetTopSmallSuccessAlert('Saved tours updated', 900);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	return (
		<Stack sx={{ width: '100%', py: 5, bgcolor: '#fff' }}>
			<Stack sx={{ width: '100%', maxWidth: 1180, mx: 'auto', px: 2 }} spacing={2.5}>
				<Stack direction="row" alignItems="center" justifyContent="space-between">
					<Typography fontSize={28} fontWeight={800}>
						{title}
					</Typography>
					<Link href="/tour">
						<Button>View all</Button>
					</Link>
				</Stack>
				{loading && tours.length === 0 ? (
					<Typography color="text.secondary">Loading tours...</Typography>
				) : (
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
							gap: 16,
						}}
					>
						{tours.map((tour) => (
							<TourCard key={tour._id} tour={tour} onLike={likeHandler} onSave={saveHandler} />
						))}
					</div>
				)}
			</Stack>
		</Stack>
	);
};

export default TourHighlights;
