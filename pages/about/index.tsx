import React from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Box, Stack } from '@mui/material';

const CapabilityCards = ({ compact = false }: { compact?: boolean }) => (
	<Stack className={'boxes'} sx={compact ? { mt: 3, gap: 2 } : undefined}>
		<Stack className={'box'} sx={compact ? { width: '100%', mr: 0, p: 2, borderRadius: 2, bgcolor: 'var(--gt-surface)' } : undefined}>
			<div>
				<img src="/img/icons/discovery.svg" alt="" />
			</div>
			<span>Destination-led discovery</span>
			<p>Start with a place, compare guided tours, and keep travel details together while you plan.</p>
		</Stack>
		<Stack className={'box'} sx={compact ? { width: '100%', mr: 0, p: 2, borderRadius: 2, bgcolor: 'var(--gt-surface)' } : undefined}>
			<div>
				<img src="/img/icons/securePayment.svg" alt="" />
			</div>
			<span>Traveler account tools</span>
			<p>Save tours, manage bookings and payment records, and join travel conversations when you are signed in.</p>
		</Stack>
	</Stack>
);

const SupportPanel = ({ compact = false }: { compact?: boolean }) => (
	<Stack className={'help'} sx={compact ? { mt: 3, width: '100%' } : undefined}>
		<Stack
			className={'container'}
			sx={
				compact
					? { p: 2.5, borderRadius: 2, bgcolor: 'var(--gt-surface-2)', alignItems: 'flex-start', gap: 2 }
					: undefined
			}
		>
			<Box className={'left'} component={'div'}>
				<strong>Need travel-platform guidance?</strong>
				<p>Read current notices, terms, and available inquiry guidance in the GoTrip Help Center.</p>
			</Box>
			<Box className={'right'} component={'div'} sx={compact ? { width: '100%' } : undefined}>
				<Link href="/cs?tab=inquiry">
					<Box
						className={'black'}
						component={'div'}
						sx={compact ? { m: 0, width: '100%', minHeight: 44, color: '#fff', bgcolor: 'var(--gt-deep-ocean)' } : undefined}
					>
						Open support
					</Box>
				</Link>
			</Box>
		</Stack>
	</Stack>
);

const About: NextPage = () => {
	const device = useDeviceDetect();
	const isMobile = device === 'mobile';

	return (
		<Stack className={'about-page'} sx={isMobile ? { px: 2, py: 3, gap: 3 } : undefined}>
			<Stack className={'intro'}>
				<Stack
					className={'container'}
					sx={isMobile ? { width: '100%', flexDirection: 'column', alignItems: 'flex-start', gap: 2 } : undefined}
				>
					<Stack className={'left'} sx={isMobile ? { width: '100%' } : undefined}>
						<strong>Travel designed around destinations, guides, and real local experiences.</strong>
					</Stack>
					<Stack className={'right'} sx={isMobile ? { width: '100%' } : undefined}>
						<p>
							GoTrip brings destination discovery, guided tours, traveler accounts, bookings, payments, and community stories into
							one place. Explore at your pace, save the experiences that fit, and return when you are ready to plan further.
						</p>
						<CapabilityCards compact={isMobile} />
					</Stack>
				</Stack>
			</Stack>
			<SupportPanel compact={isMobile} />
		</Stack>
	);
};

export default withLayoutBasic(About);
