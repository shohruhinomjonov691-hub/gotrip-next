import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import { Stack } from '@mui/material';
import { getJwtToken, updateUserInfo } from '../../auth';
import GoTripAI from '../gotripAI/GoTripAI';
import GthHeader from '../homepage-html/GthHeader';
import GthHero from '../homepage-html/GthHero';
import GthFooter from '../homepage-html/GthFooter';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const ABOUT_HASH = '#about-us';
const ABOUT_ID = 'about-us';

const withLayoutMain = (Component: any) => {
	return (props: any) => {
		const device = useDeviceDetect();
		const router = useRouter();

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		/* Footer's "About Us" link is `/#about-us`. Two things fight the scroll
		 * this needs:
		 *  1. The sections above GthAbout (Stats/Categories/Destinations) fetch
		 *     their own data and keep growing the page height for a while after
		 *     mount, so scrolling too early lands short of the target once more
		 *     content loads in above it — the same reason useScrollRestoration
		 *     (a separate, existing hook) retries instead of jumping once.
		 *  2. That same hook resets scroll to 0 on routeChangeComplete for this
		 *     navigation — it can't tell a hash-only change from a real page
		 *     change, both look like "same path before and after".
		 * Waiting for the page height to stop changing before scrolling (and
		 * forcing it after a bounded number of attempts either way) lets this
		 * land as the final, correct word without touching that unrelated,
		 * already-working hook. */
		useEffect(() => {
			if (!router.asPath.includes(ABOUT_HASH)) return;

			let cancelled = false;
			let attempts = 0;
			let lastHeight = -1;
			let timer: ReturnType<typeof setTimeout>;

			const settle = () => {
				if (cancelled) return;
				const height = document.body.scrollHeight;
				const stable = height === lastHeight;
				lastHeight = height;
				attempts += 1;

				if (stable || attempts >= 15) {
					document.getElementById(ABOUT_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
					return;
				}
				timer = setTimeout(settle, 150);
			};

			timer = setTimeout(settle, 50);
			return () => {
				cancelled = true;
				clearTimeout(timer);
			};
		}, [router.asPath]);

		return (
			<>
				<Head>
					<title>GoTrip — Explore World</title>
					<meta name={'title'} content={`GoTrip — Explore World`} />
				</Head>
				<Stack id={device === 'mobile' ? 'mobile-wrap' : 'pc-wrap'}>
					<div className="gth-root">
						<GthHeader />
						<GthHero />

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

export default withLayoutMain;
