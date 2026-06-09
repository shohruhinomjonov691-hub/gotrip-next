import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Button, MenuItem, Pagination, Stack, TextField, Typography } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import TourCard from '../../libs/components/tour/TourCard';
import { GET_TOURS } from '../../apollo/user/query';
import { LIKE_TARGET_TOUR, TOGGLE_WISHLIST } from '../../apollo/user/mutation';
import { Direction, Message } from '../../libs/enums/common.enum';
import { TourCategory, TourLocation, WishlistGroup } from '../../libs/enums/tour.enum';
import { ToursInquiry } from '../../libs/types/tour/tour.input';
import { Tour } from '../../libs/types/tour/tour';
import { T } from '../../libs/types/common';
import { userVar } from '../../apollo/store';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const initialInput: ToursInquiry = {
	page: 1,
	limit: 9,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

const TourListPage: NextPage = () => {
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const [input, setInput] = useState<ToursInquiry>(initialInput);
	const [text, setText] = useState<string>('');
	const [tours, setTours] = useState<Tour[]>([]);
	const [total, setTotal] = useState<number>(0);

	const [likeTargetTour] = useMutation(LIKE_TARGET_TOUR);
	const [toggleWishlist] = useMutation(TOGGLE_WISHLIST);

	useEffect(() => {
		if (!router.isReady) return;
		const nextSearch: T = {};
		if (router.query.text) nextSearch.text = router.query.text as string;
		if (router.query.category) nextSearch.categoryList = [router.query.category as TourCategory];
		if (router.query.location) nextSearch.locationList = [router.query.location as TourLocation];
		if (router.query.destinationId) nextSearch.destinationId = router.query.destinationId as string;
		setText((router.query.text as string) ?? '');
		setInput({ ...initialInput, search: nextSearch });
	}, [router.isReady, router.query.text, router.query.category, router.query.location, router.query.destinationId]);

	const { loading, refetch } = useQuery(GET_TOURS, {
		fetchPolicy: 'cache-and-network',
		variables: { input },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setTours(data?.getTours?.list ?? []);
			setTotal(data?.getTours?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const updateSearch = (key: string, value: string) => {
		const nextSearch = { ...input.search };
		if (!value) delete (nextSearch as T)[key];
		else if (key === 'categoryList') (nextSearch as T)[key] = [value];
		else if (key === 'locationList') (nextSearch as T)[key] = [value];
		else (nextSearch as T)[key] = value;
		setInput({ ...input, page: 1, search: nextSearch });
	};

	const applyTextSearch = () => setInput({ ...input, page: 1, search: { ...input.search, text } });

	const paginationHandler = (_: ChangeEvent<unknown>, value: number) => setInput({ ...input, page: value });

	const likeHandler = async (tourId: string) => {
		try {
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetTour({ variables: { tourId } });
			await refetch({ input });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const saveHandler = async (tourId: string) => {
		try {
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			await toggleWishlist({ variables: { input: { wishlistGroup: WishlistGroup.TOUR, wishlistRefId: tourId } } });
			await sweetTopSmallSuccessAlert('Saved tours updated', 900);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	return (
		<Stack sx={{ width: '100%', bgcolor: '#fafafa', minHeight: '100vh', py: 5 }}>
			<Stack sx={{ width: '100%', maxWidth: 1180, mx: 'auto', px: 2 }} spacing={3}>
				<Stack spacing={1}>
					<Typography fontSize={34} fontWeight={800}>
						Tours
					</Typography>
					<Typography color="text.secondary">Find guided trips, local experiences, and destination tours.</Typography>
				</Stack>
				<Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
					<TextField
						fullWidth
						size="small"
						label="Search tours"
						value={text}
						onChange={(event) => setText(event.target.value)}
					/>
					<TextField
						select
						size="small"
						label="Category"
						value={(input.search.categoryList?.[0] as string) ?? ''}
						onChange={(event) => updateSearch('categoryList', event.target.value)}
						sx={{ minWidth: 180 }}
					>
						<MenuItem value="">All</MenuItem>
						{Object.values(TourCategory).map((category) => (
							<MenuItem key={category} value={category}>
								{category}
							</MenuItem>
						))}
					</TextField>
					<TextField
						select
						size="small"
						label="Location"
						value={(input.search.locationList?.[0] as string) ?? ''}
						onChange={(event) => updateSearch('locationList', event.target.value)}
						sx={{ minWidth: 180 }}
					>
						<MenuItem value="">All</MenuItem>
						{Object.values(TourLocation).map((location) => (
							<MenuItem key={location} value={location}>
								{location}
							</MenuItem>
						))}
					</TextField>
					<Button variant="contained" onClick={applyTextSearch}>
						Search
					</Button>
				</Stack>
				{loading && tours.length === 0 ? (
					<Typography>Loading tours...</Typography>
				) : (
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
							gap: 16,
						}}
					>
						{tours.map((tour) => (
							<TourCard key={tour._id} tour={tour} onLike={likeHandler} onSave={saveHandler} />
						))}
					</div>
				)}
				{!loading && tours.length === 0 && <Typography>No tours found.</Typography>}
				{total > input.limit && (
					<Stack alignItems="center">
						<Pagination count={Math.ceil(total / input.limit)} page={input.page} onChange={paginationHandler} />
					</Stack>
				)}
			</Stack>
		</Stack>
	);
};

export default withLayoutBasic(TourListPage);
