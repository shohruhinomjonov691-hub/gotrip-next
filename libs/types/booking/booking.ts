import { BookingStatus } from '../../enums/tour.enum';
import { TotalCounter } from '../shared';

export interface Booking {
	_id: string;
	bookingStatus: BookingStatus;
	bookingNumber: string;
	tourId: string;
	memberId: string;
	agentId: string;
	scheduleId: string;
	peopleCount: number;
	totalPrice: number;
	bookingDate: Date;
	travelerName: string;
	travelerEmail: string;
	travelerPhone: string;
	passportNumber?: string;
	specialRequest?: string;
	cancelReason?: string;
	cancelledAt?: Date;
	expiresAt: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface Bookings {
	list: Booking[];
	metaCounter: TotalCounter[];
}
