import React, { useState } from 'react';
import type { NextPage } from 'next';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, MenuItem, OutlinedInput, Select, TablePagination, TextField, Typography } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { motion, useReducedMotion } from 'framer-motion';
import { useMutation, useQuery } from '@apollo/client';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { PaymentList } from '../../../libs/components/admin/payments/PaymentList';
import { GET_ALL_PAYMENTS_BY_ADMIN } from '../../../apollo/admin/query';
import { CANCEL_PAYMENT_BY_ADMIN, MARK_PAYMENT_FAILED_BY_ADMIN, MARK_PAYMENT_SUCCESS_BY_ADMIN, REFUND_PAYMENT_BY_ADMIN } from '../../../apollo/admin/mutation';
import { Payment } from '../../../libs/types/payment/payment';
import { PaymentMethod, PaymentStatus } from '../../../libs/enums/tour.enum';
import { Direction } from '../../../libs/enums/common.enum';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../libs/sweetAlert';
import { T } from '../../../libs/types/common';

interface AllPaymentsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: { paymentStatus?: PaymentStatus; paymentMethod?: PaymentMethod; bookingId?: string; memberId?: string };
}

interface AdminPaymentsProps {
	initialInquiry?: AllPaymentsInquiry;
}

interface PaymentPageMotionTarget {
	opacity: number;
	y?: number;
}

type PaymentStatusFilter = 'ALL' | PaymentStatus;
type PaymentMethodFilter = 'ALL' | PaymentMethod;

const DEFAULT_INQUIRY: AllPaymentsInquiry = { page: 1, limit: 10, sort: 'createdAt', direction: Direction.DESC, search: {} };
const PAYMENT_STATUSES: readonly PaymentStatus[] = Object.values(PaymentStatus) as PaymentStatus[];
const PAYMENT_METHODS: readonly PaymentMethod[] = Object.values(PaymentMethod) as PaymentMethod[];
const ROWS_PER_PAGE_OPTIONS: number[] = [10, 20, 40, 60];

const AdminPayments: NextPage<AdminPaymentsProps> = ({ initialInquiry = DEFAULT_INQUIRY }) => {
	const [inquiry, setInquiry] = useState<AllPaymentsInquiry>(initialInquiry);
	const [payments, setPayments] = useState<Payment[]>([]);
	const [total, setTotal] = useState(0);
	const [status, setStatus] = useState<PaymentStatusFilter>('ALL');
	const [method, setMethod] = useState<PaymentMethodFilter>('ALL');
	const [bookingId, setBookingId] = useState('');
	const [memberId, setMemberId] = useState('');
	const [successTarget, setSuccessTarget] = useState<Payment | null>(null);
	const [transactionId, setTransactionId] = useState('');
	const [transactionError, setTransactionError] = useState('');
	const reduceMotion = Boolean(useReducedMotion());
	const [markPaymentSuccessByAdmin, { loading: markingSuccess }] = useMutation(MARK_PAYMENT_SUCCESS_BY_ADMIN);
	const [markPaymentFailedByAdmin, { loading: markingFailed }] = useMutation(MARK_PAYMENT_FAILED_BY_ADMIN);
	const [refundPaymentByAdmin, { loading: refundingPayment }] = useMutation(REFUND_PAYMENT_BY_ADMIN);
	const [cancelPaymentByAdmin, { loading: cancellingPayment }] = useMutation(CANCEL_PAYMENT_BY_ADMIN);
	const { loading, error, refetch } = useQuery(GET_ALL_PAYMENTS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setPayments(data?.getAllPaymentsByAdmin?.list ?? []);
			setTotal(data?.getAllPaymentsByAdmin?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const actionBusy = markingSuccess || markingFailed || refundingPayment || cancellingPayment;
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
	const statusHandler = (nextStatus: PaymentStatusFilter) => {
		setStatus(nextStatus);
		const search = { ...inquiry.search };
		if (nextStatus === 'ALL') delete search.paymentStatus;
		else search.paymentStatus = nextStatus;
		setInquiry({ ...inquiry, page: 1, search });
	};
	const methodHandler = (nextMethod: PaymentMethodFilter) => {
		setMethod(nextMethod);
		const search = { ...inquiry.search };
		if (nextMethod === 'ALL') delete search.paymentMethod;
		else search.paymentMethod = nextMethod;
		setInquiry({ ...inquiry, page: 1, search });
	};
	const applySearchHandler = () => setInquiry((current) => ({ ...current, page: 1, search: { ...current.search, bookingId: bookingId.trim() || undefined, memberId: memberId.trim() || undefined } }));
	const clearSearchHandler = () => {
		setBookingId('');
		setMemberId('');
		setInquiry((current) => {
			const search = { ...current.search };
			delete search.bookingId;
			delete search.memberId;
			return { ...current, page: 1, search };
		});
	};
	const refetchPayments = async () => {
		try { await refetch({ input: inquiry }); } catch (err: unknown) { sweetErrorHandling(err).then(); }
	};
	const openSuccessDialog = (payment: Payment) => {
		setSuccessTarget(payment);
		setTransactionId('');
		setTransactionError('');
	};
	const markSuccessHandler = async () => {
		if (!successTarget || !transactionId.trim()) {
			setTransactionError('Enter the internal transaction reference before confirming payment.');
			return;
		}
		if (!(await sweetConfirmAlert(`Mark payment ${successTarget._id.slice(-8).toUpperCase()} as paid?`))) return;
		try {
			await markPaymentSuccessByAdmin({ variables: { paymentId: successTarget._id, transactionId: transactionId.trim() } });
			setSuccessTarget(null);
			await refetchPayments();
		} catch (err: unknown) {
			setTransactionError('We could not mark this payment as successful. Please try again.');
		}
	};
	const markFailedHandler = async (payment: Payment) => {
		if (!(await sweetConfirmAlert('Mark this pending payment as failed? This cancels the pending booking and releases its seats.'))) return;
		try { await markPaymentFailedByAdmin({ variables: { paymentId: payment._id } }); await refetchPayments(); } catch (err: unknown) { sweetErrorHandling(err).then(); }
	};
	const refundHandler = async (payment: Payment) => {
		if (!(await sweetConfirmAlert('Refund this payment? The backend will cancel the associated confirmed booking.'))) return;
		try { await refundPaymentByAdmin({ variables: { paymentId: payment._id } }); await refetchPayments(); } catch (err: unknown) { sweetErrorHandling(err).then(); }
	};
	const cancelHandler = async (payment: Payment) => {
		if (!(await sweetConfirmAlert('Cancel this pending payment?'))) return;
		try { await cancelPaymentByAdmin({ variables: { paymentId: payment._id } }); await refetchPayments(); } catch (err: unknown) { sweetErrorHandling(err).then(); }
	};

	const renderHeading = (): React.ReactElement => <div className="admin-page__heading"><div><Typography component="span">Internal payment operations</Typography><Typography component="h1">Payments</Typography><Typography component="p">Review internal payment records and apply only backend-supported lifecycle actions.</Typography></div><Typography className="admin-page__count">{total} payments</Typography></div>;
	const renderSearchAdornment = (): React.ReactElement => <InputAdornment position="end">{(bookingId || memberId) && <Button className="admin-icon-button" aria-label="Clear payment filters" onClick={clearSearchHandler}><CancelRoundedIcon /></Button>}<Button className="admin-icon-button" aria-label="Search payments" onClick={applySearchHandler}><SearchRoundedIcon /></Button></InputAdornment>;
	const renderFilters = (): React.ReactElement => {
		const statusItems: React.ReactElement[] = PAYMENT_STATUSES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>);
		const methodItems: React.ReactElement[] = PAYMENT_METHODS.map((item) => <MenuItem key={item} value={item}>{item.replace('_', ' ')}</MenuItem>);
		return <div className="admin-filterbar admin-filterbar--payments"><Select<PaymentStatusFilter> value={status} onChange={(event: SelectChangeEvent<PaymentStatusFilter>) => statusHandler(event.target.value as PaymentStatusFilter)} aria-label="Filter payments by status"><MenuItem value="ALL">All statuses</MenuItem>{statusItems}</Select><Select<PaymentMethodFilter> value={method} onChange={(event: SelectChangeEvent<PaymentMethodFilter>) => methodHandler(event.target.value as PaymentMethodFilter)} aria-label="Filter payments by method"><MenuItem value="ALL">All methods</MenuItem>{methodItems}</Select><div className="admin-search-controls admin-payment-filters"><OutlinedInput aria-label="Filter payments by booking ID" placeholder="Booking ID" value={bookingId} onChange={(event) => setBookingId(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && applySearchHandler()} /><OutlinedInput aria-label="Filter payments by member ID" placeholder="Member ID" value={memberId} onChange={(event) => setMemberId(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && applySearchHandler()} endAdornment={renderSearchAdornment()} /></div></div>;
	};
	const renderResults = (): React.ReactElement => {
		if (error) return <div className="admin-state admin-state--error"><Typography>We could not load payment operations.</Typography><Button onClick={() => refetch({ input: inquiry })}>Try again</Button></div>;
		return <><div className="admin-lifecycle-note admin-lifecycle-note--surface">GoTrip payments are internal/demo lifecycle records. This surface does not connect to an external gateway.</div><PaymentList payments={payments} loading={loading && !payments.length} actionBusy={actionBusy} onMarkSuccess={openSuccessDialog} onMarkFailed={markFailedHandler} onRefund={refundHandler} onCancel={cancelHandler} /></>;
	};
	const renderSuccessDialog = (): React.ReactElement => <Dialog open={Boolean(successTarget)} onClose={() => !markingSuccess && setSuccessTarget(null)} className="admin-payment-dialog" fullWidth maxWidth="xs" aria-labelledby="admin-payment-success-title"><DialogTitle id="admin-payment-success-title">Mark payment successful</DialogTitle><DialogContent dividers><div className="admin-lifecycle-note">This records an internal transaction reference, confirms the linked pending booking, and does not contact an external payment gateway.</div><TextField autoFocus label="Internal transaction reference" value={transactionId} onChange={(event) => { setTransactionId(event.target.value); setTransactionError(''); }} error={Boolean(transactionError)} helperText={transactionError || 'Use the verified internal reference for this payment.'} required fullWidth /></DialogContent><DialogActions><Button onClick={() => setSuccessTarget(null)} disabled={markingSuccess}>Cancel</Button><Button className="admin-primary-action" disabled={!transactionId.trim() || markingSuccess} onClick={markSuccessHandler}>{markingSuccess ? 'Saving...' : 'Mark paid'}</Button></DialogActions></Dialog>;

	const initialAnimation: PaymentPageMotionTarget = reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 };
	const animateAnimation: PaymentPageMotionTarget = { opacity: 1, y: 0 };
	const pageContent: React.ReactElement = <section className="content admin-page">{renderHeading()}<div className="table-wrap admin-surface">{renderFilters()}{renderResults()}<TablePagination rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS} component="div" count={total} rowsPerPage={inquiry.limit} page={inquiry.page - 1} onPageChange={changePageHandler} onRowsPerPageChange={changeRowsPerPageHandler} /></div>{renderSuccessDialog()}</section>;

	return <motion.div initial={initialAnimation} animate={animateAnimation} transition={{ duration: 0.22 }}>{pageContent}</motion.div>;
};

export default withAdminLayout(AdminPayments);
