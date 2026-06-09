import React, { useState } from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useQuery } from '@apollo/client';
import Moment from 'react-moment';
import { GET_NOTICES } from '../../../apollo/user/query';
import { Direction } from '../../enums/common.enum';
import { Notice as NoticeType } from '../../types/notice/notice';
import { T } from '../../types/common';

const Notice = () => {
	const device = useDeviceDetect();
	const [notices, setNotices] = useState<NoticeType[]>([]);

	/** APOLLO REQUESTS **/
	useQuery(GET_NOTICES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 20, sort: 'createdAt', direction: Direction.DESC, search: {} } },
		onCompleted: (data: T) => setNotices(data?.getNotices?.list ?? []),
	});

	if (device === 'mobile') {
		return <div>NOTICE MOBILE</div>;
	} else {
		return (
			<Stack className={'notice-content'}>
				<span className={'title'}>Notice</span>
				<Stack className={'main'}>
					<Box component={'div'} className={'top'}>
						<span>number</span>
						<span>title</span>
						<span>date</span>
					</Box>
					<Stack className={'bottom'}>
						{notices.map((notice, index) => (
							<div className={`notice-card ${(notice.noticeCategory as string) === 'EVENT' && 'event'}`} key={notice._id}>
								{(notice.noticeCategory as string) === 'EVENT' ? (
									<div>event</div>
								) : (
									<span className={'notice-number'}>{index + 1}</span>
								)}
								<span className={'notice-title'}>{notice.noticeTitle}</span>
								<span className={'notice-date'}>
									<Moment format="DD.MM.YYYY">{notice.createdAt}</Moment>
								</span>
							</div>
						))}
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default Notice;
