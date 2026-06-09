export const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export const fadeUp = {
	hidden: { opacity: 0, y: 24 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.72, ease: easeOutExpo },
	},
};

export const staggerContainer = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.08,
		},
	},
};

export const hoverLift = {
	y: -6,
	transition: { duration: 0.28, ease: easeOutExpo },
};

export const tapPress = {
	scale: 0.97,
	transition: { duration: 0.12 },
};
