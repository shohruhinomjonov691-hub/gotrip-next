import React, { useEffect } from 'react';
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

const withLayoutMain = (Component: any) => {
	return (props: any) => {
		const device = useDeviceDetect();

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

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
