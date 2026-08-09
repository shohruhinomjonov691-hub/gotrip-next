import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from '../../i18n/useTranslation';
import GoTripAIAvatar from './GoTripAIAvatar';

interface GoTripAIButtonProps {
	isOpen: boolean;
	onToggle: () => void;
}

/** Floating launcher — GoTrip AI branding, idle pulse, opens/closes the window. */
const GoTripAIButton = ({ isOpen, onToggle }: GoTripAIButtonProps) => {
	const { t } = useTranslation();

	return (
		<button
			type="button"
			className={`gt-ai-launcher${isOpen ? ' is-open' : ''}`}
			aria-label={(isOpen ? t('Close GoTrip AI') : t('Open GoTrip AI')) as string}
			aria-expanded={isOpen}
			aria-controls="gotrip-ai-window"
			onClick={onToggle}
		>
			<span className="gt-ai-launcher-pulse" aria-hidden="true" />
			<span className="gt-ai-launcher-icon">{isOpen ? <CloseIcon fontSize="small" /> : <GoTripAIAvatar size={26} animated />}</span>
			{!isOpen && <span className="gt-ai-launcher-label">{t('GoTrip AI')}</span>}
		</button>
	);
};

export default GoTripAIButton;
