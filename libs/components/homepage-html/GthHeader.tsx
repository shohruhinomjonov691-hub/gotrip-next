import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '../../i18n/useTranslation';
import NotificationBell from './NotificationBell';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { getImageUrl } from '../../config';
import { PRIMARY_LINKS, SECONDARY_LINKS } from '../navigation/navConfig';
import { useLocaleSwitch, LOCALES } from '../navigation/LanguageMenu';
import { useNavNotifications } from '../navigation/useNavNotifications';
import { useColorMode } from '../../theme/ColorModeProvider';
import GoTripLogo from '../common/GoTripLogo';
import { useClickOutside } from '../../hooks/useClickOutside';

const NAV_ITEMS = [
	PRIMARY_LINKS[0], // Home
	PRIMARY_LINKS[1], // Tours
	SECONDARY_LINKS[0], // Guides
	PRIMARY_LINKS[2], // Community
	SECONDARY_LINKS[1], // Support
];

const GthHeader = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const { mode, toggleMode } = useColorMode();
	const { lang, changeLang } = useLocaleSwitch();
	const { unreadCount } = useNavNotifications();

	const [langOpen, setLangOpen] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	const langRef = useRef<HTMLDivElement>(null);
	const headerRef = useRef<HTMLElement>(null);

	useClickOutside(langRef, langOpen, () => setLangOpen(false));
	useClickOutside(headerRef, mobileOpen, () => setMobileOpen(false));

	const currentLocale = LOCALES.find((item) => item.id === lang) ?? LOCALES[0];
	const avatarSrc = getImageUrl(user?.memberImage);
	const isAuth = Boolean(user?._id);

	return (
		<header className="header" ref={headerRef}>
			<div className="wrap">
				<Link className="brand" href="/">
					<GoTripLogo idSuffix="gth" />
				</Link>

				<nav className="nav">
					{NAV_ITEMS.map((item, index) => {
						const active = item.isActive(router);
						return (
							<React.Fragment key={item.href}>
								<Link className={active ? 'on' : ''} href={item.href}>
									<span>{t(item.labelKey)}</span>
								</Link>
								{index < NAV_ITEMS.length - 1 && <span className="dot" />}
							</React.Fragment>
						);
					})}
				</nav>

				<div className="tools">
					<button
						type="button"
						className="theme-btn"
						aria-label={t('Toggle dark mode') as string}
						aria-pressed={mode === 'dark'}
						onClick={toggleMode}
					>
						<svg className="ti-sun" viewBox="0 0 24 24">
							<circle cx="12" cy="12" r="4.6" />
							<path d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" />
						</svg>
						<svg className="ti-moon" viewBox="0 0 24 24">
							<path d="M20.5 14.7A8.5 8.5 0 1110.3 3.6a6.7 6.7 0 0010.2 11.1z" />
						</svg>
					</button>

					<div className={`lang${langOpen ? ' open' : ''}`} ref={langRef}>
						<button
							type="button"
							className="lang-btn"
							aria-expanded={langOpen}
							aria-haspopup="true"
							onClick={() => setLangOpen((v) => !v)}
						>
							<span className="flag">{currentLocale.id === 'ko' ? '🇰🇷' : currentLocale.id === 'uz' ? '🇺🇿' : currentLocale.id === 'ru' ? '🇷🇺' : '🇬🇧'}</span>
							<span>{currentLocale.code}</span>
							<svg className="ca" viewBox="0 0 24 24">
								<path d="M6 9l6 6 6-6" />
							</svg>
						</button>
						<div className="lang-menu">
							{LOCALES.map((locale) => (
								<button
									key={locale.id}
									className={locale.id === lang ? 'lang-on' : ''}
									onClick={async () => {
										setLangOpen(false);
										await changeLang(locale.id);
									}}
								>
									<span className="flag">
										{locale.id === 'ko' ? '🇰🇷' : locale.id === 'uz' ? '🇺🇿' : locale.id === 'ru' ? '🇷🇺' : '🇬🇧'}
									</span>
									{locale.label}
									<svg className="chk" viewBox="0 0 24 24">
										<path d="M20 6L9 17l-5-5" />
									</svg>
								</button>
							))}
						</div>
					</div>

					{!isAuth ? (
						<div className="auth">
							<Link className="link-btn" href="/account/join">
								{t('Log in')}
							</Link>
							<Link className="btn btn-sky" href="/account/join">
								{t('Sign up')}
							</Link>
						</div>
					) : (
						<div className="account">
							<NotificationBell />
							<Link className="mypage" href="/mypage?category=myProfile">
								<img alt="" src={avatarSrc} />
								<span>
									<span>{t('My Page')}</span>
								</span>
							</Link>
						</div>
					)}

					<button
						aria-label={t('Menu') as string}
						className="burger"
						type="button"
						onClick={() => setMobileOpen((v) => !v)}
					>
						<svg fill="none" height="26" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24" width="26">
							<path d="M4 7h16M4 12h16M4 17h16" />
						</svg>
					</button>
				</div>
			</div>

			{mobileOpen && (
				<div className="mobile-nav-drawer">
					{NAV_ITEMS.map((item) => (
						<Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
							{t(item.labelKey)}
						</Link>
					))}
					{!isAuth ? (
						<div className="mobile-nav-auth">
							<Link href="/account/join">{t('Log in')}</Link>
							<Link href="/account/join">{t('Sign up')}</Link>
						</div>
					) : (
						<div className="mobile-nav-auth">
							<Link href="/mypage?category=myProfile">{t('My Page')}</Link>
						</div>
					)}
				</div>
			)}
		</header>
	);
};

export default GthHeader;
