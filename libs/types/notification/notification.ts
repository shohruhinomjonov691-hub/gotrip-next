import { NotificationGroup, NotificationStatus, NotificationType } from '../../enums/notification.enum';
import { TotalCounter } from '../shared';

export interface Notification {
	_id: string;
	notificationType: NotificationType;
	notificationStatus: NotificationStatus;
	notificationGroup: NotificationGroup;
	notificationTitle: string;
	notificationDesc?: string;
	/** In-app destination for events with no derivable target id. */
	notificationLink?: string;
	authorId?: string;
	receiverId: string;
	tourId?: string;
	articleId?: string;
	commentId?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface Notifications {
	list: Notification[];
	metaCounter: TotalCounter[];
}
