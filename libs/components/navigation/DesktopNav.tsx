import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { PRIMARY_LINKS } from './navConfig';
import NavBrand from './NavBrand';
import NavSearch from './NavSearch';
import ThemeToggle from './ThemeToggle';
import LanguageMenu from './LanguageMenu';
import NotificationsMenu from './NotificationsMenu';
import ProfileMenu from './ProfileMenu';

/**
 * Desktop navigation. Two visual registers:
 *  - overlay (home, unscrolled): transparent over the hero — the single
 *    sanctioned glass/translucency location (DESIGN_SYSTEM2 §8.5)
 *  - solid: quiet glass surface with a hairline, both themes
 */
const DesktopNav = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [scrolled, setScrolled] = useState(false);
	const isHome = router.pathname === '/';

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const onScroll = () => setScrolled(window.scrollY >= 24);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	const overlay = isHome && !scrolled;

	return (
		<header className={`gt-nav${overlay ? ' gt-nav--overlay' : ' gt-nav--solid'}${scrolled ? ' gt-nav--scrolled' : ''}`}>
			<div className="gt-nav__inner">
				<NavBrand />

				<nav className="gt-nav__links" aria-label={t('Primary') as string}>
					{PRIMARY_LINKS.map((link) => {
						const active = link.isActive(router);
						return (
							<Link
								href={link.href}
								key={link.href}
								className={`gt-nav__link${active ? ' is-active' : ''}`}
								aria-current={active ? 'page' : undefined}
							>
								{t(link.labelKey) || link.labelKey}
							</Link>
						);
					})}
				</nav>

				<div className="gt-nav__utils">
					<NavSearch />
					<ThemeToggle />
					<LanguageMenu />
					{user?._id ? (
						<>
							<NotificationsMenu />
							<ProfileMenu />
						</>
					) : (
						<Link href="/account/join" className="gt-nav__cta">
							{t('Sign in') || 'Sign in'}
						</Link>
					)}
				</div>
			</div>
		</header>
	);
};

export default DesktopNav;
