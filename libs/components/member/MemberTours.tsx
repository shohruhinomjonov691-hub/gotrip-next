import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import TourCard from '../tour/TourCard';
import { Tour } from '../../types/tour/tour';
import { ToursInquiry } from '../../types/tour/tour.input';
import { T } from '../../types/common';
import { useRouter } from 'next/router';
import { GET_TOURS } from '../../../apollo/user/query';
import { useQuery } from '@apollo/client';

const MemberTours: NextPage = ({ initialInput, ...props }: any) => {
	const router = useRouter();
	const { memberId } = router.query;
	const [searchFilter, setSearchFilter] = useState<ToursInquiry>({ ...initialInput });
	const [agentTours, setAgentTours] = useState<Tour[]>([]);
	const [total, setTotal] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const {
		loading: getToursLoading,
		data: getToursData,
		error: getToursError,
		refetch: getToursRefetch,
	} = useQuery(GET_TOURS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		skip: !searchFilter?.search?.memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted(data: T) {
			setAgentTours(data?.getTours?.list ?? []);
			setTotal(data?.getTours?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		getToursRefetch().then();
	}, [searchFilter]);

	useEffect(() => {
		if (memberId)
			setSearchFilter({ ...initialInput, search: { ...initialInput.search, memberId: memberId as string } });
	}, [memberId]);

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	return (
			<div id="member-tours-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">Tours</Typography>
					</Stack>
				</Stack>
				<Stack className="tours-list-box">
					<Stack className="list-box">
						{agentTours?.length === 0 && (
							<div className={'no-data'}>
								<img src="/img/icons/icoAlert.svg" alt="" />
								<p>No tours found.</p>
							</div>
						)}
						<div className="tour-card-grid">
							{agentTours?.map((tour: Tour) => {
								return <TourCard tour={tour} key={tour?._id} />;
							})}
						</div>

						{agentTours.length !== 0 && (
							<Stack className="pagination-config">
								<Stack className="pagination-box">
									<Pagination
										count={Math.ceil(total / searchFilter.limit)}
										page={searchFilter.page}
										shape="circular"
										color="primary"
										onChange={paginationHandler}
									/>
								</Stack>
								<Stack className="total-result">
									<Typography>{total} tour{total > 1 ? 's' : ''} available</Typography>
								</Stack>
							</Stack>
						)}
					</Stack>
				</Stack>
			</div>
		);
};

MemberTours.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		search: {
			memberId: '',
		},
	},
};

export default MemberTours;
