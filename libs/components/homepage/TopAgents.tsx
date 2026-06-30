import React, { useState } from 'react';
import Link from 'next/link';
import { Stack, Box, Button, Typography } from '@mui/material';
import TopAgentCard from './TopAgentCard';
import { Member } from '../../types/member/member';
import { AgentsInquiry } from '../../types/member/member.input';
import { useQuery } from '@apollo/client';
import { GET_AGENTS } from '../../../apollo/user/query';
import { T } from '../../types/common';

interface TopAgentsProps {
	initialInput: AgentsInquiry;
}

const TopAgents = (props: TopAgentsProps) => {
	const { initialInput } = props;
	const [topAgents, setTopAgents] = useState<Member[]>([]);
	const visibleAgents = topAgents.slice(0, 3);

	/** APOLLO REQUESTS **/
	const { loading, error, refetch } = useQuery(GET_AGENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setTopAgents(data?.getAgents?.list ?? []);
		},
	});

	/** HANDLERS **/

	return (
		<Stack className={'top-agents'}>
			<Stack className={'container'}>
				<Stack className={'info-box'}>
					<Box component={'div'} className={'left'}>
						<span>Your Dedicated Concierge</span>
						<p>Elite travel advisors at your service.</p>
					</Box>
					<Box component={'div'} className={'right'}>
						<Link href={'/agent'}>
							<div className={'more-box'}>
								<span>View Concierge</span>
								<img src="/img/icons/rightup.svg" alt="" />
							</div>
						</Link>
					</Box>
				</Stack>
				<Stack className={'wrapper compact-agents'}>
					{loading && !visibleAgents.length ? (
						<Stack className={'homepage-skeleton-grid guide-skeleton-grid'}>{[0, 1, 2].map((item) => <span key={item} />)}</Stack>
					) : error ? (
						<Stack className={'homepage-data-state'} alignItems="center">
							<Typography>Guides could not be loaded.</Typography>
							<Button onClick={() => refetch()}>Try again</Button>
						</Stack>
					) : visibleAgents.length === 0 ? (
						<Stack className={'gt-empty-state'}>Guide profiles will appear here as the concierge network grows.</Stack>
					) : (
						<Box component={'div'} className={'card-wrapper compact-grid'}>
							{visibleAgents.map((agent: Member) => (
								<TopAgentCard agent={agent} key={agent?._id} />
							))}
						</Box>
					)}
				</Stack>
			</Stack>
		</Stack>
	);
};

TopAgents.defaultProps = {
	initialInput: {
		page: 1,
		limit: 10,
		sort: 'memberRank',
		direction: 'DESC',
		search: {},
	},
};

export default TopAgents;
