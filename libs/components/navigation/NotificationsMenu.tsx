import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Badge, Menu, MenuItem } from '@mui/material';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import moment from 'moment';
import { NotificationStatus, NotificationType } from '../../enums/notification.enum';
import { Notification } from '../../types/notification/notification';
import { useNavNotifications } from './useNavNotifications';

/** Fixed icon-per-type mapping (DESIGN_SYSTEM2 §9 — one icon per status, for life). */
const TYPE_ICONS: Record<NotificationType, React.ReactNode> = {
	[NotificationType.CONTACT_AGENT]: <MailOutlineRoundedIcon />,
	[NotificationType.LIKE_CREATED]: <FavoriteRoundedIcon />,
	[NotificationType.FOLLOW_CREATED]: <PersonAddAlt1RoundedIcon />,
	[NotificationType.COMMENT_CREATED]: <ChatBubbleOutlineRoundedIcon />,
	[NotificationType.ADMIN_NOTICE]: <CampaignRoundedIcon />,
	/* Guide application lifecycle + private messages. The Record is exhaustive by
	   design (one icon per type, for life), so adding a NotificationType requires
	   an entry here — TypeScript enforces it. */
	[NotificationType.GUIDE_REQUEST]: <PersonAddAlt1RoundedIcon />,
	[NotificationType.GUIDE_APPROVED]: <VerifiedRoundedIcon />,
	[NotificationType.GUIDE_REJECTED]: <ErrorOutlineRoundedIcon />,
	[NotificationType.MESSAGE_RECEIVED]: <MailOutlineRoundedIcon />,
};

const groupLabel = (notification: Notification): 'Today' | 'This week' | 'Earlier' => {
	const created = moment(notification.createdAt);
	if (created.isSame(moment(), 'day')) return 'Today';
	if (created.isAfter(moment().subtract(7, 'days'))) return 'This week';
	return 'Earlier';
};

/** Bell + grouped notification dropdown. Backend contract untouched. */
const NotificationsMenu = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const { notifications, unreadCount, openNotification, markAllRead } = useNavNotifications();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	const groups = (['Today', 'This week', 'Earlier'] as const)
		.map((label) => ({ label, items: notifications.filter((item) => groupLabel(item) === label) }))
		.filter((group) => group.items.length > 0);

	return (
		<>
			<button
				type="button"
				className="gt-nav__icon-btn"
				aria-label={
					unreadCount
						? `${t('Notifications') || 'Notifications'}, ${unreadCount} unread`
						: t('Notifications') || 'Notifications'
				}
				aria-haspopup="menu"
				aria-expanded={open}
				aria-controls={open ? 'gt-notifications-menu' : undefined}
				onClick={(event) => setAnchorEl(event.currentTarget)}
			>
				<Badge badgeContent={unreadCount} max={9} className="gt-nav__badge" overlap="circular">
					<NotificationsOutlinedIcon />
				</Badge>
			</button>

			<Menu
				id="gt-notifications-menu"
				className="gt-nav-menu gt-notifications"
				anchorEl={anchorEl}
				open={open}
				onClose={() => setAnchorEl(null)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
			>
				<div className="gt-notifications__head">
					<strong>{t('Notifications') || 'Notifications'}</strong>
					<button type="button" onClick={markAllRead} disabled={!unreadCount}>
						<DoneAllRoundedIcon />
						{t('Mark all read') || 'Mark all read'}
					</button>
				</div>

				<div className="gt-notifications__scroll">
					{groups.length ? (
						groups.map((group) => (
							<React.Fragment key={group.label}>
								<p className="gt-notifications__group gt-label">{t(group.label) || group.label}</p>
								{group.items.map((notification) => {
									const unread = notification.notificationStatus === NotificationStatus.WAIT;
									return (
										<MenuItem
											key={notification._id}
											className={`gt-notifications__row${unread ? ' is-unread' : ''}`}
											onClick={async () => {
												setAnchorEl(null);
												await openNotification(notification);
											}}
										>
											<span className="gt-notifications__icon" aria-hidden="true">
												{TYPE_ICONS[notification.notificationType] ?? <CampaignRoundedIcon />}
											</span>
											<span className="gt-notifications__content">
												<span className="gt-notifications__title">{notification.notificationTitle}</span>
												{notification.notificationDesc && (
													<span className="gt-notifications__desc">{notification.notificationDesc}</span>
												)}
												<span className="gt-notifications__time">
													{moment(notification.createdAt).fromNow()}
													{unread && <span className="gt-visually-hidden">, unread</span>}
												</span>
											</span>
											{unread && <span className="gt-notifications__dot" aria-hidden="true" />}
										</MenuItem>
									);
								})}
							</React.Fragment>
						))
					) : (
						<div className="gt-notifications__empty">
							<NotificationsOutlinedIcon aria-hidden="true" />
							<strong>{t("You're all caught up") || "You're all caught up"}</strong>
							<span>{t('New activity will appear here.') || 'New activity will appear here.'}</span>
						</div>
					)}
				</div>

				<MenuItem
					className="gt-notifications__footer"
					onClick={() => {
						setAnchorEl(null);
						router.push('/mypage?category=notifications');
					}}
				>
					{t('View notification center') || 'View notification center'}
				</MenuItem>
			</Menu>
		</>
	);
};

export default NotificationsMenu;
