import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Stack, Typography } from '@mui/material';
import TourCard from '../tour/TourCard';
import { GET_VISITED_TOURS } from '../../../apollo/user/query';
import { Tour } from '../../types/tour/tour';
import { T } from '../../types/common';

const RecentlyViewedTours = () => {
	const [tours, setTours] = useState<Tour[]>([]);
	const input = { page: 1, limit: 12 };

	useQuery(GET_VISITED_TOURS, {
		fetchPolicy: 'cache-and-network',
		variables: { input },
		onCompleted: (data: T) => setTours(data?.getVisited?.list ?? []),
	});

	return (
		<Stack spacing={2} sx={{ p: 2 }}>
			<Typography fontSize={28} fontWeight={800}>
				Recently Viewed Tours
			</Typography>
			<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
				{tours.map((tour) => (
					<TourCard key={tour._id} tour={tour} />
				))}
			</div>
			{tours.length === 0 && <Typography color="text.secondary">No recently viewed tours yet.</Typography>}
		</Stack>
	);
};

export default RecentlyViewedTours;
