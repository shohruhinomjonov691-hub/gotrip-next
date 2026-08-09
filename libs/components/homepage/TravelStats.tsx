import React, { useEffect, useRef, useState } from 'react';
import { Stack, Typography } from '@mui/material';
import { useQuery } from '@apollo/client';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { GET_AGENTS, GET_TOURS } from '../../../apollo/user/query';
import { Direction } from '../../enums/common.enum';
import { TourCategory, TourLocation } from '../../enums/tour.enum';
import { T } from '../../types/common';
import { fadeUp } from './motion';

const MotionSection = motion.section;

const countInput = { page: 1, limit: 1, sort: 'createdAt', direction: Direction.DESC, search: {} };
const DESTINATION_COUNT = Object.keys(TourLocation).length;
const CATEGORY_COUNT = Object.keys(TourCategory).length;

const useCountUp = (target: number, active: boolean, duration = 1500) => {
	const [value, setValue] = useState(0);

	useEffect(() => {
		if (!active) return;
		let raf = 0;
		const start = performance.now();
		const tick = (now: number) => {
			const progress = Math.min((now - start) / duration, 1);
			const eased = 1 - Math.pow(1 - progress, 3);
			setValue(Math.round(target * eased));
			if (progress < 1) raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [target, active, duration]);

	return value;
};

const StatValue = ({
	target,
	active,
	instant,
	suffix,
}: {
	target: number;
	active: boolean;
	instant: boolean;
	suffix?: string;
}) => {
	const value = useCountUp(target, active, instant ? 0 : 1500);
	return (
		<b>
			{instant ? target : value}
			{suffix}
		</b>
	);
};

const TravelStats = () => {
	const reduceMotion = useReducedMotion();
	const ref = useRef<HTMLDivElement>(null);
	const inView = useInView(ref, { once: true, amount: 0.4 });

	const { data: toursData } = useQuery(GET_TOURS, { fetchPolicy: 'cache-first', variables: { input: countInput } });
	const { data: agentsData } = useQuery(GET_AGENTS, { fetchPolicy: 'cache-first', variables: { input: countInput } });

	const tourTotal = (toursData as T)?.getTours?.metaCounter?.[0]?.total ?? 0;
	const agentTotal = (agentsData as T)?.getAgents?.metaCounter?.[0]?.total ?? 0;

	const stats = [
		{ target: tourTotal, suffix: '', label: 'Live tours', hint: 'Ready to explore right now' },
		{ target: DESTINATION_COUNT, suffix: '', label: 'Destinations', hint: 'Cities and regions covered' },
		{ target: agentTotal, suffix: '', label: 'Local guides', hint: 'Verified experts on the ground' },
		{ target: CATEGORY_COUNT, suffix: '', label: 'Tour styles', hint: 'From cruises to mountain trails' },
	];

	return (
		<MotionSection
			className={'travel-stats-section'}
			variants={reduceMotion ? undefined : fadeUp}
			initial={reduceMotion ? false : 'hidden'}
			whileInView="visible"
			viewport={{ once: true, amount: 0.2 }}
		>
			<Stack className={'home-section-container'}>
				<div className={'travel-stats-band'} ref={ref}>
					<span className={'travel-stats-shade'} aria-hidden="true" />
					<Stack className={'travel-stats-intro'}>
						<Typography className={'home-section-kicker on-dark'}>GoTrip in numbers</Typography>
						<Typography component={'h2'} className={'travel-stats-title'}>
							A growing world of curated travel
						</Typography>
						<Typography className={'travel-stats-sub'}>
							Every number here is live from the platform — no inflated marketing figures.
						</Typography>
					</Stack>
					<div className={'travel-stats-grid'}>
						{stats.map((item) => (
							<div className={'travel-stat'} key={item.label}>
								<StatValue
									target={item.target}
									active={inView}
									instant={Boolean(reduceMotion)}
									suffix={item.suffix}
								/>
								<span className={'travel-stat-label'}>{item.label}</span>
								<small>{item.hint}</small>
							</div>
						))}
					</div>
				</div>
			</Stack>
		</MotionSection>
	);
};

export default TravelStats;
