import { NextRouter } from 'next/router';

export interface NavLinkItem {
	href: string;
	/** i18n key looked up in common.json (falls back to the key itself) */
	labelKey: string;
	isActive: (router: NextRouter) => boolean;
}

/**
 * Primary destinations — the only items allowed in the center rail
 * (UX_ARCHITECTURE §1.2: ≤5, place-stable). Everything else lives in menus.
 */
export const PRIMARY_LINKS: NavLinkItem[] = [
	{ href: '/', labelKey: 'Home', isActive: (r) => r.pathname === '/' },
	{ href: '/tour', labelKey: 'Tours', isActive: (r) => r.pathname.startsWith('/tour') },
	{ href: '/community', labelKey: 'Community', isActive: (r) => r.pathname.startsWith('/community') },
	{ href: '/about', labelKey: 'About', isActive: (r) => r.pathname === '/about' },
];

/** Secondary destinations — reachable from menus, drawer, and search overlay. */
export const SECONDARY_LINKS: NavLinkItem[] = [
	{ href: '/agent', labelKey: 'Guides', isActive: (r) => r.pathname.startsWith('/agent') },
	{ href: '/cs', labelKey: 'Support', isActive: (r) => r.pathname === '/cs' },
];

/** Search contract: /tour already parses ?text= into ToursInquiry.search.text. */
export const searchHref = (text: string) => `/tour?text=${encodeURIComponent(text.trim())}`;
