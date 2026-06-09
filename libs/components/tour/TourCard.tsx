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
import { motion } from 'framer-motion';
import { Tour } from '../../types/tour/tour';
import { REACT_APP_API_URL } from '../../config';
import { formatterStr } from '../../utils';
import { hoverLift, tapPress } from '../homepage/motion';

interface TourCardProps {
	tour: Tour;
	onLike?: (tourId: string) => void;
	onSave?: (tourId: string) => void;
}

const TourCard = ({ tour, onLike, onSave }: TourCardProps) => {
	const image = tour.tourImages?.[0] ? `${REACT_APP_API_URL}/${tour.tourImages[0]}` : '/img/banner/header1.svg';
	const isLiked = !!tour.meLiked?.[0]?.myFavorite;

	return (
		<motion.div className={'tour-card-premium'} whileHover={hoverLift}>
			<div className={'tour-card-media'}>
				<Link href={`/tour/detail?id=${tour._id}`}>
					<div className={'tour-card-image'}>
						<img src={image} alt={tour.tourTitle} loading="lazy" />
						<div className={'tour-card-overlay'} />
					</div>
				</Link>
				<Chip className={'tour-card-category'} label={tour.tourCategory} size="small" />
				<div className={'tour-card-price'}>${formatterStr(tour.tourPrice)}</div>
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
						<IconButton aria-label="Save tour" onClick={() => onSave?.(tour._id)} size="small">
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
					{tour.tourLocation} · {tour.tourDuration} days
				</Typography>
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
					<Stack className={'tour-card-views'} direction="row" spacing={0.7} alignItems="center">
						<VisibilityIcon fontSize="small" />
						<Typography fontSize={13}>{tour.tourViews}</Typography>
					</Stack>
					<Typography className={'tour-card-guide'}>{tour.tourLanguage || 'Local guide'}</Typography>
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
