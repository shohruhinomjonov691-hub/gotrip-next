import React from 'react';
import Link from 'next/link';
import { useTranslation } from '../../i18n/useTranslation';

/** Brand mark + wordmark. One accent, no gradients (DESIGN_SYSTEM2 §14.1–14.2). */
const NavBrand = () => {
	const { t } = useTranslation();
	return (
		<Link href="/" className="gt-nav__brand" aria-label={t('GoTrip home') as string}>
			<span className="gt-nav__brand-mark" aria-hidden="true">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
					<path d="M3.5 14.5l17-9-4 18-4.5-6.5L3.5 14.5z" fill="currentColor" />
				</svg>
			</span>
			<span className="gt-nav__brand-word">
				Go<b>Trip</b>
			</span>
		</Link>
	);
};

export default NavBrand;
