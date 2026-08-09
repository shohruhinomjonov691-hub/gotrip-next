import React from 'react';
import Link from 'next/link';
import { Avatar, Box, Button, Menu, MenuItem, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import { Member } from '../../../types/member/member';
import { getImageUrl } from '../../../config';
import { MemberStatus, MemberType } from '../../../enums/member.enum';
import { useTranslation } from '../../../i18n/useTranslation';

/**
 * Role editing is deliberately limited to USER <-> AGENT. ADMIN is never offered
 * as a target and an ADMIN row exposes no role menu, so the panel cannot create
 * or demote administrators by accident.
 */
const roleTargetsFor = (current: MemberType): MemberType[] => {
	if (current === MemberType.USER) return [MemberType.AGENT];
	if (current === MemberType.AGENT) return [MemberType.USER];
	return [];
};

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
	const { t } = useTranslation();
	const reduceMotion = useReducedMotion();

	if (loading) {
		return (
			<Box className="admin-table-skeleton" aria-label={t('Loading members') as string} role="status">
				{Array.from({ length: 6 }).map((_, index) => <span key={index} />)}
			</Box>
		);
	}

	if (!members.length) {
		return <Box className="admin-state admin-state--empty">{t('No members match these controls.')}</Box>;
	}

	return (
		<motion.div initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
			<TableContainer className="admin-data-table">
				<Table aria-label={t('Members') as string}>
					<TableHead>
						<TableRow>
							<TableCell>{t('Member')}</TableCell>
							<TableCell>{t('Phone')}</TableCell>
							<TableCell>{t('Role')}</TableCell>
							<TableCell align="center">{t('Warnings')}</TableCell>
							<TableCell align="center">{t('Blocks')}</TableCell>
							<TableCell>{t('Status')}</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{members.map((member) => {
							const image = getImageUrl(member.memberImage);
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
										<Button className={toStatusClass(member.memberType)} onClick={(event: React.MouseEvent<HTMLElement>) => menuIconClickHandler(event, roleKey)}>
											{t(member.memberType)}
										</Button>
										<Menu anchorEl={anchorEl[roleKey]} open={Boolean(anchorEl[roleKey])} onClose={menuIconCloseHandler}>
											{roleTargetsFor(member.memberType).map((type) => (
												<MenuItem key={type} onClick={() => updateMemberHandler({ _id: member._id, memberType: type })}>{t(type)}</MenuItem>
											))}
										</Menu>
									</TableCell>
									<TableCell align="center">{member.memberWarnings}</TableCell>
									<TableCell align="center">{member.memberBlocks}</TableCell>
									<TableCell>
										<Button className={toStatusClass(member.memberStatus)} onClick={(event: React.MouseEvent<HTMLElement>) => menuIconClickHandler(event, statusKey)}>
											{t(member.memberStatus)}
										</Button>
										<Menu anchorEl={anchorEl[statusKey]} open={Boolean(anchorEl[statusKey])} onClose={menuIconCloseHandler}>
											{Object.values(MemberStatus).filter((status) => status !== member.memberStatus).map((status) => (
												<MenuItem key={status} onClick={() => updateMemberHandler({ _id: member._id, memberStatus: status })}>{t(status)}</MenuItem>
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
					const image = getImageUrl(member.memberImage);
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
							<Box className="admin-mobile-card__meta"><span>{t('Warnings')} {member.memberWarnings}</span><span>{t('Blocks')} {member.memberBlocks}</span></Box>
							<Box className="admin-mobile-card__actions">
								<Button className={toStatusClass(member.memberType)} onClick={(event: React.MouseEvent<HTMLElement>) => menuIconClickHandler(event, roleKey)}>{t(member.memberType)}</Button>
								<Button className={toStatusClass(member.memberStatus)} onClick={(event: React.MouseEvent<HTMLElement>) => menuIconClickHandler(event, statusKey)}>{t(member.memberStatus)}</Button>
							</Box>
							<Menu anchorEl={anchorEl[roleKey]} open={Boolean(anchorEl[roleKey])} onClose={menuIconCloseHandler}>{roleTargetsFor(member.memberType).map((type) => <MenuItem key={type} onClick={() => updateMemberHandler({ _id: member._id, memberType: type })}>{t(type)}</MenuItem>)}</Menu>
							<Menu anchorEl={anchorEl[statusKey]} open={Boolean(anchorEl[statusKey])} onClose={menuIconCloseHandler}>{Object.values(MemberStatus).filter((status) => status !== member.memberStatus).map((status) => <MenuItem key={status} onClick={() => updateMemberHandler({ _id: member._id, memberStatus: status })}>{t(status)}</MenuItem>)}</Menu>
						</motion.article>
					);
				})}
			</Box>
		</motion.div>
	);
};
