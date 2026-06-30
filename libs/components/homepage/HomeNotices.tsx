import React from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { Button, Stack, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import { motion, useReducedMotion } from 'framer-motion';
import { GET_NOTICES } from '../../../apollo/user/query';
import { Direction } from '../../enums/common.enum';
import { Notice } from '../../types/notice/notice';
import { T } from '../../types/common';
import { fadeUp, staggerContainer } from './motion';

const MotionSection = motion.section;
const MotionDiv = motion.div;

const HomeNotices = () => {
	const reduceMotion = useReducedMotion();
	const { loading, error, data, refetch } = useQuery(GET_NOTICES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 3, sort: 'createdAt', direction: Direction.DESC, search: {} } },
	});
	const notices: Notice[] = (data as T)?.getNotices?.list ?? [];

	return (
		<MotionSection
			className="homepage-notices-section"
			variants={reduceMotion ? undefined : fadeUp}
			initial={reduceMotion ? false : 'hidden'}
			whileInView="visible"
			viewport={{ once: true, amount: 0.16 }}
		>
			<Stack className="homepage-notices-container">
				<Stack className="homepage-notices-heading" direction={{ xs: 'column', md: 'row' }} justifyContent="space-between">
					<Stack>
						<Typography className="eyebrow">Travel desk</Typography>
						<Typography className="section-title">Plan with clarity</Typography>
						<Typography className="section-copy">The latest platform guidance, travel notes, and service updates.</Typography>
					</Stack>
					<Link href="/cs?tab=notice"><Button className="section-link" endIcon={<ArrowForwardRoundedIcon />}>View help center</Button></Link>
				</Stack>

				{loading && !notices.length ? (
					<Stack className="homepage-skeleton-grid notice-skeleton-grid"><span /><span /><span /></Stack>
				) : error ? (
					<Stack className="homepage-data-state" alignItems="center"><Typography>Notices could not be loaded.</Typography><Button onClick={() => refetch()}>Try again</Button></Stack>
				) : !notices.length ? (
					<Stack className="homepage-data-state" alignItems="center"><Typography>There are no new travel notices right now.</Typography><Link href="/cs?tab=faq"><Button>Visit help center</Button></Link></Stack>
				) : (
					<MotionDiv className="homepage-notice-list" variants={reduceMotion ? undefined : staggerContainer} initial={reduceMotion ? false : 'hidden'} whileInView="visible" viewport={{ once: true, amount: 0.12 }}>
						{notices.map((notice) => (
							<Link href={`/cs?tab=${notice.noticeCategory.toLowerCase()}&noticeId=${notice._id}`} key={notice._id}>
								<motion.article className="homepage-notice-card" variants={reduceMotion ? undefined : fadeUp} whileHover={reduceMotion ? undefined : { y: -3 }}>
									<CampaignOutlinedIcon />
									<Stack><Typography component="span">{notice.noticeCategory}</Typography><Typography component="strong">{notice.noticeTitle}</Typography><Typography component="p">{notice.noticeContent}</Typography></Stack>
									<ArrowForwardRoundedIcon className="notice-arrow" />
								</motion.article>
							</Link>
						))}
					</MotionDiv>
				)}
			</Stack>
		</MotionSection>
	);
};

export default HomeNotices;
