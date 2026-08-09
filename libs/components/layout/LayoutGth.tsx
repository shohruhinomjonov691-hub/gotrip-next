import React, { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Stack } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { getJwtToken, updateUserInfo } from '../../auth';
import { ensureMessagingSocket } from '../../messagingSocket';
import GoTripAI from '../gotripAI/GoTripAI';
import GthHeader from '../homepage-html/GthHeader';
import GthFooter from '../homepage-html/GthFooter';
import { useTranslation } from '../../i18n/useTranslation';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

/**
 * Shared layout for the non-Home public pages. Uses the exact same GthHeader /
 * GthFooter the Home page uses and mounts everything inside `.gth-root` so the
 * Home design tokens (scss/pc/homepage-html/_tokens.scss) apply identically.
 *
 * Instead of the Home hero it renders a compact breadcrumb banner, configured
 * per route below.
 */

interface BannerConfig {
	title: string;
	desc: string;
	image: string;
	crumb: string;
}

const BANNERS: Record<string, BannerConfig> = {
	'/tour': {
		title: 'Popular Tours',
		desc: 'Guided journeys, private routes and destination experiences.',
		image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=2000&q=80',
		crumb: 'Popular Tours',
	},
	'/tour/detail': {
		title: 'Tour Details',
		desc: 'Everything included, day by day.',
		image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=2000&q=80',
		crumb: 'Tour Detail',
	},
	'/agent': {
		title: 'Tour Guides',
		desc: 'Licensed local guides and operators behind every GoTrip route.',
		image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=2000&q=80',
		crumb: 'Guides',
	},
	'/agent/detail': {
		title: 'Guide Profile',
		desc: 'Experience, specialities and published tours.',
		image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=2000&q=80',
		crumb: 'Guide Detail',
	},
	'/community': {
		title: 'Community',
		desc: 'Stories, tips and news from travellers and guides.',
		image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=2000&q=80',
		crumb: 'Community',
	},
	'/community/detail': {
		title: 'Article',
		desc: 'From the GoTrip community.',
		image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=2000&q=80',
		crumb: 'Article',
	},
	'/cs': {
		title: 'Support',
		desc: 'Answers, contact details and a direct line to our team.',
		image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80',
		crumb: 'Support',
	},
};

const withLayoutGth = (Component: any) => {
	return (props: any) => {
		const { t } = useTranslation();
		const router = useRouter();
		const device = useDeviceDetect();
		const banner = BANNERS[router.pathname];

		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
			/* Open the messaging socket once per session, at the layout level, so
			   socketVar is populated for every consumer (Chat, MessagesCenter) the
			   way Apollo's transport used to do — but with reconnect. */
			if (jwt) ensureMessagingSocket();
		}, []);

		return (
			<>
				<Head>
					<title>{banner ? `${t(banner.title)} — GoTrip` : 'GoTrip — Explore World'}</title>
					<meta content={banner ? t(banner.desc) : 'GoTrip — Explore World'} name="title" />
				</Head>
				<Stack id={device === 'mobile' ? 'mobile-wrap' : 'pc-wrap'}>
					<div className="gth-root">
						<GthHeader />

						{banner && (
							<section className="pg-hero">
								<div className="pg-hero-media">
									<img alt="" src={banner.image} />
								</div>
								<div className="wrap pg-hero-inner">
									<h1>{t(banner.title)}</h1>
									<nav className="pg-crumb">
										<Link href="/">{t('Home')}</Link>
										<svg className="ico" viewBox="0 0 24 24">
											<path d="M5 12h14M13 6l6 6-6 6" />
										</svg>
										<span>{t(banner.crumb)}</span>
									</nav>
									<p>{t(banner.desc)}</p>
								</div>
							</section>
						)}

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<GthFooter />
					</div>

					<GoTripAI />
				</Stack>
			</>
		);
	};
};

export default withLayoutGth;
