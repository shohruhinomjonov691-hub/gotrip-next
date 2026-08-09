import React, { useEffect, useRef } from 'react';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import { useTranslation } from '../../i18n/useTranslation';

interface GoTripAIInputProps {
	value: string;
	onChange: (value: string) => void;
	onSend: () => void;
	disabled?: boolean;
	/** While true, the send button becomes a Stop button (same slot, same class — no new UI element). */
	isStreaming?: boolean;
	onStop?: () => void;
}

/** Auto-resizing input box + send button. Enter sends, Shift+Enter inserts a newline. */
const GoTripAIInput = ({ value, onChange, onSend, disabled, isStreaming, onStop }: GoTripAIInputProps) => {
	const { t } = useTranslation();
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		const el = textareaRef.current;
		if (!el) return;
		el.style.height = 'auto';
		el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
	}, [value]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			if (value.trim() && !disabled && !isStreaming) onSend();
		}
	};

	return (
		<div className="gt-ai-input-bar">
			<textarea
				ref={textareaRef}
				rows={1}
				className="gt-ai-input"
				placeholder={t('Ask GoTrip AI anything about your trip…') as string}
				aria-label={t('Message GoTrip AI') as string}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onKeyDown={handleKeyDown}
			/>
			{isStreaming ? (
				<button type="button" className="gt-ai-send-btn" aria-label={t('Stop generating') as string} onClick={onStop}>
					<StopRoundedIcon fontSize="small" />
				</button>
			) : (
				<button
					type="button"
					className="gt-ai-send-btn"
					aria-label={t('Send message') as string}
					disabled={disabled || !value.trim()}
					onClick={onSend}
				>
					<SendRoundedIcon fontSize="small" />
				</button>
			)}
		</div>
	);
};

export default GoTripAIInput;
