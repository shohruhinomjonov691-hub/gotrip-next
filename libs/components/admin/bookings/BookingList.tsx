import React from 'react';
import Moment from 'react-moment';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import { Booking } from '../../../types/booking/booking';
import { BookingStatus } from '../../../enums/tour.enum';
import { formatterStr } from '../../../utils';

interface BookingListProps {
	bookings: Booking[];
	loading?: boolean;
	actionBusy?: boolean;
	onUpdateStatus: (booking: Booking, status: BookingStatus) => void;
	onCancel: (booking: Booking) => void;
}

const SKELETON_ROWS: readonly number[] = [0, 1, 2, 3, 4, 5];
const bookingStatusClass = (status?: string) => `admin-status admin-status--${(status ?? 'pending').toLowerCase()}`;
const shortId = (value?: string) => value ? value.slice(-8).toUpperCase() : 'Unknown';
const formatPrice = (value: number) => `$${formatterStr(value)}`;

export const BookingList = ({ bookings, loading = false, actionBusy = false, onUpdateStatus, onCancel }: BookingListProps): React.ReactElement => {
	const reduceMotion = Boolean(useReducedMotion());

	const renderLoadingState = (): React.ReactElement => (
		<div className="admin-table-skeleton" role="status" aria-label="Loading bookings">
			{SKELETON_ROWS.map((index) => <span key={index} />)}
		</div>
	);

	const renderActions = (booking: Booking, mobile = false): React.ReactElement | null => {
		if (booking.bookingStatus === BookingStatus.PENDING) {
			return (
				<div className={mobile ? 'admin-mobile-card__actions' : 'admin-booking-actions'}>
					<Button className="admin-action-button" disabled={actionBusy} onClick={() => onUpdateStatus(booking, BookingStatus.CONFIRMED)}>Confirm</Button>
					<Button className="admin-action-button admin-action-button--danger" disabled={actionBusy} onClick={() => onCancel(booking)}>Cancel</Button>
				</div>
			);
		}
		if (booking.bookingStatus === BookingStatus.CONFIRMED) {
			return (
				<div className={mobile ? 'admin-mobile-card__actions' : 'admin-booking-actions'}>
					<Button className="admin-action-button" disabled={actionBusy} onClick={() => onUpdateStatus(booking, BookingStatus.COMPLETED)}>Complete</Button>
					<Button className="admin-action-button admin-action-button--danger" disabled={actionBusy} onClick={() => onCancel(booking)}>Cancel</Button>
				</div>
			);
		}
		return null;
	};

	const renderDesktopRow = (booking: Booking): React.ReactElement => (
		<TableRow key={booking._id}>
			<TableCell>
				<div className="admin-booking-cell">
					<strong>{booking.bookingNumber}</strong>
					<span>Booking {shortId(booking._id)}</span>
				</div>
			</TableCell>
			<TableCell>
				<div className="admin-booking-cell">
					<strong>{booking.travelerName}</strong>
					<span>{booking.travelerEmail || booking.travelerPhone}</span>
				</div>
			</TableCell>
			<TableCell>
				<div className="admin-id-pair">
					<span>Tour {shortId(booking.tourId)}</span>
					<span>Member {shortId(booking.memberId)}</span>
					<span>Agent {shortId(booking.agentId)}</span>
				</div>
			</TableCell>
			<TableCell align="center">{booking.peopleCount}</TableCell>
			<TableCell>{formatPrice(booking.totalPrice)}</TableCell>
			<TableCell><span className={bookingStatusClass(booking.bookingStatus)}>{booking.bookingStatus}</span></TableCell>
			<TableCell><div className="admin-date-cell"><span><Moment format="DD MMM YYYY">{booking.createdAt}</Moment></span><span>Updated <Moment format="DD MMM YYYY">{booking.updatedAt}</Moment></span></div></TableCell>
			<TableCell align="right">{renderActions(booking)}</TableCell>
		</TableRow>
	);

	const renderMobileCard = (booking: Booking, index: number): React.ReactElement => (
		<motion.article
			key={booking._id}
			className="admin-mobile-card admin-mobile-card--booking"
			initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.18, delay: reduceMotion ? 0 : Math.min(index * 0.025, 0.12) }}
		>
			<div className="admin-mobile-card__title"><strong>{booking.bookingNumber}</strong><span className={bookingStatusClass(booking.bookingStatus)}>{booking.bookingStatus}</span></div>
			<p>{booking.travelerName} · {formatPrice(booking.totalPrice)}</p>
			<div className="admin-mobile-card__meta"><span>{booking.peopleCount} travelers</span><span>Tour {shortId(booking.tourId)}</span><span>Member {shortId(booking.memberId)}</span></div>
			<div className="admin-mobile-card__copy"><span>Agent {shortId(booking.agentId)} · Updated <Moment format="DD MMM YYYY">{booking.updatedAt}</Moment></span></div>
			{renderActions(booking, true)}
		</motion.article>
	);

	if (loading) return renderLoadingState();
	if (!bookings.length) return <div className="admin-state admin-state--empty">No bookings match these controls.</div>;

	const desktopRows: React.ReactElement[] = bookings.map(renderDesktopRow);
	const mobileCards: React.ReactElement[] = bookings.map(renderMobileCard);

	return (
		<>
			<TableContainer className="admin-data-table"><Table aria-label="Booking management"><TableHead><TableRow><TableCell>Booking</TableCell><TableCell>Traveler</TableCell><TableCell>References</TableCell><TableCell align="center">People</TableCell><TableCell>Total</TableCell><TableCell>Status</TableCell><TableCell>Dates</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead><TableBody>{desktopRows}</TableBody></Table></TableContainer>
			<div className="admin-mobile-cards">{mobileCards}</div>
		</>
	);
};
