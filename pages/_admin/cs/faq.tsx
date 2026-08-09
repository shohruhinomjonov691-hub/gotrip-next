import React from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { NextPage } from 'next';
import Link from 'next/link';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { Box, Stack, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useTranslation } from '../../../libs/i18n/useTranslation';

const FaqArticles: NextPage = () => {
	const { t } = useTranslation();
	return (
		<Box component="section" className="content admin-unavailable-page">
			<Stack className="admin-unavailable-panel" spacing={2}>
				<Typography className="admin-unavailable__eyebrow">{t('Help center')}</Typography>
				<Typography component="h1" className="admin-title">
					{t('FAQ administration unavailable')}
				</Typography>
				<Typography className="admin-unavailable__copy">
					{t('FAQ and inquiry administration is not separately backed yet. Use Notices with categories FAQ, TERMS, and INQUIRY from /_admin/cs/notice.')}
				</Typography>
				<Link href="/_admin/cs/notice" className="admin-unavailable__link">
					{t('Open Notices')}
					<ArrowForwardRoundedIcon />
				</Link>
			</Stack>
		</Box>
	);
};

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

export default withAdminLayout(FaqArticles);
