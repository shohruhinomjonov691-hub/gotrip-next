import { GoTripAIRecommendation } from './recommendations';

/**
 * Maps a recommendation to the SAME URL patterns already used everywhere
 * else in the app (TourCard, GuideCard, ArticleCard, Footer's CS links) —
 * no new routes, no new detail pages. Destination and Notice/FAQ have no
 * standalone detail page today, so — matching how GthDestinations and the
 * Footer already link — they route to the existing list/tab views instead.
 */
export function recommendationHref(rec: GoTripAIRecommendation): string {
	switch (rec.type) {
		case 'tour':
			return `/tour/detail?id=${rec.id}`;
		case 'guide':
			return `/agent/detail?agentId=${rec.id}`;
		case 'article':
			return `/community/detail?id=${rec.id}&articleCategory=${rec.category || 'FREE'}`;
		case 'destination':
			return `/tour?destination=${rec.id}`;
		case 'notice': {
			const tab = (rec.category || 'FAQ').toLowerCase();
			const known = tab === 'terms' || tab === 'inquiry' ? tab : 'faq';
			return `/cs?tab=${known}`;
		}
		default:
			return '/';
	}
}
