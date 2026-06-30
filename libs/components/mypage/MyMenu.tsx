import React from 'react';
import { useRouter } from 'next/router';
import { Stack, Typography, Box, List, ListItem } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { logOut } from '../../auth';
import { sweetConfirmAlert } from '../../sweetAlert';

const legacyCategoryAliases: Record<string, string> = {
	addProperty: 'addTour',
	myProperties: 'myTours',
	myFavorites: 'savedTours',
	recentlyVisited: 'recentlyViewed',
};

interface MenuItemConfig {
	label: string;
	category: string;
	icon: string;
	activeIcon?: string;
}

interface MenuSectionConfig {
	title: string;
	items: MenuItemConfig[];
}

const accountItems: MenuItemConfig[] = [
	{ label: 'Profile', category: 'myProfile', icon: '/img/icons/user.svg', activeIcon: '/img/icons/userWhite.svg' },
	{ label: 'Bookings', category: 'myBookings', icon: '/img/icons/newTab.svg', activeIcon: '/img/icons/whiteTab.svg' },
	{ label: 'Payments', category: 'myPayments', icon: '/img/icons/securePayment.svg', activeIcon: '/img/icons/whiteTab.svg' },
	{ label: 'Saved Tours', category: 'savedTours', icon: '/img/icons/like.svg', activeIcon: '/img/icons/likeWhite.svg' },
	{ label: 'Recently Viewed', category: 'recentlyViewed', icon: '/img/icons/search.svg', activeIcon: '/img/icons/searchWhite.svg' },
	{ label: 'Notifications', category: 'notifications', icon: '/img/icons/discovery.svg', activeIcon: '/img/icons/discoveryWhite.svg' },
];

const communityItems: MenuItemConfig[] = [
	{ label: 'My Articles', category: 'myArticles', icon: '/img/icons/discovery.svg', activeIcon: '/img/icons/discoveryWhite.svg' },
	{ label: 'Write Article', category: 'writeArticle', icon: '/img/icons/newTab.svg', activeIcon: '/img/icons/whiteTab.svg' },
];

const agentItems: MenuItemConfig[] = [
	{ label: 'My Tours', category: 'myTours', icon: '/img/icons/review.svg', activeIcon: '/img/icons/reviewWhite.svg' },
	{ label: 'Add Tour', category: 'addTour', icon: '/img/icons/newTab.svg', activeIcon: '/img/icons/whiteTab.svg' },
];

const MyMenu = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const routeCategory = router.query?.category;
	const category: string =
		(typeof routeCategory === 'string' && legacyCategoryAliases[routeCategory]) ||
		(typeof routeCategory === 'string' ? routeCategory : 'myProfile');
	const user = useReactiveVar(userVar);
	const isAgent = user?.memberType === 'AGENT';

	/** HANDLERS **/
	const logoutHandler = async () => {
		try {
			if (await sweetConfirmAlert('Do you want to logout?')) logOut();
		} catch (err: any) {
			console.log('ERROR, logoutHandler:', err.message);
		}
	};

	const renderLink = (item: MenuItemConfig) => {
		const isActive = category === item.category;
		const iconSrc = isActive && item.activeIcon ? item.activeIcon : item.icon;

		return (
			<ListItem className={isActive ? 'focus' : ''} key={item.category}>
				<Link href={{ pathname: '/mypage', query: { category: item.category } }} scroll={false}>
					<div className={'flex-box'}>
						<img className={'com-icon'} src={iconSrc} alt="" aria-hidden="true" />
						<Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
							{item.label}
						</Typography>
					</div>
				</Link>
			</ListItem>
		);
	};

	if (device === 'mobile') {
		const quickLinks = [...accountItems, ...communityItems, ...(isAgent ? agentItems : [])];

		return (
			<Stack className="mobile-my-menu">
				{quickLinks.map((item) => (
					<Link
						key={item.category}
						href={{ pathname: '/mypage', query: { category: item.category } }}
						scroll={false}
						className={category === item.category ? 'active' : ''}
					>
						{item.label}
					</Link>
				))}
			</Stack>
		);
	}

	const sections: MenuSectionConfig[] = [
		{ title: 'Account', items: accountItems },
		{ title: 'Community', items: communityItems },
		...(isAgent ? [{ title: 'Agent Hub', items: agentItems }] : []),
	];

	return (
		<Stack width={'100%'} padding={'30px 24px'}>
			<Stack className={'profile'}>
				<Box component={'div'} className={'profile-img'}>
					<img
						src={user?.memberImage ? `${REACT_APP_API_URL}/${user?.memberImage}` : '/img/profile/defaultUser.svg'}
						alt={'member-photo'}
					/>
				</Box>
				<Stack className={'user-info'}>
					<Typography className={'user-name'}>{user?.memberNick}</Typography>
					<Box component={'div'} className={'user-phone'}>
						<img src={'/img/icons/call.svg'} alt="" aria-hidden="true" />
						<Typography className={'p-number'}>{user?.memberPhone}</Typography>
					</Box>
					{user?.memberType === 'ADMIN' ? (
						<a href="/_admin/users" target={'_blank'} rel="noreferrer">
							<Typography className={'view-list'}>{user?.memberType}</Typography>
						</a>
					) : (
						<Typography className={'view-list'}>{user?.memberType}</Typography>
					)}
				</Stack>
			</Stack>
			<Stack className={'sections'}>
				{sections.map((section, index) => (
					<Stack className={'section'} sx={{ marginTop: index === 0 ? '0' : '18px' }} key={section.title}>
						<Typography className="title" variant={'h5'}>
							{section.title}
						</Typography>
						<List className={'sub-section'}>{section.items.map(renderLink)}</List>
					</Stack>
				))}
				<Stack className={'section'} sx={{ marginTop: '24px' }}>
					<Typography className="title" variant={'h5'}>
						Session
					</Typography>
					<List className={'sub-section'}>
						<ListItem onClick={logoutHandler}>
							<div className={'flex-box'}>
								<img className={'com-icon'} src={'/img/icons/logout.svg'} alt="" aria-hidden="true" />
								<Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
									Logout
								</Typography>
							</div>
						</ListItem>
					</List>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default MyMenu;
