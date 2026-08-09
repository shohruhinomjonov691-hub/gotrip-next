import React, { useState } from 'react';
import { Menu, MenuItem } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import { LOCALES, useLocaleSwitch } from '../../i18n/useLocaleSwitch';

/* Re-exported for backward compatibility — every existing import of
   `{ LOCALES, useLocaleSwitch }` from this file (GthHeader, MobileNav, ...)
   keeps working unchanged. The canonical implementation now lives in
   libs/i18n/useLocaleSwitch.ts. */
export { LOCALES, useLocaleSwitch };

/** Desktop popover language selector — current locale shown as a compact code. */
const LanguageMenu = () => {
	const { lang, changeLang } = useLocaleSwitch();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const current = LOCALES.find((item) => item.id === lang) ?? LOCALES[0];

	return (
		<>
			<button
				type="button"
				className="gt-nav__icon-btn gt-nav__lang-btn"
				aria-label={`Change language, current language ${current.label}`}
				aria-haspopup="menu"
				aria-expanded={open}
				aria-controls={open ? 'gt-language-menu' : undefined}
				onClick={(event) => setAnchorEl(event.currentTarget)}
			>
				<LanguageRoundedIcon />
				<span className="gt-nav__lang-code">{current.code}</span>
			</button>
			<Menu
				id="gt-language-menu"
				className="gt-nav-menu"
				anchorEl={anchorEl}
				open={open}
				onClose={() => setAnchorEl(null)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
			>
				{LOCALES.map((locale) => (
					<MenuItem
						key={locale.id}
						className="gt-nav-menu__item"
						selected={locale.id === lang}
						onClick={async () => {
							setAnchorEl(null);
							await changeLang(locale.id);
						}}
					>
						<span className="gt-nav-menu__lang-code" aria-hidden="true">
							{locale.code}
						</span>
						<span className="gt-nav-menu__label">{locale.label}</span>
						{locale.id === lang && <CheckRoundedIcon className="gt-nav-menu__check" />}
					</MenuItem>
				))}
			</Menu>
		</>
	);
};

export default LanguageMenu;
