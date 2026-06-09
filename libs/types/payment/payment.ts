import { PaymentMethod, PaymentStatus } from '../../enums/tour.enum';
import { TotalCounter } from '../shared';

export interface Payment {
	_id: string;
	paymentStatus: PaymentStatus;
	paymentMethod: PaymentMethod;
	paymentAmount: number;
	bookingId: string;
	memberId: string;
	tourId: string;
	transactionId?: string;
	paidAt?: Date;
	refundedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface Payments {
	list: Payment[];
	metaCounter: TotalCounter[];
}
