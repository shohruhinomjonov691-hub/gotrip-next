import React from 'react';
import Link from 'next/link';
import { GoTripAIRecommendation } from './recommendations';
import { recommendationHref } from './recommendationRoute';

interface GoTripAIRecommendationsProps {
	items: GoTripAIRecommendation[];
}

/**
 * The compact recommendation list requested for Phase 4.7 — title/location/
 * price only, each row a link into the existing detail pages (see
 * recommendationRoute.ts). Deliberately not a card grid: reuses the
 * .gt-ai-rec-* list-row styling (mirrors the existing .gt-ai-history-* rows
 * in _gotrip-ai.scss) instead of introducing a second recommendation UI.
 */
const GoTripAIRecommendations = ({ items }: GoTripAIRecommendationsProps) => {
	if (!items.length) return null;

	return (
		<ul className="gt-ai-rec-list">
			{items.map((item) => {
				const meta = [item.location, item.price !== undefined ? `$${item.price}` : null].filter(Boolean).join(' · ');
				return (
					<li className="gt-ai-rec-item" key={`${item.type}-${item.id}`}>
						<Link className="gt-ai-rec-link" href={recommendationHref(item)}>
							<span className="gt-ai-rec-text">
								<span className="gt-ai-rec-title">{item.title}</span>
								{meta && <span className="gt-ai-rec-meta">{meta}</span>}
							</span>
							<svg aria-hidden="true" className="gt-ai-rec-arrow" viewBox="0 0 24 24">
								<path d="M9 6l6 6-6 6" />
							</svg>
						</Link>
					</li>
				);
			})}
		</ul>
	);
};

export default GoTripAIRecommendations;
