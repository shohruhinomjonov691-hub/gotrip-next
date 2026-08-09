import React from 'react';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import PlaceIcon from '@mui/icons-material/Place';
import EventNoteIcon from '@mui/icons-material/EventNote';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import DescriptionIcon from '@mui/icons-material/Description';
import AttractionsIcon from '@mui/icons-material/Attractions';
import SavingsIcon from '@mui/icons-material/Savings';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import HikingIcon from '@mui/icons-material/Hiking';
import { useTranslation } from '../../i18n/useTranslation';

const SUGGESTIONS = [
	{ label: 'Find the best tours', Icon: TravelExploreIcon },
	{ label: 'Recommend destinations', Icon: PlaceIcon },
	{ label: 'Plan my trip', Icon: EventNoteIcon },
	{ label: 'Travel tips', Icon: LightbulbIcon },
	{ label: 'Visa information', Icon: DescriptionIcon },
	{ label: 'Popular attractions', Icon: AttractionsIcon },
	{ label: 'Budget planner', Icon: SavingsIcon },
	{ label: 'Family trips', Icon: FamilyRestroomIcon },
	{ label: 'Adventure tours', Icon: HikingIcon },
] as const;

interface GoTripAISuggestionsProps {
	onSelect: (label: string) => void;
}

/**
 * Placeholder suggestion cards (Phase 4.1: UI only — selecting one just sends
 * its label like any typed message, into the same placeholder-reply pipeline
 * in useGoTripAI). Phase 4.2 can keep this list, wire it to the 5 context
 * sources, or make it dynamic — the card grid itself doesn't need to change.
 */
const GoTripAISuggestions = ({ onSelect }: GoTripAISuggestionsProps) => {
	const { t } = useTranslation();

	return (
		<div className="gt-ai-suggestions" role="list" aria-label={t('Suggested prompts') as string}>
			{SUGGESTIONS.map(({ label, Icon }) => (
				<button
					key={label}
					type="button"
					role="listitem"
					className="gt-ai-suggestion-card"
					onClick={() => onSelect(t(label) as string)}
				>
					<Icon className="gt-ai-suggestion-icon" aria-hidden="true" />
					<span>{t(label)}</span>
				</button>
			))}
		</div>
	);
};

export default GoTripAISuggestions;
