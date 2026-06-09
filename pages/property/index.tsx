import React, { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Stack, Typography } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const PropertyCompatibilityPage: NextPage = () => {
	const router = useRouter();

	useEffect(() => {
		router.replace('/tour').then();
	}, [router]);

	return (
		<Stack alignItems="center" justifyContent="center" sx={{ minHeight: 420 }}>
			<Typography>Opening tours...</Typography>
		</Stack>
	);
};

export default withLayoutBasic(PropertyCompatibilityPage);
