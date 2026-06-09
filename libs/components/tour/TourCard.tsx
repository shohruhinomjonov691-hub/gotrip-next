import React from 'react';
import Link from 'next/link';
import { Button, Chip, IconButton, Stack, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Tour } from '../../types/tour/tour';
import { REACT_APP_API_URL } from '../../config';
import { formatterStr } from '../../utils';

interface TourCardProps {
	tour: Tour;
	onLike?: (tourId: string) => void;
	onSave?: (tourId: string) => void;
}

const TourCard = ({ tour, onLike, onSave }: TourCardProps) => {
	const image = tour.tourImages?.[0] ? `${REACT_APP_API_URL}/${tour.tourImages[0]}` : '/img/banner/header1.svg';
	const isLiked = !!tour.meLiked?.[0]?.myFavorite;

	return (
		<Stack
			sx={{
				border: '1px solid #e7e7e7',
				borderRadius: '8px',
				overflow: 'hidden',
				bgcolor: '#fff',
				minHeight: 430,
			}}
		>
			<Link href={`/tour/detail?id=${tour._id}`}>
				<div style={{ height: 220, cursor: 'pointer', overflow: 'hidden', backgroundColor: '#f5f5f5' }}>
					<img
						src={image}
						alt={tour.tourTitle}
						style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
					/>
				</div>
			</Link>
			<Stack spacing={1.2} sx={{ p: 2, flex: 1 }}>
				<Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
					<Chip label={tour.tourCategory} size="small" />
					<Typography fontWeight={700}>${formatterStr(tour.tourPrice)}</Typography>
				</Stack>
				<Link href={`/tour/detail?id=${tour._id}`}>
					<Typography sx={{ cursor: 'pointer' }} fontSize={18} fontWeight={700} lineHeight={1.25}>
						{tour.tourTitle}
					</Typography>
				</Link>
				<Typography color="text.secondary" fontSize={14}>
					{tour.tourLocation} · {tour.tourDuration} days · {tour.tourMinPeople}-{tour.tourMaxPeople} travelers
				</Typography>
				<Typography color="text.secondary" fontSize={14}>
					{tour.tourAvailableSeats} seats available
				</Typography>
				<Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 'auto' }}>
					<Stack direction="row" spacing={1} alignItems="center">
						<VisibilityIcon fontSize="small" />
						<Typography fontSize={13}>{tour.tourViews}</Typography>
					</Stack>
					<Stack direction="row" spacing={0.5}>
						<IconButton aria-label="Like tour" onClick={() => onLike?.(tour._id)} size="small">
							{isLiked ? <FavoriteIcon color="primary" /> : <FavoriteBorderIcon />}
						</IconButton>
						<IconButton aria-label="Save tour" onClick={() => onSave?.(tour._id)} size="small">
							<BookmarkAddOutlinedIcon />
						</IconButton>
					</Stack>
				</Stack>
				<Link href={`/tour/detail?id=${tour._id}`}>
					<Button variant="outlined" fullWidth>
						View tour
					</Button>
				</Link>
			</Stack>
		</Stack>
	);
};

export default TourCard;
