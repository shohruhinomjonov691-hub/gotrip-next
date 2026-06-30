import React from 'react';
import Link from 'next/link';
import { Stack } from '@mui/material';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import { Member } from '../../types/member/member';

interface TopAgentProps {
	agent: Member;
}
const TopAgentCard = (props: TopAgentProps) => {
	const { agent } = props;
	const roleLabel = agent?.memberType === 'AGENT' ? 'Guide / Operator' : agent?.memberType;
	const agentImage = agent?.memberImage
		? `${process.env.REACT_APP_API_URL}/${agent?.memberImage}`
		: '/img/profile/defaultUser.svg';

	/** HANDLERS **/

	return (
		<Stack className="top-agent-card">
			<div className={'agent-avatar-frame'}>
				<Link href={`/agent/detail?agentId=${agent?._id}`} aria-label={`View ${agent?.memberNick || 'guide'} profile`}>
					<img
						src={agentImage}
						alt={agent?.memberNick || 'GoTrip guide'}
						onError={(event) => {
							event.currentTarget.src = '/img/profile/defaultUser.svg';
						}}
					/>
				</Link>
				<span className={'agent-verified'}>
					<VerifiedRoundedIcon fontSize="small" />
				</span>
			</div>

			<Link href={`/agent/detail?agentId=${agent?._id}`} className="agent-name-link">
				<strong>{agent?.memberNick}</strong>
			</Link>
			<span>{roleLabel}</span>
			<div className={'agent-stats'}>
				<small>
					<StarRoundedIcon fontSize="small" />
					{Math.max(4.8, Math.min(5, 4.8 + (agent?.memberRank || 0) / 100)).toFixed(1)}
				</small>
				<small>{agent?.memberTours || 0} tours</small>
			</div>
			<p>{agent?.memberDesc || 'Crafting seamless journeys with insider access and thoughtful pacing.'}</p>
		</Stack>
	);
};

export default TopAgentCard;
