import React from 'react';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from '../../i18n/useTranslation';
import GoTripAIAvatar from './GoTripAIAvatar';
import { GoTripAIPanel } from './useGoTripAI';

interface GoTripAIHeaderProps {
	panel: GoTripAIPanel;
	/** Guests have no saved history, so the history toggle is hidden for them. */
	showHistory?: boolean;
	onTogglePanel: () => void;
	onNewChat: () => void;
	onClose: () => void;
}

/** Premium window header: avatar + "GoTrip AI" + subtitle, history toggle, new chat, close. */
const GoTripAIHeader = ({ panel, showHistory = true, onTogglePanel, onNewChat, onClose }: GoTripAIHeaderProps) => {
	const { t } = useTranslation();

	return (
		<header className="gt-ai-header">
			<div className="gt-ai-header-identity">
				<GoTripAIAvatar size={40} animated />
				<div>
					<h2 className="gt-ai-header-title">{t('GoTrip AI')}</h2>
					<p className="gt-ai-header-subtitle">{t('Your Intelligent Travel Assistant')}</p>
				</div>
			</div>
			<div className="gt-ai-header-actions">
				{showHistory && (
					<button
						type="button"
						className="gt-ai-icon-btn"
						aria-pressed={panel === 'history'}
						aria-label={t('Conversation history') as string}
						onClick={onTogglePanel}
					>
						<HistoryOutlinedIcon fontSize="small" />
					</button>
				)}
				<button type="button" className="gt-ai-icon-btn" aria-label={t('New chat') as string} onClick={onNewChat}>
					<AddCommentOutlinedIcon fontSize="small" />
				</button>
				<button type="button" className="gt-ai-icon-btn" aria-label={t('Close GoTrip AI') as string} onClick={onClose}>
					<CloseIcon fontSize="small" />
				</button>
			</div>
		</header>
	);
};

export default GoTripAIHeader;
