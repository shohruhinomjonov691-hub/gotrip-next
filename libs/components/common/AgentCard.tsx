import React from 'react';
import { Stack, Box, Typography } from '@mui/material';
import Link from 'next/link';
import { REACT_APP_API_URL } from '../../config';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

interface AgentCardProps {
	agent: any;
	likeMemberHandler: any;
}

const AgentCard = (props: AgentCardProps) => {
	const { agent, likeMemberHandler } = props;
	const user = useReactiveVar(userVar);
	const tourCount = agent?.memberTours ?? agent?.memberProperties ?? 0;
	const imagePath: string = agent?.memberImage
		? `${REACT_APP_API_URL}/${agent?.memberImage}`
		: '/img/profile/defaultUser.svg';
	const guideName = agent?.memberFullName ?? agent?.memberNick ?? 'guide';
	const isLiked = !!agent?.meLiked?.[0]?.myFavorite;

	return (
			<Stack className="agent-general-card">
				<Link
					href={{
						pathname: '/agent/detail',
						query: { agentId: agent?._id },
					}}
				>
					<Box
						component={'div'}
						className={'agent-img'}
						style={{
							backgroundImage: `url(${imagePath})`,
							backgroundSize: 'cover',
							backgroundPosition: 'center',
							backgroundRepeat: 'no-repeat',
						}}
					>
						<div>{tourCount} tours</div>
					</Box>
				</Link>

				<Stack className={'agent-desc'}>
					<Box component={'div'} className={'agent-info'}>
						<Link
							href={{
								pathname: '/agent/detail',
							query: { agentId: agent?._id },
							}}
						>
							<strong>{guideName}</strong>
						</Link>
						<span>Guide / Operator</span>
					</Box>
					<Box component={'div'} className={'buttons'}>
							<IconButton component="span" color={'default'} disableRipple tabIndex={-1} aria-hidden="true">
								<RemoveRedEyeIcon />
							</IconButton>
							<Typography className="view-cnt">{agent?.memberViews}</Typography>
							<IconButton color={'default'} aria-label={`${isLiked ? 'Unlike' : 'Like'} ${guideName}`} onClick={() => likeMemberHandler(user, agent?._id)}>
								{isLiked ? (
								<FavoriteIcon color={'primary'} />
							) : (
								<FavoriteBorderIcon />
							)}
						</IconButton>
						<Typography className="view-cnt">{agent?.memberLikes}</Typography>
					</Box>
				</Stack>
			</Stack>
		);
};

export default AgentCard;
