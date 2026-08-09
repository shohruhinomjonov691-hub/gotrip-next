import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Stack } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import TravelExploreRoundedIcon from '@mui/icons-material/TravelExploreRounded';
import { motion, useReducedMotion } from 'framer-motion';
import { TourCategory, TourLocation } from '../../enums/tour.enum';
import { fadeUp, staggerContainer } from './motion';

const MotionStack = motion(Stack);
const MotionForm = motion.form;

const TourHeaderFilter = () => {
	const router = useRouter();
	const reduceMotion = useReducedMotion();
	const [text, setText] = useState('');
	const [category, setCategory] = useState('');
	const [location, setLocation] = useState('');

	const submitHandler = () => {
		const params = new URLSearchParams();
		if (text) params.set('text', text);
		if (category) params.set('category', category);
		if (location) params.set('location', location);
		router.push(`/tour${params.toString() ? `?${params.toString()}` : ''}`).then();
	};

	const keyDownHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter') submitHandler();
	};

	const submitFormHandler = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		submitHandler();
	};

	return (
		<MotionStack
			className={'tour-search-panel stitch-search-panel'}
			variants={reduceMotion ? undefined : staggerContainer}
			initial={reduceMotion ? false : 'hidden'}
			animate={reduceMotion ? undefined : 'visible'}
		>
			<MotionForm className={'search-grid stitch-search-grid'} variants={reduceMotion ? undefined : fadeUp} onSubmit={submitFormHandler}>
				<label className="stitch-search-field search-text-field">
					<span>
						<SearchRoundedIcon fontSize="small" />
						Search
					</span>
					<input
						type="search"
						placeholder="Heritage walks, Jeju escapes"
						value={text}
						onChange={(event) => setText(event.target.value)}
						onKeyDown={keyDownHandler}
						aria-label="Search tours"
					/>
				</label>
				<label className="stitch-search-field">
					<span>
						<CategoryRoundedIcon fontSize="small" />
						Category
					</span>
					<select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Tour category">
						<option value="">All categories</option>
						{Object.values(TourCategory).map((item) => (
							<option key={item} value={item}>
								{item}
							</option>
						))}
					</select>
				</label>
				<label className="stitch-search-field">
					<span>
						<TravelExploreRoundedIcon fontSize="small" />
						Location
					</span>
					<select value={location} onChange={(event) => setLocation(event.target.value)} aria-label="Tour location">
						<option value="">Any location</option>
						{Object.values(TourLocation).map((item) => (
							<option key={item} value={item}>
								{item}
							</option>
						))}
					</select>
				</label>
				<Button className={'search-submit'} variant="contained" type="submit" endIcon={<ArrowForwardRoundedIcon />}>
					Search
				</Button>
			</MotionForm>
		</MotionStack>
	);
};

export default TourHeaderFilter;
