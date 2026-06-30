import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Button, Chip, Stack, Typography } from '@mui/material';
import moment from 'moment';
import { GET_MY_NOTIFICATIONS } from '../../../apollo/user/query';
import {
	DELETE_NOTIFICATION,
	MARK_ALL_NOTIFICATIONS_READ,
	MARK_NOTIFICATION_READ,
} from '../../../apollo/user/mutation';
import { Direction } from '../../enums/common.enum';
import { NotificationStatus } from '../../enums/notification.enum';
import { Notification } from '../../types/notification/notification';
import { T } from '../../types/common';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../sweetAlert';

const input = { page: 1, limit: 20, sort: 'createdAt', direction: Direction.DESC, search: {} };

const NotificationsCenter = () => {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [markNotificationRead] = useMutation(MARK_NOTIFICATION_READ);
	const [markAllNotificationsRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ);
	const [deleteNotification] = useMutation(DELETE_NOTIFICATION);

	const { refetch } = useQuery(GET_MY_NOTIFICATIONS, {
		fetchPolicy: 'cache-and-network',
		variables: { input },
		onCompleted: (data: T) => setNotifications(data?.getMyNotifications?.list ?? []),
	});

	const markReadHandler = async (notificationId: string) => {
		try {
			await markNotificationRead({ variables: { notificationId } });
			await refetch({ input });
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const markAllHandler = async () => {
		try {
			await markAllNotificationsRead();
			await refetch({ input });
			await sweetTopSmallSuccessAlert('Notifications updated', 900);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const deleteHandler = async (notificationId: string) => {
		try {
			await deleteNotification({ variables: { notificationId } });
			await refetch({ input });
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	return (
		<Stack className="mypage-panel premium-panel">
			<Stack className="panel-heading" direction={{ xs: 'column', md: 'row' }} justifyContent="space-between">
				<div>
					<Typography className="panel-kicker">Notification center</Typography>
					<Typography className="panel-title">Updates and alerts</Typography>
					<Typography className="panel-copy">Read booking, payment, guide request, comment, like, follow, and notice updates.</Typography>
				</div>
				<Button className="gt-primary-button" onClick={markAllHandler} disabled={!notifications.length}>
					Mark all read
				</Button>
			</Stack>
			<Stack className="booking-list">
				{notifications.map((notification) => (
					<Stack
						className={`notification-center-row gt-card ${
							notification.notificationStatus === NotificationStatus.WAIT ? 'unread' : ''
						}`}
						key={notification._id}
					>
						<Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={2}>
							<div>
								<Stack direction="row" gap={1} flexWrap="wrap">
									<Chip label={notification.notificationStatus} className="status-chip" />
									<Chip label={notification.notificationType} className="status-chip neutral" />
								</Stack>
								<Typography className="booking-number">{notification.notificationTitle}</Typography>
								<Typography className="gt-muted">{notification.notificationDesc || notification.notificationGroup}</Typography>
								<Typography className="gt-muted">{moment(notification.createdAt).fromNow()}</Typography>
							</div>
							<Stack direction="row" gap={1} alignItems="center">
								{notification.notificationStatus === NotificationStatus.WAIT && (
									<Button onClick={() => markReadHandler(notification._id)}>Mark read</Button>
								)}
								<Button color="error" onClick={() => deleteHandler(notification._id)}>
									Delete
								</Button>
							</Stack>
						</Stack>
					</Stack>
				))}
				{notifications.length === 0 && <div className="gt-empty-state">No notifications yet.</div>}
			</Stack>
		</Stack>
	);
};

export default NotificationsCenter;
