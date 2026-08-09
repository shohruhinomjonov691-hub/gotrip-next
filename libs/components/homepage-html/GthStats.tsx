import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { useQuery } from '@apollo/client';
import { useTranslation } from '../../i18n/useTranslation';
import { GET_TOURS, GET_DESTINATIONS, GET_AGENTS } from '../../../apollo/user/query';
import { Tours } from '../../types/tour/tour';
import { Destinations } from '../../types/destination/destination';
import { Members } from '../../types/member/member';
import { Direction } from '../../enums/common.enum';

// Mirrors the exact query + variables already fired by GthNewTours / GthDestinations / GthGuides
// so Apollo's cache serves this from the same in-flight request instead of a 4th network call.
const TOURS_INPUT = { page: 1, limit: 6, sort: 'createdAt', direction: Direction.DESC, search: {} };
const DESTINATIONS_INPUT = { page: 1, limit: 20, sort: 'destinationRank', direction: Direction.DESC, search: {} };
const AGENTS_INPUT = { page: 1, limit: 20, sort: 'memberRank', direction: Direction.DESC, search: {} };

const ICONS: Record<string, React.ReactNode> = {
	tours: (
		<>
			<path d="M12 21s-7-6.3-7-11a7 7 0 0114 0c0 4.7-7 11-7 11z" />
			<circle cx="12" cy="10" r="2.6" />
			<path d="M4.5 17.5C3 18.3 2 19.3 2 20.4 2 22 6.5 23 12 23s10-1 10-2.6c0-1.1-1-2.1-2.5-2.9" />
		</>
	),
	destinations: (
		<>
			<circle cx="12" cy="12" r="9.2" />
			<path d="M2.8 12h18.4" />
			<path d="M12 2.8c2.9 3.2 2.9 15.2 0 18.4M12 2.8c-2.9 3.2-2.9 15.2 0 18.4" />
		</>
	),
	guides: (
		<>
			<circle cx="9" cy="7.5" r="3.6" />
			<path d="M2.5 20c0-3.6 2.9-5.6 6.5-5.6s6.5 2 6.5 5.6" />
			<path d="M17 8.6l1.5 1.5L22 6.6" />
			<path d="M18.5 14.5v5" />
		</>
	),
	experience: (
		<>
			<circle cx="12" cy="9" r="5.6" />
			<path d="M12 6.6l.9 1.9 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2L9.1 8.8l2-.3z" />
			<path d="M8 14.2L6.4 22l5.6-2.8L17.6 22 16 14.2" />
		</>
	),
};

const useCountUp = (target: number, active: boolean, duration = 1600) => {
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

const StatCard = ({
	icon,
	label,
	to,
	suffix,
}: {
	icon: string;
	label: string;
	to: number;
	suffix: string;
}) => {
	const ref = useRef<HTMLDivElement>(null);
	const inView = useInView(ref, { once: true, amount: 0.5 });
	const value = useCountUp(to, inView);

	return (
		<div className="stat" ref={ref}>
			<span className={`s-ico ${icon === 'destinations' || icon === 'experience' ? 'gold' : 'dark'}`}>
				<svg viewBox="0 0 24 24">{ICONS[icon]}</svg>
			</span>
			<div className="s-card">
				<span className="s-lab">{label}</span>
				<span className="s-num">
					{value}
					{suffix}
				</span>
			</div>
		</div>
	);
};

// "Years of experience" is a static founding-date fact, not a queryable entity — kept as-is.
const FOUNDED_YEAR = 2016;
const EXPERIENCE_YEARS = new Date().getFullYear() - FOUNDED_YEAR;

const GthStats = () => {
	const { t } = useTranslation();
	const { data: toursData } = useQuery<{ getTours: Tours }>(GET_TOURS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: TOURS_INPUT },
	});
	const { data: destData } = useQuery<{ getDestinations: Destinations }>(GET_DESTINATIONS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: DESTINATIONS_INPUT },
	});
	const { data: agentsData } = useQuery<{ getAgents: Members }>(GET_AGENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: AGENTS_INPUT },
	});

	const totalTours = toursData?.getTours?.metaCounter?.[0]?.total ?? 0;
	const totalDestinations = destData?.getDestinations?.metaCounter?.[0]?.total ?? 0;
	const totalGuides = agentsData?.getAgents?.metaCounter?.[0]?.total ?? 0;

	const stats = [
		{ icon: 'tours', label: t('Total Tours'), to: totalTours, suffix: '+' },
		{ icon: 'destinations', label: t('Destinations'), to: totalDestinations, suffix: '+' },
		{ icon: 'guides', label: t('Guide Agents'), to: totalGuides, suffix: '+' },
		{ icon: 'experience', label: t('Our Experience'), to: EXPERIENCE_YEARS, suffix: '+' },
	];

	return (
		<section className="stats-sec">
			<div className="wrap">
				<div className="stats">
					{stats.map((item) => (
						<StatCard key={item.label} {...item} />
					))}
				</div>
			</div>
		</section>
	);
};

export default GthStats;
