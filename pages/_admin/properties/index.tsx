import React, { useState } from 'react';
import type { NextPage } from 'next';
import {
	Box,
	Button,
	MenuItem,
	Select,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TablePagination,
	TableRow,
	Typography,
} from '@mui/material';
import { useMutation, useQuery } from '@apollo/client';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { GET_ALL_TOURS_BY_ADMIN } from '../../../apollo/admin/query';
import { REMOVE_TOUR_BY_ADMIN, UPDATE_TOUR_BY_ADMIN } from '../../../apollo/admin/mutation';
import { Direction } from '../../../libs/enums/common.enum';
import { TourLocation, TourStatus } from '../../../libs/enums/tour.enum';
import { AllToursInquiry } from '../../../libs/types/tour/tour.input';
import { Tour } from '../../../libs/types/tour/tour';
import { T } from '../../../libs/types/common';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../libs/sweetAlert';

const AdminTours: NextPage = ({ initialInquiry, ...props }: any) => {
	const [inquiry, setInquiry] = useState<AllToursInquiry>(initialInquiry);
	const [tours, setTours] = useState<Tour[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [status, setStatus] = useState<string>('ALL');
	const [location, setLocation] = useState<string>('ALL');
	const [updateTourByAdmin] = useMutation(UPDATE_TOUR_BY_ADMIN);
	const [removeTourByAdmin] = useMutation(REMOVE_TOUR_BY_ADMIN);

	const { refetch } = useQuery(GET_ALL_TOURS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setTours(data?.getAllToursByAdmin?.list ?? []);
			setTotal(data?.getAllToursByAdmin?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const changePageHandler = async (_: unknown, newPage: number) => {
		const next = { ...inquiry, page: newPage + 1 };
		setInquiry(next);
		await refetch({ input: next });
	};

	const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const next = { ...inquiry, page: 1, limit: parseInt(event.target.value, 10) };
		setInquiry(next);
		await refetch({ input: next });
	};

	const statusHandler = async (nextStatus: string) => {
		setStatus(nextStatus);
		const search = { ...inquiry.search };
		if (nextStatus === 'ALL') delete search.tourStatus;
		else search.tourStatus = nextStatus as TourStatus;
		const next = { ...inquiry, page: 1, search };
		setInquiry(next);
		await refetch({ input: next });
	};

	const locationHandler = async (nextLocation: string) => {
		setLocation(nextLocation);
		const search = { ...inquiry.search };
		if (nextLocation === 'ALL') delete search.tourLocationList;
		else search.tourLocationList = [nextLocation as TourLocation];
		const next = { ...inquiry, page: 1, search };
		setInquiry(next);
		await refetch({ input: next });
	};

	const pauseHandler = async (tour: Tour) => {
		await updateTourByAdmin({
			variables: {
				input: { _id: tour._id, tourStatus: tour.tourStatus === TourStatus.PAUSED ? TourStatus.ACTIVE : TourStatus.PAUSED },
			},
		});
		await refetch({ input: inquiry });
	};

	const removeHandler = async (tourId: string) => {
		try {
			if (!(await sweetConfirmAlert('Remove this tour?'))) return;
			await removeTourByAdmin({ variables: { tourId } });
			await refetch({ input: inquiry });
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	return (
		<Box component="div" className="content">
			<Typography variant="h2" className="tit" sx={{ mb: '24px' }}>
				Tour Management
			</Typography>
			<Stack direction="row" spacing={2} sx={{ mb: 3 }}>
				<Select size="small" value={status} sx={{ width: 180 }}>
					<MenuItem value="ALL" onClick={() => statusHandler('ALL')}>
						All statuses
					</MenuItem>
					{Object.values(TourStatus).map((item) => (
						<MenuItem key={item} value={item} onClick={() => statusHandler(item)}>
							{item}
						</MenuItem>
					))}
				</Select>
				<Select size="small" value={location} sx={{ width: 180 }}>
					<MenuItem value="ALL" onClick={() => locationHandler('ALL')}>
						All locations
					</MenuItem>
					{Object.values(TourLocation).map((item) => (
						<MenuItem key={item} value={item} onClick={() => locationHandler(item)}>
							{item}
						</MenuItem>
					))}
				</Select>
			</Stack>
			<Table>
				<TableHead>
					<TableRow>
						<TableCell>Tour</TableCell>
						<TableCell>Location</TableCell>
						<TableCell>Category</TableCell>
						<TableCell>Price</TableCell>
						<TableCell>Seats</TableCell>
						<TableCell>Status</TableCell>
						<TableCell align="right">Actions</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{tours.map((tour) => (
						<TableRow key={tour._id}>
							<TableCell>{tour.tourTitle}</TableCell>
							<TableCell>{tour.tourLocation}</TableCell>
							<TableCell>{tour.tourCategory}</TableCell>
							<TableCell>${tour.tourPrice}</TableCell>
							<TableCell>{tour.tourAvailableSeats}</TableCell>
							<TableCell>{tour.tourStatus}</TableCell>
							<TableCell align="right">
								<Button size="small" onClick={() => pauseHandler(tour)}>
									{tour.tourStatus === TourStatus.PAUSED ? 'Activate' : 'Pause'}
								</Button>
								<Button size="small" color="error" onClick={() => removeHandler(tour._id)}>
									Remove
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			<TablePagination
				rowsPerPageOptions={[10, 20, 40, 60]}
				component="div"
				count={total}
				rowsPerPage={inquiry.limit}
				page={inquiry.page - 1}
				onPageChange={changePageHandler}
				onRowsPerPageChange={changeRowsPerPageHandler}
			/>
		</Box>
	);
};

AdminTours.defaultProps = {
	initialInquiry: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {},
	},
};

export default withAdminLayout(AdminTours);
