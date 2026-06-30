import React, { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import FlightTakeoffRoundedIcon from '@mui/icons-material/FlightTakeoffRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import { Button, Chip, Stack, Typography } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import moment from 'moment';
import { GET_MY_PAYMENTS } from '../../../apollo/user/query';
import { Direction } from '../../enums/common.enum';
import { PaymentStatus } from '../../enums/tour.enum';
import { Payment } from '../../types/payment/payment';
import { T } from '../../types/common';
import { formatterStr } from '../../utils';

type PaymentFilter = 'ALL' | PaymentStatus;

const PAYMENT_FILTERS: PaymentFilter[] = ['ALL', ...Object.values(PaymentStatus)];
const cardTransition = { duration: 0.32, ease: 'easeOut' as const };

const createPaymentsInput = (paymentStatus: PaymentFilter) => ({
	page: 1,
	limit: 12,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: paymentStatus === 'ALL' ? {} : { paymentStatus },
});

const shortId = (value?: string) => (value ? value.slice(-8).toUpperCase() : 'UNKNOWN');
const formatDateTime = (value?: Date | string) => (value ? moment(value).format('MMM D, YYYY HH:mm') : 'Not available');
const formatCurrency = (value?: number) => `$${formatterStr(value ?? 0)}`;

const MyPayments = () => {
	const [payments, setPayments] = useState<Payment[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);
	const [activeStatus, setActiveStatus] = useState<PaymentFilter>('ALL');
	const prefersReducedMotion = useReducedMotion();
	const input = useMemo(() => createPaymentsInput(activeStatus), [activeStatus]);

	const { loading, error, refetch } = useQuery(GET_MY_PAYMENTS, {
		fetchPolicy: 'cache-and-network',
		notifyOnNetworkStatusChange: true,
		variables: { input },
		onCompleted: (data: T) => {
			setPayments(data?.getMyPayments?.list ?? []);
			setTotalCount(data?.getMyPayments?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const summary = useMemo(() => {
		return {
			pending: payments.filter((payment) => payment.paymentStatus === PaymentStatus.PENDING).length,
			paid: payments.filter((payment) => payment.paymentStatus === PaymentStatus.PAID).length,
			value: payments.reduce((sum, payment) => sum + (payment.paymentAmount ?? 0), 0),
		};
	}, [payments]);

	return (
		<motion.div
			className="mypage-panel premium-panel account-flow-panel"
			initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.42, ease: 'easeOut' }}
		>
			<Stack className="panel-heading account-panel-heading">
				<Typography className="panel-kicker">Payment history</Typography>
				<Typography className="panel-title">My payments</Typography>
				<Typography className="panel-copy">Review internal payment requests and completed payment lifecycle states.</Typography>
			</Stack>

			<div className="account-panel-metrics">
				<div className="account-metric-card">
					<ReceiptLongRoundedIcon />
					<span>Total shown</span>
					<strong>{totalCount || payments.length}</strong>
				</div>
				<div className="account-metric-card">
					<AccountBalanceWalletRoundedIcon />
					<span>Pending</span>
					<strong>{summary.pending}</strong>
				</div>
				<div className="account-metric-card">
					<CreditCardRoundedIcon />
					<span>Paid</span>
					<strong>{summary.paid}</strong>
				</div>
				<div className="account-metric-card gold">
					<span>Loaded amount</span>
					<strong>{formatCurrency(summary.value)}</strong>
				</div>
			</div>

			<div className="status-tabs" role="tablist" aria-label="Payment status filters">
				{PAYMENT_FILTERS.map((status) => (
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

			{loading && !payments.length ? (
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
					<Typography className="account-state-title">Payments could not load</Typography>
					<Typography className="gt-muted">Please retry the existing payment history query.</Typography>
					<Button className="gt-primary-button" startIcon={<ReplayRoundedIcon />} onClick={() => refetch({ input })}>
						Retry
					</Button>
				</div>
			) : payments.length === 0 ? (
				<div className="account-empty-state">
					<AccountBalanceWalletRoundedIcon />
					<Typography className="account-state-title">
						{activeStatus === 'ALL' ? 'No payments yet' : `No ${activeStatus.toLowerCase()} payments`}
					</Typography>
					<Typography className="gt-muted">Internal payment requests will appear here once created.</Typography>
				</div>
			) : (
				<motion.div
					className="booking-list"
					initial={prefersReducedMotion ? false : 'hidden'}
					animate="visible"
					variants={{ visible: { transition: { staggerChildren: 0.06 } }, hidden: {} }}
				>
					{payments.map((payment) => (
						<motion.div
							className="booking-row gt-card payment-dashboard-card"
							key={payment._id}
							variants={{
								hidden: { opacity: 0, y: 16 },
								visible: { opacity: 1, y: 0, transition: cardTransition },
							}}
							whileHover={prefersReducedMotion ? undefined : { y: -3 }}
							transition={cardTransition}
						>
							<div className="payment-card-top">
								<div>
									<Chip label={payment.paymentStatus} className={`status-chip ${payment.paymentStatus.toLowerCase()}`} />
									<Typography className="booking-number">Payment {shortId(payment._id)}</Typography>
									<Typography className="gt-muted">Internal method: {payment.paymentMethod.replace('_', ' ')}</Typography>
								</div>
								<div className="booking-card-price">
									<Typography className="booking-price">{formatCurrency(payment.paymentAmount)}</Typography>
									<Typography className="gt-muted">Read-only lifecycle record</Typography>
								</div>
							</div>

							<div className="payment-card-meta-grid">
								<div>
									<ReceiptLongRoundedIcon />
									<span>Booking</span>
									<strong>{shortId(payment.bookingId)}</strong>
								</div>
								<div>
									<FlightTakeoffRoundedIcon />
									<span>Tour</span>
									<strong>{shortId(payment.tourId)}</strong>
								</div>
								<div>
									<EventAvailableRoundedIcon />
									<span>Created</span>
									<strong>{formatDateTime(payment.createdAt)}</strong>
								</div>
								<div>
									<CreditCardRoundedIcon />
									<span>Transaction</span>
									<strong>{payment.transactionId || 'Pending internal processing'}</strong>
								</div>
							</div>

							{(payment.paidAt || payment.refundedAt) && (
								<div className="payment-readonly-note">
									{payment.paidAt && <span>Paid: {formatDateTime(payment.paidAt)}</span>}
									{payment.refundedAt && <span>Refunded: {formatDateTime(payment.refundedAt)}</span>}
								</div>
							)}
						</motion.div>
					))}
				</motion.div>
			)}
		</motion.div>
	);
};

export default MyPayments;
