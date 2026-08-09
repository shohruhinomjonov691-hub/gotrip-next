import React from 'react';
import moment from 'moment';
import { useRouter } from 'next/router';
import { useTranslation } from '../../i18n/useTranslation';
import { useNotificationTitle } from '../../hooks/useNotificationTitle';
import { NotificationStatus } from '../../enums/notification.enum';
import { Notification } from '../../types/notification/notification';
import { getImageUrl } from '../../config';
import { getLocalizedField } from '../../i18n/localization';

/** One notification row — title/author/tour resolution lives in useNotificationTitle,
 *  shared with NotificationBell so both surfaces render identically. */

interface NotificationCardProps {
	notification: Notification;
	meta: { label: string; tone: string; icon: React.ReactNode };
	onOpen: (n: Notification) => void;
	onMarkRead: (id: string) => void;
	onDelete: (id: string) => void;
}

const NotificationCard = ({ notification: n, meta, onOpen, onMarkRead, onDelete }: NotificationCardProps) => {
	const { t } = useTranslation();
	const { locale } = useRouter();
	const unread = n.notificationStatus === NotificationStatus.WAIT;
	const { title, author, tour } = useNotificationTitle(n);
	const localizedTourTitle = tour ? getLocalizedField(tour, 'tourTitle', locale ?? 'en') : undefined;

	return (
		<article className={unread ? 'nt-card unread' : 'nt-card'}>
			<button className="nt-open" onClick={() => onOpen(n)} type="button">
				{author ? (
					<img alt="" className="nt-av" src={getImageUrl(author.memberImage, '/img/profile/defaultUser.svg')} />
				) : (
					<span className={`nt-ico ${meta.tone}`}>{meta.icon}</span>
				)}

				<span className="nt-body">
					<span className="nt-top">
						<b>{title}</b>
						<span className={`nt-tag ${meta.tone}`}>{t(meta.label)}</span>
						{author?.memberType && <span className="nt-role">{t(author.memberType)}</span>}
					</span>

					{localizedTourTitle && <span className="nt-ref">{t('on {{title}}', { title: localizedTourTitle })}</span>}
					{n.notificationDesc && <span className="nt-desc">{n.notificationDesc}</span>}
					<span className="nt-time" title={moment(n.createdAt).format('LLL')}>
						{moment(n.createdAt).fromNow()}
					</span>
				</span>

				{unread && <i aria-label={t('Unread')} className="nt-unread-dot" />}
			</button>

			<div className="nt-actions">
				{unread && (
					<button className="nt-mini" onClick={() => onMarkRead(n._id)} type="button">
						{t('Mark read')}
					</button>
				)}
				<button
					aria-label={t('Delete notification: {{title}}', { title })}
					className="nt-mini danger"
					onClick={() => onDelete(n._id)}
					type="button"
				>
					{t('Delete')}
				</button>
			</div>
		</article>
	);
};

export default NotificationCard;
