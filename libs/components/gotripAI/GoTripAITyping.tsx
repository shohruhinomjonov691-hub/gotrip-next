import React from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import GoTripAIAvatar from './GoTripAIAvatar';

/** Three-dot typing indicator, shown while a reply is being prepared (Phase 4.1: the placeholder demo delay; Phase 4.2: the real time-to-first-token). */
const GoTripAITyping = () => {
	const { t } = useTranslation();

	return (
		<div className="gt-ai-msg-row gt-ai-msg-row--assistant" role="status" aria-live="polite">
			<GoTripAIAvatar size={28} />
			<div className="gt-ai-typing" aria-label={t('GoTrip AI is typing') as string}>
				<span className="gt-ai-typing-dot" />
				<span className="gt-ai-typing-dot" />
				<span className="gt-ai-typing-dot" />
			</div>
		</div>
	);
};

export default GoTripAITyping;
