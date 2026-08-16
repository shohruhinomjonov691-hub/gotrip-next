import React from 'react';

/* Icons for the "Meet With Tour Guide" feature-icon strip. Same inline-SVG
   convention as tourCardIcons.tsx (viewBox 0 0 24 24, stroke-only). Location
   reuses PinIcon from tourCardIcons.tsx directly rather than redrawing it. */

export const LifebuoyIcon = () => (
	<svg viewBox="0 0 24 24">
		<circle cx="12" cy="12" r="9" />
		<circle cx="12" cy="12" r="3.6" />
		<path d="M12 3v5.4M12 15.6V21M3 12h5.4M15.6 12H21M5.8 5.8l3.8 3.8M14.4 14.4l3.8 3.8M18.2 5.8l-3.8 3.8M9.6 14.4l-3.8 3.8" />
	</svg>
);

export const GuideHatIcon = () => (
	<svg viewBox="0 0 24 24">
		<path d="M3.5 16c1.7-4.6 5-7 8.5-7s6.8 2.4 8.5 7" />
		<ellipse cx="12" cy="16" rx="9.5" ry="2.3" />
		<path d="M9.5 9.2V6.5a2.5 2.5 0 015 0v2.7" />
	</svg>
);

export const CompassIcon = () => (
	<svg viewBox="0 0 24 24">
		<circle cx="12" cy="12" r="9" />
		<path d="M15 9l-2 6-6 2 2-6z" />
	</svg>
);

export const StarIcon = () => (
	<svg viewBox="0 0 24 24">
		<path d="M12 3.5l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z" />
	</svg>
);

export const CameraIcon = () => (
	<svg viewBox="0 0 24 24">
		<path d="M4 8h3l1.6-2.3h6.8L17 8h3a1.5 1.5 0 011.5 1.5v8A1.5 1.5 0 0120 19H4a1.5 1.5 0 01-1.5-1.5v-8A1.5 1.5 0 014 8z" />
		<circle cx="12" cy="13" r="3.4" />
	</svg>
);

export const TicketIcon = () => (
	<svg viewBox="0 0 24 24">
		<path d="M3 9a2 2 0 012-2h14a2 2 0 012 2v1.2a1.6 1.6 0 000 3.2V15a2 2 0 01-2 2H5a2 2 0 01-2-2v-1.6a1.6 1.6 0 000-3.2z" />
		<path d="M14 7v10" strokeDasharray="2.4 2.4" />
	</svg>
);

export const PassportIcon = () => (
	<svg viewBox="0 0 24 24">
		<rect height="17" rx="2" width="13" x="5.5" y="3.5" />
		<circle cx="12" cy="9.5" r="2.3" />
		<path d="M8.5 15.5h7M9.5 18h5" />
	</svg>
);
