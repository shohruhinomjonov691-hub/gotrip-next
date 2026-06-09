import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { GET_DESTINATIONS } from '../../../apollo/user/query';
import { Direction } from '../../enums/common.enum';
import { TourCategory, TourLocation } from '../../enums/tour.enum';
import { Destination } from '../../types/destination/destination';
import { T } from '../../types/common';

const TourHeaderFilter = () => {
	const router = useRouter();
	const [text, setText] = useState('');
	const [category, setCategory] = useState('');
	const [location, setLocation] = useState('');
	const [destinationId, setDestinationId] = useState('');
	const [destinations, setDestinations] = useState<Destination[]>([]);

	useQuery(GET_DESTINATIONS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 20, sort: 'destinationRank', direction: Direction.DESC, search: {} } },
		onCompleted: (data: T) => setDestinations(data?.getDestinations?.list ?? []),
	});

	const submitHandler = () => {
		const params = new URLSearchParams();
		if (text) params.set('text', text);
		if (category) params.set('category', category);
		if (location) params.set('location', location);
		if (destinationId) params.set('destinationId', destinationId);
		router.push(`/tour${params.toString() ? `?${params.toString()}` : ''}`).then();
	};

	return (
		<Stack
			spacing={2}
			sx={{
				width: '100%',
				bgcolor: '#fff',
				borderRadius: '8px',
				p: 2,
				boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
			}}
		>
			<Typography fontSize={28} fontWeight={800}>
				Find your next tour
			</Typography>
			<Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
				<TextField
					fullWidth
					size="small"
					label="Search"
					value={text}
					onChange={(event) => setText(event.target.value)}
				/>
				<TextField select size="small" label="Category" value={category} onChange={(event) => setCategory(event.target.value)}>
					<MenuItem value="">All</MenuItem>
					{Object.values(TourCategory).map((item) => (
						<MenuItem key={item} value={item}>
							{item}
						</MenuItem>
					))}
				</TextField>
				<TextField select size="small" label="Location" value={location} onChange={(event) => setLocation(event.target.value)}>
					<MenuItem value="">All</MenuItem>
					{Object.values(TourLocation).map((item) => (
						<MenuItem key={item} value={item}>
							{item}
						</MenuItem>
					))}
				</TextField>
				<TextField
					select
					size="small"
					label="Destination"
					value={destinationId}
					onChange={(event) => setDestinationId(event.target.value)}
					sx={{ minWidth: 180 }}
				>
					<MenuItem value="">All</MenuItem>
					{destinations.map((destination) => (
						<MenuItem key={destination._id} value={destination._id}>
							{destination.destinationTitle}
						</MenuItem>
					))}
				</TextField>
				<Button variant="contained" onClick={submitHandler}>
					Search
				</Button>
			</Stack>
		</Stack>
	);
};

export default TourHeaderFilter;
