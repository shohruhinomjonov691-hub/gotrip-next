import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useReactiveVar } from '@apollo/client';
import { Menu, MenuItem } from '@mui/material';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { userVar } from '../../../apollo/store';
import { logOut } from '../../auth';
import { REACT_APP_API_URL } from '../../config';
import { MemberType } from '../../enums/member.enum';

interface ProfileMenuItem {
	labelKey: string;
	href: string;
	icon: React.ReactNode;
}

interface ProfileMenuGroup {
	labelKey: string;
	items: ProfileMenuItem[];
}

const ROLE_BADGE: Record<string, { labelKey: string; className: string }> = {
	[MemberType.USER]: { labelKey: 'Traveler', className: 'gt-badge gt-badge--info' },
	[MemberType.AGENT]: { labelKey: 'Guide', className: 'gt-badge gt-badge--earned' },
	[MemberType.ADMIN]: { labelKey: 'Admin', className: 'gt-badge gt-badge--accent' },
};

/** Avatar → account menu: identity header, role badge, grouped links, danger logout. */
const ProfileMenu = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	const isAgent = user?.memberType === MemberType.AGENT;
	const isAdmin = user?.memberType === MemberType.ADMIN;
	const badge = ROLE_BADGE[user?.memberType as string] ?? ROLE_BADGE[MemberType.USER];
	const avatarSrc = user?.memberImage ? `${REACT_APP_API_URL}/${user?.memberImage}` : '/img/profile/defaultUser.svg';

	const groups: ProfileMenuGroup[] = [
		{
			labelKey: 'My travel',
			items: [
				{ labelKey: 'Profile', href: '/mypage?category=myProfile', icon: <PersonOutlineRoundedIcon /> },
				{ labelKey: 'Saved tours', href: '/mypage?category=savedTours', icon: <BookmarkBorderRoundedIcon /> },
				{ labelKey: 'Recently viewed', href: '/mypage?category=recentlyViewed', icon: <HistoryRoundedIcon /> },
			],
		},
		{
			labelKey: 'Community',
			items: [
				{ labelKey: 'My articles', href: '/mypage?category=myArticles', icon: <ArticleOutlinedIcon /> },
				{ labelKey: 'Write article', href: '/mypage?category=writeArticle', icon: <EditNoteRoundedIcon /> },
			],
		},
		...(isAgent
			? [
					{
						labelKey: 'Guide tools',
						items: [
							{ labelKey: 'My tours', href: '/mypage?category=myTours', icon: <MapRoundedIcon /> },
							{ labelKey: 'Add tour', href: '/mypage?category=addTour', icon: <AddCircleOutlineRoundedIcon /> },
						],
					},
			  ]
			: []),
		{
			labelKey: 'Explore',
			items: [
				{ labelKey: 'Guides', href: '/agent', icon: <GroupsRoundedIcon /> },
				{ labelKey: 'Support', href: '/cs', icon: <HelpOutlineRoundedIcon /> },
			],
		},
	];

	const go = async (href: string) => {
		setAnchorEl(null);
		await router.push(href);
	};

	return (
		<>
			<button
				type="button"
				className="gt-nav__avatar-btn"
				aria-label={t('Open account menu') || 'Open account menu'}
				aria-haspopup="menu"
				aria-expanded={open}
				aria-controls={open ? 'gt-profile-menu' : undefined}
				onClick={(event) => setAnchorEl(event.currentTarget)}
			>
				<img src={avatarSrc} alt="" />
			</button>

			<Menu
				id="gt-profile-menu"
				className="gt-nav-menu gt-profile"
				anchorEl={anchorEl}
				open={open}
				onClose={() => setAnchorEl(null)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
			>
				<div className="gt-profile__head">
					<img src={avatarSrc} alt="" />
					<div className="gt-profile__identity">
						<strong>{user?.memberNick || user?.memberFullName || 'Member'}</strong>
						<span className={badge.className}>{t(badge.labelKey) || badge.labelKey}</span>
					</div>
				</div>

				{groups.map((group) => (
					<div className="gt-profile__group" key={group.labelKey}>
						<p className="gt-label">{t(group.labelKey) || group.labelKey}</p>
						{group.items.map((item) => (
							<MenuItem key={item.href} className="gt-nav-menu__item" onClick={() => go(item.href)}>
								{item.icon}
								<span className="gt-nav-menu__label">{t(item.labelKey) || item.labelKey}</span>
							</MenuItem>
						))}
					</div>
				))}

				{isAdmin && (
					<div className="gt-profile__group">
						<p className="gt-label">{t('Workspace') || 'Workspace'}</p>
						<MenuItem className="gt-nav-menu__item" onClick={() => go('/_admin')}>
							<AdminPanelSettingsRoundedIcon />
							<span className="gt-nav-menu__label">{t('Admin workspace') || 'Admin workspace'}</span>
						</MenuItem>
					</div>
				)}

				<div className="gt-profile__danger">
					<MenuItem
						className="gt-nav-menu__item gt-nav-menu__item--danger"
						onClick={() => {
							setAnchorEl(null);
							logOut();
						}}
					>
						<LogoutRoundedIcon />
						<span className="gt-nav-menu__label">{t('Logout') || 'Logout'}</span>
					</MenuItem>
				</div>
			</Menu>
		</>
	);
};

export default ProfileMenu;
