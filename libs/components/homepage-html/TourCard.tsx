import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { useTranslation } from '../../i18n/useTranslation';
import { getLocalizedField } from '../../i18n/localization';
import { userVar } from '../../../apollo/store';
import { Message } from '../../enums/common.enum';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import {
	ArrowIcon,
	ClockIcon,
	CommentsIcon,
	HeartIcon,
	PinIcon,
	SeatsIcon,
	TravelersIcon,
	ViewsIcon,
} from './tourCardIcons';
import { Tour } from '../../types/tour/tour';
import { getImageUrl } from '../../config';

const CATEGORY_LABELS: Partial<Record<string, string>> = {
	CRUISE: 'CRUISES',
};

interface TourCardProps {
	tour: Tour;
	focus?: boolean;
	/** Extra info row (guide + seats) — used by the Tour list, omitted on the Home carousels. */
	detailed?: boolean;
	/**
	 * When provided the heart persists the like through GraphQL instead of only
	 * toggling locally (Home carousels are read-only, the Tour list is not).
	 */
	onLike?: (tourId: string) => void;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
}

const TourCard = ({ tour, focus, detailed, onLike, onMouseEnter, onMouseLeave }: TourCardProps) => {
	const { t } = useTranslation();
	const { locale } = useRouter();
	const user = useReactiveVar(userVar);
	const localizedTitle = getLocalizedField(tour, 'tourTitle', locale ?? 'en');
	const localizedDesc = getLocalizedField(tour, 'tourDesc', locale ?? 'en');
	const [localLiked, setLocalLiked] = useState(!!tour.meLiked?.[0]?.myFavorite);
	// With a persist handler the server value is authoritative (it refetches);
	// without one the heart is a local-only affordance on the Home carousels.
	const liked = onLike ? !!tour.meLiked?.[0]?.myFavorite : localLiked;

	/**
	 * Liking is for signed-in travellers only. A guest previously got a local
	 * toggle that looked like a like but saved nothing; now they get the standard
	 * "Please login first!" alert and stay exactly where they are.
	 */
	const likeClickHandler = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (!user?._id) {
			sweetMixinErrorAlert(Message.NOT_AUTHENTICATED).then();
			return;
		}
		if (onLike) onLike(tour._id);
		else setLocalLiked((v) => !v);
	};

	return (
		<Link
			className={`mp-card${focus ? ' focus' : ''}${detailed ? ' detailed' : ''}`}
			href={`/tour/detail?id=${tour._id}`}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
		>
			<div className="mp-media">
				<img alt={localizedTitle} loading="lazy" src={getImageUrl(tour.tourImages[0])} />
				<span className="mp-cat">{t(CATEGORY_LABELS[tour.tourCategory] ?? tour.tourCategory)}</span>
				<button
					aria-label={(liked ? t('Remove from saved tours') : t('Save tour')) as string}
					aria-pressed={user?._id ? liked : undefined}
					className={liked ? 'mp-like on' : 'mp-like'}
					onClick={likeClickHandler}
					type="button"
				>
					<HeartIcon />
				</button>
				<span className="mp-price">
					<small>{t('FROM')}</small>
					<b>${tour.tourPrice.toLocaleString('en-US')}</b>
				</span>
			</div>
			<div className="mp-body">
				<h3 className="mp-title">{localizedTitle}</h3>
				{!!tour.tourRating && (
					<div className="mp-rate">
						<span className="stars">★★★★★</span> ({tour.tourRating.toFixed(1)} {t('Rating')})
					</div>
				)}
				<div className="mp-loc">
					<PinIcon /> {tour.tourLocation} · {tour.tourDuration} {t('DAYS')}
				</div>
				{localizedDesc && <p className="mp-desc">{localizedDesc}</p>}
				<div className="mp-chips">
					<span className="mp-chip">
						<TravelersIcon />
						{tour.tourMinPeople}–{tour.tourMaxPeople} {t('travelers')}
					</span>
					<span className="mp-chip">
						<SeatsIcon />
						{tour.tourAvailableSeats} {t('seats')}
					</span>
				</div>
				<div className="mp-meta">
					<span>
						<ViewsIcon />
						{tour.tourViews}
					</span>
					{/* This slot is the comment count — it was bound to tourLikes, which is
					    why posting a review never appeared to change anything here. */}
					<span>
						<CommentsIcon />
						{tour.tourComments}
					</span>
					{detailed && tour.memberData && (
						<span className="mp-guide">
							<img
								alt=""
								loading="lazy"
								src={getImageUrl(tour.memberData.memberImage, '/img/profile/defaultUser.svg')}
							/>
							{tour.memberData.memberFullName || tour.memberData.memberNick}
						</span>
					)}
				</div>
				<div className="mp-foot">
					<span className="mp-days">
						<ClockIcon />
						{tour.tourDuration} {t('Days')}
					</span>
					<span className="mp-btn">
						{t('View tour')} <ArrowIcon />
					</span>
				</div>
			</div>
		</Link>
	);
};

export default TourCard;
