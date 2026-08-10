import type { ComponentType } from 'react';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminMenuList from '../admin/AdminMenuList';
import {
	AppBar,
	Avatar,
	Box,
	Divider,
	Drawer,
	IconButton,
	Menu,
	MenuItem,
	Stack,
	Toolbar,
	Tooltip,
	Typography,
	useMediaQuery,
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import WbSunnyRoundedIcon from '@mui/icons-material/WbSunnyRounded';
import { getJwtToken, logOut, updateUserInfo } from '../../auth';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { getImageUrl } from '../../config';
import { MemberType } from '../../enums/member.enum';
import { useColorMode } from '../../theme/ColorModeProvider';
import GoTripLogo from '../common/GoTripLogo';
import { useTranslation } from '../../i18n/useTranslation';

const drawerWidth = 280;

const withAdminLayout = (Component: ComponentType) => {
	return (props: object) => {
		const { t } = useTranslation();
		const router = useRouter();
		const user = useReactiveVar(userVar);
		const { mode, toggleMode } = useColorMode();
		const compactLayout = useMediaQuery('(max-width: 959px)', { noSsr: true });
		const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
		const [navOpen, setNavOpen] = useState(false);
		const [loading, setLoading] = useState(true);

		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
			setLoading(false);
		}, []);

		useEffect(() => {
			if (!loading && user.memberType !== MemberType.ADMIN) router.push('/').then();
		}, [loading, user, router]);

		useEffect(() => {
			if (!compactLayout) setNavOpen(false);
		}, [compactLayout]);

		useEffect(() => {
			setNavOpen(false);
		}, [router.pathname]);

		const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorElUser(event.currentTarget);
		const handleCloseUserMenu = () => setAnchorElUser(null);
		const isDarkMode = mode === 'dark';
		const themeToggleLabel = isDarkMode ? t('Switch to light mode') : t('Switch to dark mode');
		const logoutHandler = () => {
			logOut();
			router.push('/').then();
		};
		/* The only way in is My Page's own admin-only "Admin panel" link
		   (libs/components/mypage/MyMenu.tsx), which opens this in a new tab —
		   so once here there was no way back except closing the tab. Mirrors
		   that My Page link's own destination/query shape. */
		const goToMyPageHandler = () => {
			handleCloseUserMenu();
			router.push('/mypage?category=myProfile').then();
		};

		if (!user || user?.memberType !== MemberType.ADMIN) return null;

			const drawerContent: React.ReactElement = (
				<aside className="admin-navigation" aria-label={t('Platform control navigation') as string}>
					<Toolbar className="admin-navigation__brand">
						{/* Was `/img/logo/logoText.svg`, whose wordmark is fill="#FFFFFF" — invisible
						    on this light sidebar — and which carries a coral (#EB6753) that is not a
						    GoTrip colour. This is the same component the public header renders. */}
						<GoTripLogo idSuffix="adm" />
						{compactLayout && (
							<IconButton aria-label={t('Close navigation') as string} onClick={() => setNavOpen(false)} className="admin-navigation__close">
								<CloseRoundedIcon />
						</IconButton>
					)}
				</Toolbar>
				<Stack className="admin-navigation__operator" direction="row" alignItems="center" spacing={1.5}>
					<Avatar
						src={getImageUrl(user.memberImage)}
						alt={user.memberNick}
						/>
						<div>
							<Typography component="strong">{user.memberNick}</Typography>
							<Typography component="span">{t('Platform administrator')}</Typography>
						</div>
					</Stack>
					<Divider />
					<nav className="admin-navigation__menu">
						<AdminMenuList onNavigate={() => setNavOpen(false)} />
					</nav>
				</aside>
			);

		return (
			<main id="pc-wrap" className="admin">
				<AppBar
					position="fixed"
					className="admin-appbar"
					sx={{ width: compactLayout ? '100%' : `calc(100% - ${drawerWidth}px)`, ml: compactLayout ? 0 : `${drawerWidth}px` }}
				>
					<Toolbar className="admin-toolbar">
						{compactLayout && (
							<IconButton aria-label={t('Open navigation') as string} onClick={() => setNavOpen(true)} className="admin-toolbar__menu">
								<MenuRoundedIcon />
							</IconButton>
						)}
							<div className="admin-toolbar__context">
								<Typography component="span">GoTrip</Typography>
								<Typography component="strong">{t('Platform Control')}</Typography>
							</div>
							<div className="admin-toolbar__spacer" />
						<Tooltip title={themeToggleLabel}>
							<IconButton
								onClick={toggleMode}
								aria-label={themeToggleLabel}
								aria-pressed={isDarkMode}
								className="admin-toolbar__theme"
							>
								{isDarkMode ? <WbSunnyRoundedIcon /> : <DarkModeRoundedIcon />}
							</IconButton>
						</Tooltip>
						<Tooltip title={t('Account menu')}>
							<IconButton onClick={handleOpenUserMenu} aria-label={t('Open account menu') as string} className="admin-toolbar__avatar">
								<Avatar
									src={getImageUrl(user.memberImage)}
									alt={user.memberNick}
								/>
							</IconButton>
						</Tooltip>
						<Menu
							id="admin-account-menu"
							className="admin-account-menu"
							anchorEl={anchorElUser}
							anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
							transformOrigin={{ vertical: 'top', horizontal: 'right' }}
							open={Boolean(anchorElUser)}
							onClose={handleCloseUserMenu}
						>
								<div className="admin-account-menu__identity">
									<Typography component="strong">{user.memberNick}</Typography>
									<Typography component="span">{user.memberPhone}</Typography>
								</div>
							<Divider />
							<MenuItem onClick={goToMyPageHandler}>{t('My Page')}</MenuItem>
							<MenuItem onClick={logoutHandler}>{t('Log out')}</MenuItem>
						</Menu>
					</Toolbar>
				</AppBar>

				<Drawer
					className="aside"
					variant={compactLayout ? 'temporary' : 'permanent'}
					open={compactLayout ? navOpen : true}
					onClose={() => setNavOpen(false)}
					ModalProps={{ keepMounted: true }}
					sx={{ width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}
				>
					{drawerContent}
				</Drawer>

				<Box component="section" id="bunker">
					<Component {...props} />
				</Box>
			</main>
		);
	};
};

export default withAdminLayout;
