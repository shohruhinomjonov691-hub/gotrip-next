import React from 'react';
import { useTranslation } from '../../i18n/useTranslation';

/**
 * The single GoTrip brand mark.
 *
 * Previously the artwork lived inline inside GthHeader while the admin panel
 * used `/img/logo/logoText.svg` — a different, older asset whose wordmark is
 * `fill="#FFFFFF"` (plus a coral `#EB6753` that is not a GoTrip colour). On the
 * light admin sidebar that white wordmark was invisible. Extracting the header's
 * artwork here gives both surfaces literally the same component instead of two
 * drifting copies.
 *
 * `idSuffix` namespaces the gradient's id: SVG ids are document-global, so two
 * instances on one page would otherwise collide and the second would render
 * against the first's gradient.
 */

type Props = {
	/** Renders the "GoTrip / EXPLORE WORLD" wordmark beside the mark. */
	withWordmark?: boolean;
	/** Extra class on the root element. */
	className?: string;
	/** Unique-per-instance suffix for internal SVG ids. */
	idSuffix?: string;
};

const GoTripLogo = ({ withWordmark = true, className = '', idSuffix = 'gth' }: Props) => {
	const { t } = useTranslation();
	const gradientId = `${idSuffix}-gl`;

	return (
		<>
			<svg aria-label={t('GoTrip logo') as string} className={`logo ${className}`.trim()} role="img" viewBox="0 0 64 64">
				<defs>
					<linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="1">
						<stop offset="0" stopColor="#1fb6dd" />
						<stop offset="1" stopColor="#0d7f9f" />
					</linearGradient>
				</defs>
				<circle cx="30" cy="34" fill={`url(#${gradientId})`} r="17" />
				<g fill="none" opacity={0.62} stroke="#fff" strokeWidth="1.3">
					<path d="M13 34h34" />
					<path d="M30 17c6.5 7 6.5 27 0 34" />
					<path d="M30 17c-6.5 7-6.5 27 0 34" />
					<path d="M16.5 25.5c8 3.6 19 3.6 27 0" />
					<path d="M16.5 42.5c8-3.6 19-3.6 27 0" />
				</g>
				<ellipse
					cx="32"
					cy="32"
					fill="none"
					opacity={0.55}
					rx="27"
					ry="12"
					stroke="#0d7f9f"
					strokeDasharray="52 120"
					strokeLinecap="round"
					strokeWidth="2.4"
					transform="rotate(-24 32 32)"
				/>
				<ellipse
					cx="32"
					cy="32"
					fill="none"
					rx="27"
					ry="12"
					stroke="#16a3c8"
					strokeDasharray="70 120"
					strokeDashoffset="-96"
					strokeLinecap="round"
					strokeWidth="2.6"
					transform="rotate(-24 32 32)"
				/>
				<g transform="translate(46,15) rotate(28)">
					<path d="M0 4 L20 0 L14.5 5.5 L11 15 L8.4 7.6 L1.5 9.5 Z" fill="#103b42" />
					<path d="M6 4.6 L11.5 1.8 L8.6 5.4 Z" fill="#16a3c8" />
				</g>
			</svg>
			{withWordmark && (
				<span className="txt">
					<b>
						Go<i>Trip</i>
					</b>
					<small>EXPLORE WORLD</small>
				</span>
			)}
		</>
	);
};

export default GoTripLogo;
