import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTranslation } from '../../i18n/useTranslation';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { getImageUrl } from '../../config';
import { logOut } from '../../auth';
import LogoutDialog from '../common/LogoutDialog';

const legacyCategoryAliases: Record<string, string> = {
	addProperty: 'addTour',
	myProperties: 'myTours',
	myFavorites: 'savedTours',
	recentlyVisited: 'recentlyViewed',
};

interface MenuItemConfig {
	label: string;
	category: string;
	icon: React.ReactNode;
}

interface MenuSectionConfig {
	title: string;
	items: MenuItemConfig[];
}

/* --- icons (inline so they inherit currentColor and follow the theme) --- */
const I = {
	user: (
		<svg viewBox="0 0 24 24">
			<circle cx="12" cy="8" r="4" />
			<path d="M4.5 20a7.5 7.5 0 0115 0" />
		</svg>
	),
	heart: (
		<svg viewBox="0 0 24 24">
			<path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0112 8.2a4.1 4.1 0 017.5 2.4C19.5 15.4 12 20 12 20z" />
		</svg>
	),
	clock: (
		<svg viewBox="0 0 24 24">
			<circle cx="12" cy="12" r="8.5" />
			<path d="M12 7.5V12l3 2" />
		</svg>
	),
	bell: (
		<svg viewBox="0 0 24 24">
			<path d="M6.5 10a5.5 5.5 0 0111 0c0 4 1.5 5.5 1.5 5.5H5s1.5-1.5 1.5-5.5z" />
			<path d="M10.2 18.5a2 2 0 003.6 0" />
		</svg>
	),
	chat: (
		<svg viewBox="0 0 24 24">
			<path d="M20 12.5a7 7 0 01-7 7H8l-4 2.5V12.5a7 7 0 017-7h2a7 7 0 017 7z" />
		</svg>
	),
	users: (
		<svg viewBox="0 0 24 24">
			<circle cx="9" cy="8.5" r="3.4" />
			<path d="M3 19.5a6 6 0 0112 0" />
			<path d="M16 6.2a3.4 3.4 0 010 6.6M17.5 19.5a6 6 0 00-1.6-4.1" />
		</svg>
	),
	article: (
		<svg viewBox="0 0 24 24">
			<rect height="16" rx="2.4" width="15" x="4.5" y="4" />
			<path d="M8 8.5h8M8 12h8M8 15.5h5" />
		</svg>
	),
	pen: (
		<svg viewBox="0 0 24 24">
			<path d="M16.5 4.5l3 3L9 18l-4 1 1-4z" />
		</svg>
	),
	map: (
		<svg viewBox="0 0 24 24">
			<path d="M9 5.5L3.5 8v11L9 16.5l6 2.5 5.5-2.5v-11L15 8z" />
			<path d="M9 5.5v11M15 8v11" />
		</svg>
	),
	plus: (
		<svg viewBox="0 0 24 24">
			<circle cx="12" cy="12" r="8.5" />
			<path d="M12 8.5v7M8.5 12h7" />
		</svg>
	),
	logout: (
		<svg viewBox="0 0 24 24">
			<path d="M14 7.5V5.5a2 2 0 00-2-2H6a2 2 0 00-2 2v13a2 2 0 002 2h6a2 2 0 002-2v-2" />
			<path d="M10 12h10m0 0l-3-3m3 3l-3 3" />
		</svg>
	),
	badge: (
		<svg viewBox="0 0 24 24">
			<path d="M12 3.5l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 9.2l5.4-.8z" />
		</svg>
	),
	shield: (
		<svg viewBox="0 0 24 24">
			<path d="M12 3.5l7 3v5c0 4.4-3 8-7 9-4-1-7-4.6-7-9v-5z" />
			<path d="M9 12l2 2 4-4" />
		</svg>
	),
};

const accountItems: MenuItemConfig[] = [
	{ label: 'Profile', category: 'myProfile', icon: I.user },
	{ label: 'Saved Tours', category: 'savedTours', icon: I.heart },
	{ label: 'Recently Viewed', category: 'recentlyViewed', icon: I.clock },
	{ label: 'Notifications', category: 'notifications', icon: I.bell },
	{ label: 'Messages', category: 'messages', icon: I.chat },
];

const socialItems: MenuItemConfig[] = [
	{ label: 'Followers', category: 'followers', icon: I.users },
	{ label: 'Followings', category: 'followings', icon: I.users },
];

const communityItems: MenuItemConfig[] = [
	{ label: 'My Articles', category: 'myArticles', icon: I.article },
	{ label: 'Write Article', category: 'writeArticle', icon: I.pen },
];

/* USER accounts only — mirrors @Roles(MemberType.USER) on requestAgentRole. */
const guideApplyItems: MenuItemConfig[] = [{ label: 'Become a Guide', category: 'becomeGuide', icon: I.badge }];

const agentItems: MenuItemConfig[] = [
	{ label: 'My Tours', category: 'myTours', icon: I.map },
	{ label: 'Add Tour', category: 'addTour', icon: I.plus },
];

const MyMenu = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const routeCategory = router.query?.category;
	const category: string =
		(typeof routeCategory === 'string' && legacyCategoryAliases[routeCategory]) ||
		(typeof routeCategory === 'string' ? routeCategory : 'myProfile');
	const user = useReactiveVar(userVar);
	const isAgent = user?.memberType === 'AGENT';
	const isUser = user?.memberType === 'USER';
	const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

	/** HANDLERS **/
	const logoutHandler = () => setLogoutDialogOpen(true);

	const confirmLogout = () => {
		setLogoutDialogOpen(false);
		try {
			logOut();
		} catch (err: any) {
			console.log('ERROR, confirmLogout:', err.message);
		}
	};

	const sections: MenuSectionConfig[] = [
		{ title: 'Account', items: accountItems },
		{ title: 'Network', items: socialItems },
		{ title: 'Community', items: communityItems },
		...(isAgent ? [{ title: 'Agent Hub', items: agentItems }] : []),
		...(isUser ? [{ title: 'Guiding', items: guideApplyItems }] : []),
	];

	const avatar = getImageUrl(user?.memberImage);

	const renderLink = (item: MenuItemConfig) => {
		const isActive = category === item.category;
		return (
			<li key={item.category}>
				<Link
					aria-current={isActive ? 'page' : undefined}
					className={isActive ? 'acc-nav-link on' : 'acc-nav-link'}
					href={{ pathname: '/mypage', query: { category: item.category } }}
					scroll={false}
				>
					<span className="acc-nav-ico">{item.icon}</span>
					<span>{t(item.label)}</span>
				</Link>
			</li>
		);
	};

	return (
		<div className="acc-side">
			{/* Identity card */}
			<div className="acc-id">
				<img alt="" className="acc-id-av" src={avatar} />
				<b className="acc-id-name">{user?.memberNick}</b>
				{user?.memberPhone && <span className="acc-id-phone">{user.memberPhone}</span>}
				<span className="acc-id-role">{user?.memberType ? t(user.memberType) : ''}</span>
			</div>

			{/* Quick stats, read straight off the session token — no extra query. */}
			<div className="acc-id-stats">
				<div>
					<b>{user?.memberFollowers ?? 0}</b>
					<small>{t('Followers')}</small>
				</div>
				<div>
					<b>{user?.memberFollowings ?? 0}</b>
					<small>{t('Following')}</small>
				</div>
				<div>
					<b>{user?.memberArticles ?? 0}</b>
					<small>{t('Articles')}</small>
				</div>
			</div>

			<nav className="acc-nav" aria-label={t('Account sections') as string}>
				{sections.map((section) => (
					<div className="acc-nav-group" key={section.title}>
						<h4 className="acc-nav-title">{t(section.title)}</h4>
						<ul>{section.items.map(renderLink)}</ul>
					</div>
				))}

				<div className="acc-nav-group">
					<h4 className="acc-nav-title">{t('Session')}</h4>
					<ul>
						{user?.memberType === 'ADMIN' && (
							<li>
								<a className="acc-nav-link" href="/_admin/users" rel="noreferrer" target="_blank">
									<span className="acc-nav-ico">{I.shield}</span>
									<span>{t('Admin panel')}</span>
								</a>
							</li>
						)}
						<li>
							<button className="acc-nav-link danger" onClick={logoutHandler} type="button">
								<span className="acc-nav-ico">{I.logout}</span>
								<span>{t('Logout')}</span>
							</button>
						</li>
					</ul>
				</div>
			</nav>

			<LogoutDialog open={logoutDialogOpen} onCancel={() => setLogoutDialogOpen(false)} onConfirm={confirmLogout} />
		</div>
	);
};

export default MyMenu;
