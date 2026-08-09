import React from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { Button, Stack, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import withAdminLayout from '../../libs/components/layout/LayoutAdmin';
import { useTranslation } from '../../libs/i18n/useTranslation';
import { GET_ALL_MEMBERS_BY_ADMIN, GET_ALL_TOURS_BY_ADMIN } from '../../apollo/admin/query';
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
	const { t } = useTranslation();
	const { data: membersData } = useQuery(GET_ALL_MEMBERS_BY_ADMIN, { variables: { input: totalInput } });
	const { data: toursData } = useQuery(GET_ALL_TOURS_BY_ADMIN, { variables: { input: totalInput } });

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
	];

	return (
		<Stack className="admin-dashboard content">
			<Stack className="admin-dashboard-hero">
				<Typography className="admin-kicker">{t('GoTrip operations')}</Typography>
				<Typography className="admin-title">{t('Admin dashboard')}</Typography>
				<Typography className="admin-copy">
					{t('Monitor platform inventory and operational workload from backend-supported totals only.')}
				</Typography>
			</Stack>
			<div className="admin-stat-grid">
				{cards.map((card) => {
					const cardContent = (
						<div className={card.available === false ? 'admin-stat-card admin-stat-card--unavailable' : 'admin-stat-card'}>
							<span>{t(card.label)}</span>
							<strong>{typeof card.value === 'number' ? card.value : '...'}</strong>
							{card.available === false ? (
								<>
									<em>{t('Unavailable')}</em>
									<Button className="admin-stat-card__unavailable-action" disabled>
										{t('Coming soon')}
									</Button>
								</>
							) : (
								<em>{t('Open section')}</em>
							)}
						</div>
					);

					return card.href ? (
						<Link href={card.href} key={card.label}>
							{cardContent}
						</Link>
					) : (
						<div key={card.label} className="admin-stat-card__unavailable-wrap" aria-label={t('{{label}} administration is unavailable', { label: card.label }) as string}>
							{cardContent}
						</div>
					);
				})}
			</div>
			<Stack className="admin-workbench" direction={{ xs: 'column', md: 'row' }} gap={2}>
				<div className="admin-workbench-panel">
					<Typography className="admin-panel-title">{t('Operational focus')}</Typography>
					<Typography className="admin-panel-copy">
						{t('Manage users, tour inventory, moderate community content, and check customer support content from the existing admin routes.')}
					</Typography>
					<Link href="/_admin/users">
						<Button className="gt-primary-button" endIcon={<ArrowForwardRoundedIcon />}>
							{t('Manage users')}
						</Button>
					</Link>
				</div>
				<div className="admin-workbench-panel muted">
					<Typography className="admin-panel-title">{t('Analytics limitations')}</Typography>
					<Typography className="admin-panel-copy">
						{/* TODO(gotrip-backend): expose revenue totals, conversion rates, cancellation ratios, and time-series analytics. */}
						{t('Revenue, conversion, cancellation, and time-series charts need backend aggregate fields before they can be displayed safely.')}
					</Typography>
				</div>
			</Stack>
		</Stack>
	);
};

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

export default withAdminLayout(AdminHome);
