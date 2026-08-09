import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Modal } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import NorthEastRoundedIcon from '@mui/icons-material/NorthEastRounded';
import { PRIMARY_LINKS, SECONDARY_LINKS, searchHref } from './navConfig';

const MotionDiv = motion.div;

interface MobileSearchOverlayProps {
	open: boolean;
	onClose: () => void;
}

/**
 * Fullscreen mobile search. MUI Modal supplies the focus trap, escape
 * handling, and scroll lock; routing reuses the /tour?text= contract.
 */
const MobileSearchOverlay = ({ open, onClose }: MobileSearchOverlayProps) => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const reduceMotion = useReducedMotion();
	const [text, setText] = useState('');
	const inputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		if (!open) setText('');
	}, [open]);

	const submit = async (event: React.FormEvent) => {
		event.preventDefault();
		const normalized = text.trim();
		if (!normalized) return;
		onClose();
		await router.push(searchHref(normalized));
	};

	const quickLinks = [...PRIMARY_LINKS.filter((link) => link.href !== '/'), ...SECONDARY_LINKS];

	return (
		<Modal open={open} onClose={onClose} className="gt-search-overlay-root" aria-label={t('Search') || 'Search'}>
			<MotionDiv
				className="gt-search-overlay"
				tabIndex={-1}
				initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
			>
				<div className="gt-search-overlay__bar">
					<form className="gt-search-overlay__form" role="search" onSubmit={submit}>
						<SearchRoundedIcon aria-hidden="true" />
						<input
							ref={inputRef}
							autoFocus
							type="search"
							enterKeyHint="search"
							value={text}
							placeholder={t('Where do you want to go?') || 'Where do you want to go?'}
							aria-label={t('Search tours') || 'Search tours'}
							onChange={(event) => setText(event.target.value)}
						/>
					</form>
					<button type="button" className="gt-search-overlay__close" aria-label={t('Close search') || 'Close search'} onClick={onClose}>
						<CloseRoundedIcon />
					</button>
				</div>

				<div className="gt-search-overlay__body">
					<p className="gt-label">{t('Explore') || 'Explore'}</p>
					<ul className="gt-search-overlay__links">
						{quickLinks.map((link) => (
							<li key={link.href}>
								<Link href={link.href} onClick={onClose}>
									<span>{t(link.labelKey) || link.labelKey}</span>
									<NorthEastRoundedIcon aria-hidden="true" />
								</Link>
							</li>
						))}
					</ul>
				</div>
			</MotionDiv>
		</Modal>
	);
};

export default MobileSearchOverlay;
