import React from 'react';

export const HeartIcon = () => (
	<svg viewBox="0 0 24 24">
		<path d="M12 20.4l-1.5-1.4C5.4 14.4 2.5 11.8 2.5 8.5 2.5 5.9 4.6 4 7.2 4c1.5 0 2.9.7 3.8 1.8l1 1.2 1-1.2C13.9 4.7 15.3 4 16.8 4 19.4 4 21.5 5.9 21.5 8.5c0 3.3-2.9 5.9-8 10.5z" />
	</svg>
);

export const PinIcon = () => (
	<svg viewBox="0 0 24 24">
		<path d="M12 21s-7-6.3-7-11a7 7 0 0114 0c0 4.7-7 11-7 11z" />
		<circle cx="12" cy="10" r="2.4" />
	</svg>
);

export const TravelersIcon = () => (
	<svg viewBox="0 0 24 24">
		<circle cx="9" cy="8" r="3.2" />
		<path d="M3 20c0-3.2 2.7-5 6-5s6 1.8 6 5" />
		<path d="M17 8.5a3 3 0 000-1M17.5 20c0-2.4-1-3.8-2.5-4.6" />
	</svg>
);

export const SeatsIcon = () => (
	<svg viewBox="0 0 24 24">
		<rect height="17" rx="2.4" width="18" x="3" y="4.5" />
		<path d="M16 2.5v4M8 2.5v4M3 10h18" />
		<path d="M9.5 15l1.6 1.6 3.4-3.4" />
	</svg>
);

export const ViewsIcon = () => (
	<svg viewBox="0 0 24 24">
		<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" />
		<circle cx="12" cy="12" r="2.6" />
	</svg>
);

export const CommentsIcon = () => (
	<svg viewBox="0 0 24 24">
		<path d="M21 11.5a8.4 8.4 0 01-9 8.4L3 21l1.1-9A8.4 8.4 0 0121 11.5z" />
	</svg>
);

export const ClockIcon = () => (
	<svg viewBox="0 0 24 24">
		<circle cx="12" cy="12" r="9" />
		<path d="M12 7v5l3 2" />
	</svg>
);

export const ArrowIcon = ({ className }: { className?: string }) => (
	<svg className={className} viewBox="0 0 24 24">
		<path d="M5 12h14M13 6l6 6-6 6" />
	</svg>
);
