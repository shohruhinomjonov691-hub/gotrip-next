import React from 'react';
import Link from 'next/link';
import { useTranslation } from '../../i18n/useTranslation';

/**
 * Our Services — static presentational section. Every claim below maps to
 * something the platform actually does, and each card links to the screen that
 * delivers it, so nothing here is decorative filler.
 */

const Icons = {
	tours: (
		<svg viewBox="0 0 24 24">
			<path d="M9 5.5L3.5 8v11L9 16.5l6 2.5 5.5-2.5v-11L15 8z" />
			<path d="M9 5.5v11M15 8v11" />
		</svg>
	),
	guides: (
		<svg viewBox="0 0 24 24">
			<circle cx="12" cy="8" r="3.6" />
			<path d="M5 20a7 7 0 0114 0" />
			<path d="M17.5 4.5l1 1.8 2 .3-1.5 1.4.4 2-1.9-1-1.8 1 .3-2L14.5 6.6l2-.3z" />
		</svg>
	),
	booking: (
		<svg viewBox="0 0 24 24">
			<rect height="15" rx="2.4" width="17" x="3.5" y="5.5" />
			<path d="M3.5 10h17M8 3.5v4M16 3.5v4" />
			<path d="M9 14.5l1.8 1.8 3.7-3.8" />
		</svg>
	),
	safe: (
		<svg viewBox="0 0 24 24">
			<path d="M12 3.2l7.2 3v5.2c0 4.5-3 8.3-7.2 9.4-4.2-1.1-7.2-4.9-7.2-9.4V6.2z" />
			<path d="M9 12.2l2.2 2.2 4-4.2" />
		</svg>
	),
	personal: (
		<svg viewBox="0 0 24 24">
			<path d="M12 4l2.3 4.9 5.2.7-3.8 3.7 1 5.3L12 16.1 7.3 18.6l1-5.3L4.5 9.6l5.2-.7z" />
		</svg>
	),
	support: (
		<svg viewBox="0 0 24 24">
			<path d="M20 12.5a7 7 0 01-7 7H8l-4 2.5V12.5a7 7 0 017-7h2a7 7 0 017 7z" />
			<path d="M9.5 12h5M9.5 9h5" />
		</svg>
	),
};

const SERVICES = [
	{
		icon: Icons.tours,
		title: 'Premium tours',
		copy: 'Multi-day guided routes with a published itinerary, real duration and live seat counts.',
		href: '/tour',
		cta: 'Browse tours',
	},
	{
		icon: Icons.guides,
		title: 'Local guides',
		copy: 'Identity- and licence-checked guides with a public profile, languages and rating history.',
		href: '/agent',
		cta: 'Meet the guides',
	},
	{
		icon: Icons.booking,
		title: 'Easy enquiry',
		copy: 'Send an enquiry from any tour page. The guide confirms dates and details with you directly.',
		href: '/tour',
		cta: 'Start an enquiry',
	},
	{
		icon: Icons.safe,
		title: 'Safe travel',
		copy: 'Capped group sizes, a stated meeting point and a difficulty rating on every single route.',
		href: '/cs',
		cta: 'How it works',
	},
	{
		icon: Icons.personal,
		title: 'Personalised trips',
		copy: 'Guides regularly reshape an existing itinerary around your dates, pace and interests.',
		href: '/cs?tab=inquiry',
		cta: 'Ask a guide',
	},
	{
		icon: Icons.support,
		title: 'Real support',
		copy: 'A published FAQ, direct guide messaging and a team that answers every message.',
		href: '/cs',
		cta: 'Visit support',
	},
];

const GthServices = () => {
	const { t } = useTranslation();
	return (
		<section className="sv-sec" id="our-services">
			<div className="doodle" />
			<div className="wrap sv-head">
				<span className="eyebrow">{t('What We Do')}</span>
				<h2>{t('Our Services')}</h2>
				<p>{t('Everything between picking a route and standing at the meeting point.')}</p>
			</div>

			<div className="wrap">
				<div className="sv-grid">
					{SERVICES.map((s) => (
						<Link className="sv-card" href={s.href} key={s.title}>
							<span className="sv-ico">{s.icon}</span>
							<h3>{t(s.title)}</h3>
							<p>{t(s.copy)}</p>
							<span className="sv-cta">
								{t(s.cta)}
								<svg aria-hidden="true" viewBox="0 0 24 24">
									<path d="M5 12h13M13 6l6 6-6 6" />
								</svg>
							</span>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
};

export default GthServices;
