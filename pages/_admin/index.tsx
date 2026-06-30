import React from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { Button, Stack, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import withAdminLayout from '../../libs/components/layout/LayoutAdmin';
import {
	GET_ALL_BOOKINGS_BY_ADMIN,
	GET_ALL_DESTINATIONS_BY_ADMIN,
	GET_ALL_MEMBERS_BY_ADMIN,
	GET_ALL_PAYMENTS_BY_ADMIN,
	GET_ALL_TOURS_BY_ADMIN,
} from '../../apollo/admin/query';
import { Direction } from '../../libs/enums/common.enum';
import { T } from '../../libs/types/common';

const totalInput = { page: 1, limit: 1, sort: 'createdAt', direction: Direction.DESC, search: {} };

interface AdminDashboardCard {
	label: string;
	value: unknown;
	href?: string;
	available?: boolean;
}

const AdminHome: NextPage = () => {
	const { data: membersData } = useQuery(GET_ALL_MEMBERS_BY_ADMIN, { variables: { input: totalInput } });
	const { data: toursData } = useQuery(GET_ALL_TOURS_BY_ADMIN, { variables: { input: totalInput } });
	const { data: destinationsData } = useQuery(GET_ALL_DESTINATIONS_BY_ADMIN, { variables: { input: totalInput } });
	const { data: bookingsData } = useQuery(GET_ALL_BOOKINGS_BY_ADMIN, { variables: { input: totalInput } });
	const { data: paymentsData } = useQuery(GET_ALL_PAYMENTS_BY_ADMIN, { variables: { input: totalInput } });

	const cards: AdminDashboardCard[] = [
		{
			label: 'Members',
			value: (membersData as T)?.getAllMembersByAdmin?.metaCounter?.[0]?.total,
			href: '/_admin/users',
		},
		{
			label: 'Tours',
			value: (toursData as T)?.getAllToursByAdmin?.metaCounter?.[0]?.total,
			href: '/_admin/tours',
		},
		{
			label: 'Destinations',
			value: (destinationsData as T)?.getAllDestinationsByAdmin?.metaCounter?.[0]?.total,
			href: '/_admin/destinations',
		},
		{
			label: 'Bookings',
			value: (bookingsData as T)?.getAllBookingsByAdmin?.metaCounter?.[0]?.total,
			href: '/_admin/bookings',
		},
		{
			label: 'Payments',
			value: (paymentsData as T)?.getAllPaymentsByAdmin?.metaCounter?.[0]?.total,
			href: '/_admin/payments',
		},
	];

	return (
		<Stack className="admin-dashboard content">
			<Stack className="admin-dashboard-hero">
				<Typography className="admin-kicker">GoTrip operations</Typography>
				<Typography className="admin-title">Admin dashboard</Typography>
				<Typography className="admin-copy">
					Monitor platform inventory and operational workload from backend-supported totals only.
				</Typography>
			</Stack>
			<div className="admin-stat-grid">
				{cards.map((card) => {
					const cardContent = (
						<div className={card.available === false ? 'admin-stat-card admin-stat-card--unavailable' : 'admin-stat-card'}>
							<span>{card.label}</span>
							<strong>{typeof card.value === 'number' ? card.value : '...'}</strong>
							{card.available === false ? (
								<>
									<em>Unavailable</em>
									<Button className="admin-stat-card__unavailable-action" disabled>
										Coming soon
									</Button>
								</>
							) : (
								<em>Open section</em>
							)}
						</div>
					);

					return card.href ? (
						<Link href={card.href} key={card.label}>
							{cardContent}
						</Link>
					) : (
						<div key={card.label} className="admin-stat-card__unavailable-wrap" aria-label={`${card.label} administration is unavailable`}>
							{cardContent}
						</div>
					);
				})}
			</div>
			<Stack className="admin-workbench" direction={{ xs: 'column', md: 'row' }} gap={2}>
				<div className="admin-workbench-panel">
					<Typography className="admin-panel-title">Operational focus</Typography>
					<Typography className="admin-panel-copy">
						Review users and guide requests, manage tour inventory, moderate community content, and check customer
						support content from the existing admin routes.
					</Typography>
					<Link href="/_admin/users/agent-requests">
						<Button className="gt-primary-button" endIcon={<ArrowForwardRoundedIcon />}>
							Review guide requests
						</Button>
					</Link>
				</div>
				<div className="admin-workbench-panel muted">
					<Typography className="admin-panel-title">Analytics limitations</Typography>
					<Typography className="admin-panel-copy">
						{/* TODO(gotrip-backend): expose revenue totals, conversion rates, cancellation ratios, and time-series analytics. */}
						Revenue, conversion, cancellation, and time-series charts need backend aggregate fields before they can be
						displayed safely.
					</Typography>
				</div>
			</Stack>
		</Stack>
	);
};

export default withAdminLayout(AdminHome);
