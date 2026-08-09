import React from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_AGENTS, GET_DESTINATIONS, GET_TOURS } from '../../../apollo/user/query';
import { Members } from '../../types/member/member';
import { Tours } from '../../types/tour/tour';
import { Direction } from '../../enums/common.enum';
import { useTranslation } from '../../i18n/useTranslation';

/* Variables match the other Home sections exactly, so these resolve straight
   from the Apollo cache and add no extra network requests. */
const TOURS_INPUT = { page: 1, limit: 12, sort: 'tourRank', direction: Direction.DESC, search: {} };
const AGENTS_INPUT = { page: 1, limit: 20, sort: 'memberRank', direction: Direction.DESC, search: {} };
const DESTINATIONS_INPUT = { page: 1, limit: 10, sort: 'destinationRank', direction: Direction.DESC, search: {} };

const FOUNDED_YEAR = 2016;

const IMAGES = {
	tall: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=900&q=80',
	wide: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80',
};

const PROMISES = [
	{
		title: 'Licence-checked guides',
		copy: 'Every guide passes identity and licence checks before their first tour goes live.',
	},
	{
		title: 'Real prices, no surprises',
		copy: 'The price on the card is the price the guide set. Inclusions are listed on every tour.',
	},
	{
		title: 'Small groups by design',
		copy: 'Group sizes are capped on the tour itself, so the number you see is the number you travel with.',
	},
];

const CheckIcon = () => (
	<svg viewBox="0 0 24 24">
		<circle cx="12" cy="12" r="9" />
		<path d="M8.5 12.4l2.5 2.4 4.5-5" />
	</svg>
);

const GthAbout = () => {
	const { t } = useTranslation();
	const { data: toursData } = useQuery<{ getTours: Tours }>(GET_TOURS, {
		fetchPolicy: 'cache-first',
		variables: { input: TOURS_INPUT },
	});
	const { data: agentsData } = useQuery<{ getAgents: Members }>(GET_AGENTS, {
		fetchPolicy: 'cache-first',
		variables: { input: AGENTS_INPUT },
	});
	const { data: destData } = useQuery<any>(GET_DESTINATIONS, {
		fetchPolicy: 'cache-first',
		variables: { input: DESTINATIONS_INPUT },
	});

	const tourTotal = toursData?.getTours?.metaCounter?.[0]?.total ?? 0;
	const guideTotal = agentsData?.getAgents?.metaCounter?.[0]?.total ?? 0;
	const destTotal = destData?.getDestinations?.metaCounter?.[0]?.total ?? 0;
	const years = Math.max(1, new Date().getFullYear() - FOUNDED_YEAR);

	const facts = [
		{ value: tourTotal ? `${tourTotal}` : '—', label: t('Guided tours') },
		{ value: guideTotal ? `${guideTotal}` : '—', label: t('Verified guides') },
		{ value: destTotal ? `${destTotal}` : '—', label: t('Destinations') },
		{ value: `${years}`, label: t('Years running') },
	];

	return (
		<section className="ab-sec">
			<div className="doodle" />
			<div className="wrap ab-grid">
				{/* Imagery */}
				<div className="ab-art">
					<div className="ab-art-tall">
						<img alt="" loading="lazy" src={IMAGES.tall} />
					</div>
					<div className="ab-art-wide">
						<img alt="" loading="lazy" src={IMAGES.wide} />
					</div>
					<div className="ab-art-badge">
						<b>{years}</b>
						<small>
							{t('years of')}
							<br />
							{t('guided travel')}
						</small>
					</div>
				</div>

				{/* Copy */}
				<div className="ab-body">
					<span className="eyebrow">{t('About Us')}</span>
					<h2>{t('Travel planned by people who actually go')}</h2>
					<p className="ab-lead">
						{t(
							'GoTrip is a marketplace for guided travel. Local guides publish the routes they run themselves — you browse real itineraries, see who is leading them, and talk to that guide directly before you commit.',
						)}
					</p>

					<ul className="ab-promises">
						{PROMISES.map((p) => (
							<li key={p.title}>
								<span className="ab-check">
									<CheckIcon />
								</span>
								<div>
									<b>{t(p.title)}</b>
									<span>{t(p.copy)}</span>
								</div>
							</li>
						))}
					</ul>

					<div className="ab-facts">
						{facts.map((f) => (
							<div key={f.label}>
								<b>{f.value}</b>
								<small>{f.label}</small>
							</div>
						))}
					</div>

					<div className="ab-cta">
						<Link className="btn btn-sky" href="/tour">
							{t('Browse tours')}
						</Link>
						<Link className="btn btn-outline" href="/agent">
							{t('Meet the guides')}
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
};

export default GthAbout;
