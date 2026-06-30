import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Button, Stack, Typography } from '@mui/material';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import { motion, useReducedMotion } from 'framer-motion';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Notice from '../../libs/components/cs/Notice';
import Faq from '../../libs/components/cs/Faq';
import { NoticeCategory } from '../../libs/enums/notice.enum';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({ props: { ...(await serverSideTranslations(locale, ['common'])) } });

const tabs = [
	{ value: NoticeCategory.FAQ, label: 'FAQ', copy: 'Answers for planning and traveling well.', icon: <HelpOutlineRoundedIcon /> },
	{ value: NoticeCategory.TERMS, label: 'Terms', copy: 'Policies, terms, and platform guidance.', icon: <PolicyOutlinedIcon /> },
	{ value: NoticeCategory.INQUIRY, label: 'Inquiry', copy: 'Support requests and contact guidance.', icon: <SupportAgentRoundedIcon /> },
];

const CS: NextPage = () => {
	const router = useRouter();
	const shouldReduceMotion = useReducedMotion();
	const rawTab = router.query.tab as string | undefined;
	const noticeId = router.query.noticeId as string | undefined;
	const activeCategory = tabs.find((tab) => tab.value.toLowerCase() === rawTab)?.value ?? NoticeCategory.FAQ;
	const isOverview = rawTab === 'notice';
	const changeTab = (tab: NoticeCategory) => router.push({ pathname: '/cs', query: { tab: tab.toLowerCase() } }, undefined, { scroll: false });
	const showAllNotices = () => router.push({ pathname: '/cs', query: { tab: 'notice' } }, undefined, { scroll: false });
	const selectNotice = (id: string) => router.push({ pathname: '/cs', query: { tab: isOverview ? 'notice' : activeCategory.toLowerCase(), noticeId: id } }, undefined, { scroll: false });
	const backToList = () => router.push({ pathname: '/cs', query: { tab: isOverview ? 'notice' : activeCategory.toLowerCase() } }, undefined, { scroll: false });
	const motionProps = { initial: { opacity: 0, y: shouldReduceMotion ? 0 : 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: shouldReduceMotion ? 0.18 : 0.38 } };
	const faqFallback = activeCategory === NoticeCategory.FAQ && !isOverview && !noticeId ? (
		<section className="cs-faq-fallback">
			<Typography component="h2">More travel questions</Typography>
			<Typography>Helpful answers for common planning moments.</Typography>
			<Faq />
		</section>
	) : undefined;

	return <div className="cs-page"><main className="cs-shell"><motion.header className="cs-hero" {...motionProps}><Typography className="cs-kicker">GoTrip concierge</Typography><Typography component="h1">Travel with clarity</Typography><Typography>Find platform guidance, traveler answers, and the notices that help every journey go more smoothly.</Typography></motion.header>
		{!noticeId && <div className="cs-tabs" role="tablist" aria-label="Help categories">{tabs.map((tab) => <button key={tab.value} className={activeCategory === tab.value && !isOverview ? 'active' : ''} role="tab" aria-selected={activeCategory === tab.value && !isOverview} onClick={() => changeTab(tab.value)}><span>{tab.icon}</span><strong>{tab.label}</strong><small>{tab.copy}</small></button>)}</div>}
		{!noticeId && <div className="cs-secondary-nav"><Button className={isOverview ? 'active' : ''} onClick={showAllNotices}>All Notices</Button></div>}
		{isOverview && !noticeId && <div className="cs-overview-note"><Typography component="h2">All platform notices</Typography><Typography>Browse every current GoTrip notice in one place, or choose a category above for focused guidance.</Typography><Button onClick={() => changeTab(NoticeCategory.FAQ)}>Browse help categories</Button></div>}
		<Notice category={isOverview ? undefined : activeCategory} noticeId={noticeId} onSelect={selectNotice} onBack={backToList} emptyFallback={faqFallback} />
	</main></div>;
};

export default withLayoutBasic(CS);
