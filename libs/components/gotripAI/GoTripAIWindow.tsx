import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from '../../i18n/useTranslation';
import GoTripAIHeader from './GoTripAIHeader';
import GoTripAIHistory from './GoTripAIHistory';
import GoTripAIMessage from './GoTripAIMessage';
import GoTripAITyping from './GoTripAITyping';
import GoTripAISuggestions from './GoTripAISuggestions';
import GoTripAIInput from './GoTripAIInput';
import GoTripAIAvatar from './GoTripAIAvatar';
import { useGoTripAI } from './GoTripAIProvider';

const MotionSection = motion.section;
const MotionDiv = motion.div;

/**
 * The chat window shell — composes every GoTripAI* piece and owns nothing
 * but layout; all state lives in useGoTripAI. This is also the seam Phase
 * 4.2 integrates through: swap useGoTripAI's `requestAssistantReply` stub
 * for a real provider call and every component here keeps working as-is.
 */
const GoTripAIWindow = () => {
	const { t } = useTranslation();
	const {
		isOpen,
		close,
		panel,
		openPanel,
		conversations,
		activeConversation,
		draft,
		setDraft,
		isTyping,
		isSending,
		isStreaming,
		stopStreaming,
		sendMessage,
		sendSuggestion,
		startNewConversation,
		selectConversation,
		renameConversation,
		deleteConversation,
	} = useGoTripAI();

	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!scrollRef.current) return;
		scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
	}, [activeConversation?.messages.length, isTyping, panel]);

	// Escape closes the panel, matching standard dialog/popover keyboard behavior.
	useEffect(() => {
		if (!isOpen) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') close();
		};
		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [isOpen, close]);

	// Clicking outside the window (and outside the launcher, which already
	// toggles on its own click) closes it; clicking anywhere inside — the
	// window itself, or any portal it renders (menus, etc.) — must not.
	// mousedown (not click) so this resolves before the launcher's own
	// onClick, avoiding a close-then-reopen double-toggle on the same click.
	useEffect(() => {
		if (!isOpen) return;
		const handlePointerDown = (e: MouseEvent) => {
			const target = e.target as HTMLElement | null;
			if (target?.closest('.gt-ai-window') || target?.closest('.gt-ai-launcher')) return;
			close();
		};
		document.addEventListener('mousedown', handlePointerDown);
		return () => document.removeEventListener('mousedown', handlePointerDown);
	}, [isOpen, close]);

	const messages = activeConversation?.messages ?? [];
	const showSuggestions = panel === 'chat' && messages.length === 0;

	return (
		<AnimatePresence>
			{isOpen && (
				<React.Fragment>
					{/* Mobile-only floating-panel backdrop — display:none above 599px
					    (see scss/pc/_gotrip-ai.scss), so this is a no-op on desktop.
					    Purely decorative: the existing document-level mousedown
					    listener below already closes the window on outside clicks. */}
					<MotionDiv className="gt-ai-backdrop" aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} />
					<MotionSection
						id="gotrip-ai-window"
						className="gt-ai-window"
						role="dialog"
						aria-modal="false"
						aria-label={t('GoTrip AI') as string}
						initial={{ opacity: 0, y: 24, scale: 0.96 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 16, scale: 0.97 }}
						transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
					>
					<GoTripAIHeader
						panel={panel}
						onTogglePanel={() => openPanel(panel === 'history' ? 'chat' : 'history')}
						onNewChat={startNewConversation}
						onClose={close}
					/>

					{panel === 'history' ? (
						<GoTripAIHistory
							conversations={conversations}
							activeId={activeConversation?.id ?? null}
							onSelect={selectConversation}
							onNew={startNewConversation}
							onRename={renameConversation}
							onDelete={deleteConversation}
						/>
					) : (
						<>
							<div className="gt-ai-body" ref={scrollRef}>
								{showSuggestions ? (
									<div className="gt-ai-welcome">
										<GoTripAIAvatar size={56} animated />
										<h3>{t('How can I help you plan your trip?')}</h3>
										<p>{t('Ask me anything, or try one of these to get started.')}</p>
										<GoTripAISuggestions onSelect={sendSuggestion} />
									</div>
								) : (
									<div className="gt-ai-messages">
										<AnimatePresence initial={false}>
											{messages.map((message) => (
												<MotionDiv
													key={message.id}
													initial={{ opacity: 0, y: 10 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
												>
													<GoTripAIMessage message={message} />
												</MotionDiv>
											))}
										</AnimatePresence>
										{isTyping && <GoTripAITyping />}
									</div>
								)}
							</div>

							<GoTripAIInput
								value={draft}
								onChange={setDraft}
								onSend={() => sendMessage(draft)}
								disabled={isSending}
								isStreaming={isStreaming}
								onStop={stopStreaming}
							/>
						</>
					)}
				</MotionSection>
				</React.Fragment>
			)}
		</AnimatePresence>
	);
};

export default GoTripAIWindow;
