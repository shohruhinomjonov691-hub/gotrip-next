import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { searchHref } from './navConfig';

const MotionForm = motion.form;

/**
 * Desktop inline expanding search. Routes to /tour?text=… — the tour
 * directory already owns this URL contract; no search logic changes.
 */
const NavSearch = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const reduceMotion = useReducedMotion();
	const [open, setOpen] = useState(false);
	const [text, setText] = useState('');
	const inputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		if (open) inputRef.current?.focus();
	}, [open]);

	const close = () => {
		setOpen(false);
		setText('');
	};

	const submit = async (event: React.FormEvent) => {
		event.preventDefault();
		const normalized = text.trim();
		if (!normalized) {
			close();
			return;
		}
		close();
		await router.push(searchHref(normalized));
	};

	if (!open) {
		return (
			<button
				type="button"
				className="gt-nav__icon-btn"
				aria-label={t('Search tours') || 'Search tours'}
				onClick={() => setOpen(true)}
			>
				<SearchRoundedIcon />
			</button>
		);
	}

	return (
		<MotionForm
			className="gt-nav__search"
			role="search"
			onSubmit={submit}
			initial={reduceMotion ? { opacity: 0 } : { width: 44, opacity: 0 }}
			animate={reduceMotion ? { opacity: 1 } : { width: 264, opacity: 1 }}
			transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
		>
			<SearchRoundedIcon className="gt-nav__search-icon" aria-hidden="true" />
			<input
				ref={inputRef}
				type="search"
				enterKeyHint="search"
				value={text}
				placeholder={t('Search tours') || 'Search tours'}
				aria-label={t('Search tours') || 'Search tours'}
				onChange={(event) => setText(event.target.value)}
				onKeyDown={(event) => {
					if (event.key === 'Escape') close();
				}}
				onBlur={() => {
					if (!text.trim()) close();
				}}
			/>
			<button type="button" className="gt-nav__search-close" aria-label={t('Close search') || 'Close search'} onClick={close}>
				<CloseRoundedIcon />
			</button>
		</MotionForm>
	);
};

export default NavSearch;
