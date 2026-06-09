import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Stack, Typography } from '@mui/material';
import TourCard from '../tour/TourCard';
import { GET_AGENT_TOURS } from '../../../apollo/user/query';
import { Direction } from '../../enums/common.enum';
import { TourStatus } from '../../enums/tour.enum';
import { Tour } from '../../types/tour/tour';
import { AgentToursInquiry } from '../../types/tour/tour.input';
import { T } from '../../types/common';

const input: AgentToursInquiry = {
	page: 1,
	limit: 12,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: { tourStatus: TourStatus.ACTIVE },
};

const MyTours = () => {
	const [tours, setTours] = useState<Tour[]>([]);

	useQuery(GET_AGENT_TOURS, {
		fetchPolicy: 'cache-and-network',
		variables: { input },
		onCompleted: (data: T) => setTours(data?.getAgentTours?.list ?? []),
	});

	return (
		<Stack spacing={2} sx={{ p: 2 }}>
			<Typography fontSize={28} fontWeight={800}>
				My Tours
			</Typography>
			<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
				{tours.map((tour) => (
					<TourCard key={tour._id} tour={tour} />
				))}
			</div>
			{tours.length === 0 && <Typography color="text.secondary">No tours published yet.</Typography>}
		</Stack>
	);
};

export default MyTours;
