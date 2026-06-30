import React, { useState } from 'react';
import type { NextPage } from 'next';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, MenuItem, OutlinedInput, Select, TablePagination, TextField, Typography } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { motion, useReducedMotion } from 'framer-motion';
import { useMutation, useQuery } from '@apollo/client';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { BookingList } from '../../../libs/components/admin/bookings/BookingList';
import { GET_ALL_BOOKINGS_BY_ADMIN } from '../../../apollo/admin/query';
import { CANCEL_BOOKING_BY_ADMIN, UPDATE_BOOKING_BY_ADMIN } from '../../../apollo/admin/mutation';
import { Booking } from '../../../libs/types/booking/booking';
import { BookingStatus } from '../../../libs/enums/tour.enum';
import { Direction } from '../../../libs/enums/common.enum';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../libs/sweetAlert';
import { T } from '../../../libs/types/common';

interface AllBookingsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: { bookingStatus?: BookingStatus; bookingNumber?: string; memberId?: string; agentId?: string };
}

interface AdminBookingsProps {
	initialInquiry?: AllBookingsInquiry;
}

interface BookingPageMotionTarget {
	opacity: number;
	y?: number;
}

type BookingStatusFilter = 'ALL' | BookingStatus;

const DEFAULT_INQUIRY: AllBookingsInquiry = { page: 1, limit: 10, sort: 'createdAt', direction: Direction.DESC, search: {} };
const BOOKING_STATUSES: readonly BookingStatus[] = Object.values(BookingStatus) as BookingStatus[];
const ROWS_PER_PAGE_OPTIONS: number[] = [10, 20, 40, 60];

const AdminBookings: NextPage<AdminBookingsProps> = ({ initialInquiry = DEFAULT_INQUIRY }) => {
	const [inquiry, setInquiry] = useState<AllBookingsInquiry>(initialInquiry);
	const [bookings, setBookings] = useState<Booking[]>([]);
	const [total, setTotal] = useState(0);
	const [status, setStatus] = useState<BookingStatusFilter>('ALL');
	const [bookingNumber, setBookingNumber] = useState('');
	const [memberId, setMemberId] = useState('');
	const [agentId, setAgentId] = useState('');
	const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
	const [cancelReason, setCancelReason] = useState('');
	const reduceMotion = Boolean(useReducedMotion());
	const [updateBookingByAdmin, { loading: updatingBooking }] = useMutation(UPDATE_BOOKING_BY_ADMIN);
	const [cancelBookingByAdmin, { loading: cancellingBooking }] = useMutation(CANCEL_BOOKING_BY_ADMIN);
	const { loading, error, refetch } = useQuery(GET_ALL_BOOKINGS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setBookings(data?.getAllBookingsByAdmin?.list ?? []);
			setTotal(data?.getAllBookingsByAdmin?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const actionBusy = updatingBooking || cancellingBooking;
	const changePageHandler = async (_: unknown, newPage: number) => {
		const next = { ...inquiry, page: newPage + 1 };
		setInquiry(next);
		await refetch({ input: next });
	};
	const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const next = { ...inquiry, page: 1, limit: parseInt(event.target.value, 10) };
		setInquiry(next);
		await refetch({ input: next });
	};
	const statusHandler = (nextStatus: BookingStatusFilter) => {
		setStatus(nextStatus);
		const search = { ...inquiry.search };
		if (nextStatus === 'ALL') delete search.bookingStatus;
		else search.bookingStatus = nextStatus;
		setInquiry({ ...inquiry, page: 1, search });
	};
	const applySearchHandler = () => {
		setInquiry((current) => ({
			...current,
			page: 1,
			search: { ...current.search, bookingNumber: bookingNumber.trim() || undefined, memberId: memberId.trim() || undefined, agentId: agentId.trim() || undefined },
		}));
	};
	const clearSearchHandler = () => {
		setBookingNumber('');
		setMemberId('');
		setAgentId('');
		setInquiry((current) => {
			const search = { ...current.search };
			delete search.bookingNumber;
			delete search.memberId;
			delete search.agentId;
			return { ...current, page: 1, search };
		});
	};
	const updateStatusHandler = async (booking: Booking, bookingStatus: BookingStatus) => {
		if (!(await sweetConfirmAlert(`Mark booking ${booking.bookingNumber} as ${bookingStatus}?`))) return;
		try {
			await updateBookingByAdmin({ variables: { input: { _id: booking._id, bookingStatus } } });
			await refetch({ input: inquiry });
		} catch (err: unknown) {
			sweetErrorHandling(err).then();
		}
	};
	const openCancelDialog = (booking: Booking) => {
		setCancelTarget(booking);
		setCancelReason('');
	};
	const cancelBookingHandler = async () => {
		if (!cancelTarget || !cancelReason.trim()) return;
		if (!(await sweetConfirmAlert(`Cancel booking ${cancelTarget.bookingNumber}?`))) return;
		try {
			await cancelBookingByAdmin({ variables: { bookingId: cancelTarget._id, cancelReason: cancelReason.trim() } });
			setCancelTarget(null);
			setCancelReason('');
			await refetch({ input: inquiry });
		} catch (err: unknown) {
			sweetErrorHandling(err).then();
		}
	};

	const renderHeading = (): React.ReactElement => (
		<div className="admin-page__heading"><div><Typography component="span">Reservation operations</Typography><Typography component="h1">Bookings</Typography><Typography component="p">Review reservations and progress only the backend-supported booking lifecycle.</Typography></div><Typography className="admin-page__count">{total} bookings</Typography></div>
	);
	const renderSearchAdornment = (): React.ReactElement => <InputAdornment position="end">{(bookingNumber || memberId || agentId) && <Button className="admin-icon-button" aria-label="Clear booking filters" onClick={clearSearchHandler}><CancelRoundedIcon /></Button>}<Button className="admin-icon-button" aria-label="Search bookings" onClick={applySearchHandler}><SearchRoundedIcon /></Button></InputAdornment>;
	const renderFilters = (): React.ReactElement => {
		const statusItems: React.ReactElement[] = BOOKING_STATUSES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>);
		return <div className="admin-filterbar admin-filterbar--bookings"><Select<BookingStatusFilter> value={status} onChange={(event: SelectChangeEvent<BookingStatusFilter>) => statusHandler(event.target.value as BookingStatusFilter)} aria-label="Filter bookings by status"><MenuItem value="ALL">All statuses</MenuItem>{statusItems}</Select><div className="admin-search-controls admin-booking-filters"><OutlinedInput aria-label="Filter bookings by booking number" placeholder="Booking number" value={bookingNumber} onChange={(event) => setBookingNumber(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && applySearchHandler()} /><OutlinedInput aria-label="Filter bookings by member ID" placeholder="Member ID" value={memberId} onChange={(event) => setMemberId(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && applySearchHandler()} /><OutlinedInput aria-label="Filter bookings by agent ID" placeholder="Agent ID" value={agentId} onChange={(event) => setAgentId(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && applySearchHandler()} endAdornment={renderSearchAdornment()} /></div></div>;
	};
	const renderResults = (): React.ReactElement => {
		if (error) return <div className="admin-state admin-state--error"><Typography>We could not load booking operations.</Typography><Button onClick={() => refetch({ input: inquiry })}>Try again</Button></div>;
		return <BookingList bookings={bookings} loading={loading && !bookings.length} actionBusy={actionBusy} onUpdateStatus={updateStatusHandler} onCancel={openCancelDialog} />;
	};
	const renderCancelDialog = (): React.ReactElement => <Dialog open={Boolean(cancelTarget)} onClose={() => !cancellingBooking && setCancelTarget(null)} className="admin-booking-dialog" fullWidth maxWidth="xs" aria-labelledby="admin-booking-cancel-title"><DialogTitle id="admin-booking-cancel-title">Cancel booking</DialogTitle><DialogContent dividers><div className="admin-lifecycle-note">Cancellation releases reserved seats through the existing backend workflow.</div><TextField autoFocus label="Cancellation reason" value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} inputProps={{ maxLength: 300 }} helperText={`${cancelReason.length}/300`} multiline minRows={3} required fullWidth /></DialogContent><DialogActions><Button onClick={() => setCancelTarget(null)} disabled={cancellingBooking}>Keep booking</Button><Button className="admin-action-button admin-action-button--danger" disabled={!cancelReason.trim() || cancellingBooking} onClick={cancelBookingHandler}>Confirm cancel</Button></DialogActions></Dialog>;

	const initialAnimation: BookingPageMotionTarget = reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 };
	const animateAnimation: BookingPageMotionTarget = { opacity: 1, y: 0 };
	const pageContent: React.ReactElement = <section className="content admin-page">{renderHeading()}<div className="table-wrap admin-surface">{renderFilters()}{renderResults()}<TablePagination rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS} component="div" count={total} rowsPerPage={inquiry.limit} page={inquiry.page - 1} onPageChange={changePageHandler} onRowsPerPageChange={changeRowsPerPageHandler} /></div>{renderCancelDialog()}</section>;

	return <motion.div initial={initialAnimation} animate={animateAnimation} transition={{ duration: 0.22 }}>{pageContent}</motion.div>;
};

export default withAdminLayout(AdminBookings);
