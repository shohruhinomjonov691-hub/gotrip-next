import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Collapse, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { Bell, CalendarCheck, ChartLineUp, ChatsCircle, CreditCard, Headset, MapPin, User, UserCircleGear } from 'phosphor-react';

interface AdminMenuListProps {
	onNavigate?: () => void;
}

interface AdminMenuChild {
	title: string;
	url: string;
}

interface AdminMenuItem {
	title: string;
	icon: React.ReactNode;
	url?: string;
	children: AdminMenuChild[];
}

const menuItems: AdminMenuItem[] = [
	{ title: 'Overview', url: '/_admin', icon: <ChartLineUp size={20} weight="fill" />, children: [] },
	{
		title: 'Users',
		icon: <User size={20} weight="fill" />,
		children: [
			{ title: 'All users', url: '/_admin/users' },
			{ title: 'Agent requests', url: '/_admin/users/agent-requests' },
		],
	},
	{ title: 'Tours', icon: <UserCircleGear size={20} weight="fill" />, children: [{ title: 'Tour inventory', url: '/_admin/tours' }] },
	{ title: 'Destinations', icon: <MapPin size={20} weight="fill" />, children: [{ title: 'Destination inventory', url: '/_admin/destinations' }] },
	{ title: 'Bookings', icon: <CalendarCheck size={20} weight="fill" />, children: [{ title: 'Booking operations', url: '/_admin/bookings' }] },
	{ title: 'Payments', icon: <CreditCard size={20} weight="fill" />, children: [{ title: 'Payment operations', url: '/_admin/payments' }] },
	{ title: 'Community', icon: <ChatsCircle size={20} weight="fill" />, children: [{ title: 'Article moderation', url: '/_admin/community' }] },
	{ title: 'Audit', icon: <Bell size={20} weight="fill" />, children: [{ title: 'Notifications', url: '/_admin/notifications' }, { title: 'Comment moderation', url: '/_admin/comments' }] },
	{
		title: 'Help center',
		icon: <Headset size={20} weight="fill" />,
		children: [{ title: 'Notices', url: '/_admin/cs/notice' }],
	},
];

const AdminMenuList = ({ onNavigate }: AdminMenuListProps) => {
	const router = useRouter();
	const [expanded, setExpanded] = useState<string>('');
	const pathname = router.pathname;

	const activeItem = menuItems.find((item) => item.url === pathname || item.children.some((child) => pathname.startsWith(child.url)));

	useEffect(() => {
		setExpanded(activeItem?.title ?? '');
	}, [activeItem?.title]);

	const navigate = (url: string) => {
		router.push(url).then();
		onNavigate?.();
	};

	return (
		<List disablePadding className="admin-menu-list">
			{menuItems.map((item) => {
				const hasChildren = item.children.length > 0;
				const isActive = activeItem?.title === item.title;
				const isExpanded = expanded === item.title;

				return (
					<div key={item.title} className="admin-menu-list__group">
						<ListItemButton
							className={isActive ? 'admin-menu-list__item is-active' : 'admin-menu-list__item'}
							onClick={() => (hasChildren ? setExpanded(isExpanded ? '' : item.title) : navigate(item.url || '/_admin'))}
							aria-expanded={hasChildren ? isExpanded : undefined}
						>
							<ListItemIcon>{item.icon}</ListItemIcon>
							<ListItemText primary={item.title} />
							{hasChildren && (isExpanded ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />)}
						</ListItemButton>
						{hasChildren && (
							<Collapse in={isExpanded} timeout={180} unmountOnExit>
								<List disablePadding className="admin-menu-list__children">
									{item.children.map((child) => {
										const childActive = pathname === child.url;
										return (
											<ListItemButton
												key={child.url}
												className={childActive ? 'admin-menu-list__child is-active' : 'admin-menu-list__child'}
												onClick={() => navigate(child.url)}
												aria-current={childActive ? 'page' : undefined}
											>
												<ListItemText primary={child.title} />
											</ListItemButton>
										);
									})}
								</List>
							</Collapse>
						)}
					</div>
				);
			})}
		</List>
	);
};

export default AdminMenuList;
