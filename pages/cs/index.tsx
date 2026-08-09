import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutGth from '../../libs/components/layout/LayoutGth';
import { useTranslation } from '../../libs/i18n/useTranslation';
import { getLocalizedField } from '../../libs/i18n/localization';
import { GET_NOTICES } from '../../apollo/user/query';
import { CREATE_TESTIMONIAL } from '../../apollo/user/mutation';
import { Notice, Notices } from '../../libs/types/notice/notice';
import { NoticeCategory } from '../../libs/enums/notice.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { userVar } from '../../apollo/store';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: { ...(await serverSideTranslations(locale, ['common'])) },
});

const TABS: { value: NoticeCategory; label: string }[] = [
	{ value: NoticeCategory.FAQ, label: 'FAQ' },
	{ value: NoticeCategory.TERMS, label: 'Terms & policies' },
	{ value: NoticeCategory.INQUIRY, label: 'Inquiries' },
];

/* Section artwork. Swap either constant for a local file in /public/img if you
   would rather serve the imagery yourself. */
const HEART_ISLAND = 'https://images.unsplash.com/photo-1596674777716-517debeb9f98?auto=format&fit=crop&w=2000&q=80';
const LAGOON_VILLAS = 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1800&q=80';

/* Mirrors the backend validator on TestimonialInput.testimonialContent. */
const CONTENT_MIN = 3;
const CONTENT_MAX = 1000;

const HELP_CARDS = [
	{
		title: 'Browse tours',
		copy: 'Compare guided routes, real prices and live seat counts before you book.',
		href: '/tour',
		cta: 'Explore tours',
		icon: (
			<svg viewBox="0 0 24 24">
				<path d="M9 5.5L3.5 8v11L9 16.5l6 2.5 5.5-2.5v-11L15 8z" />
				<path d="M9 5.5v11M15 8v11" />
			</svg>
		),
	},
	{
		title: 'Find a guide',
		copy: 'Every guide is identity- and licence-checked, with a public rating history.',
		href: '/agent',
		cta: 'Meet the guides',
		icon: (
			<svg viewBox="0 0 24 24">
				<circle cx="12" cy="8" r="3.6" />
				<path d="M5 20a7 7 0 0114 0" />
			</svg>
		),
	},
	{
		title: 'Ask the community',
		copy: 'Traveller notes, recommendations and answers from people who went.',
		href: '/community',
		cta: 'Open community',
		icon: (
			<svg viewBox="0 0 24 24">
				<path d="M20 12.5a7 7 0 01-7 7H8l-4 2.5V12.5a7 7 0 017-7h2a7 7 0 017 7z" />
			</svg>
		),
	},
];

/** Contact channels, each with what it is best for and how fast it answers. */
const CHANNELS = [
	{
		label: 'Message your guide',
		value: 'From any tour page',
		note: 'Fastest for dates, pickup and group questions',
		href: '/tour',
		icon: (
			<svg viewBox="0 0 24 24">
				<path d="M20 12.5a7 7 0 01-7 7H8l-4 2.5V12.5a7 7 0 017-7h2a7 7 0 017 7z" />
			</svg>
		),
	},
	{
		label: 'Email support',
		value: 'support@gotrip.com',
		note: 'Bookings, refunds and account help',
		href: 'mailto:support@gotrip.com',
		icon: (
			<svg viewBox="0 0 24 24">
				<rect height="14" rx="2.4" width="18" x="3" y="5" />
				<path d="M3.5 6.5L12 13l8.5-6.5" />
			</svg>
		),
	},
	{
		label: 'Call us',
		value: '+1 234 567 890',
		note: 'Mon–Fri, 09:00–18:00 (PT)',
		href: 'tel:+1234567890',
		icon: (
			<svg viewBox="0 0 24 24">
				<path d="M6.5 3.5h3l1.5 4-2 1.4a12 12 0 006.1 6.1l1.4-2 4 1.5v3a2 2 0 01-2.2 2A17 17 0 014.5 5.7a2 2 0 012-2.2z" />
			</svg>
		),
	},
	{
		label: 'Press & partnerships',
		value: 'hello@gotrip.com',
		note: 'Anything not tied to a booking',
		href: 'mailto:hello@gotrip.com',
		icon: (
			<svg viewBox="0 0 24 24">
				<path d="M4 6h16v12H4z" />
				<path d="M8 10h8M8 14h5" />
			</svg>
		),
	},
];

/** What travellers can expect from us — stated plainly, no invented SLAs. */
const PROMISES = [
	{ value: 'Under 24h', label: 'Typical email reply' },
	{ value: 'Mon–Fri', label: 'Phone support' },
	{ value: 'Same day', label: 'Guide messages' },
];

const ChevronIcon = () => (
	<svg viewBox="0 0 24 24">
		<path d="M6 9l6 6 6-6" />
	</svg>
);

const StarIcon = () => (
	<svg viewBox="0 0 24 24">
		<path d="M12 3.6l2.6 5.5 5.9.8-4.3 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.5 9.9l5.9-.8z" />
	</svg>
);

const SupportPage: NextPage = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const locale = router.locale ?? 'en';
	const user = useReactiveVar(userVar);
	const [tab, setTab] = useState<NoticeCategory>(NoticeCategory.FAQ);
	const [openId, setOpenId] = useState<string | null>(null);

	// Deep-link support for ?tab=faq|terms|inquiry — the Footer's CS links (and
	// GoTrip AI notice/FAQ recommendations) already point at these query
	// values; this is what actually applies them on load.
	useEffect(() => {
		const raw = router.query.tab;
		const value = (Array.isArray(raw) ? raw[0] : raw)?.toUpperCase();
		if (value && (Object.values(NoticeCategory) as string[]).includes(value)) {
			setTab(value as NoticeCategory);
		}
	}, [router.query.tab]);

	const [content, setContent] = useState('');
	const [rating, setRating] = useState(5);
	const [touched, setTouched] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [formError, setFormError] = useState('');
	const contentRef = useRef<HTMLTextAreaElement>(null);

	const { data, loading, error, refetch } = useQuery<{ getNotices: Notices }>(GET_NOTICES, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: 1,
				limit: 30,
				sort: 'createdAt',
				direction: Direction.DESC,
				search: { noticeCategory: tab },
			},
		},
	});
	const notices: Notice[] = data?.getNotices?.list ?? [];

	const [createTestimonial, { loading: submitting }] = useMutation(CREATE_TESTIMONIAL);

	/** Client-side mirror of the server rule, so users see the problem before sending. */
	const validation = useMemo(() => {
		const trimmed = content.trim();
		if (!trimmed) return t('Please write a few words about your trip.');
		if (trimmed.length < CONTENT_MIN) return t('At least {{count}} characters, please.', { count: CONTENT_MIN });
		if (trimmed.length > CONTENT_MAX) return t('Please keep it under {{count}} characters.', { count: CONTENT_MAX });
		return '';
	}, [content, t]);

	const canSubmit = !!user?._id && !validation && !submitting;

	const submitTestimonial = async () => {
		setTouched(true);
		setFormError('');
		if (validation) {
			contentRef.current?.focus();
			return;
		}
		try {
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			// The server derives author details from the session and stores it PENDING.
			await createTestimonial({
				variables: { input: { testimonialContent: content.trim(), testimonialRating: rating } },
			});
			setContent('');
			setRating(5);
			setTouched(false);
			setSubmitted(true);
			await sweetTopSmallSuccessAlert(t('Thanks! Your testimonial is awaiting review.'), 1400);
		} catch (err: any) {
			setFormError(err?.message ?? t('Could not send your testimonial. Please try again.'));
			await sweetErrorHandling(err);
		}
	};

	return (
		<>
			{/* ---------------------------------------------------------- help */}
			<section className="pg-sec sp-top">
				<div className="wrap">
					<span className="eyebrow">{t('How can we help?')}</span>
					<h2 className="sp-h2">{t('Start here')}</h2>
					<div className="sp-cards">
						{HELP_CARDS.map((card) => (
							<Link className="sp-card" href={card.href} key={card.title}>
								<span className="sp-card-ico">{card.icon}</span>
								<h3>{t(card.title)}</h3>
								<p>{t(card.copy)}</p>
								<span className="sp-card-cta">
									{t(card.cta)}
									<svg aria-hidden="true" viewBox="0 0 24 24">
										<path d="M5 12h13M13 6l6 6-6 6" />
									</svg>
								</span>
							</Link>
						))}
					</div>
				</div>
			</section>

			{/* ----------------------------------------------------------- FAQ */}
			<section className="pg-sec sp-faq">
				<div className="wrap">
					<span className="eyebrow">{t('Good to know')}</span>
					<h2 className="sp-h2">{t('Frequently asked questions')}</h2>

					<div className="cm-tabs sp-tabs" role="tablist" aria-label={t('Help categories') as string}>
						{TABS.map((tabItem) => (
							<button
								aria-selected={tab === tabItem.value}
								className={tab === tabItem.value ? 'cm-tab on' : 'cm-tab'}
								key={tabItem.value}
								onClick={() => {
									setTab(tabItem.value);
									setOpenId(null);
								}}
								role="tab"
								type="button"
							>
								{t(tabItem.label)}
							</button>
						))}
					</div>

					{error && !loading && notices.length === 0 && (
						<div className="pg-state">
							<h3>{t('Could not load this section')}</h3>
							<p>{t('Please try again in a moment.')}</p>
							<button className="btn btn-sky" onClick={() => refetch()} type="button">
								{t('Try again')}
							</button>
						</div>
					)}

					{loading && notices.length === 0 && !error && (
						<div className="sp-acc">
							{Array.from({ length: 5 }, (_, i) => (
								<div className="pg-skeleton" key={i} style={{ height: 62, borderRadius: 16 }} />
							))}
						</div>
					)}

					{!loading && !error && notices.length === 0 && (
						<div className="pg-state">
							<h3>{t('Nothing published here yet')}</h3>
							<p>{t('Check another category or contact us directly below.')}</p>
						</div>
					)}

					{notices.length > 0 && (
						<div className="sp-acc">
							{notices.map((notice) => {
								const open = openId === notice._id;
								const localizedTitle = getLocalizedField(notice, 'noticeTitle', locale);
								const localizedContent = getLocalizedField(notice, 'noticeContent', locale);
								return (
									<div className={open ? 'sp-item open' : 'sp-item'} key={notice._id}>
										<h3 className="sp-q-h">
											<button
												aria-controls={`faq-panel-${notice._id}`}
												aria-expanded={open}
												className="sp-q"
												id={`faq-btn-${notice._id}`}
												onClick={() => setOpenId(open ? null : notice._id)}
												type="button"
											>
												<span>{localizedTitle}</span>
												<ChevronIcon />
											</button>
										</h3>
										{/* Grid-rows trick animates to auto height without measuring. */}
										<div
											aria-labelledby={`faq-btn-${notice._id}`}
											className="sp-a-wrap"
											id={`faq-panel-${notice._id}`}
											role="region"
										>
											<div className="sp-a-inner">
												<div className="sp-a">{localizedContent}</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</section>

			{/* ------------------------------------------- share your experience */}
			<section className="sp-share">
				<div className="sp-share-bg">
					<img alt="" loading="lazy" src={HEART_ISLAND} />
				</div>

				<div className="wrap sp-share-inner">
					<div className="sp-share-copy">
						<span className="eyebrow">{t('Your turn')}</span>
						<h2>{t('The best trips deserve to be told')}</h2>
						<p>
							{t(
								'Somewhere out there is a traveller deciding whether to go. Your few honest lines about the guide who made it work will help them more than any brochure.',
							)}
						</p>
						<ul className="sp-share-notes">
							<li>{t('Published on GoTrip once our team has read it')}</li>
							<li>{t('Your name and photo come from your profile')}</li>
							<li>{t('Takes about a minute')}</li>
						</ul>
					</div>

					<div className="sp-share-card">
						{submitted ? (
							<div className="sp-sent" role="status">
								<span className="sp-sent-ico">
									<svg viewBox="0 0 24 24">
										<circle cx="12" cy="12" r="9" />
										<path d="M8.4 12.4l2.5 2.4 4.7-5.2" />
									</svg>
								</span>
								<h3>{t('Thank you for sharing')}</h3>
								<p>{t('Your testimonial is with our team and will appear on GoTrip once reviewed.')}</p>
								<button className="btn btn-outline" onClick={() => setSubmitted(false)} type="button">
									{t('Write another')}
								</button>
							</div>
						) : (
							<>
								<h3 className="sp-share-title">{t('Share your experience')}</h3>

								{!user?._id && (
									<p className="sp-share-guest">
										<Link href="/account/join">{t('Log in')}</Link>{' '}
										{t('to post a testimonial — we use your profile name and photo.')}
									</p>
								)}

								{formError && (
									<div className="au-error" role="alert">
										{formError}
									</div>
								)}

								<div className="fl-field">
									<span className="sp-label" id="sp-rating-label">
										{t('How was it?')}
									</span>
									<div aria-labelledby="sp-rating-label" className="sp-stars" role="radiogroup">
										{[1, 2, 3, 4, 5].map((r) => (
											<button
												aria-checked={rating === r}
												aria-label={t('{{count}} star', { count: r }) as string}
												className={r <= rating ? 'sp-star on' : 'sp-star'}
												key={r}
												onClick={() => setRating(r)}
												role="radio"
												type="button"
											>
												<StarIcon />
											</button>
										))}
										<span className="sp-stars-val">{rating}/5</span>
									</div>
								</div>

								<div className="fl-field">
									<label htmlFor="sp-content">{t('Your testimonial')}</label>
									<textarea
										aria-describedby="sp-content-help"
										aria-invalid={touched && !!validation}
										disabled={!user?._id || submitting}
										id="sp-content"
										maxLength={CONTENT_MAX}
										onBlur={() => setTouched(true)}
										onChange={(e) => setContent(e.target.value)}
										placeholder={(user?._id ? t('Tell us how your trip went…') : t('Log in to submit a testimonial')) as string}
										ref={contentRef}
										rows={5}
										value={content}
									/>
									<div className="sp-help" id="sp-content-help">
										{touched && validation ? (
											<span className="sp-help-err">{validation}</span>
										) : (
											<span>{t('Reviewed before publishing')}</span>
										)}
										<span className={content.length > CONTENT_MAX - 100 ? 'sp-count warn' : 'sp-count'}>
											{content.length}/{CONTENT_MAX}
										</span>
									</div>
								</div>

								<button className="btn btn-sky sp-send" disabled={!canSubmit} onClick={submitTestimonial} type="button">
									{submitting ? (
										<>
											<i aria-hidden="true" className="sp-spin" />
											{t('Sending…')}
										</>
									) : (
										t('Submit testimonial')
									)}
								</button>
							</>
						)}
					</div>
				</div>
			</section>

			{/* ----------------------------------------------- customer support */}
			<section className="sp-care">
				<div className="sp-care-bg">
					<img alt="" loading="lazy" src={LAGOON_VILLAS} />
				</div>

				<div className="wrap sp-care-inner">
					<div className="sp-care-panel">
						<span className="eyebrow">{t('Customer support')}</span>
						<h2>
							<b>{t('Reach us')}</b> — {t('a real person answers')}
						</h2>
						<p className="sp-care-lead">
							{t(
								'Anything about a specific trip is fastest with the guide running it. For everything else, our team picks it up.',
							)}
						</p>

						<div className="sp-channels">
							{CHANNELS.map((c) => (
								<a className="sp-channel" href={c.href} key={c.label}>
									<span className="sp-channel-ico">{c.icon}</span>
									<span className="sp-channel-body">
										<small>{t(c.label)}</small>
										<b>{t(c.value)}</b>
										<span>{t(c.note)}</span>
									</span>
								</a>
							))}
						</div>

						<div className="sp-promises">
							{PROMISES.map((p) => (
								<div key={p.label}>
									<b>{t(p.value)}</b>
									<small>{t(p.label)}</small>
								</div>
							))}
						</div>

						<p className="sp-care-foot">
							{t('Office: 789 Inner Lane, Holy Park, California, USA · Prefer to read first?')}{' '}
							<Link href="/cs">{t('Browse the FAQ')}</Link>
						</p>
					</div>
				</div>
			</section>
		</>
	);
};

export default withLayoutGth(SupportPage);
