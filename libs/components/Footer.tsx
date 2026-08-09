import Link from 'next/link';
import { Stack, Box } from '@mui/material';
import moment from 'moment';
import { ReactNode, useState } from 'react';
import { useTranslation } from '../i18n/useTranslation';

const FooterLink = ({ href, children }: { href: string; children: ReactNode }) => (
	<Link className="footer-link" href={href}>
		{children}
	</Link>
);

const FooterBrand = () => {
	const { t } = useTranslation();
	const [logoFailed, setLogoFailed] = useState(false);

	return (
		<Link href="/" className="footer-brand-link" aria-label={t('GoTrip home') as string}>
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

/**
 * Four columns, every link real. The brief asked for a separate "Contact" column, but the
 * only contact surface that exists is the support inquiry form — so contact lives under
 * Support rather than padding a column with placeholder details.
 */
const FooterNavigation = () => {
	const { t } = useTranslation();

	return (
		<Box component={'div'} className={'bottom'}>
			<div className="footer-column">
				<strong>{t('Explore')}</strong>
				<FooterLink href="/tour">{t('Tours')}</FooterLink>
				<FooterLink href="/agent">{t('Guides')}</FooterLink>
				<FooterLink href="/community">{t('Community')}</FooterLink>
			</div>
			<div className="footer-column">
				<strong>{t('Company')}</strong>
				<FooterLink href="/about">{t('About GoTrip')}</FooterLink>
				<FooterLink href="/account/join">{t('Become a guide')}</FooterLink>
				<FooterLink href="/cs?tab=terms">{t('Terms')}</FooterLink>
			</div>
			<div className="footer-column">
				<strong>{t('Support')}</strong>
				<FooterLink href="/cs?tab=faq">{t('FAQ')}</FooterLink>
				<FooterLink href="/cs?tab=inquiry">{t('Contact us')}</FooterLink>
				<FooterLink href="/cs?tab=notice">{t('Notices')}</FooterLink>
			</div>
			<div className="footer-column">
				<strong>{t('Top destinations')}</strong>
				<FooterLink href="/tour?location=SEOUL">{t('Seoul')}</FooterLink>
				<FooterLink href="/tour?location=BUSAN">{t('Busan')}</FooterLink>
				<FooterLink href="/tour?location=JEJU">{t('Jeju')}</FooterLink>
				<FooterLink href="/tour?location=PARIS">{t('Paris')}</FooterLink>
				<FooterLink href="/tour?location=DUBAI">{t('Dubai')}</FooterLink>
				<FooterLink href="/tour?location=SAMARKAND">{t('Samarkand')}</FooterLink>
			</div>
		</Box>
	);
};

const Footer = () => {
	const { t } = useTranslation();

	return (
		<Stack className={'footer-container'}>
			<Stack className={'main'}>
				<Stack className={'left'}>
					<Box component={'div'} className={'footer-box footer-brand-box'}>
						<FooterBrand />
						<p className="footer-brand-copy">
							{t('Live tours from trusted local guides — browse, ask, and travel with people who know the place.')}
						</p>
					</Box>
				</Stack>
				<Stack className={'right'}>
					<FooterNavigation />
				</Stack>
			</Stack>
			<Stack className={'second'}>
				<span>{t('© {{year}} GoTrip. All rights reserved.', { year: moment().year() })}</span>
				<span>
					<FooterLink href="/cs?tab=terms">{t('Terms')}</FooterLink> ·{' '}
					<FooterLink href="/cs?tab=notice">{t('Notices')}</FooterLink>
				</span>
			</Stack>
		</Stack>
	);
};

export default Footer;
