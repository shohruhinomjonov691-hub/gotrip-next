import React from 'react';

interface GoTripAIAvatarProps {
	size?: number;
	/** Plays the idle gradient-shimmer + pulse animation (launcher, header). Message-bubble avatars stay still. */
	animated?: boolean;
	className?: string;
}

/**
 * Single source of truth for the GoTrip AI mark — a soft gradient orb with a
 * sparkle glyph — reused by the floating launcher, the window header, and
 * every assistant message bubble so the brand reads identically everywhere.
 */
const GoTripAIAvatar = ({ size = 40, animated = false, className }: GoTripAIAvatarProps) => {
	return (
		<span
			className={`gt-ai-avatar${animated ? ' gt-ai-avatar--animated' : ''}${className ? ` ${className}` : ''}`}
			style={{ width: size, height: size }}
			aria-hidden="true"
		>
			<svg viewBox="0 0 24 24" width={Math.round(size * 0.5)} height={Math.round(size * 0.5)} fill="none">
				<path
					d="M12 2.5c.55 3.6 2.9 5.95 6.5 6.5-3.6.55-5.95 2.9-6.5 6.5-.55-3.6-2.9-5.95-6.5-6.5 3.6-.55 5.95-2.9 6.5-6.5Z"
					fill="currentColor"
				/>
				<path
					d="M18.5 16.2c.28 1.55 1.13 2.4 2.68 2.68-1.55.28-2.4 1.13-2.68 2.68-.28-1.55-1.13-2.4-2.68-2.68 1.55-.28 2.4-1.13 2.68-2.68Z"
					fill="currentColor"
				/>
			</svg>
		</span>
	);
};

export default GoTripAIAvatar;
