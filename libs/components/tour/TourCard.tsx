import React from 'react';
import Link from 'next/link';
import { Button, Chip, IconButton, Stack, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import { motion } from 'framer-motion';
import { Tour } from '../../types/tour/tour';
import { TourStatus } from '../../enums/tour.enum';
import { REACT_APP_API_URL } from '../../config';
import { formatterStr } from '../../utils';
import { hoverLift, tapPress } from '../homepage/motion';
import { getFallbackImage } from '../homepage/homepageFallbacks';

interface TourCardProps {
	tour: Tour;
	onLike?: (tourId: string) => void;
	onSave?: (tourId: string) => void;
}

const TourCard = ({ tour, onLike, onSave }: TourCardProps) => {
	const fallbackImage = getFallbackImage(tour._id || tour.tourTitle);
	const image = tour.tourImages?.[0] ? `${REACT_APP_API_URL}/${tour.tourImages[0]}` : fallbackImage;
	const isLiked = !!tour.meLiked?.[0]?.myFavorite;
	const isAvailable = tour.tourStatus === TourStatus.ACTIVE && tour.tourAvailableSeats > 0;
	const operatorName = tour.memberData?.memberFullName || tour.memberData?.memberNick || 'Local operator';
	const description = tour.tourDesc || 'A curated GoTrip experience with local guidance and thoughtfully planned stops.';

	return (
		<motion.div className={'tour-card-premium'} whileHover={hoverLift}>
			<div className={'tour-card-media'}>
				<Link href={`/tour/detail?id=${tour._id}`}>
					<div className={'tour-card-image'}>
						<img
							src={image}
							alt={tour.tourTitle}
							loading="lazy"
							onError={(event) => {
								if (event.currentTarget.src.includes(fallbackImage)) return;
								event.currentTarget.src = fallbackImage;
							}}
						/>
						<div className={'tour-card-overlay'} />
					</div>
				</Link>
				<Chip className={'tour-card-category'} label={tour.tourCategory} size="small" />
				<span className={isAvailable ? 'tour-card-status available' : 'tour-card-status unavailable'}>
					{isAvailable ? `${tour.tourAvailableSeats} seats available` : tour.tourStatus.replace('_', ' ')}
				</span>
				<div className={'tour-card-price'}>From ${formatterStr(tour.tourPrice)}</div>
				<div className={'tour-card-actions'}>
					<motion.div whileTap={tapPress}>
						<IconButton
							aria-label="Like tour"
							onClick={() => onLike?.(tour._id)}
							size="small"
							className={isLiked ? 'active' : ''}
						>
							{isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
						</IconButton>
					</motion.div>
					<motion.div whileTap={tapPress}>
						<IconButton aria-label="Save tour to wishlist" onClick={() => onSave?.(tour._id)} size="small">
							<BookmarkAddOutlinedIcon />
						</IconButton>
					</motion.div>
				</div>
			</div>
			<Stack className={'tour-card-body'}>
				<Link href={`/tour/detail?id=${tour._id}`}>
					<Typography className={'tour-card-title'}>
						{tour.tourTitle}
					</Typography>
				</Link>
				<Typography className={'tour-card-location'}>
					<LocationOnRoundedIcon fontSize="small" />
					{tour.tourLocation} · {tour.tourDuration} day{tour.tourDuration === 1 ? '' : 's'}
				</Typography>
				<Typography className={'tour-card-description'}>{description}</Typography>
				<Stack className={'tour-card-meta'} direction="row">
					<span>
						<GroupsOutlinedIcon fontSize="small" />
						{tour.tourMinPeople}-{tour.tourMaxPeople} travelers
					</span>
					<span>
						<EventAvailableOutlinedIcon fontSize="small" />
						{tour.tourAvailableSeats} seats
					</span>
				</Stack>
				<Stack className={'tour-card-footer'} direction="row" alignItems="center" justifyContent="space-between">
					<Stack className={'tour-card-counters'} direction="row" spacing={1.1} alignItems="center">
						<span>
							<VisibilityIcon fontSize="small" />
							{tour.tourViews}
						</span>
						<span>
							<ChatBubbleOutlineRoundedIcon fontSize="small" />
							{tour.tourComments}
						</span>
					</Stack>
					<Typography className={'tour-card-guide'}>{operatorName}</Typography>
				</Stack>
				<Link href={`/tour/detail?id=${tour._id}`}>
					<Button className={'tour-card-cta'} variant="contained" fullWidth endIcon={<ArrowForwardRoundedIcon />}>
						Check availability
					</Button>
				</Link>
			</Stack>
		</motion.div>
	);
};

export default TourCard;
