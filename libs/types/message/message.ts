import { Member } from '../member/member';

export enum MessageStatus {
	SENT = 'SENT',
	READ = 'READ',
	DELETED = 'DELETED',
}

export interface MessageAttachment {
	url: string;
	fileName: string;
	fileSize: number;
	mimeType: string;
}

export interface Message {
	_id: string;
	conversationId: string;
	senderId: string;
	receiverId: string;
	messageText: string;
	messageImages?: string[];
	messageFiles?: MessageAttachment[];
	messageStatus: MessageStatus;
	readAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	senderData?: Member;
}

export interface Conversation {
	_id: string;
	participants: string[];
	lastMessageText?: string;
	lastMessageAt?: Date;
	lastMessageSenderId?: string;
	lastActivityAt: Date;
	createdAt: Date;
	updatedAt: Date;
	partner?: Member;
	unreadCount: number;
}
