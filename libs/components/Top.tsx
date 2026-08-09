import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, withRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import {
	Badge,
	Box,
	Button,
	Divider,
	Drawer,
	Menu,
	MenuItem,
	Stack,
	Typography,
	alpha,
	styled,
} from '@mui/material';
import { MenuProps } from '@mui/material/Menu';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ConfirmationNumberRoundedIcon from '@mui/icons-material/ConfirmationNumberRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import WbSunnyRoundedIcon from '@mui/icons-material/WbSunnyRounded';
import { Logout } from '@mui/icons-material';
import { CaretDown } from 'phosphor-react';
import { motion } from 'framer-motion';
import moment from 'moment';
import useDeviceDetect from '../hooks/useDeviceDetect';
import { useTranslation } from '../i18n/useTranslation';
import { LOCALES, useLocaleSwitch } from '../i18n/useLocaleSwitch';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { REACT_APP_API_URL } from '../config';
import { Direction } from '../enums/common.enum';
import { NotificationStatus } from '../enums/notification.enum';
import { Notification } from '../types/notification/notification';
import { T } from '../types/common';
import { userVar } from '../../apollo/store';
import { GET_MY_NOTIFICATIONS } from '../../apollo/user/query';
import { MARK_ALL_NOTIFICATIONS_READ, MARK_NOTIFICATION_READ } from '../../apollo/user/mutation';
import { hoverLift, tapPress } from './homepage/motion';
import { useColorMode } from '../theme/ColorModeProvider';

const MotionDiv = motion.div;
const MotionButton = motion.button;

const StyledMenu = styled((props: MenuProps) => (
	<Menu
		elevation={0}
		anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
		transformOrigin={{ vertical: 'top', horizontal: 'right' }}
		{...props}
	/>
))(({ theme }) => ({
	'& .MuiPaper-root': {
		marginTop: theme.spacing(1),
		borderRadius: 16,
		minWidth: 190,
		background: 'rgba(7, 17, 33, 0.96)',
		border: '1px solid rgba(255,255,255,0.12)',
		color: '#eaf1ff',
		boxShadow: '0 24px 80px rgba(0, 0, 0, 0.28)',
		backdropFilter: 'blur(20px)',
		'& .MuiMenuItem-root': {
			gap: 10,
			fontWeight: 700,
			'&:hover': {
				backgroundColor: alpha('#ffffff', 0.08),
			},
		},
	},
}));

const Top = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const { t } = useTranslation();
	const router = useRouter();
	const { mode, toggleMode } = useColorMode();
	const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
	const { lang, changeLang } = useLocaleSwitch();
	const [colorChange, setColorChange] = useState(false);
	const [logoutAnchor, setLogoutAnchor] = useState<null | HTMLElement>(null);
	const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
	const [moreOpen, setMoreOpen] = useState(false);
	const drop = Boolean(anchorEl2);
	const logoutOpen = Boolean(logoutAnchor);
	const notificationsOpen = Boolean(notificationAnchor);
	const isDarkMode = mode === 'dark';
	const themeToggleLabel = isDarkMode ? t('Switch to light mode') : t('Switch to dark mode');
	// LayoutHome (withLayoutMain) is used only by the home page, so `/` is the
	// "full-bleed hero behind the nav" signal → transparent nav; all other pages stay solid.
	const isHome = router.pathname === '/';

	const notificationInput = useMemo(
		() => ({
			page: 1,
			limit: 6,
			sort: 'createdAt',
			direction: Direction.DESC,
			search: {},
		}),
		[],
	);

	const [markNotificationRead] = useMutation(MARK_NOTIFICATION_READ);
	const [markAllNotificationsRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ);

	const { data: notificationsData, refetch: refetchNotifications } = useQuery(GET_MY_NOTIFICATIONS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: notificationInput },
		skip: !user?._id,
	});

	const notifications: Notification[] = notificationsData?.getMyNotifications?.list ?? [];
	const unreadCount = notifications.filter((item) => item.notificationStatus === NotificationStatus.WAIT).length;

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const changeNavbarColor = () => setColorChange(window.scrollY >= 70);
		changeNavbarColor();
		window.addEventListener('scroll', changeNavbarColor, { passive: true });
		return () => window.removeEventListener('scroll', changeNavbarColor);
	}, []);

	const langChoice = useCallback(
		async (e: any) => {
			const nextLang = e.currentTarget.id;
			setAnchorEl2(null);
			await changeLang(nextLang);
		},
		[changeLang],
	);

	const handleNotificationClick = async (notification: Notification) => {
		if (notification.notificationStatus === NotificationStatus.WAIT) {
			await markNotificationRead({ variables: { notificationId: notification._id } });
			await refetchNotifications?.({ input: notificationInput });
		}
		if (notification.tourId) await router.push(`/tour/detail?id=${notification.tourId}`);
		else if (notification.articleId) await router.push(`/community/detail?articleCategory=FREE&id=${notification.articleId}`);
	};

	const markAllHandler = async () => {
		await markAllNotificationsRead();
		await refetchNotifications?.({ input: notificationInput });
	};

	// Exactly five primary destinations at every width (DESIGN_SYSTEM2 §299). "My Page" is
	// account-scoped, so it lives in the account menu rather than competing here.
	const navItems = [
		{ href: '/', label: t('Home'), active: router.pathname === '/' },
		{ href: '/tour', label: t('Tours'), active: router.pathname === '/tour' },
		{ href: '/agent', label: t('Guides'), active: router.pathname === '/agent' || router.pathname === '/agent/detail' },
		{
			href: '/community',
			label: t('Community'),
			active: router.pathname.startsWith('/community'),
		},
		{ href: '/cs', label: t('Support'), active: router.pathname === '/cs' },
	];

	if (device === 'mobile') {
		const mobileItems = [
			{ href: '/', label: t('Home'), icon: <HomeRoundedIcon />, active: router.pathname === '/' },
			{ href: '/tour', label: t('Tours'), icon: <SearchRoundedIcon />, active: router.pathname === '/tour' },
			{
				href: user?._id ? '/mypage?category=savedTours' : '/account/join?referrer=/mypage?category=savedTours',
				label: t('Saved'),
				icon: <ConfirmationNumberRoundedIcon />,
				active: router.asPath.includes('category=savedTours'),
			},
			{
				href: user?._id ? '/mypage?category=myProfile' : '/account/join?referrer=/mypage',
				label: t('Profile'),
				icon: <PersonRoundedIcon />,
				active: router.pathname === '/mypage' && !router.asPath.includes('category=savedTours'),
			},
		];

		// Destinations that did not make the five-item bottom bar; the sheet holds these, not everything.
		const secondaryItems = [
			{ href: '/agent', label: t('Guides') },
			{ href: '/community', label: t('Community') },
			{ href: '/cs', label: t('Support') },
			{ href: '/about', label: t('About GoTrip') },
		];

		return (
			<>
				{/* Persistent top bar at every width (DESIGN_SYSTEM2 §299) — mobile previously had none. */}
				<Stack className={'mobile-top-bar'}>
					<Link href={'/'} className="brand-link" aria-label={t('GoTrip home') as string}>
						<span className="brand-mark" aria-hidden="true">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
								<path d="M3.5 14.5l17-9-4 18-4.5-6.5L3.5 14.5z" fill="currentColor" />
							</svg>
						</span>
						<span className="brand-word">
							Go<b>Trip</b>
						</span>
					</Link>
					<Stack className="mobile-top-actions">
						<Link href={'/tour'} className="mobile-cta">
							{t('Explore tours')}
						</Link>
						<MotionButton
							type="button"
							className="mobile-more-btn"
							aria-label={t('More options') as string}
							aria-haspopup="dialog"
							aria-expanded={moreOpen}
							whileTap={tapPress}
							onClick={() => setMoreOpen(true)}
						>
							<MoreHorizRoundedIcon />
						</MotionButton>
					</Stack>
				</Stack>

				<Stack className={'mobile-bottom-nav'}>
					{mobileItems.map((item) => (
						<Link href={item.href} key={item.href}>
							<MotionDiv className={item.active ? 'active' : ''} whileTap={tapPress}>
								{item.icon}
								<span>{item.label}</span>
							</MotionDiv>
						</Link>
					))}
					<MotionButton
						type="button"
						className={`mobile-theme-toggle ${isDarkMode ? 'active' : ''}`}
						aria-label={themeToggleLabel}
						aria-pressed={isDarkMode}
						whileTap={tapPress}
						onClick={toggleMode}
					>
						{isDarkMode ? <WbSunnyRoundedIcon /> : <DarkModeRoundedIcon />}
						<span>{isDarkMode ? t('Light') : t('Dark')}</span>
					</MotionButton>
				</Stack>

				{/* A structured sheet for secondary destinations only — never a junk drawer (§299). */}
				<Drawer anchor="bottom" open={moreOpen} onClose={() => setMoreOpen(false)} className="mobile-more-sheet">
					<Stack className="sheet-body">
						<span className="sheet-title">{t('More')}</span>
						{secondaryItems.map((item) => (
							<Link href={item.href} key={item.href} onClick={() => setMoreOpen(false)}>
								{item.label}
							</Link>
						))}
						<Divider />
						<span className="sheet-title">{t('Language')}</span>
						<Stack className="sheet-langs">
							{/* id is the real next-i18next routing locale; label is the badge text —
								kept as 'KR' for Korean regardless of the routing id so this button's
								text never changes. */}
							{[
								{ id: 'en', label: 'EN' },
								{ id: 'uz', label: 'UZ' },
								{ id: 'ko', label: 'KR' },
								{ id: 'ru', label: 'RU' },
							].map((item) => (
								<button
									key={item.id}
									type="button"
									className={lang === item.id ? 'active' : ''}
									onClick={() => {
										setMoreOpen(false);
										changeLang(item.id);
									}}
								>
									{item.label}
								</button>
							))}
						</Stack>
					</Stack>
				</Drawer>
			</>
		);
	}

	return (
		<Stack className={'navbar'}>
			<Stack className={`navbar-main gotrip-nav ${isHome ? 'nav-over-hero' : 'nav-solid'}${colorChange ? ' nav-scrolled' : ''}`}>
				<Stack className={'container'}>
					<Box component={'div'} className={'logo-box'}>
						<Link href={'/'} className="brand-link" aria-label={t('GoTrip home') as string}>
							<span className="brand-mark" aria-hidden="true">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
									<path d="M3.5 14.5l17-9-4 18-4.5-6.5L3.5 14.5z" fill="currentColor" />
								</svg>
							</span>
							<span className="brand-word">
								Go<b>Trip</b>
							</span>
						</Link>
					</Box>

					<Box component={'nav'} className={'router-box'}>
						{navItems.map((item) => (
							<Link href={item.href} key={item.href}>
								<MotionDiv className={item.active ? 'active' : ''} whileHover={hoverLift} whileTap={tapPress}>
									{item.label}
								</MotionDiv>
							</Link>
						))}
					</Box>

					<Box component={'div'} className={'user-box'}>
						<MotionButton
							type="button"
							className={'theme-toggle'}
							aria-label={themeToggleLabel}
							aria-pressed={isDarkMode}
							whileHover={{ scale: 1.05 }}
							whileTap={tapPress}
							onClick={toggleMode}
						>
							{isDarkMode ? <WbSunnyRoundedIcon /> : <DarkModeRoundedIcon />}
						</MotionButton>
						{user?._id ? (
							<>
								<MotionButton
									type="button"
									className={'notification-pill'}
									aria-label={unreadCount ? `Open notifications, ${unreadCount} unread` : 'Open notifications'}
									aria-haspopup="menu"
									aria-expanded={notificationsOpen}
									aria-controls={notificationsOpen ? 'notification-menu' : undefined}
									whileHover={{ scale: 1.05 }}
									whileTap={tapPress}
									onClick={(event: any) => setNotificationAnchor(event.currentTarget)}
								>
									<Badge badgeContent={unreadCount} color="error" max={9}>
										<NotificationsOutlinedIcon className={'notification-icon'} />
									</Badge>
								</MotionButton>
								<Menu
									id="notification-menu"
									anchorEl={notificationAnchor}
									open={notificationsOpen}
									onClose={() => setNotificationAnchor(null)}
									className="notification-menu"
								>
									<Stack className="notification-head">
										<Typography>{t('Notifications')}</Typography>
										<Button size="small" onClick={markAllHandler} disabled={!unreadCount}>
											{t('Mark all read')}
										</Button>
									</Stack>
									<Divider />
									{notifications.length ? (
										notifications.map((notification) => (
											<MenuItem
												key={notification._id}
												className={notification.notificationStatus === NotificationStatus.WAIT ? 'unread' : ''}
												onClick={() => handleNotificationClick(notification)}
											>
												<Stack>
													<Typography className="notification-title">{notification.notificationTitle}</Typography>
													<Typography className="notification-desc">
														{notification.notificationDesc || notification.notificationType}
													</Typography>
													<Typography className="notification-time">{moment(notification.createdAt).fromNow()}</Typography>
												</Stack>
											</MenuItem>
										))
									) : (
										<Stack className="notification-empty">{t('No notifications yet')}</Stack>
									)}
									<Divider />
									<MenuItem onClick={() => router.push('/mypage?category=notifications')}>{t('View notification center')}</MenuItem>
								</Menu>

								<MotionButton
									type="button"
									className={'login-user'}
									aria-label={t('Open account menu') as string}
									aria-haspopup="menu"
									aria-expanded={logoutOpen}
									aria-controls={logoutOpen ? 'account-menu' : undefined}
									onClick={(event: any) => setLogoutAnchor(event.currentTarget)}
									whileHover={{ scale: 1.04 }}
									whileTap={tapPress}
								>
									<img src={user?.memberImage ? `${REACT_APP_API_URL}/${user?.memberImage}` : '/img/profile/defaultUser.svg'} alt="" />
								</MotionButton>
								<Menu id="account-menu" anchorEl={logoutAnchor} open={logoutOpen} onClose={() => setLogoutAnchor(null)} sx={{ mt: '5px' }}>
									<MenuItem
										onClick={() => {
											setLogoutAnchor(null);
											router.push('/mypage');
										}}
									>
										<PersonRoundedIcon fontSize="small" style={{ color: 'var(--gt-blue)', marginRight: '10px' }} />
										{t('My Page')}
									</MenuItem>
									<MenuItem onClick={() => logOut()}>
										<Logout fontSize="small" style={{ color: 'var(--gt-blue)', marginRight: '10px' }} />
										{t('Logout')}
									</MenuItem>
								</Menu>
							</>
						) : (
							<Link href={'/account/join'} className="nav-signin">
								<MotionDiv className={'signin-box'} whileTap={tapPress}>
									<AccountCircleOutlinedIcon />
									<span>{t('Login')}</span>
								</MotionDiv>
							</Link>
						)}

						{/* The one primary action in the chrome (§1.8) — discovery is what the site is for. */}
						<Link href={'/tour'}>
							<MotionDiv className={'join-box'} whileHover={{ y: -3 }} whileTap={tapPress}>
								<span>{t('Explore tours')}</span>
							</MotionDiv>
						</Link>

						<div className={'lan-box'}>
							<Button
								disableRipple
								className="btn-lang"
								onClick={(event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl2(event.currentTarget)}
								endIcon={<CaretDown size={14} color="#d6e3ff" weight="fill" />}
							>
								<Box component={'div'} className={'flag'}>
									{lang === 'uz' ? (
										<span className="text-flag">UZ</span>
									) : (
										// The Korean flag asset on disk is still named langkr.png — only the
										// routing locale id changed to 'ko', not this filename.
										<img src={`/img/flag/lang${lang === 'ko' ? 'kr' : lang}.png`} alt={`${lang} language`} />
									)}
								</Box>
							</Button>
							<StyledMenu anchorEl={anchorEl2} open={drop} onClose={() => setAnchorEl2(null)}>
								{LOCALES.map((locale) => (
									<MenuItem disableRipple onClick={langChoice} id={locale.id} key={locale.id}>
										{locale.id === 'uz' ? (
											<span className="img-flag text-flag">UZ</span>
										) : (
											<img
												className="img-flag"
												src={`/img/flag/lang${locale.id === 'ko' ? 'kr' : locale.id}.png`}
												alt={locale.label}
											/>
										)}
										{locale.label}
									</MenuItem>
								))}
							</StyledMenu>
						</div>
					</Box>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default withRouter(Top);
