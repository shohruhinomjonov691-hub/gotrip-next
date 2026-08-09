import { TotalCounter } from '../shared';
import { TestimonialStatus } from '../../enums/testimonial.enum';

export interface Testimonial {
	_id: string;
	testimonialStatus: TestimonialStatus;
	testimonialContent: string;
	testimonialRating?: number;
	authorName: string;
	authorRole?: string;
	authorImage?: string;
	memberId?: string;
	tourId?: string;
	testimonialOrder: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface Testimonials {
	list: Testimonial[];
	metaCounter: TotalCounter[];
}
