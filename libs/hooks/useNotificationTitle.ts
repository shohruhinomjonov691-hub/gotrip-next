import { useQuery } from '@apollo/client';
import { useTranslation } from '../i18n/useTranslation';
import { GET_MEMBER, GET_TOUR } from '../../apollo/user/query';
import { NotificationType } from '../enums/notification.enum';
import { Notification } from '../types/notification/notification';
import { Member } from '../types/member/member';
import { Tour } from '../types/tour/tour';

/**
 * `notificationTitle` is a fixed English string baked in server-side at
 * creation time (see NotificationService's per-type templates) — there is no
 * per-locale variant to select, so it never changed with the app's language.
 * This reconstructs a properly localized title from `notificationType` (an
 * existing, already-fetched field) instead, the same way NotificationCard
 * already did for CONTACT_AGENT alone; this just extends that one special
 * case to every notification type and shares it so the bell dropdown and the
 * Notifications Center render identically instead of drifting apart.
 *
 * `author`/`tour` are read `cache-only` — no network request, no side
 * effect. Both are already normalised in Apollo's cache from wherever they
 * were first fetched (My Tours, the tour page, etc.); when neither is cached
 * yet, the title falls back to the type's plain label (or the raw stored
 * title for content notifications like ADMIN_NOTICE, which snapshot real
 * admin-authored text rather than a fixed template).
 */

const SIMPLE_TITLE_KEY: Partial<Record<NotificationType, string>> = {
	[NotificationType.COMMENT_CREATED]: 'New comment created',
	[NotificationType.FOLLOW_CREATED]: 'New follower',
	[NotificationType.LIKE_CREATED]: 'New like',
	[NotificationType.GUIDE_REQUEST]: 'New Guide Application',
	[NotificationType.GUIDE_APPROVED]: 'Congratulations!',
	[NotificationType.GUIDE_REJECTED]: 'Guide application update',
};

interface UseNotificationTitleResult {
	title: string;
	author?: Member;
	tour?: Tour;
}

export function useNotificationTitle(n: Notification): UseNotificationTitleResult {
	const { t } = useTranslation();
	const wantsAuthor =
		!!n.authorId && (n.notificationType === NotificationType.CONTACT_AGENT || n.notificationType === NotificationType.MESSAGE_RECEIVED);

	const { data: authorData } = useQuery(GET_MEMBER, {
		fetchPolicy: 'cache-only',
		skip: !wantsAuthor,
		variables: { input: n.authorId },
	});
	const { data: tourData } = useQuery(GET_TOUR, {
		fetchPolicy: 'cache-only',
		skip: !n.tourId,
		variables: { tourId: n.tourId },
	});

	const author: Member | undefined = authorData?.getMember;
	const tour: Tour | undefined = tourData?.getTour;
	const authorName = author?.memberFullName || author?.memberNick;

	let title = n.notificationTitle;
	switch (n.notificationType) {
		case NotificationType.CONTACT_AGENT:
			title = authorName ? t('{{name}} sent an inquiry', { name: authorName }) : n.notificationTitle;
			break;
		case NotificationType.MESSAGE_RECEIVED:
			title = authorName ? t('{{name}} sent you a message', { name: authorName }) : t('New message');
			break;
		default: {
			const key = SIMPLE_TITLE_KEY[n.notificationType];
			if (key) title = t(key);
			break;
		}
	}

	return { title, author, tour };
}
