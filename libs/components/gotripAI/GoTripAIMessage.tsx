import React from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import GoTripAIAvatar from './GoTripAIAvatar';
import GoTripAIRecommendations from './GoTripAIRecommendations';
import { parseGoTripAIContent } from './recommendations';
import { GoTripAIMessageData } from './types';

interface GoTripAIMessageProps {
	message: GoTripAIMessageData;
}

const formatTimestamp = (ts: number, locale: string): string => {
	try {
		return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(new Date(ts));
	} catch {
		return new Date(ts).toLocaleTimeString();
	}
};

/**
 * A single message bubble — user, assistant, or system. `message.streaming`
 * renders a blinking cursor after the content, so this same markup already
 * supports Phase 4.2 appending real streamed `delta`s to `content` with no
 * further changes.
 */
const GoTripAIMessage = React.memo(({ message }: GoTripAIMessageProps) => {
	const { t, i18n } = useTranslation();
	const { role, content, createdAt, streaming } = message;

	if (role === 'system') {
		return (
			<div className="gt-ai-system-note" role="note">
				{content}
			</div>
		);
	}

	const isUser = role === 'user';
	// User turns never carry a recommendation block — only parse the assistant's own text.
	const { text, items } = isUser ? { text: content, items: [] } : parseGoTripAIContent(content);

	return (
		<div className={`gt-ai-msg-row gt-ai-msg-row--${role}`}>
			{!isUser && <GoTripAIAvatar size={28} />}
			<div className="gt-ai-msg-col">
				<div className={`gt-ai-bubble gt-ai-bubble--${role}`}>
					<span>{text}</span>
					{streaming && (
						<span className="gt-ai-cursor" aria-hidden="true">
							▍
						</span>
					)}
				</div>
				{!streaming && <GoTripAIRecommendations items={items} />}
				<time className="gt-ai-msg-time" dateTime={new Date(createdAt).toISOString()}>
					{isUser ? t('You') : t('GoTrip AI')} · {formatTimestamp(createdAt, i18n.language)}
				</time>
			</div>
		</div>
	);
});

GoTripAIMessage.displayName = 'GoTripAIMessage';

export default GoTripAIMessage;
