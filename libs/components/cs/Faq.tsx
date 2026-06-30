import React, { SyntheticEvent, useState } from 'react';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import { AccordionDetails, Box, Stack, Typography } from '@mui/material';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import { styled } from '@mui/material/styles';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

const Accordion = styled((props: AccordionProps) => <MuiAccordion disableGutters elevation={0} square {...props} />)(
	({ theme }) => ({
		border: `1px solid ${theme.palette.divider}`,
		'&:not(:last-child)': {
			borderBottom: 0,
		},
		'&:before': {
			display: 'none',
		},
	}),
);

const AccordionSummary = styled((props: AccordionSummaryProps) => (
	<MuiAccordionSummary expandIcon={<KeyboardArrowDownRoundedIcon sx={{ fontSize: '1.4rem' }} />} {...props} />
))(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .05)' : '#fff',
	'& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
		transform: 'rotate(180deg)',
	},
	'& .MuiAccordionSummary-content': {
		marginLeft: theme.spacing(1),
	},
}));

const FAQ_CATEGORIES = [
	{ id: 'tours', label: 'Tours' },
	{ id: 'booking', label: 'Booking and payment' },
	{ id: 'travelers', label: 'For travelers' },
	{ id: 'guides', label: 'For guides' },
	{ id: 'account', label: 'Account' },
	{ id: 'community', label: 'Community' },
	{ id: 'support', label: 'Support' },
] as const;

type FaqCategory = (typeof FAQ_CATEGORIES)[number]['id'];

interface FaqEntry {
	id: string;
	subject: string;
	content: string;
}

const FAQ_DATA: Record<FaqCategory, FaqEntry[]> = {
	tours: [
		{
			id: 'tour-discovery',
			subject: 'How do I find a tour?',
			content: 'Browse tours by destination, category, location, price, and trip duration. Each tour page shows its operator, itinerary details, and available departures when provided.',
		},
		{
			id: 'tour-details',
			subject: 'What should I check before choosing a tour?',
			content: 'Review the meeting point, duration, group size, inclusions, exclusions, difficulty, language, and schedule availability before continuing to booking.',
		},
		{
			id: 'tour-saved',
			subject: 'Can I save a tour for later?',
			content: 'Yes. Signed-in travelers can save tours to their wishlist and return to them from My Page.',
		},
	],
	booking: [
		{
			id: 'booking-schedule',
			subject: 'How do I choose a departure?',
			content: 'Choose an active schedule with enough remaining seats on the tour detail page before entering traveler details.',
		},
		{
			id: 'booking-payment',
			subject: 'When is payment information shown?',
			content: 'Available payment information and booking status are shown during the booking flow. Refer to the tour details and Terms for the current conditions.',
		},
		{
			id: 'booking-records',
			subject: 'Where can I review a booking or payment record?',
			content: 'Signed-in travelers can review their booking and payment records from My Page.',
		},
	],
	travelers: [
		{
			id: 'traveler-preparation',
			subject: 'What should I prepare before a tour?',
			content: 'Confirm the departure time, meeting point, group requirements, and the tour operator instructions before you travel.',
		},
		{
			id: 'traveler-changes',
			subject: 'What if my plans change?',
			content: 'Check the booking status and tour details first, then use the available booking controls or send an inquiry for help with your situation.',
		},
		{
			id: 'traveler-destination',
			subject: 'Can I start with a destination instead of a tour?',
			content: 'Yes. Destination pages provide local context and link to tours associated with that place.',
		},
	],
	guides: [
		{
			id: 'guide-request',
			subject: 'How do I request guide access?',
			content: 'Create a traveler account, then include a guide or operator request during sign-up. Administrators review the request before operator access is granted.',
		},
		{
			id: 'guide-tours',
			subject: 'What can approved guides manage?',
			content: 'Approved guides can create and update the tours they operate from the agent area in My Page.',
		},
		{
			id: 'guide-profile',
			subject: 'How do travelers find guides?',
			content: 'Public guide profiles show the tours and traveler feedback associated with each guide.',
		},
	],
	account: [
		{
			id: 'account-profile',
			subject: 'Where can I update my profile?',
			content: 'Use My Page to update your profile information and review your account activity.',
		},
		{
			id: 'account-notifications',
			subject: 'Where do I find notifications?',
			content: 'Account notifications are available from the header and the Notifications section in My Page when you are signed in.',
		},
		{
			id: 'account-signin',
			subject: 'Why do I need an account?',
			content: 'An account lets you save tours, create bookings, manage payments, participate in the community, and track your activity.',
		},
	],
	community: [
		{
			id: 'community-posts',
			subject: 'How do I share a travel story?',
			content: 'Sign in, then use the Community writing flow from My Page to publish a story in the appropriate category.',
		},
		{
			id: 'community-comments',
			subject: 'Can I comment on a story?',
			content: 'Signed-in members can join article conversations. Keep comments useful, respectful, and relevant to travel.',
		},
		{
			id: 'community-safety',
			subject: 'What should I do about inappropriate content?',
			content: 'Use the available support pathway to describe the issue. Administrators can moderate public community content.',
		},
	],
	support: [
		{
			id: 'support-notices',
			subject: 'Where can I find platform notices?',
			content: 'The Help Center groups current notices under FAQ, Terms, and Inquiry so you can find the relevant guidance quickly.',
		},
		{
			id: 'support-inquiry',
			subject: 'How do I ask for help?',
			content: 'Open the Inquiry section in the Help Center to review available support guidance and current service updates.',
		},
		{
			id: 'support-terms',
			subject: 'Where can I read the platform terms?',
			content: 'Open the Terms category in the Help Center for current policy and platform guidance.',
		},
	],
};

const Faq = () => {
	const [category, setCategory] = useState<FaqCategory>('tours');
	const [expanded, setExpanded] = useState<string | false>('tour-discovery');

	const changeCategoryHandler = (nextCategory: FaqCategory) => {
		setCategory(nextCategory);
		setExpanded(FAQ_DATA[nextCategory][0]?.id ?? false);
	};

	const handleChange = (panel: string) => (_event: SyntheticEvent, newExpanded: boolean) => {
		setExpanded(newExpanded ? panel : false);
	};

	return (
		<Stack className={'faq-content'}>
			<Box className={'categories'} component={'div'} role="tablist" aria-label="Travel help topics">
				{FAQ_CATEGORIES.map((item) => (
					<div
						key={item.id}
						className={category === item.id ? 'active' : ''}
						role="tab"
						tabIndex={0}
						aria-selected={category === item.id}
						onClick={() => changeCategoryHandler(item.id)}
						onKeyDown={(event) => {
							if (event.key === 'Enter' || event.key === ' ') {
								event.preventDefault();
								changeCategoryHandler(item.id);
							}
						}}
					>
						{item.label}
					</div>
				))}
			</Box>
			<Box className={'wrap'} component={'div'}>
				{FAQ_DATA[category].map((item) => {
					const headerId = `faq-${item.id}-header`;
					const contentId = `faq-${item.id}-content`;

					return (
						<Accordion expanded={expanded === item.id} onChange={handleChange(item.id)} key={item.id}>
							<AccordionSummary id={headerId} className="question" aria-controls={contentId}>
								<Typography className="badge" variant={'h4'}>
									Q
								</Typography>
								<Typography>{item.subject}</Typography>
							</AccordionSummary>
							<AccordionDetails id={contentId} aria-labelledby={headerId}>
								<Stack className={'answer flex-box'}>
									<Typography className="badge" variant={'h4'} color={'primary'}>
										A
									</Typography>
									<Typography>{item.content}</Typography>
								</Stack>
							</AccordionDetails>
						</Accordion>
					);
				})}
			</Box>
		</Stack>
	);
};

export default Faq;
