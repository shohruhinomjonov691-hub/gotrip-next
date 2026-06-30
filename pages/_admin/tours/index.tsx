import React, { useState } from 'react';
import type { NextPage } from 'next';
import { Button, MenuItem, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import { useMutation, useQuery } from '@apollo/client';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { GET_ALL_TOURS_BY_ADMIN } from '../../../apollo/admin/query';
import { REMOVE_TOUR_BY_ADMIN, UPDATE_TOUR_BY_ADMIN } from '../../../apollo/admin/mutation';
import { Direction } from '../../../libs/enums/common.enum';
import { TourLocation, TourStatus } from '../../../libs/enums/tour.enum';
import { AllToursInquiry } from '../../../libs/types/tour/tour.input';
import { Tour } from '../../../libs/types/tour/tour';
import { T } from '../../../libs/types/common';
import { REACT_APP_API_URL } from '../../../libs/config';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../libs/sweetAlert';

const tourStatusClass = (status?: string) => `admin-status admin-status--${(status ?? 'hold').toLowerCase()}`;
const formatPrice = (price: number) => `$${new Intl.NumberFormat('en-US').format(price)}`;
const rowsPerPageOptions = [10, 20, 40, 60];
const tourStatusOptions = Object.values(TourStatus) as TourStatus[];
const tourLocationOptions = Object.values(TourLocation) as TourLocation[];
const MotionSection = motion.section;
const MotionArticle = motion.article;

const AdminTours: NextPage = ({ initialInquiry }: any) => {
	const [inquiry, setInquiry] = useState<AllToursInquiry>(initialInquiry);
	const [tours, setTours] = useState<Tour[]>([]);
	const [total, setTotal] = useState(0);
	const [status, setStatus] = useState('ALL');
	const [location, setLocation] = useState('ALL');
	const reduceMotion = useReducedMotion() ?? false;
	const [updateTourByAdmin] = useMutation(UPDATE_TOUR_BY_ADMIN);
	const [removeTourByAdmin] = useMutation(REMOVE_TOUR_BY_ADMIN);
	const { loading, error, refetch } = useQuery(GET_ALL_TOURS_BY_ADMIN, {
		fetchPolicy: 'network-only', variables: { input: inquiry }, notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => { setTours(data?.getAllToursByAdmin?.list ?? []); setTotal(data?.getAllToursByAdmin?.metaCounter?.[0]?.total ?? 0); },
	});

	const changePageHandler = async (_: unknown, newPage: number) => { const next = { ...inquiry, page: newPage + 1 }; setInquiry(next); await refetch({ input: next }); };
	const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement>) => { const next = { ...inquiry, page: 1, limit: parseInt(event.target.value, 10) }; setInquiry(next); await refetch({ input: next }); };
	const statusHandler = async (nextStatus: string) => { setStatus(nextStatus); const search = { ...inquiry.search }; if (nextStatus === 'ALL') delete search.tourStatus; else search.tourStatus = nextStatus as TourStatus; const next = { ...inquiry, page: 1, search }; setInquiry(next); await refetch({ input: next }); };
	const locationHandler = async (nextLocation: string) => { setLocation(nextLocation); const search = { ...inquiry.search }; if (nextLocation === 'ALL') delete search.tourLocationList; else search.tourLocationList = [nextLocation as TourLocation]; const next = { ...inquiry, page: 1, search }; setInquiry(next); await refetch({ input: next }); };
	const pauseHandler = async (tour: Tour) => { try { await updateTourByAdmin({ variables: { input: { _id: tour._id, tourStatus: tour.tourStatus === TourStatus.PAUSED ? TourStatus.ACTIVE : TourStatus.PAUSED } } }); await refetch({ input: inquiry }); } catch (err: any) { sweetErrorHandling(err).then(); } };
	const removeHandler = async (tourId: string) => { try { if (!(await sweetConfirmAlert('Remove this tour?'))) return; await removeTourByAdmin({ variables: { tourId } }); await refetch({ input: inquiry }); } catch (err: any) { sweetErrorHandling(err).then(); } };
	const imageFor = (tour: Tour) => tour.tourImages?.[0] ? `${REACT_APP_API_URL}/${tour.tourImages[0]}` : '/img/banner/joinBg.svg';

	const renderHeading = (): React.ReactElement => (
		<div className="admin-page__heading">
			<div>
				<Typography component="span">Tour operations</Typography>
				<Typography component="h1">Tour inventory</Typography>
				<Typography component="p">Monitor availability and publication status across every operator experience.</Typography>
			</div>
			<Typography className="admin-page__count">{total} tours</Typography>
		</div>
	);

	const renderFilters = (): React.ReactElement => (
		<div className="admin-filterbar admin-filterbar--selects">
			<Select value={status} onChange={(event) => statusHandler(event.target.value)} aria-label="Filter tours by status">
				<MenuItem value="ALL">All statuses</MenuItem>
				{tourStatusOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
			</Select>
			<Select value={location} onChange={(event) => locationHandler(event.target.value)} aria-label="Filter tours by location">
				<MenuItem value="ALL">All locations</MenuItem>
				{tourLocationOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
			</Select>
		</div>
	);

	const renderDesktopRows = (): React.ReactElement[] => tours.map((tour) => (
		<TableRow key={tour._id}>
			<TableCell>
				<Stack direction="row" alignItems="center" spacing={1.5} className="admin-tour-cell">
					<img src={imageFor(tour)} alt="" />
					<div>
						<Typography component="strong">{tour.tourTitle}</Typography>
						<Typography component="span">{formatPrice(tour.tourPrice)} · {tour.tourDuration} days</Typography>
					</div>
				</Stack>
			</TableCell>
			<TableCell>{tour.tourLocation}</TableCell>
			<TableCell>{tour.tourCategory}</TableCell>
			<TableCell>{tour.tourAvailableSeats} seats</TableCell>
			<TableCell><span className={tourStatusClass(tour.tourStatus)}>{tour.tourStatus}</span></TableCell>
			<TableCell align="right">
				<Stack direction="row" spacing={1} justifyContent="flex-end">
					<Button className="admin-action-button" onClick={() => pauseHandler(tour)}>
						{tour.tourStatus === TourStatus.PAUSED ? 'Activate' : 'Pause'}
					</Button>
					<Button className="admin-action-button admin-action-button--danger" onClick={() => removeHandler(tour._id)}>
						Remove
					</Button>
				</Stack>
			</TableCell>
		</TableRow>
	));

	const renderMobileCards = (): React.ReactElement[] => tours.map((tour, index) => (
		<MotionArticle
			key={tour._id}
			className="admin-mobile-card admin-mobile-card--tour"
			initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.18, delay: reduceMotion ? 0 : Math.min(index * 0.025, 0.12) }}
		>
			<img src={imageFor(tour)} alt="" />
			<div className="admin-mobile-card__title">
				<Typography component="strong">{tour.tourTitle}</Typography>
				<span className={tourStatusClass(tour.tourStatus)}>{tour.tourStatus}</span>
			</div>
			<Typography component="p">{tour.tourLocation} · {tour.tourCategory}</Typography>
			<div className="admin-mobile-card__meta">
				<span>{formatPrice(tour.tourPrice)}</span>
				<span>{tour.tourAvailableSeats} seats</span>
			</div>
			<Stack direction="row" spacing={1}>
				<Button className="admin-action-button" onClick={() => pauseHandler(tour)}>
					{tour.tourStatus === TourStatus.PAUSED ? 'Activate' : 'Pause'}
				</Button>
				<Button className="admin-action-button admin-action-button--danger" onClick={() => removeHandler(tour._id)}>
					Remove
				</Button>
			</Stack>
		</MotionArticle>
	));

	const renderResults = (): React.ReactElement => {
		if (error) {
			return (
				<div className="admin-state admin-state--error">
					<Typography>We could not load the tour inventory.</Typography>
					<Button onClick={() => refetch({ input: inquiry })}>Try again</Button>
				</div>
			);
		}
		if (loading && !tours.length) {
			return (
				<div className="admin-table-skeleton" role="status" aria-label="Loading tours">
					{Array.from({ length: 6 }).map((_, index) => <span key={index} />)}
				</div>
			);
		}
		if (!tours.length) return <div className="admin-state admin-state--empty">No tours match these inventory controls.</div>;

		return (
			<>
				<TableContainer className="admin-data-table">
					<Table aria-label="Tour inventory">
						<TableHead>
							<TableRow>
								<TableCell>Tour</TableCell>
								<TableCell>Location</TableCell>
								<TableCell>Category</TableCell>
								<TableCell>Availability</TableCell>
								<TableCell>Status</TableCell>
								<TableCell align="right">Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>{renderDesktopRows()}</TableBody>
					</Table>
				</TableContainer>
				<div className="admin-mobile-cards">{renderMobileCards()}</div>
			</>
		);
	};

	return (
		<MotionSection className="content admin-page" initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
			{renderHeading()}
			<div className="table-wrap admin-surface">
				{renderFilters()}
				{renderResults()}
				<TablePagination rowsPerPageOptions={rowsPerPageOptions} component="div" count={total} rowsPerPage={inquiry.limit} page={inquiry.page - 1} onPageChange={changePageHandler} onRowsPerPageChange={changeRowsPerPageHandler} />
			</div>
		</MotionSection>
	);
};

AdminTours.defaultProps = { initialInquiry: { page: 1, limit: 10, sort: 'createdAt', direction: Direction.DESC, search: {} } };

export default withAdminLayout(AdminTours);
