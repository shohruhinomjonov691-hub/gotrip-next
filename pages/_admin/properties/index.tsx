import React, { useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Box, Typography } from '@mui/material';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';

const AdminToursRedirect: NextPage = () => {
	const router = useRouter();

	useEffect(() => {
		router.replace('/_admin/tours').then();
	}, [router]);

	return (
		<Box component="div" className="content">
			<Typography variant="h2" className="tit" sx={{ mb: '12px' }}>
				Tour Management
			</Typography>
			<Typography>Redirecting to tour management...</Typography>
		</Box>
	);
};

export default withAdminLayout(AdminToursRedirect);
