import React from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_TOURS, GET_AGENTS } from '../../../apollo/user/query';
import { Tour, Tours } from '../../types/tour/tour';
import { Members } from '../../types/member/member';
import { Direction } from '../../enums/common.enum';
import { useTranslation } from '../../i18n/useTranslation';

// Mirrors GthNewTours / GthGuides exactly so Apollo serves these from the same
// in-flight cache entry instead of firing new network requests.
const TOURS_INPUT = { page: 1, limit: 6, sort: 'createdAt', direction: Direction.DESC, search: {} };
const AGENTS_INPUT = { page: 1, limit: 20, sort: 'memberRank', direction: Direction.DESC, search: {} };

const FEATURES = [
	{
		icon: (
			<svg viewBox="0 0 24 24">
				<path d="M12 3l2.4 5.4 5.6.6-4.2 3.9 1.2 5.6L12 15.7 6.9 18.5l1.2-5.6L4 9l5.6-.6z" />
			</svg>
		),
		title: 'Handpicked Tours',
		desc: 'Every route is reviewed by our team before it goes live, so you book what was promised.',
	},
	{
		icon: (
			<svg viewBox="0 0 24 24">
				<path d="M12 3l7.5 3v6c0 4.6-3.1 8.1-7.5 9.4C7.6 20.1 4.5 16.6 4.5 12V6z" />
				<path d="M9.2 12.2l2 2 3.6-4" />
			</svg>
		),
		title: 'Safety First, Always',
		desc: 'Licensed agents, insured transport and 24/7 support on every booking.',
	},
	{
		icon: (
			<svg viewBox="0 0 24 24">
				<circle cx="9" cy="8" r="3.4" />
				<path d="M3 20c0-3.4 2.7-5.3 6-5.3s6 1.9 6 5.3" />
				<path d="M17 9.4l1.5 1.5L22 7.4" />
			</svg>
		),
		title: 'Verified Guide Agents',
		desc: 'Every agent passes ID and licence checks, and keeps a public rating you can see.',
	},
	{
		icon: (
			<svg viewBox="0 0 24 24">
				<circle cx="12" cy="12" r="9" />
				<path d="M12 7v5l3.4 2" />
			</svg>
		),
		title: 'Free Cancellation',
		desc: 'Change your mind up to 48 hours before departure and get your money back.',
	},
];

const GthPlanTrip = () => {
	const { t } = useTranslation();
	const { data: toursData } = useQuery<{ getTours: Tours }>(GET_TOURS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: TOURS_INPUT },
	});
	const { data: agentsData } = useQuery<{ getAgents: Members }>(GET_AGENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: AGENTS_INPUT },
	});

	const totalTours = toursData?.getTours?.metaCounter?.[0]?.total ?? 0;
	const totalGuides = agentsData?.getAgents?.metaCounter?.[0]?.total ?? 0;

	// Guide-entered per-tour rating averaged across the fetched sample — there is no
	// per-traveller review system on this platform, so we never show a fabricated review count.
	const rated: Tour[] = (toursData?.getTours?.list ?? []).filter((t) => !!t.tourRating);
	const avgRating = rated.length ? rated.reduce((sum, t) => sum + (t.tourRating ?? 0), 0) / rated.length : null;

	return (
		<section className="plan-sec">
			<span className="deco p1">🛂</span>
			<span className="deco p2">👒</span>
			<span className="deco p3">🛟</span>
			<span className="deco p4">🚐</span>
			<div className="wrap plan-grid">
				<div className="plan-collage">
					<div className="pc pc-a">
						<img
							alt=""
							loading="lazy"
							src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80"
						/>
					</div>
					<div className="pc pc-b">
						<img
							alt=""
							loading="lazy"
							src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80"
						/>
					</div>
					<div className="pc pc-c">
						<img
							alt=""
							loading="lazy"
							src="https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=900&q=80"
						/>
					</div>
					{avgRating !== null && (
						<div className="plan-badge">
							<span className="st">⭐</span>
							<span>
								<b>{avgRating.toFixed(1)}</b>
								<small>{t('Average guide-rated tour')}</small>
							</span>
						</div>
					)}
				</div>
				<div className="plan-txt">
					<span className="eyebrow">{t("Let's Go Together")}</span>
					<h2>{t('Plan Your Trip With Us')}</h2>
					<p>
						{t(
							'GoTrip brings {{totalTours}}+ tours from {{totalGuides}}+ verified guide agents into one place. Compare real prices, read reviews left by travellers who actually went, and book the whole trip in a few minutes — no hidden fees at checkout.',
							{ totalTours, totalGuides },
						)}
					</p>
					{FEATURES.map((feat) => (
						<div className="pfeat" key={feat.title}>
							<span className="pi">{feat.icon}</span>
							<div>
								<h3>{t(feat.title)}</h3>
								<p>{t(feat.desc)}</p>
							</div>
						</div>
					))}
					<Link className="btn" href="/tour">
						{t('Learn More')}{' '}
						<span className="ar">
							<svg className="ico" viewBox="0 0 24 24">
								<path d="M5 12h14M13 6l6 6-6 6" />
							</svg>
						</span>
					</Link>
				</div>
			</div>
		</section>
	);
};

export default GthPlanTrip;
