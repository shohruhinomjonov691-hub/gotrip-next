import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, withRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import {
	Badge,
	Box,
	Button,
	Divider,
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
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import WbSunnyRoundedIcon from '@mui/icons-material/WbSunnyRounded';
import { Logout } from '@mui/icons-material';
import { CaretDown } from 'phosphor-react';
import { motion } from 'framer-motion';
import moment from 'moment';
import useDeviceDetect from '../hooks/useDeviceDetect';
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
	const { t } = useTranslation('common');
	const router = useRouter();
	const { mode, toggleMode } = useColorMode();
	const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
	const [lang, setLang] = useState<string>('en');
	const [colorChange, setColorChange] = useState(false);
	const [logoutAnchor, setLogoutAnchor] = useState<null | HTMLElement>(null);
	const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
	const [logoFailed, setLogoFailed] = useState(false);
	const drop = Boolean(anchorEl2);
	const logoutOpen = Boolean(logoutAnchor);
	const notificationsOpen = Boolean(notificationAnchor);
	const isDarkMode = mode === 'dark';
	const themeToggleLabel = isDarkMode ? 'Switch to light mode' : 'Switch to dark mode';

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
		const savedLocale = localStorage.getItem('locale') ?? router.locale ?? 'en';
		setLang(savedLocale);
		localStorage.setItem('locale', savedLocale);
	}, [router.locale]);

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const changeNavbarColor = () => setColorChange(window.scrollY >= 50);
		changeNavbarColor();
		window.addEventListener('scroll', changeNavbarColor, { passive: true });
		return () => window.removeEventListener('scroll', changeNavbarColor);
	}, []);

	const langChoice = useCallback(
		async (e: any) => {
			const nextLang = e.currentTarget.id;
			setLang(nextLang);
			localStorage.setItem('locale', nextLang);
			setAnchorEl2(null);
			await router.push(router.asPath, router.asPath, { locale: nextLang });
		},
		[router],
	);

	const handleNotificationClick = async (notification: Notification) => {
		if (notification.notificationStatus === NotificationStatus.WAIT) {
			await markNotificationRead({ variables: { notificationId: notification._id } });
			await refetchNotifications?.({ input: notificationInput });
		}
		if (notification.tourId) await router.push(`/tour/detail?id=${notification.tourId}`);
		else if (notification.articleId) await router.push(`/community/detail?articleCategory=FREE&id=${notification.articleId}`);
		else if (notification.bookingId || notification.paymentId) await router.push('/mypage?category=notifications');
	};

	const markAllHandler = async () => {
		await markAllNotificationsRead();
		await refetchNotifications?.({ input: notificationInput });
	};

	const navItems = [
		{ href: '/', label: t('Home'), active: router.pathname === '/' },
		{ href: '/tour', label: t('Tours') || 'Tours', active: router.pathname === '/tour' || router.pathname === '/property' },
		{
			href: '/destination',
			label: t('Destinations') || 'Destinations',
			active: router.pathname === '/destination' || router.pathname === '/destination/detail',
		},
		{ href: '/agent', label: t('Guides'), active: router.pathname === '/agent' || router.pathname === '/agent/detail' },
		{
			href: '/community?articleCategory=FREE',
			label: t('Community'),
			active: router.pathname.startsWith('/community'),
		},
		{ href: '/cs', label: t('CS'), active: router.pathname === '/cs' },
		...(user?._id
			? [
					{
						href: '/mypage',
						label: t('My Page'),
						active: router.pathname === '/mypage',
					},
			  ]
			: []),
	];

	if (device === 'mobile') {
		const mobileItems = [
			{ href: '/', label: t('Home'), icon: <HomeRoundedIcon />, active: router.pathname === '/' },
			{ href: '/tour', label: t('Tours') || 'Tours', icon: <SearchRoundedIcon />, active: router.pathname === '/tour' },
			{
				href: user?._id ? '/mypage?category=myBookings' : '/account/join?referrer=/mypage?category=myBookings',
				label: t('Bookings') || 'Bookings',
				icon: <ConfirmationNumberRoundedIcon />,
				active: router.asPath.includes('category=myBookings'),
			},
			{
				href: user?._id ? '/mypage?category=myProfile' : '/account/join?referrer=/mypage',
				label: t('Profile') || 'Profile',
				icon: <PersonRoundedIcon />,
				active: router.pathname === '/mypage' && !router.asPath.includes('category=myBookings'),
			},
		];

		return (
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
					<span>{isDarkMode ? 'Light' : 'Dark'}</span>
				</MotionButton>
			</Stack>
		);
	}

	return (
		<Stack className={'navbar'}>
			<Stack className={`navbar-main gotrip-nav ${colorChange ? 'transparent' : ''}`}>
				<Stack className={'container'}>
					<Box component={'div'} className={'logo-box'}>
						<Link href={'/'} className="brand-link" aria-label="GoTrip home">
							{logoFailed ? (
								<span className="brand-fallback">
									<span className="brand-mark" aria-hidden="true">
										G
									</span>
									<span>GoTrip</span>
								</span>
							) : (
								<img src="/img/logo/logoText.svg" alt="GoTrip" onError={() => setLogoFailed(true)} />
							)}
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
										<Typography>Notifications</Typography>
										<Button size="small" onClick={markAllHandler} disabled={!unreadCount}>
											Mark all read
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
										<Stack className="notification-empty">No notifications yet.</Stack>
									)}
									<Divider />
									<MenuItem onClick={() => router.push('/mypage?category=notifications')}>View notification center</MenuItem>
								</Menu>

								<MotionButton
									type="button"
									className={'login-user'}
									aria-label="Open account menu"
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
									<MenuItem onClick={() => logOut()}>
										<Logout fontSize="small" style={{ color: 'var(--gt-blue)', marginRight: '10px' }} />
										Logout
									</MenuItem>
								</Menu>
							</>
						) : (
							<Link href={'/account/join'}>
								<MotionDiv className={'join-box'} whileHover={{ scale: 1.025, y: -1 }} whileTap={tapPress}>
									<AccountCircleOutlinedIcon />
									<span>
										{t('Login')} / {t('Register')}
									</span>
								</MotionDiv>
							</Link>
						)}

						<div className={'lan-box'}>
							<Button
								disableRipple
								className="btn-lang"
								onClick={(event) => setAnchorEl2(event.currentTarget)}
								endIcon={<CaretDown size={14} color="#d6e3ff" weight="fill" />}
							>
								<Box component={'div'} className={'flag'}>
									{lang === 'uz' ? <span>UZ</span> : <img src={`/img/flag/lang${lang}.png`} alt={`${lang} language`} />}
								</Box>
							</Button>
							<StyledMenu anchorEl={anchorEl2} open={drop} onClose={() => setAnchorEl2(null)}>
								<MenuItem disableRipple onClick={langChoice} id="en">
									<img className="img-flag" src={'/img/flag/langen.png'} alt="English" />
									English
								</MenuItem>
								<MenuItem disableRipple onClick={langChoice} id="uz">
									<span className="img-flag text-flag">UZ</span>
									O'zbekcha
								</MenuItem>
								<MenuItem disableRipple onClick={langChoice} id="kr">
									<img className="img-flag" src={'/img/flag/langkr.png'} alt="Korean" />
									Korean
								</MenuItem>
								<MenuItem disableRipple onClick={langChoice} id="ru">
									<img className="img-flag" src={'/img/flag/langru.png'} alt="Russian" />
									Russian
								</MenuItem>
							</StyledMenu>
						</div>
					</Box>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default withRouter(Top);
