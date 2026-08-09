import React from 'react';
import Moment from 'react-moment';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import { Notification } from '../../../types/notification/notification';
import { useTranslation } from '../../../i18n/useTranslation';

interface NotificationListProps {
	notifications: Notification[];
	loading?: boolean;
}

const SKELETON_ROWS: readonly number[] = [0, 1, 2, 3, 4, 5];
const notificationStatusClass = (status?: string) => `admin-status admin-status--${(status ?? 'wait').toLowerCase()}`;

export const NotificationList = ({ notifications, loading = false }: NotificationListProps): React.ReactElement => {
	const { t } = useTranslation();
	const reduceMotion = Boolean(useReducedMotion());
	const shortId = (value?: string) => value ? value.slice(-8).toUpperCase() : t('None');
	const notificationContext = (notification: Notification): string[] => [
		notification.tourId && t('Tour {{id}}', { id: shortId(notification.tourId) }),
		notification.articleId && t('Article {{id}}', { id: shortId(notification.articleId) }),
		notification.commentId && t('Comment {{id}}', { id: shortId(notification.commentId) }),
	].filter(Boolean) as string[];

	const renderLoadingState = (): React.ReactElement => <div className="admin-table-skeleton" role="status" aria-label={t('Loading notification audit records') as string}>{SKELETON_ROWS.map((index) => <span key={index} />)}</div>;
	const renderDesktopRow = (notification: Notification): React.ReactElement => {
		const context = notificationContext(notification);
		return (
			<TableRow key={notification._id}>
				<TableCell><div className="admin-notification-cell"><strong>{notification.notificationTitle}</strong><span>{notification.notificationDesc || t('No message content.')}</span></div></TableCell>
				<TableCell><div className="admin-id-pair"><span>{t(notification.notificationType)}</span><span>{t(notification.notificationGroup)}</span></div></TableCell>
				<TableCell><span>{t('Receiver {{id}}', { id: shortId(notification.receiverId) })}</span></TableCell>
				<TableCell>{context.length ? <div className="admin-id-pair">{context.map((item) => <span key={item}>{item}</span>)}</div> : <span className="admin-empty-value">{t('No context')}</span>}</TableCell>
				<TableCell><span className={notificationStatusClass(notification.notificationStatus)}>{t(notification.notificationStatus)}</span></TableCell>
				<TableCell><Moment format="DD MMM YYYY HH:mm">{notification.createdAt}</Moment></TableCell>
			</TableRow>
		);
	};
	const renderMobileCard = (notification: Notification, index: number): React.ReactElement => {
		const context = notificationContext(notification);
		return (
			<motion.article key={notification._id} className="admin-mobile-card admin-mobile-card--notification" initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18, delay: reduceMotion ? 0 : Math.min(index * 0.025, 0.12) }}>
				<div className="admin-mobile-card__title"><strong>{notification.notificationTitle}</strong><span className={notificationStatusClass(notification.notificationStatus)}>{t(notification.notificationStatus)}</span></div>
				<p>{t(notification.notificationType)} · {t(notification.notificationGroup)}</p>
				<div className="admin-mobile-card__copy"><span>{notification.notificationDesc || t('No message content.')}</span></div>
				<div className="admin-mobile-card__meta"><span>{t('Receiver {{id}}', { id: shortId(notification.receiverId) })}</span><span><Moment format="DD MMM YYYY HH:mm">{notification.createdAt}</Moment></span></div>
				{context.length > 0 && <div className="admin-mobile-card__copy"><span>{context.join(' · ')}</span></div>}
			</motion.article>
		);
	};

	if (loading) return renderLoadingState();
	if (!notifications.length) return <div className="admin-state admin-state--empty">{t('No notifications match these audit controls.')}</div>;

	const desktopRows: React.ReactElement[] = notifications.map(renderDesktopRow);
	const mobileCards: React.ReactElement[] = notifications.map(renderMobileCard);

	return <><TableContainer className="admin-data-table"><Table aria-label={t('Notification audit records') as string}><TableHead><TableRow><TableCell>{t('Notifications')}</TableCell><TableCell>{t('Type / group')}</TableCell><TableCell>{t('Recipient')}</TableCell><TableCell>{t('Context')}</TableCell><TableCell>{t('Read status')}</TableCell><TableCell>{t('Created')}</TableCell></TableRow></TableHead><TableBody>{desktopRows}</TableBody></Table></TableContainer><div className="admin-mobile-cards">{mobileCards}</div></>;
};
