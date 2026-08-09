import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_MY_NOTIFICATIONS } from '../../../apollo/user/query';
import { MARK_ALL_NOTIFICATIONS_READ, MARK_NOTIFICATION_READ } from '../../../apollo/user/mutation';
import { Direction } from '../../enums/common.enum';
import { NotificationStatus } from '../../enums/notification.enum';
import { Notification } from '../../types/notification/notification';

/**
 * Shared notification wiring for the desktop dropdown and the mobile drawer.
 * Query, mutations, and deep-link routing are unchanged backend contracts.
 */
export const useNavNotifications = () => {
	const user = useReactiveVar(userVar);
	const router = useRouter();

	const notificationInput = useMemo(
		() => ({
			page: 1,
			limit: 8,
			sort: 'createdAt',
			direction: Direction.DESC,
			search: {},
		}),
		[],
	);

	const [markNotificationRead] = useMutation(MARK_NOTIFICATION_READ);
	const [markAllNotificationsRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ);

	const { data, refetch } = useQuery(GET_MY_NOTIFICATIONS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: notificationInput },
		skip: !user?._id,
	});

	const notifications: Notification[] = data?.getMyNotifications?.list ?? [];
	const unreadCount = notifications.filter((item) => item.notificationStatus === NotificationStatus.WAIT).length;

	const openNotification = async (notification: Notification) => {
		if (notification.notificationStatus === NotificationStatus.WAIT) {
			await markNotificationRead({ variables: { notificationId: notification._id } });
			await refetch?.({ input: notificationInput });
		}
		if (notification.tourId) await router.push(`/tour/detail?id=${notification.tourId}`);
		else if (notification.articleId)
			await router.push(`/community/detail?articleCategory=FREE&id=${notification.articleId}`);
	};

	const markAllRead = async () => {
		await markAllNotificationsRead();
		await refetch?.({ input: notificationInput });
	};

	return { notifications, unreadCount, openNotification, markAllRead };
};

export default useNavNotifications;
