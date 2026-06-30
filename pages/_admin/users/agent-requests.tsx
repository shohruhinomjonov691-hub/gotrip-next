import React, { useState } from 'react';
import type { NextPage } from 'next';
import { Button, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import { useMutation, useQuery } from '@apollo/client';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { GET_AGENT_REQUESTS_BY_ADMIN } from '../../../apollo/admin/query';
import { REVIEW_AGENT_REQUEST_BY_ADMIN } from '../../../apollo/admin/mutation';
import { AgentRequestStatus } from '../../../libs/enums/member.enum';
import { Direction } from '../../../libs/enums/common.enum';
import { MembersInquiry } from '../../../libs/types/member/member.input';
import { Member } from '../../../libs/types/member/member';
import { T } from '../../../libs/types/common';
import { sweetErrorHandling } from '../../../libs/sweetAlert';

const requestStatusClass = (status?: string) => `admin-status admin-status--${(status ?? 'pending').toLowerCase()}`;
const rowsPerPageOptions = [10, 20, 40];
const MotionSection = motion.section;
const MotionArticle = motion.article;

const AgentRequestsAdmin: NextPage = ({ initialInquiry }: any) => {
	const [inquiry, setInquiry] = useState<MembersInquiry>(initialInquiry);
	const [members, setMembers] = useState<Member[]>([]);
	const [total, setTotal] = useState(0);
	const [processingId, setProcessingId] = useState('');
	const reduceMotion = useReducedMotion() ?? false;
	const [reviewAgentRequestByAdmin] = useMutation(REVIEW_AGENT_REQUEST_BY_ADMIN);
	const { loading, error, refetch } = useQuery(GET_AGENT_REQUESTS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setMembers(data?.getAgentRequestsByAdmin?.list ?? []);
			setTotal(data?.getAgentRequestsByAdmin?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const changePageHandler = async (_: unknown, newPage: number) => {
		const next = { ...inquiry, page: newPage + 1 };
		setInquiry(next);
		await refetch({ input: next });
	};
	const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const next = { ...inquiry, page: 1, limit: parseInt(event.target.value, 10) };
		setInquiry(next);
		await refetch({ input: next });
	};
	const reviewHandler = async (memberId: string, agentRequestStatus: AgentRequestStatus) => {
		try {
			setProcessingId(memberId);
			await reviewAgentRequestByAdmin({ variables: { input: { memberId, agentRequestStatus } } });
			await refetch({ input: inquiry });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		} finally {
			setProcessingId('');
		}
	};

	const renderHeading = (): React.ReactElement => (
		<div className="admin-page__heading">
			<div>
				<Typography component="span">Operator governance</Typography>
				<Typography component="h1">Agent requests</Typography>
				<Typography component="p">Review traveler applications to publish and manage GoTrip tours.</Typography>
			</div>
			<Typography className="admin-page__count">{total} pending</Typography>
		</div>
	);

	const renderDecisionActions = (member: Member): React.ReactElement => (
		<Stack direction="row" spacing={1} justifyContent="flex-end">
			<Button
				className="admin-action-button"
				disabled={processingId === member._id}
				onClick={() => reviewHandler(member._id, AgentRequestStatus.APPROVED)}
			>
				Approve
			</Button>
			<Button
				className="admin-action-button admin-action-button--danger"
				disabled={processingId === member._id}
				onClick={() => reviewHandler(member._id, AgentRequestStatus.REJECTED)}
			>
				Reject
			</Button>
		</Stack>
	);

	const renderDesktopRows = (): React.ReactElement[] => members.map((member) => (
		<TableRow key={member._id}>
			<TableCell>
				<div className="admin-name-cell">
					<Typography component="strong">{member.memberNick}</Typography>
					<Typography component="span">{member.memberPhone}</Typography>
				</div>
			</TableCell>
			<TableCell className="admin-cell-copy">{member.agentRequestMessage || 'No message provided.'}</TableCell>
			<TableCell className="admin-cell-copy">{member.agentExperience || 'Not provided'}</TableCell>
			<TableCell>
				<span className={requestStatusClass(member.agentRequestStatus)}>
					{member.agentRequestStatus || AgentRequestStatus.NONE}
				</span>
			</TableCell>
			<TableCell align="right">{renderDecisionActions(member)}</TableCell>
		</TableRow>
	));

	const renderMobileCards = (): React.ReactElement[] => members.map((member, index) => (
		<MotionArticle
			key={member._id}
			className="admin-mobile-card"
			initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.18, delay: reduceMotion ? 0 : Math.min(index * 0.025, 0.12) }}
		>
			<div className="admin-mobile-card__title">
				<Typography component="strong">{member.memberNick}</Typography>
				<span className={requestStatusClass(member.agentRequestStatus)}>{member.agentRequestStatus || AgentRequestStatus.NONE}</span>
			</div>
			<Typography component="p">{member.memberPhone}</Typography>
			<div className="admin-mobile-card__copy">
				<strong>Request</strong>
				<span>{member.agentRequestMessage || 'No message provided.'}</span>
			</div>
			<div className="admin-mobile-card__copy">
				<strong>Experience</strong>
				<span>{member.agentExperience || 'Not provided'}</span>
			</div>
			{renderDecisionActions(member)}
		</MotionArticle>
	));

	const renderResults = (): React.ReactElement => {
		if (error) {
			return (
				<div className="admin-state admin-state--error">
					<Typography>We could not load agent requests.</Typography>
					<Button onClick={() => refetch({ input: inquiry })}>Try again</Button>
				</div>
			);
		}
		if (loading && !members.length) {
			return (
				<div className="admin-table-skeleton" role="status" aria-label="Loading agent requests">
					{Array.from({ length: 5 }).map((_, index) => <span key={index} />)}
				</div>
			);
		}
		if (!members.length) return <div className="admin-state admin-state--empty">There are no agent requests in this queue.</div>;

		return (
			<>
				<TableContainer className="admin-data-table">
					<Table aria-label="Agent requests">
						<TableHead>
							<TableRow>
								<TableCell>Applicant</TableCell>
								<TableCell>Request</TableCell>
								<TableCell>Experience</TableCell>
								<TableCell>Status</TableCell>
								<TableCell align="right">Decision</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>{renderDesktopRows()}</TableBody>
					</Table>
				</TableContainer>
				<div className="admin-mobile-cards">{renderMobileCards()}</div>
			</>
		);
	};

	return (
		<MotionSection className="content admin-page" initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
			{renderHeading()}
			<div className="table-wrap admin-surface">
				{renderResults()}
				<TablePagination rowsPerPageOptions={rowsPerPageOptions} component="div" count={total} rowsPerPage={inquiry.limit} page={inquiry.page - 1} onPageChange={changePageHandler} onRowsPerPageChange={changeRowsPerPageHandler} />
			</div>
		</MotionSection>
	);
};

AgentRequestsAdmin.defaultProps = { initialInquiry: { page: 1, limit: 10, sort: 'createdAt', direction: Direction.DESC, search: { agentRequestStatus: AgentRequestStatus.PENDING } } };

export default withAdminLayout(AgentRequestsAdmin);
