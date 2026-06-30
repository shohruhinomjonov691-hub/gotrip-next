import React from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { Box, Stack, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

const FaqArticles: NextPage = () => {
	return (
		<Box component="section" className="content admin-unavailable-page">
			<Stack className="admin-unavailable-panel" spacing={2}>
				<Typography className="admin-unavailable__eyebrow">Help center</Typography>
				<Typography component="h1" className="admin-title">
					FAQ administration unavailable
				</Typography>
				<Typography className="admin-unavailable__copy">
					FAQ and inquiry administration is not separately backed yet. Use Notices with categories FAQ, TERMS, and INQUIRY from /_admin/cs/notice.
				</Typography>
				<Link href="/_admin/cs/notice" className="admin-unavailable__link">
					Open Notices
					<ArrowForwardRoundedIcon />
				</Link>
			</Stack>
		</Box>
	);
};

export default withAdminLayout(FaqArticles);
