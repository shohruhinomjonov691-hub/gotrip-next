import React, { useState } from 'react';
import type { NextPage } from 'next';
import { Button, MenuItem, OutlinedInput, Select, TablePagination, Typography } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import { useQuery } from '@apollo/client';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { NotificationList } from '../../../libs/components/admin/notifications/NotificationList';
import { GET_ALL_NOTIFICATIONS_BY_ADMIN } from '../../../apollo/admin/query';
import { Notification } from '../../../libs/types/notification/notification';
import { NotificationGroup, NotificationStatus, NotificationType } from '../../../libs/enums/notification.enum';
import { Direction } from '../../../libs/enums/common.enum';
import { T } from '../../../libs/types/common';

interface AllNotificationsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: { notificationStatus?: NotificationStatus; notificationType?: NotificationType; notificationGroup?: NotificationGroup; receiverId?: string; memberId?: string };
}

interface AdminNotificationsProps {
	initialInquiry?: AllNotificationsInquiry;
}

interface NotificationPageMotionTarget {
	opacity: number;
	y?: number;
}

type NotificationStatusFilter = 'ALL' | NotificationStatus;
type NotificationTypeFilter = 'ALL' | NotificationType;
type NotificationGroupFilter = 'ALL' | NotificationGroup;

const DEFAULT_INQUIRY: AllNotificationsInquiry = { page: 1, limit: 10, sort: 'createdAt', direction: Direction.DESC, search: {} };
const NOTIFICATION_STATUSES: readonly NotificationStatus[] = Object.values(NotificationStatus) as NotificationStatus[];
const NOTIFICATION_TYPES: readonly NotificationType[] = Object.values(NotificationType) as NotificationType[];
const NOTIFICATION_GROUPS: readonly NotificationGroup[] = Object.values(NotificationGroup) as NotificationGroup[];
const ROWS_PER_PAGE_OPTIONS: number[] = [10, 20, 40, 60];

const AdminNotifications: NextPage<AdminNotificationsProps> = ({ initialInquiry = DEFAULT_INQUIRY }) => {
	const [inquiry, setInquiry] = useState<AllNotificationsInquiry>(initialInquiry);
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [total, setTotal] = useState(0);
	const [status, setStatus] = useState<NotificationStatusFilter>('ALL');
	const [type, setType] = useState<NotificationTypeFilter>('ALL');
	const [group, setGroup] = useState<NotificationGroupFilter>('ALL');
	const [receiverId, setReceiverId] = useState('');
	const [memberId, setMemberId] = useState('');
	const reduceMotion = Boolean(useReducedMotion());
	const { loading, error, refetch } = useQuery(GET_ALL_NOTIFICATIONS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setNotifications(data?.getAllNotificationsByAdmin?.list ?? []);
			setTotal(data?.getAllNotificationsByAdmin?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const changePageHandler = async (_: unknown, newPage: number) => {
		const next = { ...inquiry, page: newPage + 1 };
		setInquiry(next);
		await refetch({ input: next });
	};
	const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const next = { ...inquiry, page: 1, limit: parseInt(event.target.value, 10) };
		setInquiry(next);
		await refetch({ input: next });
	};
	const updateFilter = <K extends keyof AllNotificationsInquiry['search']>(key: K, value: AllNotificationsInquiry['search'][K] | undefined) => {
		setInquiry((current) => ({ ...current, page: 1, search: { ...current.search, [key]: value } }));
	};
	const applyRecipientFilter = () => updateFilter('receiverId', receiverId.trim() || undefined);
	const applyMemberFilter = () => updateFilter('memberId', memberId.trim() || undefined);
	const clearIdentityFilters = () => {
		setReceiverId('');
		setMemberId('');
		setInquiry((current) => {
			const search = { ...current.search };
			delete search.receiverId;
			delete search.memberId;
			return { ...current, page: 1, search };
		});
	};

	const renderHeading = (): React.ReactElement => <div className="admin-page__heading"><div><Typography component="span">System audit</Typography><Typography component="h1">Notifications</Typography><Typography component="p">Review generated notification records without changing their delivery or read state.</Typography></div><Typography className="admin-page__count">{total} notifications</Typography></div>;
	const renderFilters = (): React.ReactElement => {
		const statusItems: React.ReactElement[] = NOTIFICATION_STATUSES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>);
		const typeItems: React.ReactElement[] = NOTIFICATION_TYPES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>);
		const groupItems: React.ReactElement[] = NOTIFICATION_GROUPS.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>);
		return <div className="admin-filterbar admin-filterbar--notifications"><Select<NotificationStatusFilter> value={status} onChange={(event: SelectChangeEvent<NotificationStatusFilter>) => { const next = event.target.value as NotificationStatusFilter; setStatus(next); updateFilter('notificationStatus', next === 'ALL' ? undefined : next); }} aria-label="Filter notifications by read status"><MenuItem value="ALL">All statuses</MenuItem>{statusItems}</Select><Select<NotificationTypeFilter> value={type} onChange={(event: SelectChangeEvent<NotificationTypeFilter>) => { const next = event.target.value as NotificationTypeFilter; setType(next); updateFilter('notificationType', next === 'ALL' ? undefined : next); }} aria-label="Filter notifications by type"><MenuItem value="ALL">All types</MenuItem>{typeItems}</Select><Select<NotificationGroupFilter> value={group} onChange={(event: SelectChangeEvent<NotificationGroupFilter>) => { const next = event.target.value as NotificationGroupFilter; setGroup(next); updateFilter('notificationGroup', next === 'ALL' ? undefined : next); }} aria-label="Filter notifications by group"><MenuItem value="ALL">All groups</MenuItem>{groupItems}</Select><div className="admin-search-controls admin-notification-filters"><OutlinedInput aria-label="Filter notifications by receiver ID" placeholder="Receiver ID" value={receiverId} onChange={(event) => setReceiverId(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && applyRecipientFilter()} /><OutlinedInput aria-label="Filter notifications by member ID" placeholder="Member ID" value={memberId} onChange={(event) => setMemberId(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && applyMemberFilter()} /><Button className="admin-action-button" onClick={() => { applyRecipientFilter(); applyMemberFilter(); }}>Apply IDs</Button>{(receiverId || memberId) && <Button className="admin-action-button" onClick={clearIdentityFilters}>Clear IDs</Button>}</div></div>;
	};
	const renderResults = (): React.ReactElement => error ? <div className="admin-state admin-state--error"><Typography>We could not load notification audit records.</Typography><Button onClick={() => refetch({ input: inquiry })}>Try again</Button></div> : <NotificationList notifications={notifications} loading={loading && !notifications.length} />;

	const initialAnimation: NotificationPageMotionTarget = reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 };
	const animateAnimation: NotificationPageMotionTarget = { opacity: 1, y: 0 };
	const pageContent: React.ReactElement = <section className="content admin-page">{renderHeading()}<div className="table-wrap admin-surface">{renderFilters()}{renderResults()}<TablePagination rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS} component="div" count={total} rowsPerPage={inquiry.limit} page={inquiry.page - 1} onPageChange={changePageHandler} onRowsPerPageChange={changeRowsPerPageHandler} /></div></section>;

	return <motion.div initial={initialAnimation} animate={animateAnimation} transition={{ duration: 0.22 }}>{pageContent}</motion.div>;
};

export default withAdminLayout(AdminNotifications);
