import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import TwitterIcon from '@mui/icons-material/Twitter';
import Link from 'next/link';
import { Stack, Box } from '@mui/material';
import moment from 'moment';
import { ReactNode, useState } from 'react';

const FooterLink = ({ href, children }: { href?: string; children: ReactNode }) =>
	href ? (
		<Link className="footer-link" href={href}>
			{children}
		</Link>
	) : (
		<span className="footer-unavailable" aria-disabled="true">
			{children}
		</span>
	);

const FooterBrand = () => {
	const [logoFailed, setLogoFailed] = useState(false);

	return (
		<Link href="/" className="footer-brand-link" aria-label="GoTrip home">
			{logoFailed ? (
				<span className="footer-brand-fallback">
					<span className="footer-brand-mark" aria-hidden="true">
						G
					</span>
					<span>GoTrip</span>
				</span>
			) : (
				<img src="/img/logo/logoWhite.svg" alt="GoTrip" className={'logo'} onError={() => setLogoFailed(true)} />
			)}
		</Link>
	);
};

const FooterNavigation = () => (
	<Box component={'div'} className={'bottom'}>
		<div className="footer-column">
			<strong>Company</strong>
			<FooterLink href="/about">About GoTrip</FooterLink>
			<FooterLink href="/tour">Explore tours</FooterLink>
			<FooterLink href="/destination">Destinations</FooterLink>
			<FooterLink href="/community?articleCategory=FREE">Journal</FooterLink>
		</div>
		<div className="footer-column">
			<strong>Support</strong>
			<FooterLink href="/cs?tab=inquiry">Contact</FooterLink>
			<FooterLink href="/cs?tab=faq">FAQ</FooterLink>
			<FooterLink href="/cs?tab=terms">Terms</FooterLink>
			<FooterLink href="/cs?tab=notice">Notices</FooterLink>
		</div>
		<div className="footer-column footer-column--global">
			<strong>Global</strong>
			<span>Traveler support</span>
			<p>+82 10 4867 2909</p>
			<span>Concierge regions</span>
			<FooterLink>Seoul</FooterLink>
			<FooterLink>Busan</FooterLink>
			<FooterLink>Jeju</FooterLink>
		</div>
	</Box>
);

const FooterSocial = () => (
	<div className={'media-box'} aria-hidden="true">
		<FacebookOutlinedIcon />
		<TelegramIcon />
		<InstagramIcon />
		<TwitterIcon />
	</div>
);

const Footer = () => {
	return (
		<Stack className={'footer-container'}>
			<Stack className={'main'}>
				<Stack className={'left'}>
					<Box component={'div'} className={'footer-box footer-brand-box'}>
						<FooterBrand />
						<p className="footer-brand-copy">
							Redefining luxury travel through curated tours, personal guide support, and destination-led discovery.
						</p>
						<FooterSocial />
					</Box>
				</Stack>
				<Stack className={'right'}>
					<FooterNavigation />
				</Stack>
			</Stack>
			<Stack className={'second'}>
				<span>© {moment().year()} GoTrip Luxury Travel Concierge.</span>
				<span>
					<FooterLink href="/cs?tab=terms">Terms</FooterLink> · <FooterLink>Privacy</FooterLink> · <FooterLink>Sitemap</FooterLink>
				</span>
			</Stack>
		</Stack>
	);
};

export default Footer;
