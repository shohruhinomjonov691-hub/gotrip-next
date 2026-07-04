import type { ThemeOptions } from '@mui/material/styles';
import shadow from './shadow';
import typography from './typography';

type PaletteMode = 'light' | 'dark';

const components = (mode: PaletteMode) => ({
	MuiTypography: {
		styleOverrides: {
			root: {
				letterSpacing: '0',
			},
		},
		defaultProps: {
			variantMapping: {
				h1: 'h1',
				h2: 'h2',
				h3: 'h3',
				h4: 'h4',
				h5: 'h5',
				h6: 'h6',
				subtitle1: 'p',
				subtitle2: 'p',
				subtitle3: 'p',
				body1: 'p',
				body2: 'p',
			},
		},
	},
	MuiLink: {
		styleOverrides: {
			root: {
				color: 'var(--gt-muted)',
				textDecoration: 'none',
			},
		},
	},
	MuiDivider: {
		styleOverrides: {
			root: {
				borderColor: 'var(--gt-divider)',
			},
		},
	},
	MuiBox: {
		styleOverrides: {
			root: {
				padding: '0',
			},
		},
		makeStyles: {
			root: {
				padding: 0,
			},
		},
		sx: {
			'&.MuiBox-root': {
				component: 'div',
			},
		},
	},
	MuiContainer: {
		styleOverrides: {
			root: {
				maxWidth: 'inherit',
				padding: '0',
				'@media (min-width: 600px)': {
					paddingLeft: 0,
					paddingRight: 0,
				},
			},
		},
	},
	MuiCssBaseline: {
		styleOverrides: {
			html: { height: '100%' },
			body: {
				background: 'var(--gt-bg)',
				color: 'var(--gt-text)',
				height: '100%',
				minHeight: '100%',
			},
			p: {
				margin: '0',
			},
		},
	},
	MuiAvatar: {
		styleOverrides: {
			root: {
				marginLeft: '0',
			},
		},
	},
	MuiButton: {
		styleOverrides: {
			root: {
				color: 'var(--gt-text)',
				minWidth: 'auto',
				lineHeight: '1.2',
				boxShadow: 'none',
				fontWeight: 600,
				borderRadius: 'var(--gt-radius-pill)',
				transition:
					'background-color var(--gt-duration-fast) var(--gt-ease-out), border-color var(--gt-duration-fast) var(--gt-ease-out), color var(--gt-duration-fast) var(--gt-ease-out), box-shadow var(--gt-duration-fast) var(--gt-ease-out), transform var(--gt-duration-instant) var(--gt-ease-out)',
				ButtonText: {
					color: 'var(--gt-text)',
				},
				'&:active': {
					transform: 'scale(0.98)',
				},
			},
		},
	},
	MuiIconButton: {
		styleOverrides: {
			root: {
				color: 'var(--gt-text)',
			},
		},
	},
	MuiListItemButton: {
		styleOverrides: {
			root: {
				padding: '0',
			},
		},
	},
	MuiList: {
		styleOverrides: {
			root: {
				padding: '0',
			},
		},
	},
	MuiListItem: {
		styleOverrides: {
			root: {
				MuiSelect: {
					backgroundColor: 'var(--gt-input-bg)',
				},
				padding: '0',
			},
		},
	},
	MuiFormControl: {
		styleOverrides: {
			root: {
				width: '100%',
			},
		},
	},
	MuiFormControlLabel: {
		styleOverrides: {
			root: {
				marginRight: '0',
			},
		},
	},
	MuiSelect: {
		styleOverrides: {
			root: {},
			select: {
				textAlign: 'left',
			},
		},
	},
	MuiInputBase: {
		styleOverrides: {
			root: {
				color: 'var(--gt-input-text)',
				input: {},
			},
		},
	},
	MuiOutlinedInput: {
		styleOverrides: {
			root: {
				height: '48px',
				width: '100%',
				backgroundColor: 'var(--gt-input-bg)',
				color: 'var(--gt-input-text)',
				input: {},
			},
			notchedOutline: {
				padding: '8px',
				top: '-9px',
				border: '1px solid var(--gt-input-border)',
			},
		},
	},
	MuiFormHelperText: {
		styleOverrides: {
			root: {
				margin: '5px 0 0 2px',
				lineHeight: '1.2',
			},
		},
	},
	MuiStepper: {
		styleOverrides: {
			root: {
				alignItems: 'center',
			},
		},
	},
	MuiTabPanel: {
		styleOverrides: {
			root: {
				padding: '0',
			},
		},
	},
	MuiSvgIcon: {
		styleOverrides: {
			root: {},
		},
	},
	MuiStepIcon: {
		styleOverrides: {
			root: {
				color: 'var(--gt-surface)',
				borderRadius: '50%',
				border: '1px solid var(--gt-border)',
			},
			text: {
				fill: 'var(--gt-muted)',
			},
		},
	},
	MuiStepConnector: {
		styleOverrides: {
			line: {
				borderColor: 'var(--gt-border)',
			},
		},
	},
	MuiStepLabel: {
		styleOverrides: {
			label: {
				fontSize: '14px',
			},
		},
	},
	MuiCheckbox: {
		styleOverrides: {
			root: {
				'&.Mui-checked': {
					color: 'var(--gt-accent)',
				},
			},
		},
	},
	MuiTooltip: {
		styleOverrides: {
			tooltip: {
				padding: '6px 10px',
				borderRadius: '8px',
				background: 'var(--gt-ink)',
				fontSize: 'var(--gt-text-micro)',
				fontWeight: 600,
				lineHeight: 1.35,
			},
		},
	},
	MuiFab: {
		styleOverrides: {
			root: {
				width: '40px',
				height: '40px',
				background: 'var(--gt-surface)',
				color: 'var(--gt-text)',
			},
			hover: {
				background: 'var(--gt-surface)',
			},
		},
	},
	MuiPaper: {
		styleOverrides: {
			root: {
				backgroundImage: 'none',
				backgroundColor: 'var(--gt-paper)',
				color: 'var(--gt-text)',
				MuiMenu: {
					boxShadow: 'var(--gt-shadow-soft)',
				},
			},
		},
	},
	MuiMenuItem: {
		styleOverrides: {
			root: {
				padding: '6px 8px',
			},
		},
	},
	MuiAlert: {
		styleOverrides: {
			root: {
				boxShadow: 'none',
			},
		},
	},
	MuiChip: {
		styleOverrides: {
			root: {
				border: '1px solid var(--gt-border)',
				color: 'var(--gt-text)',
			},
		},
	},
}) as ThemeOptions['components'];

/* Palette mirrors scss/foundation/_tokens.scss — one accent (deep blue),
 * warm amber reserved for earned things, slightly-cool neutral ramp. */
export const createMaterialTheme = (mode: PaletteMode = 'light'): ThemeOptions => ({
	palette: {
		mode,
		background: {
			default: mode === 'dark' ? '#0c1424' : '#f7f8fb',
			paper: mode === 'dark' ? '#141f36' : '#ffffff',
		},
		primary: {
			contrastText: '#ffffff',
			main: mode === 'dark' ? '#3766db' : '#1a56db',
		},
		secondary: {
			main: mode === 'dark' ? '#f0c268' : '#b45309',
		},
		divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(23, 34, 59, 0.1)',
		text: {
			primary: mode === 'dark' ? '#e8edf8' : '#17223b',
			secondary: mode === 'dark' ? 'rgba(232, 237, 248, 0.66)' : '#576076',
		},
		action: {
			active: mode === 'dark' ? '#e8edf8' : '#17223b',
			hover: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(26, 86, 219, 0.08)',
			selected: mode === 'dark' ? 'rgba(77, 126, 242, 0.18)' : 'rgba(26, 86, 219, 0.08)',
			disabled: mode === 'dark' ? 'rgba(232, 237, 248, 0.36)' : 'rgba(0, 0, 0, 0.26)',
			disabledBackground: mode === 'dark' ? 'rgba(232, 237, 248, 0.12)' : 'rgba(0, 0, 0, 0.12)',
		},
	},
	components: components(mode),
	shadows: shadow as ThemeOptions['shadows'],
	typography: typography as ThemeOptions['typography'],
});

/**
 * LIGHT THEME (DEFAULT)
 */
export const light = createMaterialTheme('light');
export const dark = createMaterialTheme('dark');
