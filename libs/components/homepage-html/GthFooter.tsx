import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from '../../i18n/useTranslation';
import { FacebookIcon, InstagramIcon, LinkedInIcon, XIcon, YouTubeIcon } from './socialIcons';

/* "About Us" points at the existing #about-us section on the Home page
   (GthAbout.tsx) rather than a route of its own. */
const ABOUT_US_HREF = '/#about-us';

const USEFUL_LINKS = [
	{ label: 'Home', href: '/' },
	{ label: 'About Us', href: ABOUT_US_HREF },
	{ label: 'All Tours', href: '/tour' },
	{ label: 'Become a Guide', href: '/mypage' },
	{ label: 'FAQ', href: '/cs' },
	{ label: 'Contact Us', href: '/cs' },
];

const INSTA_IMAGES = [
	'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=200&q=60',
	'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=200&q=60',
	'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=200&q=60',
	'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=200&q=60',
	'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=200&q=60',
	'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=200&q=60',
];

const GthFooter = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [showTop, setShowTop] = useState(false);

	/** Already on the Home page: scroll directly instead of round-tripping
	 *  through a hash-only route change. Mirrors GthHero's own #our-services
	 *  handler. From any other page the plain href navigates to `/#about-us`,
	 *  where LayoutHome's scroll-on-mount effect takes over. */
	const scrollToAboutUs = (e: React.MouseEvent<HTMLAnchorElement>) => {
		if (router.pathname !== '/') return;
		e.preventDefault();
		document.getElementById('about-us')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	};

	useEffect(() => {
		const onScroll = () => setShowTop(window.scrollY > 600);
		window.addEventListener('scroll', onScroll);
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	return (
		<footer className="foot">
			<span className="car">
				<svg viewBox="0 0 64 32">
					<path d="M4 22h4a4 4 0 018 0h24a4 4 0 018 0h6" />
					<path d="M8 22V14l6-6h18l8 8h6a4 4 0 014 4" />
					<circle cx="16" cy="24" r="3.4" />
					<circle cx="44" cy="24" r="3.4" />
					<path d="M16 14h8v8" />
				</svg>
			</span>
			<div className="f-newsletter">
				<div className="wrap">
					<div>
						<h2>{t('Get Updated With The Latest Deals')}</h2>
						<p className="f-note">
							{t('Fresh tour packages and price drops, straight to your inbox — no spam, unsubscribe anytime.')}
						</p>
					</div>
					<form
						className="f-form"
						onSubmit={(e) => {
							e.preventDefault();
							setEmail('');
						}}
					>
						<input
							onChange={(e) => setEmail(e.target.value)}
							placeholder={t('Enter your email') as string}
							required
							type="email"
							value={email}
						/>
						<button className="btn btn-sky" type="submit">
							{t('Subscribe Now')}{' '}
							<span className="ar">
								<svg className="ico" viewBox="0 0 24 24">
									<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />
								</svg>
							</span>
						</button>
					</form>
				</div>
			</div>
			<div className="wrap f-cols">
				<div className="f-col">
					<div className="f-brand">
						<svg aria-label={t('GoTrip logo') as string} className="logo" viewBox="0 0 64 64">
							<defs>
								<linearGradient id="fgl" x1="0" x2="1" y1="0" y2="1">
									<stop offset="0" stopColor="#1fb6dd" />
									<stop offset="1" stopColor="#0d7f9f" />
								</linearGradient>
							</defs>
							<circle cx="30" cy="34" fill="url(#fgl)" r="17" />
							<g fill="none" opacity=".62" stroke="#fff" strokeWidth="1.3">
								<path d="M13 34h34" />
								<path d="M30 17c6.5 7 6.5 27 0 34" />
								<path d="M30 17c-6.5 7-6.5 27 0 34" />
								<path d="M16.5 25.5c8 3.6 19 3.6 27 0" />
								<path d="M16.5 42.5c8-3.6 19-3.6 27 0" />
							</g>
							<ellipse
								cx="32"
								cy="32"
								fill="none"
								rx="27"
								ry="12"
								stroke="#16a3c8"
								strokeDasharray="70 120"
								strokeDashoffset="-96"
								strokeLinecap="round"
								strokeWidth="2.6"
								transform="rotate(-24 32 32)"
							/>
							<g transform="translate(46,15) rotate(28)">
								<path d="M0 4 L20 0 L14.5 5.5 L11 15 L8.4 7.6 L1.5 9.5 Z" fill="#fff" />
							</g>
						</svg>
						<span className="txt">
							<b>
								Go<i>Trip</i>
							</b>
							<small>EXPLORE WORLD</small>
						</span>
					</div>
					<p className="f-about">
						{t(
							'GoTrip connects travellers with 250+ verified guide agents across 120 destinations — real prices, honest reviews, and a human to call if a trip ever needs to change.',
						)}
					</p>
					<div className="f-soc">
						<a aria-label={t('Facebook') as string} className="fb" href="#" onClick={(e) => e.preventDefault()}>
							<FacebookIcon />
						</a>
						<a aria-label={t('X (Twitter)') as string} className="tw" href="#" onClick={(e) => e.preventDefault()}>
							<XIcon />
						</a>
						<a aria-label={t('LinkedIn') as string} className="li" href="#" onClick={(e) => e.preventDefault()}>
							<LinkedInIcon />
						</a>
						<a aria-label={t('YouTube') as string} className="yt" href="#" onClick={(e) => e.preventDefault()}>
							<YouTubeIcon />
						</a>
						<a aria-label={t('Instagram') as string} className="ig" href="#" onClick={(e) => e.preventDefault()}>
							<InstagramIcon />
						</a>
					</div>
				</div>
				<div className="f-col">
					<h4>{t('Useful Link')}</h4>
					<ul>
						{USEFUL_LINKS.map((link) => (
							<li key={link.label}>
								<Link href={link.href} onClick={link.href === ABOUT_US_HREF ? scrollToAboutUs : undefined}>
									<svg viewBox="0 0 24 24">
										<path d="M9 6l6 6-6 6" />
									</svg>{' '}
									{t(link.label)}
								</Link>
							</li>
						))}
					</ul>
				</div>
				<div className="f-col">
					<h4>{t('Get In Touch')}</h4>
					<div className="f-touch">
						<span className="ti">
							<svg viewBox="0 0 24 24">
								<path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.6A2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.8.7a2 2 0 011.7 2z" />
							</svg>
						</span>
						<div>
							+1 234 567 890
							<br />
							+1 987 654 321
						</div>
					</div>
					<div className="f-touch">
						<span className="ti">
							<svg viewBox="0 0 24 24">
								<rect height="14" rx="2" width="18" x="3" y="5" />
								<path d="M3 7l9 6 9-6" />
							</svg>
						</span>
						<div>
							hello@gotrip.com
							<br />
							support@gotrip.com
						</div>
					</div>
					<div className="f-touch">
						<span className="ti">
							<svg viewBox="0 0 24 24">
								<path d="M12 21s-7-6.3-7-11a7 7 0 0114 0c0 4.7-7 11-7 11z" />
								<circle cx="12" cy="10" r="2.4" />
							</svg>
						</span>
						<div>
							789 Inner Lane, Holy Park,
							<br />
							California, USA
						</div>
					</div>
				</div>
				<div className="f-col">
					<h4>{t('Instagram Post')}</h4>
					<div className="f-insta">
						{INSTA_IMAGES.map((src) => (
							<a href="#" key={src} onClick={(e) => e.preventDefault()}>
								<img alt="" loading="lazy" src={src} />
							</a>
						))}
					</div>
				</div>
			</div>
			<div className="f-bot">
				<div className="wrap">
					<span>{t('Copyright © 2026 GoTrip. All rights reserved.')}</span>
					<div className="legal">
						<Link href="/cs">{t('Terms of Service')}</Link>
						<Link href="/cs">{t('Privacy Policy')}</Link>
					</div>
					<div className="f-pay">
						<span style={{ opacity: 0.7, fontSize: '.85rem' }}>{t('We Accept')}</span>
						<span className="badge">MC</span>
						<span className="badge">VISA</span>
						<span className="badge">PayPal</span>
						<span className="badge">Pay</span>
					</div>
				</div>
			</div>
			<button
				aria-label={t('Back to top') as string}
				className={showTop ? 'f-top show' : 'f-top'}
				onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
			>
				<svg viewBox="0 0 24 24">
					<path d="M12 19V5M5 12l7-7 7 7" />
				</svg>
			</button>
		</footer>
	);
};

export default GthFooter;
