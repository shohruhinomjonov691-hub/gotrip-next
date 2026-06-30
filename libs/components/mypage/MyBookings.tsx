import React, { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import FlightTakeoffRoundedIcon from '@mui/icons-material/FlightTakeoffRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import {
	Button,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	MenuItem,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import moment from 'moment';
import { GET_MY_BOOKINGS } from '../../../apollo/user/query';
import { CANCEL_BOOKING, CREATE_PAYMENT } from '../../../apollo/user/mutation';
import { Direction } from '../../enums/common.enum';
import { BookingStatus, PaymentMethod } from '../../enums/tour.enum';
import { Booking } from '../../types/booking/booking';
import { T } from '../../types/common';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { formatterStr } from '../../utils';

type BookingFilter = 'ALL' | BookingStatus;

const BOOKING_FILTERS: BookingFilter[] = ['ALL', ...Object.values(BookingStatus)];
const DEFAULT_CANCEL_REASON = 'Cancelled by traveler.';
const cardTransition = { duration: 0.32, ease: 'easeOut' as const };

const createBookingsInput = (bookingStatus: BookingFilter) => ({
	page: 1,
	limit: 12,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: bookingStatus === 'ALL' ? {} : { bookingStatus },
});

const shortId = (value?: string) => (value ? value.slice(-8).toUpperCase() : 'UNKNOWN');
const formatDate = (value?: Date | string) => (value ? moment(value).format('MMM D, YYYY') : 'Not available');
const formatCurrency = (value?: number) => `$${formatterStr(value ?? 0)}`;

const MyBookings = () => {
	const [bookings, setBookings] = useState<Booking[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);
	const [activeStatus, setActiveStatus] = useState<BookingFilter>('ALL');
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CARD);
	const [paymentRequestId, setPaymentRequestId] = useState<string>('');
	const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
	const [cancelReason, setCancelReason] = useState<string>(DEFAULT_CANCEL_REASON);
	const prefersReducedMotion = useReducedMotion();
	const input = useMemo(() => createBookingsInput(activeStatus), [activeStatus]);
	const [cancelBooking, { loading: cancellingBooking }] = useMutation(CANCEL_BOOKING);
	const [createPayment, { loading: creatingPayment }] = useMutation(CREATE_PAYMENT);

	const { loading, error, refetch } = useQuery(GET_MY_BOOKINGS, {
		fetchPolicy: 'cache-and-network',
		notifyOnNetworkStatusChange: true,
		variables: { input },
		onCompleted: (data: T) => {
			setBookings(data?.getMyBookings?.list ?? []);
			setTotalCount(data?.getMyBookings?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const summary = useMemo(() => {
		return {
			pending: bookings.filter((booking) => booking.bookingStatus === BookingStatus.PENDING).length,
			confirmed: bookings.filter((booking) => booking.bookingStatus === BookingStatus.CONFIRMED).length,
			value: bookings.reduce((sum, booking) => sum + (booking.totalPrice ?? 0), 0),
		};
	}, [bookings]);

	const cancelHandler = async () => {
		if (!cancelTarget) return;

		try {
			await cancelBooking({
				variables: { bookingId: cancelTarget._id, cancelReason: cancelReason.trim() || DEFAULT_CANCEL_REASON },
			});
			await refetch({ input });
			setCancelTarget(null);
			setCancelReason(DEFAULT_CANCEL_REASON);
			await sweetTopSmallSuccessAlert('Booking cancelled', 900);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const paymentHandler = async (booking: Booking) => {
		if (booking.bookingStatus !== BookingStatus.PENDING) return;

		try {
			await createPayment({
				variables: {
					input: {
						bookingId: booking._id,
						paymentAmount: booking.totalPrice,
						paymentMethod,
					},
				},
			});
			setPaymentRequestId(booking._id);
			await refetch({ input });
			await sweetTopSmallSuccessAlert('Payment request created', 900);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	return (
		<>
			<motion.div
				className="mypage-panel premium-panel account-flow-panel"
				initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.42, ease: 'easeOut' }}
			>
				<Stack className="panel-heading account-panel-heading" direction={{ xs: 'column', md: 'row' }} justifyContent="space-between">
					<div>
						<Typography className="panel-kicker">Traveler dashboard</Typography>
						<Typography className="panel-title">My bookings</Typography>
						<Typography className="panel-copy">Track tour reservations, internal payment requests, and cancellations.</Typography>
					</div>
					<TextField
						select
						size="small"
						label="Payment method"
						value={paymentMethod}
						onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
					>
						{Object.values(PaymentMethod).map((method) => (
							<MenuItem key={method} value={method}>
								{method.replace('_', ' ')}
							</MenuItem>
						))}
					</TextField>
				</Stack>

				<div className="account-panel-metrics">
					<div className="account-metric-card">
						<ReceiptLongRoundedIcon />
						<span>Total shown</span>
						<strong>{totalCount || bookings.length}</strong>
					</div>
					<div className="account-metric-card">
						<CreditCardRoundedIcon />
						<span>Pending</span>
						<strong>{summary.pending}</strong>
					</div>
					<div className="account-metric-card">
						<FlightTakeoffRoundedIcon />
						<span>Confirmed</span>
						<strong>{summary.confirmed}</strong>
					</div>
					<div className="account-metric-card gold">
						<span>Current value</span>
						<strong>{formatCurrency(summary.value)}</strong>
					</div>
				</div>

				<div className="status-tabs" role="tablist" aria-label="Booking status filters">
					{BOOKING_FILTERS.map((status) => (
						<motion.button
							key={status}
							type="button"
							className={activeStatus === status ? 'active' : ''}
							onClick={() => setActiveStatus(status)}
							whileHover={prefersReducedMotion ? undefined : { y: -1 }}
							whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
						>
							{status === 'ALL' ? 'All' : status}
						</motion.button>
					))}
				</div>

				{loading && !bookings.length ? (
					<Stack className="booking-list">
						{[0, 1, 2].map((item) => (
							<div className="account-skeleton-card" key={item}>
								<span />
								<strong />
								<em />
							</div>
						))}
					</Stack>
				) : error ? (
					<div className="account-error-state">
						<Typography className="account-state-title">Bookings could not load</Typography>
						<Typography className="gt-muted">Please retry the existing booking query.</Typography>
						<Button className="gt-primary-button" startIcon={<ReplayRoundedIcon />} onClick={() => refetch({ input })}>
							Retry
						</Button>
					</div>
				) : bookings.length === 0 ? (
					<div className="account-empty-state">
						<FlightTakeoffRoundedIcon />
						<Typography className="account-state-title">
							{activeStatus === 'ALL' ? 'No bookings yet' : `No ${activeStatus.toLowerCase()} bookings`}
						</Typography>
						<Typography className="gt-muted">Your tour reservations will appear here once created.</Typography>
					</div>
				) : (
					<motion.div
						className="booking-list"
						initial={prefersReducedMotion ? false : 'hidden'}
						animate="visible"
						variants={{ visible: { transition: { staggerChildren: 0.06 } }, hidden: {} }}
					>
						{bookings.map((booking) => {
							const canCreatePayment = booking.bookingStatus === BookingStatus.PENDING;
							const canCancel = [BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(booking.bookingStatus);

							return (
								<motion.div
									className="booking-row gt-card booking-dashboard-card"
									key={booking._id}
									variants={{
										hidden: { opacity: 0, y: 16 },
										visible: { opacity: 1, y: 0, transition: cardTransition },
									}}
									whileHover={prefersReducedMotion ? undefined : { y: -3 }}
									transition={cardTransition}
								>
									<div className="booking-card-content">
										<div className="booking-card-media">
											<FlightTakeoffRoundedIcon />
											<span>Tour</span>
											<strong>{shortId(booking.tourId)}</strong>
										</div>
										<div className="booking-card-main">
											<div className="booking-card-top">
												<div>
													<Chip
														label={booking.bookingStatus}
														className={`status-chip ${booking.bookingStatus.toLowerCase()}`}
													/>
													<Typography className="booking-number">{booking.bookingNumber}</Typography>
													<Typography className="gt-muted">Booking ID: {shortId(booking._id)}</Typography>
												</div>
												<div className="booking-card-price">
													<Typography className="booking-price">{formatCurrency(booking.totalPrice)}</Typography>
													<Typography className="gt-muted">Internal payment amount</Typography>
												</div>
											</div>

											<div className="booking-card-meta-grid">
												<div>
													<CalendarMonthRoundedIcon />
													<span>Booked for</span>
													<strong>{formatDate(booking.bookingDate)}</strong>
												</div>
												<div>
													<GroupsRoundedIcon />
													<span>Travelers</span>
													<strong>
														{booking.peopleCount} traveler{booking.peopleCount === 1 ? '' : 's'}
													</strong>
												</div>
												<div>
													<ReceiptLongRoundedIcon />
													<span>Schedule</span>
													<strong>{shortId(booking.scheduleId)}</strong>
												</div>
												<div>
													<CreditCardRoundedIcon />
													<span>Traveler contact</span>
													<strong>{booking.travelerEmail || booking.travelerPhone || 'Not available'}</strong>
												</div>
											</div>

											<Stack className="booking-card-actions" direction="row" gap={1} flexWrap="wrap">
												{canCreatePayment && (
													<Button
														className="gt-primary-button"
														onClick={() => paymentHandler(booking)}
														disabled={creatingPayment}
														startIcon={<CreditCardRoundedIcon />}
													>
														Create payment request
													</Button>
												)}
												{canCancel && (
													<Button
														className="gt-soft-danger-button"
														onClick={() => {
															setCancelTarget(booking);
															setCancelReason(booking.cancelReason || DEFAULT_CANCEL_REASON);
														}}
														disabled={cancellingBooking}
														startIcon={<CloseRoundedIcon />}
													>
														Cancel booking
													</Button>
												)}
											</Stack>

											<AnimatePresence>
												{paymentRequestId === booking._id && (
													<motion.div
														className="booking-inline-success"
														initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
														animate={{ opacity: 1, y: 0 }}
														exit={{ opacity: 0, y: -6 }}
														transition={cardTransition}
													>
														<CreditCardRoundedIcon />
														<span>Payment request is pending internal admin processing.</span>
													</motion.div>
												)}
											</AnimatePresence>
										</div>
									</div>
								</motion.div>
							);
						})}
					</motion.div>
				)}
			</motion.div>

			<Dialog
				open={!!cancelTarget}
				onClose={() => setCancelTarget(null)}
				className="cancel-booking-dialog"
				fullWidth
				maxWidth="xs"
			>
				<DialogTitle>Cancel booking</DialogTitle>
				<DialogContent>
					<Typography className="gt-muted">
						This keeps the existing backend cancellation flow and sends your reason with the request.
					</Typography>
					<TextField
						fullWidth
						multiline
						minRows={3}
						label="Cancellation reason"
						value={cancelReason}
						onChange={(event) => setCancelReason(event.target.value)}
						margin="normal"
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setCancelTarget(null)} disabled={cancellingBooking}>
						Keep booking
					</Button>
					<Button className="gt-soft-danger-button" onClick={cancelHandler} disabled={cancellingBooking}>
						Confirm cancel
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default MyBookings;
