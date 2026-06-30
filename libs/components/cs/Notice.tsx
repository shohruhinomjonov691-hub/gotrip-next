import React, { useMemo, useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import { motion, useReducedMotion } from 'framer-motion';
import Moment from 'react-moment';
import { useQuery } from '@apollo/client';
import { GET_NOTICE, GET_NOTICES } from '../../../apollo/user/query';
import { Direction } from '../../enums/common.enum';
import { Notice as NoticeType } from '../../types/notice/notice';
import { NoticeCategory } from '../../enums/notice.enum';
import { T } from '../../types/common';

interface NoticeProps {
	category?: NoticeCategory;
	noticeId?: string;
	onSelect: (id: string) => void;
	onBack: () => void;
	emptyFallback?: React.ReactNode;
}
const easeOutExpo = [0.16, 1, 0.3, 1] as const;
const categoryMeta: Record<NoticeCategory, { label: string; icon: React.ReactNode }> = {
	[NoticeCategory.FAQ]: { label: 'FAQ', icon: <HelpOutlineRoundedIcon /> },
	[NoticeCategory.TERMS]: { label: 'Terms', icon: <PolicyOutlinedIcon /> },
	[NoticeCategory.INQUIRY]: { label: 'Inquiry', icon: <SupportAgentRoundedIcon /> },
};

const Notice = ({ category, noticeId, onSelect, onBack, emptyFallback }: NoticeProps) => {
	const shouldReduceMotion = useReducedMotion();
	const [notices, setNotices] = useState<NoticeType[]>([]);
	const listQuery = useQuery(GET_NOTICES, { fetchPolicy: 'cache-and-network', variables: { input: { page: 1, limit: 20, sort: 'createdAt', direction: Direction.DESC, search: {} } }, onCompleted: (data: T) => setNotices(data?.getNotices?.list ?? []) });
	const detailQuery = useQuery(GET_NOTICE, { fetchPolicy: 'cache-and-network', variables: { noticeId }, skip: !noticeId });
	const filteredNotices = useMemo(() => category ? notices.filter((notice) => notice.noticeCategory === category) : notices, [category, notices]);
	const featuredNotice = filteredNotices[0];
	const secondaryNotices = filteredNotices.slice(1);
	const listMotion = { hidden: {}, visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.06, delayChildren: shouldReduceMotion ? 0 : 0.06 } } };
	const itemMotion = { hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 14 }, visible: { opacity: 1, y: 0, transition: { duration: shouldReduceMotion ? 0.18 : 0.34, ease: easeOutExpo } } };

	if (noticeId) {
		const notice = detailQuery.data?.getNotice as NoticeType | undefined;
		if (detailQuery.loading) return <div className="cs-detail-skeleton" aria-label="Loading notice" />;
		if (detailQuery.error || !notice) return <div className="cs-state error" role="alert"><Typography component="h2">This notice could not load</Typography><Button onClick={() => detailQuery.refetch({ noticeId })}>Try again</Button><Button startIcon={<ArrowBackRoundedIcon />} onClick={onBack}>Back to notices</Button></div>;
		const meta = categoryMeta[notice.noticeCategory];
		return <motion.article className="cs-notice-detail" variants={itemMotion} initial="hidden" animate="visible"><Button className="cs-back-button" startIcon={<ArrowBackRoundedIcon />} onClick={onBack}>Back to notices</Button><div className="cs-detail-category">{meta?.icon}<span>{meta?.label || notice.noticeCategory}</span></div><Typography component="h2">{notice.noticeTitle}</Typography><Typography className="cs-detail-date"><Moment format="MMMM D, YYYY">{notice.createdAt}</Moment></Typography><div className="cs-detail-content">{notice.noticeContent}</div></motion.article>;
	}

	return <section className="notice-content"><motion.header className="notice-heading" variants={itemMotion} initial="hidden" animate="visible"><div><Typography className="cs-kicker">Platform notices</Typography><Typography component="h2">{category ? `${categoryMeta[category].label} guidance` : 'All current notices'}</Typography></div><Typography>{filteredNotices.length} {filteredNotices.length === 1 ? 'update' : 'updates'}</Typography></motion.header>
		{listQuery.loading && notices.length === 0 && <div className="cs-notice-grid">{[0, 1, 2].map((item) => <div className="cs-notice-skeleton" key={item}><span /><strong /><em /></div>)}</div>}
		{listQuery.error && notices.length === 0 && <div className="cs-state error" role="alert"><Typography component="h3">Notices could not load</Typography><Button onClick={() => listQuery.refetch()}>Refresh notices</Button></div>}
		{!listQuery.loading && !listQuery.error && filteredNotices.length === 0 && (emptyFallback || <div className="cs-state"><DescriptionOutlinedIcon /><Typography component="h3">No updates in this category yet</Typography><Typography>Check another category for current GoTrip guidance.</Typography></div>)}
		{featuredNotice && !listQuery.loading && !listQuery.error && <motion.article className="cs-featured-notice" variants={itemMotion} initial="hidden" animate="visible" whileHover={shouldReduceMotion ? undefined : { y: -4 }}><div className="cs-featured-media"><img src="/img/banner/cities/BUSAN.webp" alt="" /><div /></div><div className="cs-featured-copy"><Typography className="cs-notice-category">{categoryMeta[featuredNotice.noticeCategory]?.label || featuredNotice.noticeCategory}</Typography><Typography component="h3">{featuredNotice.noticeTitle}</Typography><Typography>{featuredNotice.noticeContent}</Typography><Button endIcon={<ArrowForwardRoundedIcon />} onClick={() => onSelect(featuredNotice._id)}>Read featured notice</Button></div></motion.article>}
		<motion.div className="cs-notice-grid" variants={listMotion} initial="hidden" animate="visible">{secondaryNotices.map((notice) => { const meta = categoryMeta[notice.noticeCategory]; return <motion.article className="cs-notice-card" variants={itemMotion} key={notice._id} whileHover={shouldReduceMotion ? undefined : { y: -4 }}><div className="cs-notice-card-top"><span>{meta?.icon}</span><Moment format="MMM D, YYYY">{notice.createdAt}</Moment></div><Typography className="cs-notice-category">{meta?.label || notice.noticeCategory}</Typography><Typography component="h3">{notice.noticeTitle}</Typography><Typography className="cs-notice-excerpt">{notice.noticeContent}</Typography><Button endIcon={<ArrowForwardRoundedIcon />} onClick={() => onSelect(notice._id)}>Read update</Button></motion.article>; })}</motion.div>
	</section>;
};

export default Notice;
