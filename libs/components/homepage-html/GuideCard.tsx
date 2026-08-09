import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from '../../i18n/useTranslation';
import { ViewsIcon, HeartIcon } from './tourCardIcons';
import { FacebookIcon, InstagramIcon, LinkedInIcon, XIcon, YouTubeIcon } from './socialIcons';
import { Member } from '../../types/member/member';
import { getImageUrl } from '../../config';
import { getLocalizedField } from '../../i18n/localization';

const SOCIAL_KEYS = [
	{ key: 'facebook', label: 'Facebook', cls: 'fb', Icon: FacebookIcon },
	{ key: 'twitter', label: 'X (Twitter)', cls: 'tw', Icon: XIcon },
	{ key: 'linkedin', label: 'LinkedIn', cls: 'li', Icon: LinkedInIcon },
	{ key: 'youtube', label: 'YouTube', cls: 'yt', Icon: YouTubeIcon },
	{ key: 'instagram', label: 'Instagram', cls: 'ig', Icon: InstagramIcon },
] as const;

interface GuideCardProps {
	guide: Member;
	/** Highlighted state used by the Home carousel. */
	active?: boolean;
	/**
	 * Lets a draggable carousel suppress the click that ends a drag. Returning false
	 * cancels navigation.
	 */
	canNavigate?: () => boolean;
}

/**
 * Single guide card shared by the Home "Meet With Tour Guide" carousel and the Guides
 * page grid, so both stay visually identical from one definition.
 */
const GuideCard = ({ guide, active, canNavigate }: GuideCardProps) => {
	const { t } = useTranslation();
	const router = useRouter();
	const locale = router.locale ?? 'en';
	const socials = SOCIAL_KEYS.filter(({ key }) => guide.memberSocial?.[key]);
	const name = guide.memberFullName || guide.memberNick;
	const localizedDesc = getLocalizedField(guide, 'memberDesc', locale);

	return (
		<article className={active ? 'tg-card on' : 'tg-card'}>
			{/*
			 * Stretched link: a real <a> covering the card, rather than a click
			 * handler on the <article>. That keeps proper link semantics (href,
			 * keyboard, ⌘/middle-click, open-in-new-tab) while leaving the social
			 * anchors as siblings — nesting <a> inside <a> is invalid and is what
			 * makes such cards navigate unreliably.
			 */}
			<Link
				aria-label={t('View {{name}}\'s guide profile', { name }) as string}
				className="tg-link"
				href={`/agent/detail?agentId=${guide._id}`}
				onClick={(e) => {
					// Swallow the click that ends a carousel drag.
					if (canNavigate && !canNavigate()) e.preventDefault();
				}}
			/>
			<div className="tg-cover">
				{guide.memberCoverImage && <img alt="" loading="lazy" src={getImageUrl(guide.memberCoverImage)} />}
				<span className="tg-tours">{guide.memberTours} {t('tours')}</span>
			</div>
			<div className="tg-av">
				<img alt={name} loading="lazy" src={getImageUrl(guide.memberImage)} />
			</div>
			<div className="tg-panel">
				<h3 className="tg-name">{name}</h3>
				<p className="tg-role">{localizedDesc || guide.agentExperience || t('Guide / Operator')}</p>
				<div className="tg-stats">
					<span>
						<ViewsIcon />
						{guide.memberViews}
					</span>
					<span className="lk">
						<HeartIcon />
						{guide.memberLikes}
					</span>
				</div>
				{socials.length > 0 && (
					<div className="tg-soc">
						{socials.map(({ key, label, cls, Icon }) => (
							<a
								aria-label={t('{{name}} on {{label}}', { name, label: t(label) }) as string}
								className={cls}
								href={guide.memberSocial?.[key]}
								key={key}
								rel="noopener noreferrer"
								target="_blank"
							>
								<Icon />
							</a>
						))}
					</div>
				)}
			</div>
		</article>
	);
};

export default GuideCard;
