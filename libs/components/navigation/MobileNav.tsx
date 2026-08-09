import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useReactiveVar } from '@apollo/client';
import { Badge, Drawer } from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import WbSunnyRoundedIcon from '@mui/icons-material/WbSunnyRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { userVar } from '../../../apollo/store';
import { logOut } from '../../auth';
import { REACT_APP_API_URL } from '../../config';
import { MemberType } from '../../enums/member.enum';
import { useColorMode } from '../../theme/ColorModeProvider';
import { useNavNotifications } from './useNavNotifications';
import { LOCALES, useLocaleSwitch } from './LanguageMenu';
import MobileSearchOverlay from './MobileSearchOverlay';
import NavBrand from './NavBrand';

interface DrawerRow {
	labelKey: string;
	href: string;
	icon: React.ReactNode;
	isActive?: boolean;
}

/**
 * Mobile navigation: a calm top bar (brand · search · bell · menu) and a
 * right slide-in drawer with profile header, grouped destinations,
 * preferences (theme + language), and a danger logout row.
 * MUI Drawer supplies focus trap, escape, scrim, and scroll lock.
 */
const MobileNav = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const { mode, toggleMode } = useColorMode();
	const { unreadCount } = useNavNotifications();
	const { lang, changeLang } = useLocaleSwitch();
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [searchOpen, setSearchOpen] = useState(false);
	const isDark = mode === 'dark';

	/* Route change always closes floating surfaces */
	useEffect(() => {
		const close = () => {
			setDrawerOpen(false);
			setSearchOpen(false);
		};
		router.events.on('routeChangeStart', close);
		return () => router.events.off('routeChangeStart', close);
	}, [router.events]);

	const exploreRows: DrawerRow[] = [
		{ labelKey: 'Home', href: '/', icon: <HomeRoundedIcon />, isActive: router.pathname === '/' },
		{ labelKey: 'Tours', href: '/tour', icon: <MapRoundedIcon />, isActive: router.pathname.startsWith('/tour') },
		{
			labelKey: 'Community',
			href: '/community',
			icon: <ForumRoundedIcon />,
			isActive: router.pathname.startsWith('/community'),
		},
		{ labelKey: 'Guides', href: '/agent', icon: <GroupsRoundedIcon />, isActive: router.pathname.startsWith('/agent') },
		{ labelKey: 'About', href: '/about', icon: <InfoOutlinedIcon />, isActive: router.pathname === '/about' },
		{ labelKey: 'Support', href: '/cs', icon: <HelpOutlineRoundedIcon />, isActive: router.pathname === '/cs' },
	];

	const travelRows: DrawerRow[] = user?._id
		? [
				{ labelKey: 'Profile', href: '/mypage?category=myProfile', icon: <PersonOutlineRoundedIcon /> },
				{ labelKey: 'Saved tours', href: '/mypage?category=savedTours', icon: <BookmarkBorderRoundedIcon /> },
				{
					labelKey: 'Notifications',
					href: '/mypage?category=notifications',
					icon: <NotificationsOutlinedIcon />,
				},
		  ]
		: [];

	const avatarSrc = user?.memberImage ? `${REACT_APP_API_URL}/${user?.memberImage}` : '/img/profile/defaultUser.svg';
	const roleLabel =
		user?.memberType === MemberType.ADMIN ? 'Admin' : user?.memberType === MemberType.AGENT ? 'Guide' : 'Traveler';

	return (
		<>
			<header className="gt-mnav">
				<NavBrand />
				<div className="gt-mnav__actions">
					<button
						type="button"
						className="gt-nav__icon-btn"
						aria-label={t('Search tours') || 'Search tours'}
						onClick={() => setSearchOpen(true)}
					>
						<SearchRoundedIcon />
					</button>
					{user?._id && (
						<Link
							href="/mypage?category=notifications"
							className="gt-nav__icon-btn"
							aria-label={
								unreadCount
									? `${t('Notifications') || 'Notifications'}, ${unreadCount} unread`
									: t('Notifications') || 'Notifications'
							}
						>
							<Badge badgeContent={unreadCount} max={9} className="gt-nav__badge" overlap="circular">
								<NotificationsOutlinedIcon />
							</Badge>
						</Link>
					)}
					<button
						type="button"
						className="gt-nav__icon-btn"
						aria-label={t('Open menu') || 'Open menu'}
						aria-haspopup="dialog"
						aria-expanded={drawerOpen}
						onClick={() => setDrawerOpen(true)}
					>
						<MenuRoundedIcon />
					</button>
				</div>
			</header>

			<MobileSearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

			<Drawer
				anchor="right"
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				className="gt-drawer-root"
				PaperProps={{ className: 'gt-mnav__drawer' }}
				transitionDuration={320}
			>
				<div className="gt-mnav__drawer-head">
					{user?._id ? (
						<Link href="/mypage?category=myProfile" className="gt-mnav__profile">
							<img src={avatarSrc} alt="" />
							<span className="gt-mnav__profile-meta">
								<strong>{user?.memberNick || 'Member'}</strong>
								<span
									className={`gt-badge ${
										user?.memberType === MemberType.AGENT
											? 'gt-badge--earned'
											: user?.memberType === MemberType.ADMIN
											? 'gt-badge--accent'
											: 'gt-badge--info'
									}`}
								>
									{t(roleLabel) || roleLabel}
								</span>
							</span>
							<ChevronRightRoundedIcon aria-hidden="true" />
						</Link>
					) : (
						<Link href="/account/join" className="gt-btn gt-btn--primary gt-mnav__signin">
							{t('Sign in') || 'Sign in'} / {t('Register') || 'Register'}
						</Link>
					)}
					<button
						type="button"
						className="gt-nav__icon-btn gt-mnav__close"
						aria-label={t('Close menu') || 'Close menu'}
						onClick={() => setDrawerOpen(false)}
					>
						<CloseRoundedIcon />
					</button>
				</div>

				<nav className="gt-mnav__section" aria-label={t('Explore') || 'Explore'}>
					<p className="gt-label">{t('Explore') || 'Explore'}</p>
					{exploreRows.map((row) => (
						<Link
							href={row.href}
							key={row.href}
							className={`gt-mnav__row${row.isActive ? ' is-active' : ''}`}
							aria-current={row.isActive ? 'page' : undefined}
						>
							{row.icon}
							<span>{t(row.labelKey) || row.labelKey}</span>
						</Link>
					))}
				</nav>

				{travelRows.length > 0 && (
					<nav className="gt-mnav__section" aria-label={t('My travel') || 'My travel'}>
						<p className="gt-label">{t('My travel') || 'My travel'}</p>
						{travelRows.map((row) => (
							<Link href={row.href} key={row.href} className="gt-mnav__row">
								{row.icon}
								<span>{t(row.labelKey) || row.labelKey}</span>
							</Link>
						))}
					</nav>
				)}

				<div className="gt-mnav__section">
					<p className="gt-label">{t('Preferences') || 'Preferences'}</p>
					<button
						type="button"
						className="gt-mnav__row"
						aria-pressed={isDark}
						onClick={toggleMode}
					>
						{isDark ? <WbSunnyRoundedIcon /> : <DarkModeRoundedIcon />}
						<span>{isDark ? t('Light mode') || 'Light mode' : t('Dark mode') || 'Dark mode'}</span>
						<span className={`gt-mnav__switch${isDark ? ' is-on' : ''}`} aria-hidden="true" />
					</button>
					<div className="gt-mnav__locales" role="group" aria-label={t('Language') || 'Language'}>
						{LOCALES.map((locale) => (
							<button
								key={locale.id}
								type="button"
								className={`gt-chip${locale.id === lang ? ' is-selected' : ''}`}
								aria-pressed={locale.id === lang}
								onClick={() => changeLang(locale.id)}
							>
								{locale.code}
							</button>
						))}
					</div>
				</div>

				{user?._id && (
					<div className="gt-mnav__section gt-mnav__section--danger">
						<button type="button" className="gt-mnav__row gt-mnav__row--danger" onClick={() => logOut()}>
							<LogoutRoundedIcon />
							<span>{t('Logout') || 'Logout'}</span>
						</button>
					</div>
				)}
			</Drawer>
		</>
	);
};

export default MobileNav;
