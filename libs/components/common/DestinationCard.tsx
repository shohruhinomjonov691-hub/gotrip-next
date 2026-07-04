import React from 'react';
import Link from 'next/link';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import { motion } from 'framer-motion';
import { fadeUp, hoverLift, tapPress } from '../homepage/motion';
import { getFallbackImage } from '../homepage/homepageFallbacks';

interface DestinationCardProps {
	title: string;
	href: string;
	image: string;
	location?: string;
	caption?: string;
	/** Renders the vertically-offset variant used for the middle feature card. */
	offset?: boolean;
	/** Larger feature cards above the fold should load eagerly. */
	eager?: boolean;
}

const DestinationCard = ({ title, href, image, location, caption, offset = false, eager = false }: DestinationCardProps) => {
	return (
		<Link href={href}>
			<motion.div
				className={offset ? 'destination-feature-card destination-feature-card-offset' : 'destination-feature-card'}
				variants={fadeUp}
				whileHover={hoverLift}
				whileTap={tapPress}
			>
				<img
					src={image}
					alt={title}
					loading={eager ? 'eager' : 'lazy'}
					onError={(event) => {
						event.currentTarget.src = getFallbackImage(title);
					}}
				/>
				<div className="destination-feature-overlay" />
				<div className="destination-feature-copy">
					{location ? (
						<span>
							<PlaceOutlinedIcon fontSize="small" />
							{location}
						</span>
					) : null}
					<strong>{title}</strong>
					{caption ? <p>{caption}</p> : null}
				</div>
			</motion.div>
		</Link>
	);
};

export default DestinationCard;
