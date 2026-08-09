import React, { useState } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client';
import {
	Avatar,
	Button,
	Chip,
	Rating,
	Stack,
	Tab,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tabs,
	Typography,
} from '@mui/material';
import moment from 'moment';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { GET_ALL_TESTIMONIALS_BY_ADMIN } from '../../../apollo/admin/query';
import {
	APPROVE_TESTIMONIAL_BY_ADMIN,
	DELETE_TESTIMONIAL_BY_ADMIN,
	REJECT_TESTIMONIAL_BY_ADMIN,
} from '../../../apollo/admin/mutation';
import { TestimonialStatus } from '../../../libs/enums/testimonial.enum';
import { Direction } from '../../../libs/enums/common.enum';
import { Testimonial } from '../../../libs/types/testimonial/testimonial';
import { getImageUrl } from '../../../libs/config';
import { sweetConfirmAlert, sweetErrorHandling, sweetMixinSuccessAlert } from '../../../libs/sweetAlert';
import { useTranslation } from '../../../libs/i18n/useTranslation';

/**
 * Testimonial moderation.
 *
 * Self-service submissions from the Support page land as PENDING and had no
 * admin surface until now. Uses only existing operations:
 *   getAllTestimonialsByAdmin / approve / reject / deleteTestimonialByAdmin
 */

const TABS: { label: string; value: TestimonialStatus }[] = [
	{ label: 'Pending', value: TestimonialStatus.PENDING },
	{ label: 'Approved', value: TestimonialStatus.APPROVED },
	{ label: 'Rejected', value: TestimonialStatus.REJECTED },
];

const LIMIT = 20;

const AdminTestimonials: NextPage = () => {
	const { t } = useTranslation();
	const [status, setStatus] = useState<TestimonialStatus>(TestimonialStatus.PENDING);
	const [page, setPage] = useState(1);

	const input = {
		page,
		limit: LIMIT,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: { testimonialStatus: status },
	};

	const { data, loading, error, refetch } = useQuery(GET_ALL_TESTIMONIALS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
		variables: { input },
	});

	const rows: Testimonial[] = data?.getAllTestimonialsByAdmin?.list ?? [];
	const total: number = data?.getAllTestimonialsByAdmin?.metaCounter?.[0]?.total ?? 0;
	const pages = Math.ceil(total / LIMIT) || 1;

	const [approve, { loading: a }] = useMutation(APPROVE_TESTIMONIAL_BY_ADMIN);
	const [reject, { loading: r }] = useMutation(REJECT_TESTIMONIAL_BY_ADMIN);
	const [remove, { loading: d }] = useMutation(DELETE_TESTIMONIAL_BY_ADMIN);
	const busy = a || r || d;

	const run = async (fn: () => Promise<unknown>, msg: string) => {
		try {
			await fn();
			await refetch({ input });
			await sweetMixinSuccessAlert(msg);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const deleteHandler = async (testimonialId: string) => {
		if (!(await sweetConfirmAlert(t('Delete this testimonial permanently?') as string))) return;
		await run(() => remove({ variables: { testimonialId } }), t('Testimonial deleted.'));
	};

	return (
		<Stack className="admin-page content">
			<Stack className="admin-page__heading">
				<Typography className="admin-kicker">{t('Platform control')}</Typography>
				<Typography className="admin-title" component="h1">
					{t('Testimonials')}
				</Typography>
				<Typography className="admin-copy">
					{t('Traveller testimonials submitted from the Support page arrive here as pending. Approving publishes them to the Home page.')}
				</Typography>
			</Stack>

			<Tabs
				className="admin-tabs"
				onChange={(_: React.SyntheticEvent, v: TestimonialStatus) => {
					setStatus(v);
					setPage(1);
				}}
				value={status}
			>
				{TABS.map((tab) => (
					<Tab key={tab.value} label={t(tab.label)} value={tab.value} />
				))}
			</Tabs>

			<Typography className="admin-page__count">
				{loading && rows.length === 0 ? t('Loading…') : t('{{count}} testimonials', { count: total })}
			</Typography>

			{error && rows.length === 0 && !loading && (
				<div className="admin-empty">
					{t('Could not load testimonials.')}
					<Button onClick={() => refetch({ input })}>{t('Retry')}</Button>
				</div>
			)}

			{!loading && !error && rows.length === 0 && (
				<div className="admin-empty">{t('No {{status}} testimonials.', { status: t(status) })}</div>
			)}

			{rows.length > 0 && (
				<TableContainer>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>{t('About the author')}</TableCell>
								<TableCell>{t('Rating')}</TableCell>
								<TableCell>{t('Testimonials')}</TableCell>
								<TableCell>{t('Submitted')}</TableCell>
								<TableCell>{t('Status')}</TableCell>
								<TableCell align="right">{t('Actions')}</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{rows.map((item) => (
								<TableRow key={item._id}>
									<TableCell>
										<Stack alignItems="center" direction="row" spacing={1.5}>
											<Avatar alt={item.authorName} src={getImageUrl(item.authorImage, '/img/profile/defaultUser.svg')} />
											<div>
												<strong>{item.authorName}</strong>
												{item.authorRole && (
													<Typography className="admin-cell-copy" variant="body2">
														{item.authorRole}
													</Typography>
												)}
											</div>
										</Stack>
									</TableCell>
									<TableCell>
										{item.testimonialRating ? (
											<Rating readOnly size="small" value={item.testimonialRating} />
										) : (
											<Typography className="admin-cell-copy" variant="body2">
												—
											</Typography>
										)}
									</TableCell>
									<TableCell sx={{ maxWidth: 420 }}>
										<Typography className="admin-cell-copy" variant="body2">
											{item.testimonialContent}
										</Typography>
									</TableCell>
									<TableCell>
										<Typography className="admin-cell-copy" variant="body2">
											{moment(item.createdAt).format('DD MMM YYYY')}
										</Typography>
									</TableCell>
									<TableCell>
										<Chip
											color={
												item.testimonialStatus === TestimonialStatus.APPROVED
													? 'success'
													: item.testimonialStatus === TestimonialStatus.REJECTED
														? 'error'
														: 'warning'
											}
											label={t(item.testimonialStatus)}
											size="small"
										/>
									</TableCell>
									<TableCell align="right">
										<Stack direction="row" justifyContent="flex-end" spacing={1}>
											{item.testimonialStatus !== TestimonialStatus.APPROVED && (
												<Button
													className="admin-action-button admin-action-button--success"
													disabled={busy}
													onClick={() =>
														run(() => approve({ variables: { testimonialId: item._id } }), t('Testimonial published.'))
													}
												>
													{t('Approve')}
												</Button>
											)}
											{item.testimonialStatus !== TestimonialStatus.REJECTED && (
												<Button
													className="admin-action-button admin-action-button--warning"
													disabled={busy}
													onClick={() =>
														run(() => reject({ variables: { testimonialId: item._id } }), t('Testimonial rejected.'))
													}
												>
													{t('Reject')}
												</Button>
											)}
											<Button
												className="admin-action-button admin-action-button--danger"
												disabled={busy}
												onClick={() => deleteHandler(item._id)}
											>
												{t('Delete')}
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

export default withAdminLayout(AdminTestimonials);
