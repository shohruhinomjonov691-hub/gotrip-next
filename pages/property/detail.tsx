import React, { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Stack, Typography } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutFull from '../../libs/components/layout/LayoutFull';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const TourDetailRedirectCompatibilityPage: NextPage = () => {
	const router = useRouter();

	useEffect(() => {
		if (!router.isReady) return;
		const id = router.query.id;
		const nextPath = id ? `/tour/detail?id=${id}` : '/tour';
		router.replace(nextPath).then();
	}, [router]);

	return (
		<Stack alignItems="center" justifyContent="center" sx={{ minHeight: 420 }}>
			<Typography>Opening tour details...</Typography>
		</Stack>
	);
};

export default withLayoutFull(TourDetailRedirectCompatibilityPage);
