import React from 'react';
import Moment from 'react-moment';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import { Payment } from '../../../types/payment/payment';
import { PaymentStatus } from '../../../enums/tour.enum';
import { formatterStr } from '../../../utils';

interface PaymentListProps {
	payments: Payment[];
	loading?: boolean;
	actionBusy?: boolean;
	onMarkSuccess: (payment: Payment) => void;
	onMarkFailed: (payment: Payment) => void;
	onRefund: (payment: Payment) => void;
	onCancel: (payment: Payment) => void;
}

const SKELETON_ROWS: readonly number[] = [0, 1, 2, 3, 4, 5];
const paymentStatusClass = (status?: string) => `admin-status admin-status--${(status ?? 'pending').toLowerCase()}`;
const shortId = (value?: string) => value ? value.slice(-8).toUpperCase() : 'Unknown';
const formatPrice = (value: number) => `$${formatterStr(value)}`;

export const PaymentList = ({ payments, loading = false, actionBusy = false, onMarkSuccess, onMarkFailed, onRefund, onCancel }: PaymentListProps): React.ReactElement => {
	const reduceMotion = Boolean(useReducedMotion());

	const renderLoadingState = (): React.ReactElement => <div className="admin-table-skeleton" role="status" aria-label="Loading payments">{SKELETON_ROWS.map((index) => <span key={index} />)}</div>;

	const renderActions = (payment: Payment, mobile = false): React.ReactElement | null => {
		const className = mobile ? 'admin-mobile-card__actions' : 'admin-payment-actions';
		if (payment.paymentStatus === PaymentStatus.PENDING) {
			return <div className={className}><Button className="admin-action-button" disabled={actionBusy} onClick={() => onMarkSuccess(payment)}>Mark success</Button><Button className="admin-action-button" disabled={actionBusy} onClick={() => onMarkFailed(payment)}>Mark failed</Button><Button className="admin-action-button admin-action-button--danger" disabled={actionBusy} onClick={() => onCancel(payment)}>Cancel</Button></div>;
		}
		if (payment.paymentStatus === PaymentStatus.PAID) {
			return <div className={className}><Button className="admin-action-button admin-action-button--danger" disabled={actionBusy} onClick={() => onRefund(payment)}>Refund</Button></div>;
		}
		return null;
	};

	const renderDesktopRow = (payment: Payment): React.ReactElement => (
		<TableRow key={payment._id}>
			<TableCell><div className="admin-payment-cell"><strong>Payment {shortId(payment._id)}</strong><span>{payment.transactionId || 'No transaction reference yet'}</span></div></TableCell>
			<TableCell><div className="admin-id-pair"><span>Booking {shortId(payment.bookingId)}</span><span>Member {shortId(payment.memberId)}</span><span>Tour {shortId(payment.tourId)}</span></div></TableCell>
			<TableCell>{formatPrice(payment.paymentAmount)}</TableCell>
			<TableCell>{payment.paymentMethod.replace('_', ' ')}</TableCell>
			<TableCell><span className={paymentStatusClass(payment.paymentStatus)}>{payment.paymentStatus}</span></TableCell>
			<TableCell><div className="admin-date-cell"><span><Moment format="DD MMM YYYY">{payment.createdAt}</Moment></span><span>Updated <Moment format="DD MMM YYYY">{payment.updatedAt}</Moment></span></div></TableCell>
			<TableCell align="right">{renderActions(payment)}</TableCell>
		</TableRow>
	);

	const renderMobileCard = (payment: Payment, index: number): React.ReactElement => (
		<motion.article key={payment._id} className="admin-mobile-card admin-mobile-card--payment" initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18, delay: reduceMotion ? 0 : Math.min(index * 0.025, 0.12) }}>
			<div className="admin-mobile-card__title"><strong>Payment {shortId(payment._id)}</strong><span className={paymentStatusClass(payment.paymentStatus)}>{payment.paymentStatus}</span></div>
			<p>{formatPrice(payment.paymentAmount)} · {payment.paymentMethod.replace('_', ' ')}</p>
			<div className="admin-mobile-card__meta"><span>Booking {shortId(payment.bookingId)}</span><span>Member {shortId(payment.memberId)}</span><span>Tour {shortId(payment.tourId)}</span></div>
			<div className="admin-mobile-card__copy"><span>{payment.transactionId || 'Pending internal processing'} · Updated <Moment format="DD MMM YYYY">{payment.updatedAt}</Moment></span></div>
			{renderActions(payment, true)}
		</motion.article>
	);

	if (loading) return renderLoadingState();
	if (!payments.length) return <div className="admin-state admin-state--empty">No payments match these controls.</div>;

	const desktopRows: React.ReactElement[] = payments.map(renderDesktopRow);
	const mobileCards: React.ReactElement[] = payments.map(renderMobileCard);

	return <><TableContainer className="admin-data-table"><Table aria-label="Payment management"><TableHead><TableRow><TableCell>Payment</TableCell><TableCell>References</TableCell><TableCell>Amount</TableCell><TableCell>Method</TableCell><TableCell>Status</TableCell><TableCell>Dates</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead><TableBody>{desktopRows}</TableBody></Table></TableContainer><div className="admin-mobile-cards">{mobileCards}</div></>;
};
