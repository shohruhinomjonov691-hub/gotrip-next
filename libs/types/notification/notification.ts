import { NotificationGroup, NotificationStatus, NotificationType } from '../../enums/notification.enum';
import { TotalCounter } from '../shared';

export interface Notification {
	_id: string;
	notificationType: NotificationType;
	notificationStatus: NotificationStatus;
	notificationGroup: NotificationGroup;
	notificationTitle: string;
	notificationDesc?: string;
	authorId?: string;
	receiverId: string;
	memberId: string;
	tourId?: string;
	bookingId?: string;
	paymentId?: string;
	articleId?: string;
	commentId?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface Notifications {
	list: Notification[];
	metaCounter: TotalCounter[];
}
