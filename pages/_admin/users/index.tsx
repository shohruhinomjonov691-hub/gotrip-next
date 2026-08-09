import React, { useCallback, useEffect, useState } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { NextPage } from 'next';
import { Box, Button, InputAdornment, MenuItem, OutlinedInput, Select, Stack, TablePagination, Typography } from '@mui/material';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { motion, useReducedMotion } from 'framer-motion';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { MemberPanelList } from '../../../libs/components/admin/users/MemberList';
import { MembersInquiry } from '../../../libs/types/member/member.input';
import { Member } from '../../../libs/types/member/member';
import { MemberStatus, MemberType } from '../../../libs/enums/member.enum';
import { sweetErrorHandling, sweetMixinSuccessAlert } from '../../../libs/sweetAlert';
/* AdminMemberUpdate (not MemberUpdate) mirrors the server's MemberAdminUpdate
   argument — see the note on UPDATE_MEMBER_BY_ADMIN. Both already existed; the
   page was simply importing the self-service shape. */
import { AdminMemberUpdate } from '../../../libs/types/member/member.update';
import { useMutation, useQuery } from '@apollo/client';
import { UPDATE_MEMBER_BY_ADMIN } from '../../../apollo/admin/mutation';
import { GET_ALL_MEMBERS_BY_ADMIN } from '../../../apollo/admin/query';
import { T } from '../../../libs/types/common';
import { useTranslation } from '../../../libs/i18n/useTranslation';

const memberTabs = [
	{ value: 'ALL', label: 'All members' },
	{ value: MemberStatus.ACTIVE, label: 'Active' },
	{ value: MemberStatus.BLOCK, label: 'Blocked' },
	{ value: MemberStatus.DELETE, label: 'Deleted' },
];

const AdminUsers: NextPage = ({ initialInquiry }: any) => {
	const { t } = useTranslation();
	const [anchorEl, setAnchorEl] = useState<Record<string, HTMLElement | null>>({});
	const [membersInquiry, setMembersInquiry] = useState<MembersInquiry>(initialInquiry);
	const [members, setMembers] = useState<Member[]>([]);
	const [membersTotal, setMembersTotal] = useState(0);
	const [value, setValue] = useState<string>(membersInquiry?.search?.memberStatus || 'ALL');
	const [searchText, setSearchText] = useState('');
	const [searchType, setSearchType] = useState('ALL');
	const reduceMotion = useReducedMotion();
	const [updateMemberByAdmin] = useMutation(UPDATE_MEMBER_BY_ADMIN);

	const { loading, error, refetch } = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: membersInquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setMembers(data?.getAllMembersByAdmin?.list ?? []);
			setMembersTotal(data?.getAllMembersByAdmin?.metaCounter?.[0]?.total ?? 0);
		},
	});

	useEffect(() => {
		refetch({ input: membersInquiry }).then();
	}, [membersInquiry]);

	const changePageHandler = async (_: unknown, newPage: number) => {
		const next = { ...membersInquiry, page: newPage + 1 };
		setMembersInquiry(next);
		await refetch({ input: next });
	};

	const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const next = { ...membersInquiry, page: 1, limit: parseInt(event.target.value, 10) };
		setMembersInquiry(next);
		await refetch({ input: next });
	};

	const menuIconClickHandler = (event: React.MouseEvent<HTMLElement>, key: string) => setAnchorEl({ [key]: event.currentTarget });
	const menuIconCloseHandler = () => setAnchorEl({});

	const tabChangeHandler = (nextValue: string) => {
		setValue(nextValue);
		setSearchText('');
		const search = { ...membersInquiry.search, text: '' };
		if (nextValue === 'ALL') delete search.memberStatus;
		else search.memberStatus = nextValue as MemberStatus;
		setMembersInquiry({ ...membersInquiry, page: 1, sort: 'createdAt', search });
	};

	const updateMemberHandler = async (updateData: AdminMemberUpdate) => {
		try {
			await updateMemberByAdmin({ variables: { input: updateData } });
			menuIconCloseHandler();
			await refetch({ input: membersInquiry });
			/* The change was previously silent on success, so a no-op and a real
			   update looked identical — which is part of why the broken mutation
			   went unnoticed. Confirm what actually changed. */
			const changed = updateData.memberType
				? t('Role set to {{role}}.', { role: t(updateData.memberType) })
				: updateData.memberStatus
				? t('Status set to {{status}}.', { status: t(updateData.memberStatus) })
				: t('Member updated.');
			await sweetMixinSuccessAlert(changed);
		} catch (err: any) {
			menuIconCloseHandler();
			sweetErrorHandling(err).then();
		}
	};

	const textHandler = useCallback((nextValue: string) => setSearchText(nextValue), []);
	const searchTextHandler = () => setMembersInquiry({ ...membersInquiry, page: 1, search: { ...membersInquiry.search, text: searchText } });
	const searchTypeHandler = (nextValue: string) => {
		setSearchType(nextValue);
		const search = { ...membersInquiry.search };
		if (nextValue === 'ALL') delete search.memberType;
		else search.memberType = nextValue as MemberType;
		setMembersInquiry({ ...membersInquiry, page: 1, sort: 'createdAt', search });
	};

	return (
		<motion.section className="content admin-page" initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
			<Box className="admin-page__heading">
				<Box><Typography component="span">{t('Member administration')}</Typography><Typography component="h1">{t('Users')}</Typography><Typography component="p">{t('Review accounts, roles, and account access without leaving the control desk.')}</Typography></Box>
				<Typography className="admin-page__count">{t('{{count}} total', { count: membersTotal })}</Typography>
			</Box>
			<Box className="table-wrap admin-surface">
				<Box className="admin-filterbar">
					<Box className="admin-tabs" role="tablist" aria-label={t('Member status') as string}>
						{memberTabs.map((tab) => <Button key={tab.value} role="tab" aria-selected={value === tab.value} className={value === tab.value ? 'is-active' : ''} onClick={() => tabChangeHandler(tab.value)}>{t(tab.label)}</Button>)}
					</Box>
					<Stack className="search-area admin-search-controls" direction="row">
						<OutlinedInput aria-label={t('Search members') as string} value={searchText} onChange={(event) => textHandler(event.target.value)} placeholder={t('Search name or nickname') as string} onKeyDown={(event) => event.key === 'Enter' && searchTextHandler()} endAdornment={<InputAdornment position="end">{searchText && <Button aria-label={t('Clear member search') as string} className="admin-icon-button" onClick={() => { setSearchText(''); setMembersInquiry({ ...membersInquiry, page: 1, search: { ...membersInquiry.search, text: '' } }); }}><CancelRoundedIcon /></Button>}<Button aria-label={t('Search members') as string} className="admin-icon-button" onClick={searchTextHandler}><SearchRoundedIcon /></Button></InputAdornment>} />
						<Select aria-label={t('Filter members by role') as string} value={searchType} onChange={(event) => searchTypeHandler(event.target.value)}>
							<MenuItem value="ALL">{t('All roles')}</MenuItem><MenuItem value={MemberType.USER}>{t('USER')}</MenuItem><MenuItem value={MemberType.AGENT}>{t('AGENT')}</MenuItem>
						</Select>
					</Stack>
				</Box>
				{error ? <Box className="admin-state admin-state--error"><Typography>{t('We could not load members.')}</Typography><Button onClick={() => refetch({ input: membersInquiry })}>{t('Try again')}</Button></Box> : <MemberPanelList members={members} anchorEl={anchorEl} menuIconClickHandler={menuIconClickHandler} menuIconCloseHandler={menuIconCloseHandler} updateMemberHandler={updateMemberHandler} loading={loading && !members.length} />}
				<TablePagination rowsPerPageOptions={[10, 20, 40, 60]} component="div" count={membersTotal} rowsPerPage={membersInquiry.limit} page={membersInquiry.page - 1} onPageChange={changePageHandler} onRowsPerPageChange={changeRowsPerPageHandler} />
			</Box>
		</motion.section>
	);
};

AdminUsers.defaultProps = { initialInquiry: { page: 1, limit: 10, sort: 'createdAt', search: {} } };

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

export default withAdminLayout(AdminUsers);
