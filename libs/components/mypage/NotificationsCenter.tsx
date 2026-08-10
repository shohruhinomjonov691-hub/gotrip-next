import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from '../../i18n/useTranslation';
import { useMutation, useQuery } from '@apollo/client';
import moment from 'moment';
import { GET_MY_NOTIFICATIONS } from '../../../apollo/user/query';
import {
	DELETE_NOTIFICATION,
	MARK_ALL_NOTIFICATIONS_READ,
	MARK_NOTIFICATION_READ,
} from '../../../apollo/user/mutation';
import { Direction } from '../../enums/common.enum';
import { NotificationStatus, NotificationType } from '../../enums/notification.enum';
import { Notification } from '../../types/notification/notification';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { resolveNotificationHref } from '../../notificationRoute';
import NotificationCard from './NotificationCard';

const input = { page: 1, limit: 20, sort: 'createdAt', direction: Direction.DESC, search: {} };

/** Per-type presentation. Keys are the existing NotificationType enum values. */
const TYPE_META: Record<string, { label: string; tone: string; icon: React.ReactNode }> = {
	[NotificationType.CONTACT_AGENT]: {
		label: 'Message',
		tone: 'sky',
		icon: (
			<svg viewBox="0 0 24 24">
				<path d="M20 12.5a7 7 0 01-7 7H8l-4 2.5V12.5a7 7 0 017-7h2a7 7 0 017 7z" />
			</svg>
		),
	},
	/* Guide application lifecycle. Reuses the existing tone vocabulary rather than
	   introducing new colours. */
	[NotificationType.GUIDE_REQUEST]: {
		label: 'Guide application',
		tone: 'sky',
		icon: (
			<svg viewBox="0 0 24 24">
				<path d="M12 3.5l7 3v5c0 4.4-3 8-7 9-4-1-7-4.6-7-9v-5z" />
				<path d="M9 12l2 2 4-4" />
			</svg>
		),
	},
	[NotificationType.GUIDE_APPROVED]: {
		label: 'Approved',
		tone: 'emerald',
		icon: (
			<svg viewBox="0 0 24 24">
				<path d="M20 6L9 17l-5-5" />
			</svg>
		),
	},
	[NotificationType.GUIDE_REJECTED]: {
		label: 'Application update',
		tone: 'amber',
		icon: (
			<svg viewBox="0 0 24 24">
				<circle cx="12" cy="12" r="9" />
				<path d="M12 8v5M12 16h.01" />
			</svg>
		),
	},
	[NotificationType.MESSAGE_RECEIVED]: {
		label: 'Message',
		tone: 'sky',
		icon: (
			<svg viewBox="0 0 24 24">
				<path d="M20 12.5a7 7 0 01-7 7H8l-4 2.5V12.5a7 7 0 017-7h2a7 7 0 017 7z" />
			</svg>
		),
	},
	[NotificationType.COMMENT_CREATED]: {
		label: 'Comment',
		tone: 'violet',
		icon: (
			<svg viewBox="0 0 24 24">
				<path d="M21 12a8 8 0 01-8 8H5l-2 2V12a8 8 0 018-8h2a8 8 0 018 8z" />
			</svg>
		),
	},
	[NotificationType.LIKE_CREATED]: {
		label: 'Like',
		tone: 'rose',
		icon: (
			<svg viewBox="0 0 24 24">
				<path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0112 8.2a4.1 4.1 0 017.5 2.4C19.5 15.4 12 20 12 20z" />
			</svg>
		),
	},
	[NotificationType.FOLLOW_CREATED]: {
		label: 'Follow',
		tone: 'green',
		icon: (
			<svg viewBox="0 0 24 24">
				<circle cx="10" cy="8.5" r="3.4" />
				<path d="M4 19.5a6 6 0 0112 0M18 8v6M15 11h6" />
			</svg>
		),
	},
	[NotificationType.ADMIN_NOTICE]: {
		label: 'Notice',
		tone: 'amber',
		icon: (
			<svg viewBox="0 0 24 24">
				<path d="M6.5 10a5.5 5.5 0 0111 0c0 4 1.5 5.5 1.5 5.5H5s1.5-1.5 1.5-5.5z" />
				<path d="M10.2 18.5a2 2 0 003.6 0" />
			</svg>
		),
	},
};

/**
 * History categories.
 *
 * These map onto the five NotificationType values the backend actually emits.
 * There is deliberately no Messages tab — messaging is its own module now — and
 * no Bookings tab, because no booking module exists server-side.
 */
const FILTERS = [
	{ key: 'all', label: 'All' },
	{ key: 'unread', label: 'Unread' },
	{ key: 'read', label: 'Read' },
	{ key: NotificationType.LIKE_CREATED, label: 'Likes' },
	{ key: NotificationType.COMMENT_CREATED, label: 'Comments' },
	{ key: NotificationType.FOLLOW_CREATED, label: 'Followers' },
	{ key: NotificationType.ADMIN_NOTICE, label: 'System' },
];

/** Bucket by day so the list reads as a timeline rather than a flat wall. Keys
 *  are translated at render time (BUCKET_ORDER/grouped keys stay English so
 *  they remain stable map keys regardless of the active locale). */
const bucketOf = (iso: any) => {
	const d = moment(iso);
	if (d.isSame(moment(), 'day')) return 'Today';
	if (d.isSame(moment().subtract(1, 'day'), 'day')) return 'Yesterday';
	if (d.isAfter(moment().subtract(7, 'day'))) return 'This week';
	return 'Earlier';
};
const BUCKET_ORDER = ['Today', 'Yesterday', 'This week', 'Earlier'];

const NotificationsCenter = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const [filter, setFilter] = useState<string>('all');

	const [markNotificationRead] = useMutation(MARK_NOTIFICATION_READ);
	const [markAllNotificationsRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ);
	const [deleteNotification] = useMutation(DELETE_NOTIFICATION);

	const { data, loading, error, refetch } = useQuery(GET_MY_NOTIFICATIONS, {
		fetchPolicy: 'cache-and-network',
		notifyOnNetworkStatusChange: true,
		variables: { input },
	});
	const notifications: Notification[] = data?.getMyNotifications?.list ?? [];

	const unreadCount = notifications.filter((n) => n.notificationStatus === NotificationStatus.WAIT).length;

	const visible = useMemo(() => {
		if (filter === 'all') return notifications;
		if (filter === 'unread') return notifications.filter((n) => n.notificationStatus === NotificationStatus.WAIT);
		if (filter === 'read') return notifications.filter((n) => n.notificationStatus === NotificationStatus.READ);
		return notifications.filter((n) => n.notificationType === filter);
	}, [notifications, filter]);

	const grouped = useMemo(() => {
		const map: Record<string, Notification[]> = {};
		for (const n of visible) {
			const b = bucketOf(n.createdAt);
			(map[b] ??= []).push(n);
		}
		return BUCKET_ORDER.filter((b) => map[b]?.length).map((b) => ({ bucket: b, items: map[b] }));
	}, [visible]);

	/**
	 * HANDLERS
	 *
	 * The header bell (NotificationBell) and this list each run their own
	 * GET_MY_NOTIFICATIONS query with different `limit` variables, so they're
	 * separate Apollo cache entries — a plain local refetch() here only updated
	 * this list, leaving the bell's count stale until a full page reload. Naming
	 * the query in refetchQueries instead refreshes every active instance of it
	 * (this list AND the bell) in one round trip, which is what keeps them in sync.
	 */
	const markReadHandler = async (notificationId: string) => {
		try {
			await markNotificationRead({ variables: { notificationId }, refetchQueries: ['GetMyNotifications'] });
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const markAllHandler = async () => {
		try {
			await markAllNotificationsRead({ refetchQueries: ['GetMyNotifications'] });
			await sweetTopSmallSuccessAlert(t('Notifications updated'), 900);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const deleteHandler = async (notificationId: string) => {
		try {
			await deleteNotification({ variables: { notificationId }, refetchQueries: ['GetMyNotifications'] });
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	/**
	 * Opening a notification marks it read (existing mutation) and routes to the
	 * thing it refers to. Message notifications open the Messages section.
	 */
	const openHandler = async (n: Notification) => {
		if (n.notificationStatus === NotificationStatus.WAIT) await markReadHandler(n._id);

		/* Destination resolution is shared with NotificationBell — see
		   libs/notificationRoute.ts. `scroll: false` is kept for in-page
		   (/mypage → /mypage) moves so the list does not jump. */
		const href = resolveNotificationHref(n);
		if (!href) return;

		const staysOnMyPage = typeof href === 'object' && href.pathname === '/mypage';
		if (staysOnMyPage) {
			await router.push(href as any, undefined, { scroll: false });
			return;
		}
		await router.push(href as any);
	};

	return (
		<div className="nt-wrap">
			<div className="nt-bar">
				<div className="nt-tabs" role="tablist" aria-label={t('Filter notifications') as string}>
					{FILTERS.map((f) => (
						<button
							aria-selected={filter === f.key}
							className={filter === f.key ? 'cm-tab on' : 'cm-tab'}
							key={f.key}
							onClick={() => setFilter(f.key)}
							role="tab"
							type="button"
						>
							{t(f.label)}
							{f.key === 'unread' && unreadCount > 0 && <i className="nt-count">{unreadCount}</i>}
						</button>
					))}
				</div>
				<button className="btn btn-outline nt-readall" disabled={!unreadCount} onClick={markAllHandler} type="button">
					{t('Mark all read')}
				</button>
			</div>

			{loading && notifications.length === 0 && (
				<div className="nt-group">
					{Array.from({ length: 4 }, (_, i) => (
						<div className="pg-skeleton" key={i} style={{ height: 84, borderRadius: 18 }} />
					))}
				</div>
			)}

			{error && notifications.length === 0 && !loading && (
				<div className="pg-state">
					<h3>{t('Could not load notifications')}</h3>
					<p>{t('Please try again in a moment.')}</p>
					<button className="btn btn-sky" onClick={() => refetch({ input })} type="button">
						{t('Try again')}
					</button>
				</div>
			)}

			{!loading && !error && visible.length === 0 && (
				<div className="pg-state">
					<h3>{t(filter === 'all' ? 'No notifications yet' : 'Nothing here')}</h3>
					<p>
						{t(
							filter === 'all'
								? 'Replies, follows and likes on your tours and articles will show up here.'
								: 'Try a different filter.',
						)}
					</p>
				</div>
			)}

			{grouped.map(({ bucket, items }) => (
				<div className="nt-group" key={bucket}>
					<h4 className="nt-bucket">{t(bucket)}</h4>
					{items.map((n) => {
						const meta = TYPE_META[n.notificationType] ?? TYPE_META[NotificationType.ADMIN_NOTICE];
						return (
							<NotificationCard
								key={n._id}
								meta={meta}
								notification={n}
								onDelete={deleteHandler}
								onMarkRead={markReadHandler}
								onOpen={openHandler}
							/>
						);
					})}
				</div>
			))}
		</div>
	);
};

export default NotificationsCenter;
