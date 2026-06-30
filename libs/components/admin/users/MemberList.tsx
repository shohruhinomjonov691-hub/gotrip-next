import React from 'react';
import Link from 'next/link';
import { Avatar, Box, Button, Menu, MenuItem, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import { Member } from '../../../types/member/member';
import { REACT_APP_API_URL } from '../../../config';
import { MemberStatus, MemberType } from '../../../enums/member.enum';

interface MemberPanelListProps {
	members: Member[];
	anchorEl: Record<string, HTMLElement | null>;
	menuIconClickHandler: (event: React.MouseEvent<HTMLElement>, key: string) => void;
	menuIconCloseHandler: () => void;
	updateMemberHandler: (input: { _id: string; memberType?: MemberType; memberStatus?: MemberStatus }) => void;
	loading?: boolean;
}

const toStatusClass = (value?: string) => `admin-status admin-status--${(value ?? 'hold').toLowerCase()}`;

export const MemberPanelList = ({
	members,
	anchorEl,
	menuIconClickHandler,
	menuIconCloseHandler,
	updateMemberHandler,
	loading = false,
}: MemberPanelListProps) => {
	const reduceMotion = useReducedMotion();

	if (loading) {
		return (
			<Box className="admin-table-skeleton" aria-label="Loading members" role="status">
				{Array.from({ length: 6 }).map((_, index) => <span key={index} />)}
			</Box>
		);
	}

	if (!members.length) {
		return <Box className="admin-state admin-state--empty">No members match these controls.</Box>;
	}

	return (
		<motion.div initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
			<TableContainer className="admin-data-table">
				<Table aria-label="Members">
					<TableHead>
						<TableRow>
							<TableCell>Member</TableCell>
							<TableCell>Phone</TableCell>
							<TableCell>Role</TableCell>
							<TableCell align="center">Warnings</TableCell>
							<TableCell align="center">Blocks</TableCell>
							<TableCell>Status</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{members.map((member) => {
							const image = member.memberImage ? `${REACT_APP_API_URL}/${member.memberImage}` : '/img/profile/defaultUser.svg';
							const roleKey = `${member._id}-role`;
							const statusKey = `${member._id}-status`;

							return (
								<TableRow key={member._id}>
									<TableCell>
										<Stack direction="row" alignItems="center" spacing={1.5} className="admin-person">
											<Avatar src={image} alt={member.memberNick} />
											<Box>
												<Link href={`/member?memberId=${member._id}`}>{member.memberNick}</Link>
												<Typography component="span">{member.memberFullName || member._id}</Typography>
											</Box>
										</Stack>
									</TableCell>
									<TableCell>{member.memberPhone}</TableCell>
									<TableCell>
										<Button className={toStatusClass(member.memberType)} onClick={(event) => menuIconClickHandler(event, roleKey)}>
											{member.memberType}
										</Button>
										<Menu anchorEl={anchorEl[roleKey]} open={Boolean(anchorEl[roleKey])} onClose={menuIconCloseHandler}>
											{Object.values(MemberType).filter((type) => type !== member.memberType).map((type) => (
												<MenuItem key={type} onClick={() => updateMemberHandler({ _id: member._id, memberType: type })}>{type}</MenuItem>
											))}
										</Menu>
									</TableCell>
									<TableCell align="center">{member.memberWarnings}</TableCell>
									<TableCell align="center">{member.memberBlocks}</TableCell>
									<TableCell>
										<Button className={toStatusClass(member.memberStatus)} onClick={(event) => menuIconClickHandler(event, statusKey)}>
											{member.memberStatus}
										</Button>
										<Menu anchorEl={anchorEl[statusKey]} open={Boolean(anchorEl[statusKey])} onClose={menuIconCloseHandler}>
											{Object.values(MemberStatus).filter((status) => status !== member.memberStatus).map((status) => (
												<MenuItem key={status} onClick={() => updateMemberHandler({ _id: member._id, memberStatus: status })}>{status}</MenuItem>
											))}
										</Menu>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</TableContainer>
			<Box className="admin-mobile-cards">
				{members.map((member, index) => {
					const image = member.memberImage ? `${REACT_APP_API_URL}/${member.memberImage}` : '/img/profile/defaultUser.svg';
					const roleKey = `${member._id}-mobile-role`;
					const statusKey = `${member._id}-mobile-status`;
					return (
						<motion.article
							key={member._id}
							className="admin-mobile-card"
							initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.18, delay: reduceMotion ? 0 : Math.min(index * 0.025, 0.12) }}
						>
							<Stack direction="row" spacing={1.5} alignItems="center">
								<Avatar src={image} alt={member.memberNick} />
								<Box><Link href={`/member?memberId=${member._id}`}>{member.memberNick}</Link><Typography component="span">{member.memberPhone}</Typography></Box>
							</Stack>
							<Box className="admin-mobile-card__meta"><span>Warnings {member.memberWarnings}</span><span>Blocks {member.memberBlocks}</span></Box>
							<Box className="admin-mobile-card__actions">
								<Button className={toStatusClass(member.memberType)} onClick={(event) => menuIconClickHandler(event, roleKey)}>{member.memberType}</Button>
								<Button className={toStatusClass(member.memberStatus)} onClick={(event) => menuIconClickHandler(event, statusKey)}>{member.memberStatus}</Button>
							</Box>
							<Menu anchorEl={anchorEl[roleKey]} open={Boolean(anchorEl[roleKey])} onClose={menuIconCloseHandler}>{Object.values(MemberType).filter((type) => type !== member.memberType).map((type) => <MenuItem key={type} onClick={() => updateMemberHandler({ _id: member._id, memberType: type })}>{type}</MenuItem>)}</Menu>
							<Menu anchorEl={anchorEl[statusKey]} open={Boolean(anchorEl[statusKey])} onClose={menuIconCloseHandler}>{Object.values(MemberStatus).filter((status) => status !== member.memberStatus).map((status) => <MenuItem key={status} onClick={() => updateMemberHandler({ _id: member._id, memberStatus: status })}>{status}</MenuItem>)}</Menu>
						</motion.article>
					);
				})}
			</Box>
		</motion.div>
	);
};
