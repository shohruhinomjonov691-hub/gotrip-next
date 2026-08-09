import React, { useState } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client';
import {
	Avatar,
	Button,
	Chip,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tab,
	Tabs,
	Typography,
} from '@mui/material';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { GET_AGENT_REQUESTS_BY_ADMIN } from '../../../apollo/admin/query';
import {
	APPROVE_AGENT_REQUEST_BY_ADMIN,
	REJECT_AGENT_REQUEST_BY_ADMIN,
} from '../../../apollo/admin/mutation';
import { AgentRequestStatus } from '../../../libs/enums/member.enum';
import { Direction } from '../../../libs/enums/common.enum';
import { Member } from '../../../libs/types/member/member';
import { getImageUrl } from '../../../libs/config';
import { sweetErrorHandling, sweetMixinSuccessAlert } from '../../../libs/sweetAlert';
import { useTranslation } from '../../../libs/i18n/useTranslation';

/**
 * Guide Requests — admin review screen for the existing agent-request workflow.
 *
 * Uses only operations that already exist server-side:
 *   getAgentRequestsByAdmin / approveAgentRequestByAdmin / rejectAgentRequestByAdmin
 *
 * Approving flips memberType to AGENT — that rule lives in member.service and is
 * not reimplemented here. Both mutations only accept a memberId, so there is no
 * admin-side reason field to capture (see the note under the table).
 */

const TABS: { label: string; value: AgentRequestStatus }[] = [
	{ label: 'Pending', value: AgentRequestStatus.PENDING },
	{ label: 'Approved', value: AgentRequestStatus.APPROVED },
	{ label: 'Rejected', value: AgentRequestStatus.REJECTED },
];

const LIMIT = 20;

const AdminGuideRequests: NextPage = () => {
	const { t } = useTranslation();
	const [status, setStatus] = useState<AgentRequestStatus>(AgentRequestStatus.PENDING);
	const [page, setPage] = useState(1);

	const input = {
		page,
		limit: LIMIT,
		sort: 'updatedAt',
		direction: Direction.DESC,
		search: { agentRequestStatus: status },
	};

	const { data, loading, error, refetch } = useQuery(GET_AGENT_REQUESTS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
		variables: { input },
	});

	const rows: Member[] = data?.getAgentRequestsByAdmin?.list ?? [];
	const total: number = data?.getAgentRequestsByAdmin?.metaCounter?.[0]?.total ?? 0;
	const pages = Math.ceil(total / LIMIT) || 1;

	const [approve, { loading: approving }] = useMutation(APPROVE_AGENT_REQUEST_BY_ADMIN);
	const [reject, { loading: rejecting }] = useMutation(REJECT_AGENT_REQUEST_BY_ADMIN);
	const busy = approving || rejecting;

	const approveHandler = async (memberId: string, nick?: string) => {
		try {
			await approve({ variables: { memberId } });
			await refetch({ input });
			await sweetMixinSuccessAlert(t('{{name}} is now a guide.', { name: nick ?? t('Member') }));
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const rejectHandler = async (memberId: string, nick?: string) => {
		try {
			await reject({ variables: { memberId } });
			await refetch({ input });
			await sweetMixinSuccessAlert(t('Application from {{name}} was rejected.', { name: nick ?? t('member') }));
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	return (
		<Stack className="admin-page content">
			<Stack className="admin-page__heading">
				<Typography className="admin-kicker">{t('Platform control')}</Typography>
				<Typography className="admin-title" component="h1">
					{t('Guide requests')}
				</Typography>
				<Typography className="admin-copy">
					{t('Review applications from travellers who want to publish tours. Approving promotes the account to AGENT.')}
				</Typography>
			</Stack>

			<Tabs
				className="admin-tabs"
				onChange={(_: React.SyntheticEvent, v: AgentRequestStatus) => {
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
				{loading && rows.length === 0 ? t('Loading…') : t('{{count}} applications', { count: total })}
			</Typography>

			{error && rows.length === 0 && !loading && (
				<div className="admin-empty">
					{t('Could not load applications.')}
					<Button onClick={() => refetch({ input })}>{t('Retry')}</Button>
				</div>
			)}

			{!loading && !error && rows.length === 0 && (
				<div className="admin-empty">{t('No {{status}} applications.', { status: t(status) })}</div>
			)}

			{rows.length > 0 && (
				<TableContainer>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>{t('Applicant')}</TableCell>
								<TableCell>{t('Contact')}</TableCell>
								<TableCell>{t('Why they want to guide')}</TableCell>
								<TableCell>{t('Experience')}</TableCell>
								<TableCell>{t('Status')}</TableCell>
								<TableCell align="right">{t('Actions')}</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{rows.map((m) => (
								<TableRow key={m._id}>
									<TableCell>
										<Stack alignItems="center" direction="row" spacing={1.5}>
											<Avatar
												alt={m.memberNick}
												src={getImageUrl(m.memberImage)}
											/>
											<div>
												<strong>{m.memberFullName || m.memberNick}</strong>
												<Typography className="admin-cell-copy" variant="body2">
													@{m.memberNick} · {t(m.memberType)}
												</Typography>
											</div>
										</Stack>
									</TableCell>
									<TableCell>
										<Typography className="admin-cell-copy" variant="body2">
											{m.memberPhone || '—'}
										</Typography>
										<Typography className="admin-cell-copy" variant="body2">
											{m.memberAddress || '—'}
										</Typography>
									</TableCell>
									<TableCell sx={{ maxWidth: 320 }}>
										<Typography className="admin-cell-copy" variant="body2">
											{m.agentRequestMessage || '—'}
										</Typography>
									</TableCell>
									<TableCell sx={{ maxWidth: 260 }}>
										<Typography className="admin-cell-copy" variant="body2">
											{m.agentExperience || '—'}
										</Typography>
									</TableCell>
									<TableCell>
										<Chip
											color={
												m.agentRequestStatus === AgentRequestStatus.APPROVED
													? 'success'
													: m.agentRequestStatus === AgentRequestStatus.REJECTED
														? 'error'
														: 'warning'
											}
											label={m.agentRequestStatus ? t(m.agentRequestStatus) : ''}
											size="small"
										/>
									</TableCell>
									<TableCell align="right">
										{status === AgentRequestStatus.PENDING ? (
											<Stack direction="row" justifyContent="flex-end" spacing={1}>
												<Button
													className="admin-action-button admin-action-button--success"
													disabled={busy}
													onClick={() => approveHandler(m._id, m.memberNick)}
												>
													{t('Approve')}
												</Button>
												<Button
													className="admin-action-button admin-action-button--warning"
													disabled={busy}
													onClick={() => rejectHandler(m._id, m.memberNick)}
												>
													{t('Reject')}
												</Button>
											</Stack>
										) : (
											<Typography className="admin-cell-copy" variant="body2">
												{t('Reviewed')}
											</Typography>
										)}
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

			<Typography className="admin-copy admin-note">
				{t('Note: approve and reject take only a member id — the backend stores no admin rejection reason, so none is captured here. A rejected applicant may apply again.')}
			</Typography>
		</Stack>
	);
};

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

export default withAdminLayout(AdminGuideRequests);
