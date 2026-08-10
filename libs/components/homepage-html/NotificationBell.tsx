import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import moment from 'moment';
import { useTranslation } from '../../i18n/useTranslation';
import { GET_MY_NOTIFICATIONS } from '../../../apollo/user/query';
import { MARK_ALL_NOTIFICATIONS_READ, MARK_NOTIFICATION_READ } from '../../../apollo/user/mutation';
import { Direction } from '../../enums/common.enum';
import { NotificationStatus, NotificationType } from '../../enums/notification.enum';
import { Notification } from '../../types/notification/notification';
import { resolveNotificationHref } from '../../notificationRoute';
import { useNotificationTitle } from '../../hooks/useNotificationTitle';
import { userVar } from '../../../apollo/store';

/**
 * Quick notification dropdown for the navbar bell.
 *
 * Opens in place — it never navigates. Reuses GET_MY_NOTIFICATIONS with a small
 * limit; the same document backs the full history screen, so Apollo serves both
 * from one cache entry per variable set. Marking read reuses the existing
 * mutations. No new backend operation is involved.
 */

const PREVIEW_LIMIT = 6;

const PREVIEW_INPUT = {
	page: 1,
	limit: PREVIEW_LIMIT,
	sort: 'createdAt',
	direction: Direction.DESC,
	/* The bell is an unread inbox, not a history — NotificationsCenter (My
	   Page) is the one place read notifications remain visible. Filtering
	   server-side means a read notification simply stops matching this
	   query on the next refetch, rather than needing local hide-logic. */
	search: { notificationStatus: NotificationStatus.WAIT },
};

/** Only the five types the backend actually emits. */
const TONE: Record<string, string> = {
	[NotificationType.CONTACT_AGENT]: 'sky',
	[NotificationType.COMMENT_CREATED]: 'violet',
	[NotificationType.LIKE_CREATED]: 'rose',
	[NotificationType.FOLLOW_CREATED]: 'green',
	[NotificationType.ADMIN_NOTICE]: 'amber',
};

const ICON: Record<string, React.ReactNode> = {
	[NotificationType.CONTACT_AGENT]: (
		<svg viewBox="0 0 24 24">
			<path d="M20 12.5a7 7 0 01-7 7H8l-4 2.5V12.5a7 7 0 017-7h2a7 7 0 017 7z" />
		</svg>
	),
	[NotificationType.COMMENT_CREATED]: (
		<svg viewBox="0 0 24 24">
			<path d="M21 12a8 8 0 01-8 8H5l-2 2V12a8 8 0 018-8h2a8 8 0 018 8z" />
		</svg>
	),
	[NotificationType.LIKE_CREATED]: (
		<svg viewBox="0 0 24 24">
			<path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0112 8.2a4.1 4.1 0 017.5 2.4C19.5 15.4 12 20 12 20z" />
		</svg>
	),
	[NotificationType.FOLLOW_CREATED]: (
		<svg viewBox="0 0 24 24">
			<circle cx="10" cy="8.5" r="3.4" />
			<path d="M4 19.5a6 6 0 0112 0M18 8v6M15 11h6" />
		</svg>
	),
	[NotificationType.ADMIN_NOTICE]: (
		<svg viewBox="0 0 24 24">
			<path d="M6.5 10a5.5 5.5 0 0111 0c0 4 1.5 5.5 1.5 5.5H5s1.5-1.5 1.5-5.5z" />
			<path d="M10.2 18.5a2 2 0 003.6 0" />
		</svg>
	),
};

/** One row — a separate component so useNotificationTitle (a hook) can be
 *  called once per item instead of inside the list's .map() callback. */
const NotificationBellRow = ({ n, onOpen }: { n: Notification; onOpen: (n: Notification) => void }) => {
	const isUnread = n.notificationStatus === NotificationStatus.WAIT;
	const tone = TONE[n.notificationType] ?? 'amber';
	const { title } = useNotificationTitle(n);

	return (
		<li>
			<button className={isUnread ? 'nb-item unread' : 'nb-item'} onClick={() => onOpen(n)} type="button">
				<span className={`nb-ico ${tone}`}>{ICON[n.notificationType]}</span>
				<span className="nb-body">
					<span className="nb-title">{title}</span>
					{n.notificationDesc && <span className="nb-desc">{n.notificationDesc}</span>}
					<span className="nb-time">{moment(n.createdAt).fromNow()}</span>
				</span>
				{isUnread && <i className="nb-unread" aria-hidden="true" />}
			</button>
		</li>
	);
};

const NotificationBell = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [open, setOpen] = useState(false);
	const wrapRef = useRef<HTMLDivElement>(null);

	const { data } = useQuery(GET_MY_NOTIFICATIONS, {
		fetchPolicy: 'cache-and-network',
		skip: !user?._id,
		variables: { input: PREVIEW_INPUT },
	});
	const items: Notification[] = data?.getMyNotifications?.list ?? [];
	const unread = useMemo(
		() => items.filter((n) => n.notificationStatus === NotificationStatus.WAIT).length,
		[items],
	);

	const [markRead] = useMutation(MARK_NOTIFICATION_READ);
	const [markAll] = useMutation(MARK_ALL_NOTIFICATIONS_READ);

	/** Close on outside click and on Escape. */
	useEffect(() => {
		if (!open) return;
		const onDown = (e: MouseEvent) => {
			if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setOpen(false);
		};
		document.addEventListener('mousedown', onDown);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('mousedown', onDown);
			document.removeEventListener('keydown', onKey);
		};
	}, [open]);

	/** Close when the route changes so it never lingers over a new page. */
	useEffect(() => setOpen(false), [router.asPath]);

	const openItem = async (n: Notification) => {
		setOpen(false);
		if (n.notificationStatus === NotificationStatus.WAIT) {
			try {
				// Naming the query (rather than a local refetch()) also refreshes
				// NotificationsCenter's own GET_MY_NOTIFICATIONS instance on My Page —
				// it runs with a different `limit`, so it's a separate cache entry that
				// a local refetch here would never have touched.
				await markRead({ variables: { notificationId: n._id }, refetchQueries: ['GetMyNotifications'] });
			} catch {
				/* Non-blocking: navigation below still happens. */
			}
		}
		/* Destination resolution is shared with NotificationsCenter — see
		   libs/notificationRoute.ts. */
		const href = resolveNotificationHref(n);
		if (href) await router.push(href as any);
	};

	const markAllHandler = async () => {
		try {
			await markAll({ refetchQueries: ['GetMyNotifications'] });
		} catch {
			/* Silent — the panel simply keeps its current state. */
		}
	};

	if (!user?._id) return null;

	return (
		<div className="nb-wrap" ref={wrapRef}>
			<button
				aria-expanded={open}
				aria-haspopup="true"
				aria-label={unread ? (t('Notifications, {{count}} unread', { count: unread }) as string) : (t('Notifications') as string)}
				className="bell"
				onClick={() => setOpen((v) => !v)}
				type="button"
			>
				<svg viewBox="0 0 24 24">
					<path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
					<path d="M13.7 21a2 2 0 01-3.4 0" />
				</svg>
				{unread > 0 && <i className="nb-dot">{unread > 9 ? '9+' : unread}</i>}
			</button>

			{open && (
				<div className="nb-panel" role="dialog" aria-label={t('Notifications') as string}>
					<div className="nb-head">
						<b>{t('Notifications')}</b>
						{unread > 0 && (
							<button className="nb-mark" onClick={markAllHandler} type="button">
								{t('Mark all read')}
							</button>
						)}
					</div>

					{items.length === 0 ? (
						<p className="nb-empty">{t('Nothing yet — replies, follows and likes will appear here.')}</p>
					) : (
						<ul className="nb-list">
							{items.map((n) => (
								<NotificationBellRow key={n._id} n={n} onOpen={openItem} />
							))}
						</ul>
					)}

					<Link className="nb-all" href="/mypage?category=notifications" onClick={() => setOpen(false)}>
						{t('View all notifications')}
					</Link>
				</div>
			)}
		</div>
	);
};

export default NotificationBell;
