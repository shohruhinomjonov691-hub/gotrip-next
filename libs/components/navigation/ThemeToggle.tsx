import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import WbSunnyRoundedIcon from '@mui/icons-material/WbSunnyRounded';
import { useColorMode } from '../../theme/ColorModeProvider';

const MotionSpan = motion.span;

/**
 * Animated light/dark toggle. Theme itself is applied by ColorModeProvider +
 * the pre-paint script in _document.tsx (anti-flash law) — this only triggers it.
 */
const ThemeToggle = ({ className = 'gt-nav__icon-btn' }: { className?: string }) => {
	const { mode, toggleMode } = useColorMode();
	const reduceMotion = useReducedMotion();
	const isDark = mode === 'dark';

	return (
		<button
			type="button"
			className={className}
			aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
			aria-pressed={isDark}
			onClick={toggleMode}
		>
			<AnimatePresence mode="wait" initial={false}>
				<MotionSpan
					key={mode}
					className="gt-nav__icon-swap"
					initial={reduceMotion ? { opacity: 0 } : { opacity: 0, rotate: -60, scale: 0.6 }}
					animate={{ opacity: 1, rotate: 0, scale: 1 }}
					exit={reduceMotion ? { opacity: 0 } : { opacity: 0, rotate: 60, scale: 0.6 }}
					transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
				>
					{isDark ? <WbSunnyRoundedIcon /> : <DarkModeRoundedIcon />}
				</MotionSpan>
			</AnimatePresence>
		</button>
	);
};

export default ThemeToggle;
