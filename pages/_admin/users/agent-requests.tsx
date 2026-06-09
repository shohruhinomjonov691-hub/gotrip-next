import React, { useState } from 'react';
import type { NextPage } from 'next';
import {
	Box,
	Button,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TablePagination,
	TableRow,
	Typography,
} from '@mui/material';
import { useMutation, useQuery } from '@apollo/client';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { GET_AGENT_REQUESTS_BY_ADMIN } from '../../../apollo/admin/query';
import { REVIEW_AGENT_REQUEST_BY_ADMIN } from '../../../apollo/admin/mutation';
import { AgentRequestStatus } from '../../../libs/enums/member.enum';
import { Direction } from '../../../libs/enums/common.enum';
import { MembersInquiry } from '../../../libs/types/member/member.input';
import { Member } from '../../../libs/types/member/member';
import { T } from '../../../libs/types/common';

const AgentRequestsAdmin: NextPage = ({ initialInquiry, ...props }: any) => {
	const [inquiry, setInquiry] = useState<MembersInquiry>(initialInquiry);
	const [members, setMembers] = useState<Member[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [reviewAgentRequestByAdmin] = useMutation(REVIEW_AGENT_REQUEST_BY_ADMIN);

	const { refetch } = useQuery(GET_AGENT_REQUESTS_BY_ADMIN, {
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
		await reviewAgentRequestByAdmin({
			variables: {
				input: {
					memberId,
					agentRequestStatus,
				},
			},
		});
		await refetch({ input: inquiry });
	};

	return (
		<Box component="div" className="content">
			<Typography variant="h2" className="tit" sx={{ mb: '24px' }}>
				Guide / Operator Requests
			</Typography>
			<Table>
				<TableHead>
					<TableRow>
						<TableCell>Member</TableCell>
						<TableCell>Phone</TableCell>
						<TableCell>Message</TableCell>
						<TableCell>Experience</TableCell>
						<TableCell>Status</TableCell>
						<TableCell align="right">Actions</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{members.map((member) => (
						<TableRow key={member._id}>
							<TableCell>{member.memberNick}</TableCell>
							<TableCell>{member.memberPhone}</TableCell>
							<TableCell>{member.agentRequestMessage ?? '-'}</TableCell>
							<TableCell>{member.agentExperience ?? '-'}</TableCell>
							<TableCell>{member.agentRequestStatus ?? AgentRequestStatus.NONE}</TableCell>
							<TableCell align="right">
								<Stack direction="row" spacing={1} justifyContent="flex-end">
									<Button size="small" onClick={() => reviewHandler(member._id, AgentRequestStatus.APPROVED)}>
										Approve
									</Button>
									<Button
										size="small"
										color="error"
										onClick={() => reviewHandler(member._id, AgentRequestStatus.REJECTED)}
									>
										Reject
									</Button>
								</Stack>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			<TablePagination
				rowsPerPageOptions={[10, 20, 40]}
				component="div"
				count={total}
				rowsPerPage={inquiry.limit}
				page={inquiry.page - 1}
				onPageChange={changePageHandler}
				onRowsPerPageChange={changeRowsPerPageHandler}
			/>
		</Box>
	);
};

AgentRequestsAdmin.defaultProps = {
	initialInquiry: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: { agentRequestStatus: AgentRequestStatus.PENDING },
	},
};

export default withAdminLayout(AgentRequestsAdmin);
