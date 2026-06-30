import React, { useMemo, useState } from 'react';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	MenuItem,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Tooltip,
	Typography,
	useMediaQuery,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { motion, useReducedMotion } from 'framer-motion';
import {
	GET_AGENT_BOOKING,
	GET_AGENT_BOOKINGS,
	GET_AGENT_PAYMENT,
	GET_AGENT_PAYMENTS,
	GET_AGENT_TOURS,
	GET_TOUR_SCHEDULES,
} from '../../../apollo/user/query';
import {
	CREATE_TOUR_SCHEDULE,
	DELETE_TOUR_SCHEDULE,
	UPDATE_AGENT_BOOKING_STATUS,
	UPDATE_TOUR,
	UPDATE_TOUR_SCHEDULE,
} from '../../../apollo/user/mutation';
import { Direction } from '../../enums/common.enum';
import { BookingStatus, PaymentMethod, PaymentStatus, TourScheduleStatus, TourStatus } from '../../enums/tour.enum';
import { Booking } from '../../types/booking/booking';
import { Payment } from '../../types/payment/payment';
import { Tour } from '../../types/tour/tour';
import { TourSchedule } from '../../types/tour/tour-schedule';
import { TourUpdate } from '../../types/tour/tour.update';
import { T } from '../../types/common';
import { sweetConfirmAlert, sweetErrorHandling, sweetMixinSuccessAlert } from '../../sweetAlert';

const base = { page: 1, limit: 12, sort: 'createdAt', direction: Direction.DESC };
const editableScheduleStatuses = [TourScheduleStatus.ACTIVE, TourScheduleStatus.PAUSED];
const AGENT_BOOKING_LIMIT = 5;
const AGENT_PAYMENT_LIMIT = 5;
const bookingStatuses = Object.values(BookingStatus) as BookingStatus[];
const paymentStatuses = Object.values(PaymentStatus) as PaymentStatus[];
const paymentMethods = Object.values(PaymentMethod) as PaymentMethod[];

type BookingStatusFilter = 'ALL' | BookingStatus;
type PaymentStatusFilter = 'ALL' | PaymentStatus;
type PaymentMethodFilter = 'ALL' | PaymentMethod;

interface AgentBookingSearch {
	bookingStatus?: BookingStatus;
	tourId?: string;
	scheduleId?: string;
	bookingNumber?: string;
	startDate?: string;
	endDate?: string;
}

interface AgentBookingsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: AgentBookingSearch;
}

interface AgentPaymentSearch {
	paymentStatus?: PaymentStatus;
	paymentMethod?: PaymentMethod;
	bookingId?: string;
	tourId?: string;
	startDate?: string;
	endDate?: string;
}

interface AgentPaymentsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: AgentPaymentSearch;
}

const defaultBookingInquiry: AgentBookingsInquiry = {
	page: 1,
	limit: AGENT_BOOKING_LIMIT,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

const defaultPaymentInquiry: AgentPaymentsInquiry = {
	page: 1,
	limit: AGENT_PAYMENT_LIMIT,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

interface ScheduleFormValues {
	startDate: string;
	endDate: string;
	price: string;
	availableSeats: string;
	scheduleStatus: TourScheduleStatus;
}

interface CreateScheduleInput {
	tourId: string;
	startDate: string;
	endDate: string;
	price: number;
	availableSeats: number;
}

interface UpdateScheduleInput {
	_id: string;
	startDate: string;
	endDate: string;
	price: number;
	availableSeats: number;
	scheduleStatus?: TourScheduleStatus;
}

const toDateInput = (value?: Date | string) => {
	if (!value) return '';
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};

const toIsoDate = (value: string) => new Date(`${value}T00:00:00.000Z`).toISOString();
const formatScheduleDate = (value: Date | string) => new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
const formatCurrency = (value: number) => `$${new Intl.NumberFormat('en-US').format(value)}`;
const formatDateTime = (value?: Date | string) => {
	if (!value) return 'Not set';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return 'Not set';
	return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};
const shortId = (value?: string) => (value ? value.slice(-8).toUpperCase() : 'Not set');
const getScheduleStatus = (schedule: TourSchedule) =>
	schedule.reservedSeats >= schedule.availableSeats ? TourScheduleStatus.FULL : schedule.scheduleStatus;

const normalizeBookingInquiry = (inquiry: AgentBookingsInquiry): AgentBookingsInquiry => ({
	...inquiry,
	search: {
		...inquiry.search,
		startDate: inquiry.search.startDate ? toIsoDate(inquiry.search.startDate) : undefined,
		endDate: inquiry.search.endDate ? toIsoDate(inquiry.search.endDate) : undefined,
	},
});

const normalizePaymentInquiry = (inquiry: AgentPaymentsInquiry): AgentPaymentsInquiry => ({
	...inquiry,
	search: {
		...inquiry.search,
		startDate: inquiry.search.startDate ? toIsoDate(inquiry.search.startDate) : undefined,
		endDate: inquiry.search.endDate ? toIsoDate(inquiry.search.endDate) : undefined,
	},
});

const createScheduleForm = (tour?: Tour): ScheduleFormValues => {
	const today = new Date().toISOString().slice(0, 10);
	return {
		startDate: today,
		endDate: today,
		price: String(tour?.tourPrice ?? 0),
		availableSeats: String(tour?.tourAvailableSeats ?? 1),
		scheduleStatus: TourScheduleStatus.ACTIVE,
	};
};

const createEditScheduleForm = (schedule: TourSchedule): ScheduleFormValues => ({
	startDate: toDateInput(schedule.startDate),
	endDate: toDateInput(schedule.endDate),
	price: String(schedule.price),
	availableSeats: String(schedule.availableSeats),
	scheduleStatus:
		schedule.scheduleStatus === TourScheduleStatus.PAUSED ? TourScheduleStatus.PAUSED : TourScheduleStatus.ACTIVE,
});

export default function MyTours() {
	const reduceMotion = useReducedMotion();
	const compactDialog = useMediaQuery('(max-width: 700px)', { noSsr: true });
	const [tours, setTours] = useState<Tour[]>([]);
	const [status, setStatus] = useState<TourStatus>(TourStatus.ACTIVE);
	const [editTour, setEditTour] = useState<TourUpdate | null>(null);
	const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
	const [schedules, setSchedules] = useState<TourSchedule[]>([]);
	const [scheduleForm, setScheduleForm] = useState<ScheduleFormValues>(createScheduleForm());
	const [editingSchedule, setEditingSchedule] = useState<TourSchedule | null>(null);
	const [scheduleFormError, setScheduleFormError] = useState('');
	const [bookingInquiry, setBookingInquiry] = useState<AgentBookingsInquiry>(defaultBookingInquiry);
	const [bookings, setBookings] = useState<Booking[]>([]);
	const [bookingTotal, setBookingTotal] = useState(0);
	const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
	const [paymentInquiry, setPaymentInquiry] = useState<AgentPaymentsInquiry>(defaultPaymentInquiry);
	const [payments, setPayments] = useState<Payment[]>([]);
	const [paymentTotal, setPaymentTotal] = useState(0);
	const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

	const bookingQueryInput = useMemo(() => normalizeBookingInquiry(bookingInquiry), [bookingInquiry]);
	const paymentQueryInput = useMemo(() => normalizePaymentInquiry(paymentInquiry), [paymentInquiry]);

	const toursQuery = useQuery(GET_AGENT_TOURS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { ...base, search: { tourStatus: status } } },
		onCompleted: (data: T) => setTours(data?.getAgentTours?.list ?? []),
	});
	const schedulesQuery = useQuery(GET_TOUR_SCHEDULES, {
		fetchPolicy: 'network-only',
		variables: { tourId: selectedTour?._id ?? '' },
		skip: !selectedTour?._id,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => setSchedules(data?.getTourSchedules?.list ?? []),
	});
	const bookingsQuery = useQuery(GET_AGENT_BOOKINGS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: bookingQueryInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setBookings(data?.getAgentBookings?.list ?? []);
			setBookingTotal(data?.getAgentBookings?.metaCounter?.[0]?.total ?? 0);
		},
	});
	const paymentsQuery = useQuery(GET_AGENT_PAYMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: paymentQueryInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setPayments(data?.getAgentPayments?.list ?? []);
			setPaymentTotal(data?.getAgentPayments?.metaCounter?.[0]?.total ?? 0);
		},
	});
	const [loadAgentBooking, bookingDetailQuery] = useLazyQuery(GET_AGENT_BOOKING, {
		fetchPolicy: 'network-only',
		onCompleted: (data: T) => setSelectedBooking(data?.getAgentBooking ?? null),
	});
	const [loadAgentPayment, paymentDetailQuery] = useLazyQuery(GET_AGENT_PAYMENT, {
		fetchPolicy: 'network-only',
		onCompleted: (data: T) => setSelectedPayment(data?.getAgentPayment ?? null),
	});

	const [updateTour, { loading: updatingTour }] = useMutation(UPDATE_TOUR);
	const [updateAgentBookingStatus, { loading: updatingAgentBooking }] = useMutation(UPDATE_AGENT_BOOKING_STATUS);
	const [createSchedule, { loading: creatingSchedule }] = useMutation(CREATE_TOUR_SCHEDULE);
	const [updateSchedule, { loading: updatingSchedule }] = useMutation(UPDATE_TOUR_SCHEDULE);
	const [deleteSchedule, { loading: deletingSchedule }] = useMutation(DELETE_TOUR_SCHEDULE);

	const stats = useMemo(
		() => ({
			active: tours.filter((tour) => tour.tourStatus === TourStatus.ACTIVE).length,
			seats: tours.reduce((count, tour) => count + tour.tourAvailableSeats, 0),
			views: tours.reduce((count, tour) => count + tour.tourViews, 0),
			likes: tours.reduce((count, tour) => count + tour.tourLikes, 0),
		}),
		[tours],
	);

	const scheduleBusy = creatingSchedule || updatingSchedule || deletingSchedule;
	const editingIsFull = editingSchedule ? Number(scheduleForm.availableSeats) <= editingSchedule.reservedSeats : false;

	const saveTour = async () => {
		try {
			if (!editTour) return;
			await updateTour({ variables: { input: editTour } });
			await toursQuery.refetch();
			setEditTour(null);
			await sweetMixinSuccessAlert('Tour updated successfully.');
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	const openSchedules = (tour: Tour) => {
		setSelectedTour(tour);
		setSchedules([]);
		setEditingSchedule(null);
		setScheduleForm(createScheduleForm(tour));
		setScheduleFormError('');
	};

	const closeSchedules = () => {
		if (scheduleBusy) return;
		setSelectedTour(null);
		setSchedules([]);
		setEditingSchedule(null);
		setScheduleForm(createScheduleForm());
		setScheduleFormError('');
	};

	const updateScheduleForm = (field: keyof ScheduleFormValues, value: string) => {
		setScheduleForm((current) => ({ ...current, [field]: value }));
		setScheduleFormError('');
	};

	const validateSchedule = (reservedSeats = 0) => {
		const price = Number(scheduleForm.price);
		const availableSeats = Number(scheduleForm.availableSeats);

		if (!scheduleForm.startDate || !scheduleForm.endDate) {
			setScheduleFormError('Choose both a start date and an end date.');
			return null;
		}
		if (new Date(scheduleForm.endDate) < new Date(scheduleForm.startDate)) {
			setScheduleFormError('The end date must be on or after the start date.');
			return null;
		}
		if (!Number.isFinite(price) || price < 0) {
			setScheduleFormError('Price must be zero or greater.');
			return null;
		}
		if (!Number.isInteger(availableSeats) || availableSeats < 1) {
			setScheduleFormError('Available seats must be at least one whole seat.');
			return null;
		}
		if (availableSeats < reservedSeats) {
			setScheduleFormError(`Available seats cannot be lower than the ${reservedSeats} reserved seat${reservedSeats === 1 ? '' : 's'}.`);
			return null;
		}

		return { price, availableSeats };
	};

	const refreshScheduleData = async () => {
		if (!selectedTour) return;
		await Promise.all([schedulesQuery.refetch({ tourId: selectedTour._id }), toursQuery.refetch()]);
	};

	const updateBookingSearch = (field: keyof AgentBookingSearch, value: string) => {
		setBookingInquiry((current) => {
			const search = { ...current.search };
			if (!value || value === 'ALL') delete search[field];
			else search[field] = value as never;
			return { ...current, page: 1, search };
		});
	};

	const updatePaymentSearch = (field: keyof AgentPaymentSearch, value: string) => {
		setPaymentInquiry((current) => {
			const search = { ...current.search };
			if (!value || value === 'ALL') delete search[field];
			else search[field] = value as never;
			return { ...current, page: 1, search };
		});
	};

	const clearBookingFilters = () => setBookingInquiry(defaultBookingInquiry);
	const clearPaymentFilters = () => setPaymentInquiry(defaultPaymentInquiry);

	const changeBookingPage = (direction: 'next' | 'previous') => {
		setBookingInquiry((current) => ({
			...current,
			page: direction === 'next' ? current.page + 1 : Math.max(1, current.page - 1),
		}));
	};

	const changePaymentPage = (direction: 'next' | 'previous') => {
		setPaymentInquiry((current) => ({
			...current,
			page: direction === 'next' ? current.page + 1 : Math.max(1, current.page - 1),
		}));
	};

	const openBookingDetail = async (booking: Booking) => {
		setSelectedBooking(booking);
		await loadAgentBooking({ variables: { bookingId: booking._id } });
	};

	const openPaymentDetail = async (payment: Payment) => {
		setSelectedPayment(payment);
		await loadAgentPayment({ variables: { paymentId: payment._id } });
	};

	const updateAgentBookingHandler = async (booking: Booking, bookingStatus: BookingStatus) => {
		const action = bookingStatus === BookingStatus.CANCELLED ? 'cancel' : 'complete';
		const successMessage = bookingStatus === BookingStatus.CANCELLED ? 'Booking cancelled.' : 'Booking completed.';
		if (!(await sweetConfirmAlert(`Confirm ${action} for booking ${booking.bookingNumber}?`))) return;
		try {
			await updateAgentBookingStatus({ variables: { bookingId: booking._id, bookingStatus } });
			await bookingsQuery.refetch({ input: bookingQueryInput });
			if (selectedBooking?._id === booking._id) {
				await loadAgentBooking({ variables: { bookingId: booking._id } });
			}
			await sweetMixinSuccessAlert(successMessage);
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	const createScheduleHandler = async () => {
		try {
			if (!selectedTour) return;
			const values = validateSchedule();
			if (!values) return;

			const input: CreateScheduleInput = {
				tourId: selectedTour._id,
				startDate: toIsoDate(scheduleForm.startDate),
				endDate: toIsoDate(scheduleForm.endDate),
				price: values.price,
				availableSeats: values.availableSeats,
			};
			await createSchedule({ variables: { input } });
			setScheduleForm(createScheduleForm(selectedTour));
			await refreshScheduleData();
			await sweetMixinSuccessAlert('Schedule created.');
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	const openScheduleEditor = (schedule: TourSchedule) => {
		setEditingSchedule(schedule);
		setScheduleForm(createEditScheduleForm(schedule));
		setScheduleFormError('');
	};

	const saveScheduleHandler = async () => {
		try {
			if (!editingSchedule) return;
			const values = validateSchedule(editingSchedule.reservedSeats);
			if (!values) return;

			const input: UpdateScheduleInput = {
				_id: editingSchedule._id,
				startDate: toIsoDate(scheduleForm.startDate),
				endDate: toIsoDate(scheduleForm.endDate),
				price: values.price,
				availableSeats: values.availableSeats,
			};
			if (values.availableSeats > editingSchedule.reservedSeats) input.scheduleStatus = scheduleForm.scheduleStatus;

			await updateSchedule({ variables: { input } });
			setEditingSchedule(null);
			setScheduleForm(createScheduleForm(selectedTour ?? undefined));
			await refreshScheduleData();
			await sweetMixinSuccessAlert('Schedule updated.');
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	const deleteScheduleHandler = async (schedule: TourSchedule) => {
		try {
			if (!(await sweetConfirmAlert(`Delete the ${formatScheduleDate(schedule.startDate)} schedule?`))) return;
			await deleteSchedule({ variables: { scheduleId: schedule._id } });
			if (editingSchedule?._id === schedule._id) {
				setEditingSchedule(null);
				setScheduleForm(createScheduleForm(selectedTour ?? undefined));
			}
			await refreshScheduleData();
			await sweetMixinSuccessAlert('Schedule deleted.');
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	const renderBookingFilters = (): React.ReactElement => (
		<div className="agent-ops-filters" aria-label="Filter agent bookings">
			<label>
				<span>Status</span>
				<select
					aria-label="Filter bookings by status"
					value={bookingInquiry.search.bookingStatus ?? 'ALL'}
					onChange={(event) => updateBookingSearch('bookingStatus', event.target.value as BookingStatusFilter)}
				>
					<option value="ALL">All statuses</option>
					{bookingStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
				</select>
			</label>
			<label>
				<span>Booking number</span>
				<input aria-label="Filter bookings by booking number" value={bookingInquiry.search.bookingNumber ?? ''} onChange={(event) => updateBookingSearch('bookingNumber', event.target.value)} placeholder="GTB-..." />
			</label>
			<label>
				<span>Tour ID</span>
				<input aria-label="Filter bookings by tour ID" value={bookingInquiry.search.tourId ?? ''} onChange={(event) => updateBookingSearch('tourId', event.target.value)} placeholder="Tour ID" />
			</label>
			<label>
				<span>Schedule ID</span>
				<input aria-label="Filter bookings by schedule ID" value={bookingInquiry.search.scheduleId ?? ''} onChange={(event) => updateBookingSearch('scheduleId', event.target.value)} placeholder="Schedule ID" />
			</label>
			<label>
				<span>From</span>
				<input aria-label="Filter bookings from date" type="date" value={bookingInquiry.search.startDate ?? ''} onChange={(event) => updateBookingSearch('startDate', event.target.value)} />
			</label>
			<label>
				<span>To</span>
				<input aria-label="Filter bookings to date" type="date" value={bookingInquiry.search.endDate ?? ''} onChange={(event) => updateBookingSearch('endDate', event.target.value)} />
			</label>
			<button type="button" onClick={clearBookingFilters}>Clear</button>
		</div>
	);

	const renderPaymentFilters = (): React.ReactElement => (
		<div className="agent-ops-filters" aria-label="Filter agent payments">
			<label>
				<span>Status</span>
				<select
					aria-label="Filter payments by status"
					value={paymentInquiry.search.paymentStatus ?? 'ALL'}
					onChange={(event) => updatePaymentSearch('paymentStatus', event.target.value as PaymentStatusFilter)}
				>
					<option value="ALL">All statuses</option>
					{paymentStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
				</select>
			</label>
			<label>
				<span>Method</span>
				<select
					aria-label="Filter payments by method"
					value={paymentInquiry.search.paymentMethod ?? 'ALL'}
					onChange={(event) => updatePaymentSearch('paymentMethod', event.target.value as PaymentMethodFilter)}
				>
					<option value="ALL">All methods</option>
					{paymentMethods.map((item) => <option key={item} value={item}>{item.replace('_', ' ')}</option>)}
				</select>
			</label>
			<label>
				<span>Booking ID</span>
				<input aria-label="Filter payments by booking ID" value={paymentInquiry.search.bookingId ?? ''} onChange={(event) => updatePaymentSearch('bookingId', event.target.value)} placeholder="Booking ID" />
			</label>
			<label>
				<span>Tour ID</span>
				<input aria-label="Filter payments by tour ID" value={paymentInquiry.search.tourId ?? ''} onChange={(event) => updatePaymentSearch('tourId', event.target.value)} placeholder="Tour ID" />
			</label>
			<label>
				<span>From</span>
				<input aria-label="Filter payments from date" type="date" value={paymentInquiry.search.startDate ?? ''} onChange={(event) => updatePaymentSearch('startDate', event.target.value)} />
			</label>
			<label>
				<span>To</span>
				<input aria-label="Filter payments to date" type="date" value={paymentInquiry.search.endDate ?? ''} onChange={(event) => updatePaymentSearch('endDate', event.target.value)} />
			</label>
			<button type="button" onClick={clearPaymentFilters}>Clear</button>
		</div>
	);

	const renderBookingActions = (booking: Booking): React.ReactElement => (
		<div className="agent-ops-actions">
			<Button startIcon={<VisibilityOutlinedIcon />} onClick={() => openBookingDetail(booking)}>View</Button>
			{booking.bookingStatus === BookingStatus.PENDING && (
				<Button className="agent-ops-danger" startIcon={<BlockRoundedIcon />} onClick={() => updateAgentBookingHandler(booking, BookingStatus.CANCELLED)} disabled={updatingAgentBooking}>
					Cancel
				</Button>
			)}
			{booking.bookingStatus === BookingStatus.CONFIRMED && (
				<Button startIcon={<AssignmentTurnedInRoundedIcon />} onClick={() => updateAgentBookingHandler(booking, BookingStatus.COMPLETED)} disabled={updatingAgentBooking}>
					Complete
				</Button>
			)}
		</div>
	);

	const renderBookingRow = (booking: Booking): React.ReactElement => (
		<article className="agent-ops-row agent-ops-row--booking" key={booking._id}>
			<div className="agent-ops-row__main">
				<strong>{booking.bookingNumber}</strong>
				<span className={`agent-ops-badge is-${booking.bookingStatus.toLowerCase()}`}>{booking.bookingStatus}</span>
			</div>
			<div><span>Tour</span><strong>{shortId(booking.tourId)}</strong></div>
			<div><span>Schedule</span><strong>{shortId(booking.scheduleId)}</strong></div>
			<div><span>Member</span><strong>{shortId(booking.memberId)}</strong></div>
			<div><span>Travelers</span><strong>{booking.peopleCount}</strong></div>
			<div><span>Total</span><strong>{formatCurrency(booking.totalPrice)}</strong></div>
			<div><span>Traveler</span><strong>{booking.travelerName}</strong><small>{booking.travelerEmail}</small></div>
			<div><span>Created</span><strong>{formatDateTime(booking.createdAt)}</strong></div>
			{renderBookingActions(booking)}
		</article>
	);

	const renderPaymentRow = (payment: Payment): React.ReactElement => (
		<article className="agent-ops-row agent-ops-row--payment" key={payment._id}>
			<div className="agent-ops-row__main">
				<strong>{shortId(payment._id)}</strong>
				<span className={`agent-ops-badge is-${payment.paymentStatus.toLowerCase()}`}>{payment.paymentStatus}</span>
			</div>
			<div><span>Booking</span><strong>{shortId(payment.bookingId)}</strong></div>
			<div><span>Tour</span><strong>{shortId(payment.tourId)}</strong></div>
			<div><span>Member</span><strong>{shortId(payment.memberId)}</strong></div>
			<div><span>Amount</span><strong>{formatCurrency(payment.paymentAmount)}</strong></div>
			<div><span>Method</span><strong>{payment.paymentMethod.replace('_', ' ')}</strong></div>
			<div><span>Reference</span><strong>{payment.transactionId || 'Pending'}</strong></div>
			<div><span>Created</span><strong>{formatDateTime(payment.createdAt)}</strong></div>
			<div className="agent-ops-actions"><Button startIcon={<VisibilityOutlinedIcon />} onClick={() => openPaymentDetail(payment)}>View</Button></div>
		</article>
	);

	const renderBookingPanel = (): React.ReactElement => {
		const hasNext = bookingInquiry.page * bookingInquiry.limit < bookingTotal;
		return (
			<section className="agent-ops-panel" aria-labelledby="agent-bookings-title">
				<div className="agent-ops-panel__heading">
					<div><Typography component="h2" id="agent-bookings-title">Booking management</Typography><p>Review owned-tour reservations and use only the backend-supported lifecycle actions.</p></div>
					<strong>{bookingTotal} bookings</strong>
				</div>
				{renderBookingFilters()}
				{bookingsQuery.error && !bookings.length ? (
					<div className="agent-ops-state agent-ops-state--error"><Typography>Bookings could not load.</Typography><Button onClick={() => bookingsQuery.refetch({ input: bookingQueryInput })}>Retry</Button></div>
				) : bookingsQuery.loading && !bookings.length ? (
					<div className="agent-ops-state" role="status">Loading bookings...</div>
				) : !bookings.length ? (
					<div className="agent-ops-state"><Typography>No bookings match these filters yet.</Typography></div>
				) : (
					<div className="agent-ops-table" aria-label="Agent bookings">{bookings.map(renderBookingRow)}</div>
				)}
				<div className="agent-ops-pagination" aria-label="Agent booking pagination">
					<Button disabled={bookingInquiry.page <= 1 || bookingsQuery.loading} onClick={() => changeBookingPage('previous')}>Previous</Button>
					<span>Page {bookingInquiry.page}</span>
					<Button disabled={!hasNext || bookingsQuery.loading} onClick={() => changeBookingPage('next')}>Next</Button>
				</div>
			</section>
		);
	};

	const renderPaymentPanel = (): React.ReactElement => {
		const hasNext = paymentInquiry.page * paymentInquiry.limit < paymentTotal;
		return (
			<section className="agent-ops-panel" aria-labelledby="agent-payments-title">
				<div className="agent-ops-panel__heading">
					<div><Typography component="h2" id="agent-payments-title">Payment records</Typography><p>Read-only internal payment records for bookings on your tours.</p></div>
					<strong>{paymentTotal} payments</strong>
				</div>
				<div className="agent-ops-note"><PaymentsRoundedIcon />Payments remain internal GoTrip lifecycle records. Agents cannot mark, refund, or cancel payments.</div>
				{renderPaymentFilters()}
				{paymentsQuery.error && !payments.length ? (
					<div className="agent-ops-state agent-ops-state--error"><Typography>Payments could not load.</Typography><Button onClick={() => paymentsQuery.refetch({ input: paymentQueryInput })}>Retry</Button></div>
				) : paymentsQuery.loading && !payments.length ? (
					<div className="agent-ops-state" role="status">Loading payments...</div>
				) : !payments.length ? (
					<div className="agent-ops-state"><Typography>No payment records match these filters yet.</Typography></div>
				) : (
					<div className="agent-ops-table" aria-label="Agent payments">{payments.map(renderPaymentRow)}</div>
				)}
				<div className="agent-ops-pagination" aria-label="Agent payment pagination">
					<Button disabled={paymentInquiry.page <= 1 || paymentsQuery.loading} onClick={() => changePaymentPage('previous')}>Previous</Button>
					<span>Page {paymentInquiry.page}</span>
					<Button disabled={!hasNext || paymentsQuery.loading} onClick={() => changePaymentPage('next')}>Next</Button>
				</div>
			</section>
		);
	};

	const renderBookingDetailDialog = (): React.ReactElement => {
		const booking = selectedBooking;
		return (
			<Dialog open={Boolean(booking)} onClose={() => setSelectedBooking(null)} fullWidth maxWidth="sm" className="agent-ops-detail-dialog" aria-labelledby="agent-booking-detail-title">
				<DialogTitle id="agent-booking-detail-title">Booking details</DialogTitle>
				<DialogContent dividers>
					{bookingDetailQuery.loading && <div className="agent-ops-state" role="status">Loading booking...</div>}
					{bookingDetailQuery.error && <div className="agent-ops-state agent-ops-state--error">Booking details could not load.</div>}
					{booking && (
						<dl className="agent-ops-detail-list">
							<div><dt>Booking number</dt><dd>{booking.bookingNumber}</dd></div>
							<div><dt>Status</dt><dd><span className={`agent-ops-badge is-${booking.bookingStatus.toLowerCase()}`}>{booking.bookingStatus}</span></dd></div>
							<div><dt>Tour ID</dt><dd>{booking.tourId}</dd></div>
							<div><dt>Schedule ID</dt><dd>{booking.scheduleId}</dd></div>
							<div><dt>Member ID</dt><dd>{booking.memberId}</dd></div>
							<div><dt>Travelers</dt><dd>{booking.peopleCount}</dd></div>
							<div><dt>Total price</dt><dd>{formatCurrency(booking.totalPrice)}</dd></div>
							<div><dt>Traveler</dt><dd>{booking.travelerName}</dd></div>
							<div><dt>Email</dt><dd>{booking.travelerEmail}</dd></div>
							<div><dt>Phone</dt><dd>{booking.travelerPhone}</dd></div>
							<div><dt>Booking date</dt><dd>{formatDateTime(booking.bookingDate)}</dd></div>
							<div><dt>Created</dt><dd>{formatDateTime(booking.createdAt)}</dd></div>
							<div><dt>Updated</dt><dd>{formatDateTime(booking.updatedAt)}</dd></div>
							{booking.passportNumber && <div><dt>Passport</dt><dd>{booking.passportNumber}</dd></div>}
							{booking.specialRequest && <div><dt>Special request</dt><dd>{booking.specialRequest}</dd></div>}
							{booking.cancelReason && <div><dt>Cancel reason</dt><dd>{booking.cancelReason}</dd></div>}
						</dl>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setSelectedBooking(null)}>Close</Button>
					{booking && renderBookingActions(booking)}
				</DialogActions>
			</Dialog>
		);
	};

	const renderPaymentDetailDialog = (): React.ReactElement => {
		const payment = selectedPayment;
		return (
			<Dialog open={Boolean(payment)} onClose={() => setSelectedPayment(null)} fullWidth maxWidth="sm" className="agent-ops-detail-dialog" aria-labelledby="agent-payment-detail-title">
				<DialogTitle id="agent-payment-detail-title">Payment details</DialogTitle>
				<DialogContent dividers>
					{paymentDetailQuery.loading && <div className="agent-ops-state" role="status">Loading payment...</div>}
					{paymentDetailQuery.error && <div className="agent-ops-state agent-ops-state--error">Payment details could not load.</div>}
					{payment && (
						<dl className="agent-ops-detail-list">
							<div><dt>Payment ID</dt><dd>{payment._id}</dd></div>
							<div><dt>Status</dt><dd><span className={`agent-ops-badge is-${payment.paymentStatus.toLowerCase()}`}>{payment.paymentStatus}</span></dd></div>
							<div><dt>Booking ID</dt><dd>{payment.bookingId}</dd></div>
							<div><dt>Tour ID</dt><dd>{payment.tourId}</dd></div>
							<div><dt>Member ID</dt><dd>{payment.memberId}</dd></div>
							<div><dt>Amount</dt><dd>{formatCurrency(payment.paymentAmount)}</dd></div>
							<div><dt>Method</dt><dd>{payment.paymentMethod.replace('_', ' ')}</dd></div>
							<div><dt>Transaction</dt><dd>{payment.transactionId || 'Not recorded'}</dd></div>
							<div><dt>Paid at</dt><dd>{formatDateTime(payment.paidAt)}</dd></div>
							<div><dt>Refunded at</dt><dd>{formatDateTime(payment.refundedAt)}</dd></div>
							<div><dt>Created</dt><dd>{formatDateTime(payment.createdAt)}</dd></div>
							<div><dt>Updated</dt><dd>{formatDateTime(payment.updatedAt)}</dd></div>
						</dl>
					)}
				</DialogContent>
				<DialogActions><Button onClick={() => setSelectedPayment(null)}>Close</Button></DialogActions>
			</Dialog>
		);
	};

	const renderScheduleForm = (): React.ReactElement => {
		const isEditing = Boolean(editingSchedule);
		return (
			<section className="agent-schedule-form" aria-labelledby="agent-schedule-form-title">
				<div className="agent-schedule-form__heading">
					<div>
						<h3 id="agent-schedule-form-title">{isEditing ? 'Edit departure' : 'Add a departure'}</h3>
						<p>{isEditing ? 'Reservations stay protected while you adjust availability.' : 'Set the departure dates, price, and capacity.'}</p>
					</div>
					{isEditing && (
						<Button onClick={() => { setEditingSchedule(null); setScheduleForm(createScheduleForm(selectedTour ?? undefined)); }} disabled={scheduleBusy}>
							Cancel edit
						</Button>
					)}
				</div>
				<div className="agent-schedule-form__grid">
					<TextField label="Start date" type="date" value={scheduleForm.startDate} onChange={(event) => updateScheduleForm('startDate', event.target.value)} InputLabelProps={{ shrink: true }} required />
					<TextField label="End date" type="date" value={scheduleForm.endDate} onChange={(event) => updateScheduleForm('endDate', event.target.value)} InputLabelProps={{ shrink: true }} required />
					<TextField label="Price" type="number" value={scheduleForm.price} onChange={(event) => updateScheduleForm('price', event.target.value)} inputProps={{ min: 0, step: 1 }} required />
					<TextField label="Available seats" type="number" value={scheduleForm.availableSeats} onChange={(event) => updateScheduleForm('availableSeats', event.target.value)} inputProps={{ min: 1, step: 1 }} required />
					{isEditing && (
						<>
							<TextField label="Reserved seats" value={editingSchedule?.reservedSeats ?? 0} InputProps={{ readOnly: true }} helperText="Managed by booking reservations" />
							<TextField select label="Status" value={editingIsFull ? TourScheduleStatus.FULL : scheduleForm.scheduleStatus} onChange={(event) => updateScheduleForm('scheduleStatus', event.target.value)} disabled={editingIsFull} helperText={editingIsFull ? 'Full is derived from reserved capacity.' : undefined}>
								{editingIsFull ? <MenuItem value={TourScheduleStatus.FULL}>{TourScheduleStatus.FULL}</MenuItem> : editableScheduleStatuses.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
							</TextField>
						</>
					)}
				</div>
				{scheduleFormError && <Typography className="agent-schedule-form__error" role="alert">{scheduleFormError}</Typography>}
				<Button className="agent-schedule-form__submit" startIcon={isEditing ? <EditOutlinedIcon /> : <AddRoundedIcon />} onClick={isEditing ? saveScheduleHandler : createScheduleHandler} disabled={scheduleBusy}>
					{isEditing ? (updatingSchedule ? 'Saving schedule...' : 'Save schedule') : (creatingSchedule ? 'Creating schedule...' : 'Create schedule')}
				</Button>
			</section>
		);
	};

	const renderScheduleTableRow = (schedule: TourSchedule): React.ReactElement => {
		const scheduleStatus = getScheduleStatus(schedule);
		const startDate = formatScheduleDate(schedule.startDate);
		return (
			<TableRow key={schedule._id}>
				<TableCell><strong>{startDate}</strong><span>{formatScheduleDate(schedule.endDate)}</span></TableCell>
				<TableCell>{formatCurrency(schedule.price)}</TableCell>
				<TableCell>{schedule.reservedSeats} reserved / {schedule.availableSeats} seats</TableCell>
				<TableCell><span className={`agent-schedule-status is-${scheduleStatus.toLowerCase()}`}>{scheduleStatus}</span></TableCell>
				<TableCell align="right">
					<Tooltip title="Edit schedule"><IconButton aria-label={`Edit schedule starting ${startDate}`} onClick={() => openScheduleEditor(schedule)} disabled={scheduleBusy}><EditOutlinedIcon /></IconButton></Tooltip>
					<Tooltip title="Delete schedule"><IconButton aria-label={`Delete schedule starting ${startDate}`} onClick={() => deleteScheduleHandler(schedule)} disabled={scheduleBusy} className="agent-schedule-delete"><DeleteOutlineRoundedIcon /></IconButton></Tooltip>
				</TableCell>
			</TableRow>
		);
	};

	const renderScheduleMobileCard = (schedule: TourSchedule): React.ReactElement => {
		const scheduleStatus = getScheduleStatus(schedule);
		return (
			<article className="agent-schedule-mobile-card" key={schedule._id}>
				<div className="agent-schedule-mobile-card__heading">
					<div><strong>{formatScheduleDate(schedule.startDate)}</strong><span>to {formatScheduleDate(schedule.endDate)}</span></div>
					<span className={`agent-schedule-status is-${scheduleStatus.toLowerCase()}`}>{scheduleStatus}</span>
				</div>
				<div className="agent-schedule-mobile-card__meta"><span>{formatCurrency(schedule.price)}</span><span>{schedule.reservedSeats} reserved / {schedule.availableSeats} seats</span></div>
				<div className="agent-schedule-mobile-card__actions"><Button startIcon={<EditOutlinedIcon />} onClick={() => openScheduleEditor(schedule)} disabled={scheduleBusy}>Edit</Button><Button startIcon={<DeleteOutlineRoundedIcon />} onClick={() => deleteScheduleHandler(schedule)} disabled={scheduleBusy} className="agent-schedule-delete">Delete</Button></div>
			</article>
		);
	};

	const renderScheduleList = (): React.ReactElement => {
		if (schedulesQuery.loading && !schedules.length) return <div className="agent-schedule-state" role="status">Loading departures...</div>;
		if (schedulesQuery.error && !schedules.length) return <div className="agent-schedule-state agent-schedule-state--error"><Typography>Schedules could not load.</Typography><Button startIcon={<RefreshRoundedIcon />} onClick={() => schedulesQuery.refetch()}>Retry</Button></div>;
		if (!schedules.length) return <div className="agent-schedule-state"><CalendarMonthRoundedIcon /><Typography>No departures are scheduled yet.</Typography></div>;

		return (
			<>
				<TableContainer className="agent-schedule-table">
					<Table aria-label={`${selectedTour?.tourTitle ?? 'Tour'} schedules`}>
						<TableHead><TableRow><TableCell>Dates</TableCell><TableCell>Price</TableCell><TableCell>Capacity</TableCell><TableCell>Status</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
						<TableBody>{schedules.map(renderScheduleTableRow)}</TableBody>
					</Table>
				</TableContainer>
				<div className="agent-schedule-mobile-list">{schedules.map(renderScheduleMobileCard)}</div>
			</>
		);
	};

	const renderTourCard = (tour: Tour): React.ReactElement => {
		const activeScheduleCount = tour.schedules?.filter((schedule) => getScheduleStatus(schedule) === TourScheduleStatus.ACTIVE).length ?? 0;
		const image = tour.tourImages?.[0] ? `${process.env.REACT_APP_API_URL}/${tour.tourImages[0]}` : '/img/community/communityImg.png';
		return (
			<article key={tour._id} className="agent-tour">
				<img src={image} alt={tour.tourTitle} />
				<div>
					<small>{tour.tourCategory} · {tour.tourLocation}</small>
					<h3>{tour.tourTitle}</h3>
					<p>{formatCurrency(tour.tourPrice)} · {tour.tourDuration} days · {tour.tourAvailableSeats} seats</p>
					<p>{tour.tourViews} views · {tour.tourLikes} likes · {activeScheduleCount} active schedules</p>
					<div className="agent-tour__actions">
						<Button onClick={() => setEditTour({ _id: tour._id, tourTitle: tour.tourTitle, tourPrice: tour.tourPrice, tourCategory: tour.tourCategory, tourLocation: tour.tourLocation, tourStatus: tour.tourStatus, tourDuration: tour.tourDuration, tourAvailableSeats: tour.tourAvailableSeats, tourMinPeople: tour.tourMinPeople, tourMaxPeople: tour.tourMaxPeople, tourDesc: tour.tourDesc })}>Edit tour</Button>
						<Button startIcon={<ScheduleRoundedIcon />} onClick={() => openSchedules(tour)}>Manage schedules</Button>
					</div>
				</div>
			</article>
		);
	};

	const renderPortfolio = (): React.ReactElement => {
		if (toursQuery.loading && !tours.length) return <div className="agent-state">Loading portfolio...</div>;
		if (toursQuery.error) return <div className="agent-state">Portfolio could not load.<Button onClick={() => toursQuery.refetch()}>Retry</Button></div>;
		if (!tours.length) return <div className="agent-state">No tours in this status yet.</div>;
		return <div className="agent-grid">{tours.map(renderTourCard)}</div>;
	};

	const renderScheduleDialogContent = (): React.ReactElement => (
		<div className="agent-schedule-dialog__content">
			{renderScheduleForm()}
			<section className="agent-schedule-list" aria-labelledby="agent-schedule-list-title">
				<div className="agent-schedule-list__heading">
					<div><h3 id="agent-schedule-list-title">Departures</h3><p>Reservation counts are controlled by confirmed bookings.</p></div>
					<Button startIcon={<RefreshRoundedIcon />} onClick={() => schedulesQuery.refetch()} disabled={schedulesQuery.loading}>Refresh</Button>
				</div>
				{renderScheduleList()}
			</section>
		</div>
	);

	return (
		<motion.section id="agent-hub" className="agent-hub" initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }} animate={{ opacity: 1, y: 0 }}>
			<header>
				<div><small>GO TRIP OPERATOR</small><Typography component="h1">Agent Hub</Typography><p>Manage your curated travel portfolio from one calm workspace.</p></div>
				<Button onClick={() => { window.location.href = '/mypage?category=addTour'; }}>Add tour</Button>
			</header>
			<div className="agent-kpis">{Object.entries(stats).map(([key, value]) => <div key={key}><strong>{value}</strong><span>{key}</span></div>)}</div>
			<div className="agent-toolbar"><div>{Object.values(TourStatus).map((item) => <button type="button" key={item} className={status === item ? 'active' : ''} onClick={() => setStatus(item)}>{item}</button>)}</div><span>{tours.length} tours</span></div>
			{renderPortfolio()}
			<div className="agent-ops-grid">
				{renderBookingPanel()}
				{renderPaymentPanel()}
			</div>
			<Dialog open={Boolean(editTour)} onClose={() => setEditTour(null)} fullWidth maxWidth="sm"><DialogTitle>Edit tour</DialogTitle><DialogContent>{editTour && <Stack gap={2} mt={1}><TextField label="Title" value={editTour.tourTitle || ''} onChange={(event) => setEditTour({ ...editTour, tourTitle: event.target.value })} /><TextField select label="Status" value={editTour.tourStatus || TourStatus.ACTIVE} onChange={(event) => setEditTour({ ...editTour, tourStatus: event.target.value as TourStatus })}>{Object.values(TourStatus).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField><TextField type="number" label="Price" value={editTour.tourPrice || 0} onChange={(event) => setEditTour({ ...editTour, tourPrice: Number(event.target.value) })} /><TextField multiline minRows={3} label="Description" value={editTour.tourDesc || ''} onChange={(event) => setEditTour({ ...editTour, tourDesc: event.target.value })} /></Stack>}</DialogContent><DialogActions><Button onClick={() => setEditTour(null)}>Cancel</Button><Button disabled={updatingTour} onClick={saveTour}>Save changes</Button></DialogActions></Dialog>
			<Dialog open={Boolean(selectedTour)} onClose={closeSchedules} fullWidth maxWidth="lg" fullScreen={compactDialog} className="agent-schedule-dialog" aria-labelledby="agent-schedule-dialog-title">
				<DialogTitle id="agent-schedule-dialog-title"><Stack direction="row" gap={1.25} alignItems="center"><EventAvailableRoundedIcon /><span>Manage schedules{selectedTour ? `: ${selectedTour.tourTitle}` : ''}</span></Stack></DialogTitle>
				<DialogContent dividers>{renderScheduleDialogContent()}</DialogContent>
				<DialogActions><Button onClick={closeSchedules} disabled={scheduleBusy}>Close</Button></DialogActions>
			</Dialog>
			{renderBookingDetailDialog()}
			{renderPaymentDetailDialog()}
		</motion.section>
	);
}
