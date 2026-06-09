import { TotalCounter } from '../shared';
import { TourScheduleStatus } from '../../enums/tour.enum';

export interface TourSchedule {
	_id: string;
	scheduleStatus: TourScheduleStatus;
	tourId: string;
	startDate: Date;
	endDate: Date;
	availableSeats: number;
	reservedSeats: number;
	price: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface TourSchedules {
	list: TourSchedule[];
	metaCounter: TotalCounter[];
}
