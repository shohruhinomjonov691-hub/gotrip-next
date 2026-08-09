import React from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { NextPage } from 'next';
import Link from 'next/link';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Box, Stack } from '@mui/material';
import { useTranslation } from '../../libs/i18n/useTranslation';

const CapabilityCards = ({ compact = false }: { compact?: boolean }) => {
	const { t } = useTranslation();

	return (
		<Stack className={'boxes'} sx={compact ? { mt: 3, gap: 2 } : undefined}>
			<Stack className={'box'} sx={compact ? { width: '100%', mr: 0, p: 2, borderRadius: 2, bgcolor: 'var(--gt-surface)' } : undefined}>
				<div>
					<img src="/img/icons/discovery.svg" alt="" />
				</div>
				<span>{t('Tour-led discovery')}</span>
				<p>{t('Browse guided tours, compare guides, and keep travel details together while you plan.')}</p>
			</Stack>
			<Stack className={'box'} sx={compact ? { width: '100%', mr: 0, p: 2, borderRadius: 2, bgcolor: 'var(--gt-surface)' } : undefined}>
				<div>
					<img src="/img/icons/securePayment.svg" alt="" />
				</div>
				<span>{t('Traveler account tools')}</span>
				<p>{t('Save tours, contact guides directly, and join travel conversations when you are signed in.')}</p>
			</Stack>
		</Stack>
	);
};

const SupportPanel = ({ compact = false }: { compact?: boolean }) => {
	const { t } = useTranslation();

	return (
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
					<strong>{t('Need travel-platform guidance?')}</strong>
					<p>{t('Read current notices, terms, and available inquiry guidance in the GoTrip Help Center.')}</p>
				</Box>
				<Box className={'right'} component={'div'} sx={compact ? { width: '100%' } : undefined}>
					<Link href="/cs?tab=inquiry">
						<Box
							className={'black'}
							component={'div'}
							sx={compact ? { m: 0, width: '100%', minHeight: 44, color: '#fff', bgcolor: 'var(--gt-deep-ocean)' } : undefined}
						>
							{t('Open support')}
						</Box>
					</Link>
				</Box>
			</Stack>
		</Stack>
	);
};

const About: NextPage = () => {
	const device = useDeviceDetect();
	const isMobile = device === 'mobile';
	const { t } = useTranslation();

	return (
		<Stack className={'about-page'} sx={isMobile ? { px: 2, py: 3, gap: 3 } : undefined}>
			<Stack className={'intro'}>
				<Stack
					className={'container'}
					sx={isMobile ? { width: '100%', flexDirection: 'column', alignItems: 'flex-start', gap: 2 } : undefined}
				>
					<Stack className={'left'} sx={isMobile ? { width: '100%' } : undefined}>
						<strong>{t('Travel designed around tours, guides, and real local experiences.')}</strong>
					</Stack>
					<Stack className={'right'} sx={isMobile ? { width: '100%' } : undefined}>
						<p>
							{t(
								'GoTrip brings tour discovery, guided experiences, traveler accounts, direct guide contact, and community stories into one place. Explore at your pace, save the experiences that fit, and return when you are ready to plan further.',
							)}
						</p>
						<CapabilityCards compact={isMobile} />
					</Stack>
				</Stack>
			</Stack>
			<SupportPanel compact={isMobile} />
		</Stack>
	);
};

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

export default withLayoutBasic(About);
