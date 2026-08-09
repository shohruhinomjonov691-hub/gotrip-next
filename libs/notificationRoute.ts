import type { UrlObject } from 'url';
import { NotificationType } from './enums/notification.enum';
import { Notification } from './types/notification/notification';

/**
 * Single source of truth for "where does this notification go?".
 *
 * NotificationBell and NotificationsCenter each carried their own copy of this
 * branching, which had already drifted (the Center passes router options, the
 * Bell does not). Both now call this instead, so a new notification type is
 * routed by editing one function.
 *
 * Resolution order:
 *   1. notificationLink — an explicit destination stored by the producer. Used by
 *      the guide-application and message events, which have no target id to
 *      derive from. Explicit always wins.
 *   2. CONTACT_AGENT — the legacy message-shaped event, opens Messages and passes
 *      notificationId so the target conversation can be selected.
 *   3. Content ids — article, then tour.
 *   4. FOLLOW_CREATED — the follower's public profile.
 *
 * Returns null when nothing sensible can be opened; callers should then only
 * mark the notification read.
 */
export const resolveNotificationHref = (n: Notification): UrlObject | string | null => {
	if (n.notificationLink) return n.notificationLink;

	if (n.notificationType === NotificationType.CONTACT_AGENT) {
		return { pathname: '/mypage', query: { category: 'messages', notificationId: n._id } };
	}
	if (n.articleId) return `/community/detail?id=${n.articleId}`;
	if (n.tourId) return `/tour/detail?id=${n.tourId}`;
	if (n.notificationType === NotificationType.FOLLOW_CREATED && n.authorId) {
		return `/member?memberId=${n.authorId}`;
	}
	return null;
};
