import React, { useState } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client';
import {
	Avatar,
	Button,
	Chip,
	MenuItem,
	Select,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { GET_ALL_DESTINATIONS_BY_ADMIN } from '../../../apollo/admin/query';
import { REMOVE_DESTINATION_BY_ADMIN, UPDATE_DESTINATION_BY_ADMIN } from '../../../apollo/admin/mutation';
import { DestinationStatus } from '../../../libs/enums/destination.enum';
import { Direction } from '../../../libs/enums/common.enum';
import { Destination } from '../../../libs/types/destination/destination';
import { getImageUrl } from '../../../libs/config';
import { sweetConfirmAlert, sweetErrorHandling, sweetMixinSuccessAlert } from '../../../libs/sweetAlert';
import { useTranslation } from '../../../libs/i18n/useTranslation';

/**
 * Destination catalogue.
 *
 * Publish / hide is the existing destinationStatus field driven through
 * updateDestinationByAdmin — no new status concept is introduced.
 */

const LIMIT = 20;
const STATUSES = Object.values(DestinationStatus);

const AdminDestinations: NextPage = () => {
	const { t } = useTranslation();
	const [status, setStatus] = useState<DestinationStatus | ''>('');
	const [page, setPage] = useState(1);

	const input = {
		page,
		limit: LIMIT,
		sort: 'destinationRank',
		direction: Direction.DESC,
		search: status ? { destinationStatus: status } : {},
	};

	const { data, loading, error, refetch } = useQuery(GET_ALL_DESTINATIONS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
		variables: { input },
	});

	const rows: Destination[] = data?.getAllDestinationsByAdmin?.list ?? [];
	const total: number = data?.getAllDestinationsByAdmin?.metaCounter?.[0]?.total ?? 0;
	const pages = Math.ceil(total / LIMIT) || 1;

	const [update, { loading: updating }] = useMutation(UPDATE_DESTINATION_BY_ADMIN);
	const [remove, { loading: removing }] = useMutation(REMOVE_DESTINATION_BY_ADMIN);
	const busy = updating || removing;

	const setStatusHandler = async (_id: string, destinationStatus: DestinationStatus) => {
		try {
			await update({ variables: { input: { _id, destinationStatus } } });
			await refetch({ input });
			await sweetMixinSuccessAlert(t('Destination set to {{status}}.', { status: t(destinationStatus) }));
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const removeHandler = async (destinationId: string) => {
		if (!(await sweetConfirmAlert(t('Remove this destination?') as string))) return;
		try {
			await remove({ variables: { destinationId } });
			await refetch({ input });
			await sweetMixinSuccessAlert(t('Destination removed.'));
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	return (
		<Stack className="admin-page content admin-table-cards">
			<Stack className="admin-page__heading">
				<Typography className="admin-kicker">{t('Platform control')}</Typography>
				<Typography className="admin-title" component="h1">
					{t('Destinations')}
				</Typography>
				<Typography className="admin-copy">
					{t('The destination catalogue behind the Home rail and tour filters. Status controls public visibility.')}
				</Typography>
			</Stack>

			<Stack alignItems="center" className="admin-filters" direction="row" spacing={2}>
				<Typography className="admin-cell-copy">{t('Status')}</Typography>
				<Select
					onChange={(e) => {
						setStatus(e.target.value as DestinationStatus | '');
						setPage(1);
					}}
					size="small"
					value={status}
				>
					<MenuItem value="">{t('All statuses')}</MenuItem>
					{STATUSES.map((s) => (
						<MenuItem key={s} value={s}>
							{t(s)}
						</MenuItem>
					))}
				</Select>
				<Typography className="admin-page__count">
					{loading && rows.length === 0 ? t('Loading…') : t('{{count}} destinations', { count: total })}
				</Typography>
			</Stack>

			{error && rows.length === 0 && !loading && (
				<div className="admin-empty">
					{t('Could not load destinations.')}
					<Button onClick={() => refetch({ input })}>{t('Retry')}</Button>
				</div>
			)}

			{!loading && !error && rows.length === 0 && <div className="admin-empty">{t('No destinations found.')}</div>}

			{rows.length > 0 && (
				<TableContainer>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>{t('Destination')}</TableCell>
								<TableCell>{t('Location')}</TableCell>
								<TableCell align="right">{t('Tours')}</TableCell>
								<TableCell align="right">{t('Views')}</TableCell>
								<TableCell align="right">{t('Likes')}</TableCell>
								<TableCell>{t('Status')}</TableCell>
								<TableCell align="right">{t('Actions')}</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{rows.map((d) => (
								<TableRow key={d._id}>
									{/* data-label drives the mobile card layout — see Categories. */}
									<TableCell data-col="identity" data-label={t('Destination')}>
										<Stack alignItems="center" direction="row" spacing={1.5}>
											<Avatar alt={d.destinationTitle} src={getImageUrl(d.destinationThumbnail)} variant="rounded" />
											<div>
												<strong>{d.destinationTitle}</strong>
												<Typography className="admin-cell-copy" variant="body2">
													{d.locationKey ? t(d.locationKey) : '—'}
												</Typography>
											</div>
										</Stack>
									</TableCell>
									<TableCell data-label={t('Location')}>
										<Typography className="admin-cell-copy" variant="body2">
											{d.destinationCity}, {d.destinationCountry}
										</Typography>
									</TableCell>
									<TableCell align="right" data-label={t('Tours')}>
										{d.tourCount ?? 0}
									</TableCell>
									<TableCell align="right" data-label={t('Views')}>
										{d.destinationViews}
									</TableCell>
									<TableCell align="right" data-label={t('Likes')}>
										{d.destinationLikes}
									</TableCell>
									<TableCell data-label={t('Status')}>
										<Chip
											color={d.destinationStatus === DestinationStatus.ACTIVE ? 'success' : 'warning'}
											label={t(d.destinationStatus)}
											size="small"
										/>
									</TableCell>
									<TableCell align="right" data-col="actions" data-label={t('Actions')}>
										<Stack direction="row" justifyContent="flex-end" spacing={1}>
											{d.destinationStatus === DestinationStatus.ACTIVE ? (
												<Button
													className="admin-action-button admin-action-button--neutral"
													disabled={busy}
													onClick={() => setStatusHandler(d._id, DestinationStatus.PAUSED)}
												>
													{t('Hide')}
												</Button>
											) : (
												<Button
													className="admin-action-button admin-action-button--success"
													disabled={busy}
													onClick={() => setStatusHandler(d._id, DestinationStatus.ACTIVE)}
												>
													{t('Publish')}
												</Button>
											)}
											<Button
												className="admin-action-button admin-action-button--danger"
												disabled={busy}
												onClick={() => removeHandler(d._id)}
											>
												{t('Remove')}
											</Button>
										</Stack>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			)}

			{pages > 1 && (
				<Stack alignItems="center" className="admin-pager" direction="row" justifyContent="center" spacing={1}>
					<Button disabled={page <= 1} onClick={() => setPage(page - 1)}>
						{t('Prev')}
					</Button>
					<Typography className="admin-cell-copy">
						{t('Page {{page}} of {{pages}}', { page, pages })}
					</Typography>
					<Button disabled={page >= pages} onClick={() => setPage(page + 1)}>
						{t('Next')}
					</Button>
				</Stack>
			)}
		</Stack>
	);
};

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

export default withAdminLayout(AdminDestinations);
