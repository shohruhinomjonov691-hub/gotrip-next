import React, { useState } from 'react';
import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useTranslation } from '../../i18n/useTranslation';
import { GoTripAIConversation } from './types';

interface GoTripAIHistoryProps {
	conversations: GoTripAIConversation[];
	activeId: string | null;
	onSelect: (id: string) => void;
	onNew: () => void;
	onRename: (id: string, title: string) => void;
	onDelete: (id: string) => void;
}

/** Conversation history panel — previous chats, new chat, rename, delete. UI-only: everything lives in useGoTripAI's localStorage-backed state, no backend calls. */
const GoTripAIHistory = ({ conversations, activeId, onSelect, onNew, onRename, onDelete }: GoTripAIHistoryProps) => {
	const { t } = useTranslation();
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editValue, setEditValue] = useState('');

	const startRename = (conversation: GoTripAIConversation) => {
		setEditingId(conversation.id);
		setEditValue(conversation.title);
	};

	const commitRename = () => {
		if (editingId) onRename(editingId, editValue);
		setEditingId(null);
	};

	return (
		<div className="gt-ai-history">
			<button type="button" className="gt-ai-new-chat" onClick={onNew}>
				<AddCommentOutlinedIcon fontSize="small" />
				{t('New chat')}
			</button>

			{conversations.length === 0 ? (
				<div className="gt-ai-history-empty">{t('No previous chats yet')}</div>
			) : (
				<ul className="gt-ai-history-list" role="list">
					{conversations.map((conversation) => {
						const isEditing = editingId === conversation.id;
						const preview = conversation.messages[conversation.messages.length - 1]?.content ?? t('No messages yet');

						return (
							<li key={conversation.id} className={`gt-ai-history-item${conversation.id === activeId ? ' active' : ''}`}>
								{isEditing ? (
									<div className="gt-ai-history-edit">
										<input
											autoFocus
											aria-label={t('Rename conversation') as string}
											value={editValue}
											onChange={(e) => setEditValue(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === 'Enter') commitRename();
												if (e.key === 'Escape') setEditingId(null);
											}}
										/>
										<button type="button" aria-label={t('Save') as string} onClick={commitRename}>
											<CheckIcon fontSize="small" />
										</button>
										<button type="button" aria-label={t('Cancel') as string} onClick={() => setEditingId(null)}>
											<CloseIcon fontSize="small" />
										</button>
									</div>
								) : (
									<>
										<button type="button" className="gt-ai-history-select" onClick={() => onSelect(conversation.id)}>
											<ChatBubbleOutlineIcon fontSize="small" className="gt-ai-history-icon" />
											<span className="gt-ai-history-text">
												<span className="gt-ai-history-title">{conversation.title}</span>
												<span className="gt-ai-history-preview">{preview}</span>
											</span>
										</button>
										<div className="gt-ai-history-actions">
											<button
												type="button"
												aria-label={t('Rename conversation') as string}
												onClick={() => startRename(conversation)}
											>
												<EditOutlinedIcon fontSize="small" />
											</button>
											<button
												type="button"
												aria-label={t('Delete conversation') as string}
												onClick={() => onDelete(conversation.id)}
											>
												<DeleteOutlineIcon fontSize="small" />
											</button>
										</div>
									</>
								)}
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
};

export default GoTripAIHistory;
