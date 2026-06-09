import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { Button, Chip, InputAdornment, MenuItem, Stack, TextField, Typography } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import TravelExploreRoundedIcon from '@mui/icons-material/TravelExploreRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { motion } from 'framer-motion';
import { GET_DESTINATIONS } from '../../../apollo/user/query';
import { REACT_APP_API_URL } from '../../config';
import { Direction } from '../../enums/common.enum';
import { TourCategory, TourLocation } from '../../enums/tour.enum';
import { Destination } from '../../types/destination/destination';
import { T } from '../../types/common';
import { fadeUp, hoverLift, staggerContainer, tapPress } from './motion';

const MotionStack = motion(Stack);
const MotionDiv = motion.div;

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

	const keyDownHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter') submitHandler();
	};

	const featuredDestinations = destinations.slice(0, 4);
	const inputSx = {
		'& .MuiOutlinedInput-root': {
			borderRadius: '16px',
			bgcolor: 'rgba(255,255,255,0.92)',
			transition: 'box-shadow 220ms ease, background-color 220ms ease, transform 220ms ease',
			'& fieldset': { borderColor: 'rgba(255,255,255,0.64)' },
			'&:hover': {
				bgcolor: '#fff',
				boxShadow: '0 14px 30px rgba(16, 24, 40, 0.12)',
				transform: 'translateY(-1px)',
			},
			'&.Mui-focused': {
				bgcolor: '#fff',
				boxShadow: '0 0 0 4px rgba(38, 166, 154, 0.18)',
			},
		},
		'& .MuiInputLabel-root': { fontWeight: 700 },
	};

	return (
		<MotionStack className={'tour-search-panel'} variants={staggerContainer} initial="hidden" animate="visible">
			<MotionStack className={'search-heading'} variants={fadeUp}>
				<Chip className={'glass-chip'} icon={<TravelExploreRoundedIcon />} label="GoTrip search" />
				<Typography className={'search-title'}>Where should the next memory begin?</Typography>
				<Typography className={'search-copy'}>
					Search by tour, destination, category, or city. We will take you straight to matching experiences.
				</Typography>
			</MotionStack>
			<MotionStack className={'search-grid'} direction={{ xs: 'column', md: 'row' }} variants={fadeUp}>
				<TextField
					fullWidth
					size="small"
					label="Search tours"
					placeholder="Culture walks, Jeju escapes..."
					value={text}
					onChange={(event) => setText(event.target.value)}
					onKeyDown={keyDownHandler}
					sx={inputSx}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchRoundedIcon fontSize="small" />
							</InputAdornment>
						),
					}}
				/>
				<TextField
					select
					size="small"
					label="Category"
					value={category}
					onChange={(event) => setCategory(event.target.value)}
					sx={inputSx}
				>
					<MenuItem value="">All categories</MenuItem>
					{Object.values(TourCategory).map((item) => (
						<MenuItem key={item} value={item}>
							{item}
						</MenuItem>
					))}
				</TextField>
				<TextField
					select
					size="small"
					label="Location"
					value={location}
					onChange={(event) => setLocation(event.target.value)}
					sx={inputSx}
				>
					<MenuItem value="">Any location</MenuItem>
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
					sx={{ minWidth: 180, ...inputSx }}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<PlaceOutlinedIcon fontSize="small" />
							</InputAdornment>
						),
					}}
				>
					<MenuItem value="">All destinations</MenuItem>
					{destinations.map((destination) => (
						<MenuItem key={destination._id} value={destination._id}>
							{destination.destinationTitle}
						</MenuItem>
					))}
				</TextField>
				<Button className={'search-submit'} variant="contained" onClick={submitHandler} endIcon={<ArrowForwardRoundedIcon />}>
					Search
				</Button>
			</MotionStack>
			{featuredDestinations.length > 0 && (
				<MotionStack className={'destination-discovery'} variants={fadeUp}>
					<Stack className={'destination-title-row'} direction="row" alignItems="center" justifyContent="space-between">
						<Typography>Popular destinations</Typography>
						<Link href={'/tour'}>
							<span>Browse all tours</span>
						</Link>
					</Stack>
					<MotionDiv className={'destination-grid'} variants={staggerContainer} initial="hidden" animate="visible">
						{featuredDestinations.map((destination) => {
							const image = destination.destinationImages?.[0]
								? `${REACT_APP_API_URL}/${destination.destinationImages[0]}`
								: '/img/banner/header2.svg';

							return (
								<Link href={`/tour?destinationId=${destination._id}`} key={destination._id}>
									<MotionDiv
										className={'destination-card'}
										variants={fadeUp}
										whileHover={hoverLift}
										whileTap={tapPress}
									>
										<img src={image} alt={destination.destinationTitle} />
										<div>
											<strong>{destination.destinationTitle}</strong>
											<span>
												{destination.destinationCity || destination.destinationCountry} ·{' '}
												{destination.destinationTours || 0} tours
											</span>
										</div>
									</MotionDiv>
								</Link>
							);
						})}
					</MotionDiv>
				</MotionStack>
			)}
		</MotionStack>
	);
};

export default TourHeaderFilter;
