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
				borderRadius: 'var(--gt-radius-sm)',
				transition: 'background-color 180ms ease, border-color 180ms ease, color 180ms ease, box-shadow 180ms ease, transform 180ms ease',
				ButtonText: {
					color: 'var(--gt-text)',
				},
				'&:active': {
					transform: 'translateY(1px)',
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
				border: '1px solid var(--gt-border)',
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
					color: 'var(--gt-blue)',
				},
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

export const createMaterialTheme = (mode: PaletteMode = 'light'): ThemeOptions => ({
	palette: {
		mode,
		background: {
			default: mode === 'dark' ? '#00132e' : '#f4f7ff',
			paper: mode === 'dark' ? '#021f43' : '#ffffff',
		},
		primary: {
			contrastText: '#ffffff',
			main: '#0049e3',
		},
		secondary: {
			main: '#d4af37',
		},
		divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 41, 77, 0.1)',
		text: {
			primary: mode === 'dark' ? '#d6e3ff' : '#001b3d',
			secondary: mode === 'dark' ? '#b7c3d6' : '#455873',
		},
		action: {
			active: mode === 'dark' ? '#d6e3ff' : '#001b3d',
			hover: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(50, 100, 255, 0.08)',
			selected: mode === 'dark' ? 'rgba(50, 100, 255, 0.18)' : 'rgba(50, 100, 255, 0.08)',
			disabled: mode === 'dark' ? 'rgba(214, 227, 255, 0.36)' : 'rgba(0, 0, 0, 0.26)',
			disabledBackground: mode === 'dark' ? 'rgba(214, 227, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
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
