import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from '../../i18n/useTranslation';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import axios from 'axios';
import moment from 'moment';
import { socketVar, userVar } from '../../../apollo/store';
import { GET_MESSAGES, GET_MY_CONVERSATIONS, SEARCH_MEMBERS } from '../../../apollo/user/query';
import { MARK_CONVERSATION_READ, SEND_MESSAGE } from '../../../apollo/user/mutation';
import { getImageUrl } from '../../config';
import { getJwtToken } from '../../auth';
import { ensureMessagingSocket } from '../../messagingSocket';
import { useClickOutside } from '../../hooks/useClickOutside';
import { Conversation, Message, MessageAttachment } from '../../types/message/message';
import { Member } from '../../types/member/member';

/** Mirrors the multipart pattern already used by AddNewTour.tsx / MyProfile.tsx —
 *  no new upload transport, just a new `target`. Images go through the existing
 *  imagesUploader; documents go through the new documentsUploader (see
 *  member.resolver.ts) — same transport, same target, different mimetype
 *  allow-list, so the two are kept as separate requests. */
const MAX_ATTACHMENTS = 6;
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const DOCUMENT_MIME_TYPES = [
	'application/pdf',
	'application/msword',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'application/vnd.ms-excel',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	'application/vnd.ms-powerpoint',
	'application/vnd.openxmlformats-officedocument.presentationml.presentation',
	'text/plain',
	'application/zip',
	'application/x-zip-compressed',
];
const ACCEPTED_ATTACHMENT_TYPES = [...IMAGE_MIME_TYPES, ...DOCUMENT_MIME_TYPES].join(', ');

const formatFileSize = (bytes: number): string => {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const fileExt = (fileName: string): string => (fileName.split('.').pop() || '').toLowerCase();

/** Small line-art file-type badge, matching this screen's existing inline-SVG
 *  icon style (paperclip, send arrow, etc.) rather than pulling in an icon set. */
const FileTypeIcon = ({ fileName }: { fileName: string }) => {
	const ext = fileExt(fileName);
	const label = ext === 'docx' || ext === 'doc' ? 'DOC' : ext === 'xlsx' || ext === 'xls' ? 'XLS' : ext === 'pptx' || ext === 'ppt' ? 'PPT' : ext.toUpperCase();
	return (
		<span className={`ms-file-icon ms-file-icon--${ext}`} aria-hidden="true">
			<svg viewBox="0 0 24 24">
				<path d="M6 2.5h8L19 7.5V21a1 1 0 01-1 1H6a1 1 0 01-1-1V3.5a1 1 0 011-1z" />
				<path d="M14 2.5V8h5" />
			</svg>
			<b>{label}</b>
		</span>
	);
};

/**
 * Private messaging.
 *
 * MongoDB is the source of truth: the conversation list and history come from
 * GraphQL, so refresh, logout and server restart lose nothing. The socket only
 * signals that a message was persisted; this screen then re-reads. There is no
 * client-side message store to drift out of sync.
 *
 * Replaces the previous screen, which rendered a single global broadcast room
 * backed by an in-memory server array capped at five entries and shared by every
 * signed-in member.
 */

const CONVERSATION_INPUT = { page: 1, limit: 50 };
const MESSAGE_LIMIT = 50;

const dayLabel = (d: Date | string, t: (key: string) => string): string => {
	const m = moment(d);
	if (m.isSame(moment(), 'day')) return t('Today');
	if (m.isSame(moment().subtract(1, 'day'), 'day')) return t('Yesterday');
	return m.format('D MMMM YYYY');
};

const MessagesCenter = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const socket = useReactiveVar(socketVar);

	const [activeId, setActiveId] = useState<string>('');
	/* Older pages fetched beyond the first. Keyed by nothing — reset whenever the
	   open conversation changes. */
	const [olderPages, setOlderPages] = useState<Message[]>([]);
	const [page, setPage] = useState(1);
	const [loadingOlder, setLoadingOlder] = useState(false);
	/* Set while an older page is being merged, so the auto-scroll effect below
	   does not yank the reader back to the newest message. A ref (not state)
	   because it must be readable synchronously inside the same commit. */
	const skipAutoScroll = useRef(false);
	const threadRef = useRef<HTMLDivElement>(null);
	const [draft, setDraft] = useState('');
	const [search, setSearch] = useState('');
	const listEndRef = useRef<HTMLDivElement>(null);
	/* The conversation list now opens as a popover instead of sitting
	   permanently above the chat — same list/search markup and data, just
	   shown on demand so the chat gets the available height. */
	const [listOpen, setListOpen] = useState(false);
	const topbarRef = useRef<HTMLDivElement>(null);
	useClickOutside(topbarRef, listOpen, () => setListOpen(false));
	/* Attachments: paths already returned by imagesUploader, ready to send. */
	const [pendingImages, setPendingImages] = useState<string[]>([]);
	/* Documents: full metadata already returned by documentsUploader — the
	   receiver has no File object to read a name/size from, so this has to be
	   captured now and sent through, not re-derived later. */
	const [pendingFiles, setPendingFiles] = useState<MessageAttachment[]>([]);
	const [uploadingAttachment, setUploadingAttachment] = useState(false);
	const [uploadProgress, setUploadProgress] = useState<number | null>(null);
	const [attachmentError, setAttachmentError] = useState('');
	const fileInputRef = useRef<HTMLInputElement>(null);

	const {
		data: convData,
		refetch: refetchConversations,
		loading: loadingConversations,
	} = useQuery(GET_MY_CONVERSATIONS, {
		fetchPolicy: 'cache-and-network',
		notifyOnNetworkStatusChange: true,
		variables: { input: CONVERSATION_INPUT },
		skip: !user?._id,
	});
	const conversations: Conversation[] = convData?.getMyConversations?.list ?? [];
	/* Surfaced on the toggle button so unread messages stay visible even while
	   the list itself is collapsed — the per-row badges inside the popover are
	   unchanged. */
	const totalUnread = useMemo(
		() => conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0),
		[conversations],
	);

	/* Directory search only fires once the box has enough to be meaningful. */
	const { data: searchData } = useQuery(SEARCH_MEMBERS, {
		fetchPolicy: 'cache-first',
		variables: { input: { page: 1, limit: 8, text: search.trim() } },
		skip: !user?._id || search.trim().length < 2,
	});
	const foundMembers: Member[] = searchData?.searchMembers?.list ?? [];

	const {
		data: msgData,
		refetch: refetchMessages,
		fetchMore: fetchMoreMessages,
		loading: loadingMessages,
	} = useQuery(GET_MESSAGES, {
		fetchPolicy: 'cache-and-network',
		notifyOnNetworkStatusChange: true,
		variables: { input: { page: 1, limit: MESSAGE_LIMIT, conversationId: activeId } },
		skip: !activeId,
	});
	const totalMessages: number = msgData?.getMessages?.metaCounter?.[0]?.total ?? 0;

	/* Server returns newest-first so pagination pages backwards in time. The first
	   page comes from the live query (so realtime refetches keep updating it) and
	   older pages are accumulated separately. Merging by _id in a Map guarantees no
	   duplicate renders even if a refetch overlaps a just-loaded older page, and
	   nothing is dropped. Rendered oldest-first. */
	const messages: Message[] = useMemo(() => {
		const firstPage: Message[] = msgData?.getMessages?.list ?? [];
		const byId = new Map<string, Message>();
		[...firstPage, ...olderPages].forEach((m) => byId.set(String(m._id), m));
		return Array.from(byId.values()).sort(
			(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
		);
	}, [msgData, olderPages]);

	const hasOlder = messages.length < totalMessages;

	const [sendMessage, { loading: sending }] = useMutation(SEND_MESSAGE);
	const [markRead] = useMutation(MARK_CONVERSATION_READ);

	const active = conversations.find((c) => c._id === activeId);

	/* Deep link from a message notification:
	   /mypage?category=messages&conversationId=… opens that thread. */
	useEffect(() => {
		const target = router.query?.conversationId as string | undefined;
		if (target && target !== activeId) setActiveId(target);
	}, [router.query?.conversationId]);

	useEffect(() => {
		if (!activeId && conversations.length) setActiveId(conversations[0]._id);
	}, [conversations, activeId]);

	/* Switching threads discards any older pages loaded for the previous one, and
	   any attachments picked for the thread being left. */
	useEffect(() => {
		setOlderPages([]);
		setPage(1);
		setPendingImages([]);
		setPendingFiles([]);
		setAttachmentError('');
	}, [activeId]);

	/* Opening a thread clears its unread state. */
	useEffect(() => {
		if (!activeId) return;
		(async () => {
			try {
				await markRead({ variables: { conversationId: activeId } });
				await refetchConversations({ input: CONVERSATION_INPUT });
			} catch {
				/* Non-blocking — the thread still renders. */
			}
		})();
	}, [activeId]);

	/* Open (or adopt) the messaging socket. Idempotent, and it reconnects itself
	   after a drop — the Apollo subscription transport never did. */
	useEffect(() => {
		ensureMessagingSocket();
	}, []);

	/* On reconnect, re-read: anything that arrived while the socket was down is
	   already in MongoDB, so this closes the gap without any client buffering. */
	useEffect(() => {
		const onOpen = () => {
			refetchConversations({ input: CONVERSATION_INPUT });
			if (activeId) refetchMessages({ input: { page: 1, limit: MESSAGE_LIMIT, conversationId: activeId } });
		};
		window.addEventListener('gt-socket-open', onOpen);
		return () => window.removeEventListener('gt-socket-open', onOpen);
	}, [activeId, refetchConversations, refetchMessages]);

	/* Realtime: the socket signals, the database is re-read.
	 * 'messagesRead' fires once the *other* participant opens this thread —
	 * re-reading flips SENT -> READ on our own bubbles' ticks with no extra
	 * client-side bookkeeping, same as 'messageCreated' already does. */
	useEffect(() => {
		if (!socket) return;
		const handler = (event: MessageEvent) => {
			try {
				const data = JSON.parse(event.data);
				if (data.event !== 'messageCreated' && data.event !== 'messagesRead') return;
				refetchConversations({ input: CONVERSATION_INPUT });
				if (data.conversationId === activeId) {
					refetchMessages({ input: { page: 1, limit: MESSAGE_LIMIT, conversationId: activeId } });
				}
			} catch {
				/* Ignore frames that are not JSON. */
			}
		};
		socket.addEventListener('message', handler);
		return () => socket.removeEventListener('message', handler);
	}, [socket, activeId, refetchConversations, refetchMessages]);

	/* Jump to the newest bubble on open and on new arrivals — but never while the
	   user is reading back through older pages.
	   scrollTop is assigned directly rather than using scrollIntoView: the smooth
	   variant races the layout pass that follows a refetch, which left the thread
	   pinned at scrollTop 0 with 3396px of content. */
	useEffect(() => {
		if (skipAutoScroll.current) {
			skipAutoScroll.current = false;
			return;
		}
		const el = threadRef.current;
		if (!el) return;
		/* The thread's final height is only known after the bubbles have laid out,
		   and a single rAF fired too early (measured: scrollTop stayed 0 against
		   3396px of content). Pin it again on a short timeout so the last write
		   happens after layout has settled. */
		const pin = () => {
			const node = threadRef.current;
			if (node) node.scrollTop = node.scrollHeight;
		};
		pin();
		const raf = requestAnimationFrame(pin);
		const timer = setTimeout(pin, 150);
		return () => {
			cancelAnimationFrame(raf);
			clearTimeout(timer);
		};
	}, [activeId, msgData]);

	/**
	 * Load the next older page.
	 *
	 * Scroll preservation: prepending content shifts everything down by exactly
	 * the height that was added, so the pre-fetch scrollHeight is captured and the
	 * delta re-applied after render. Without this the viewport jumps to the top
	 * the moment older messages arrive.
	 */
	const loadOlder = useCallback(async () => {
		if (loadingOlder || !activeId || !hasOlder) return;
		const el = threadRef.current;
		const prevHeight = el?.scrollHeight ?? 0;
		const prevTop = el?.scrollTop ?? 0;
		setLoadingOlder(true);
		try {
			const next = page + 1;
			const res = await fetchMoreMessages({
				variables: { input: { page: next, limit: MESSAGE_LIMIT, conversationId: activeId } },
			});
			const older: Message[] = res.data?.getMessages?.list ?? [];
			if (older.length) {
				skipAutoScroll.current = true;
				setOlderPages((prev) => [...prev, ...older]);
				setPage(next);
			}
			/* Two frames: the first lets React commit the prepended bubbles, the
			   second runs after layout so scrollHeight is the post-merge value. */
			requestAnimationFrame(() =>
				requestAnimationFrame(() => {
					const after = threadRef.current;
					if (!after) return;
					after.scrollTop = prevTop + (after.scrollHeight - prevHeight);
				}),
			);
		} catch {
			/* Leave the thread as it is; the button stays available to retry. */
		} finally {
			setLoadingOlder(false);
		}
	}, [loadingOlder, activeId, hasOlder, page, fetchMoreMessages]);

	/**
	 * Uploads the picked files. Images go through the existing `imagesUploader`
	 * mutation (target: "message"); documents go through the new
	 * `documentsUploader` mutation (same target, same multipart transport, a
	 * different mimetype allow-list — see member.resolver.ts). Both run
	 * client-side validation first (format + size) so a rejected file never
	 * reaches the network; the server re-validates both independently since the
	 * client check is only a UX convenience, not the security boundary.
	 * Successful uploads are staged in `pendingImages` / `pendingFiles`; the
	 * actual message is only created on Send.
	 */
	const uploadAttachments = async (fileList: FileList | null) => {
		if (!fileList?.length) return;
		setAttachmentError('');

		const picked = Array.from(fileList);

		const unsupported = picked.find((f) => !IMAGE_MIME_TYPES.includes(f.type) && !DOCUMENT_MIME_TYPES.includes(f.type));
		if (unsupported) {
			setAttachmentError(t('"{{name}}" is not a supported format.', { name: unsupported.name }) as string);
			return;
		}
		const oversized = picked.find((f) => f.size > MAX_ATTACHMENT_BYTES);
		if (oversized) {
			setAttachmentError(t('"{{name}}" is over 10MB.', { name: oversized.name }) as string);
			return;
		}

		const imageRoom = MAX_ATTACHMENTS - pendingImages.length;
		const fileRoom = MAX_ATTACHMENTS - pendingFiles.length;
		const imageFiles = picked.filter((f) => IMAGE_MIME_TYPES.includes(f.type)).slice(0, Math.max(imageRoom, 0));
		const documentFiles = picked.filter((f) => DOCUMENT_MIME_TYPES.includes(f.type)).slice(0, Math.max(fileRoom, 0));
		if (!imageFiles.length && !documentFiles.length) {
			setAttachmentError(
				t('You can attach up to {{count}} images and {{count}} files per message.', {
					count: MAX_ATTACHMENTS,
				}) as string,
			);
			return;
		}

		const totalBytes = [...imageFiles, ...documentFiles].reduce((sum, f) => sum + f.size, 0) || 1;
		const progressByRequest = { images: 0, documents: 0 };
		const reportProgress = () => {
			const uploaded = progressByRequest.images + progressByRequest.documents;
			setUploadProgress(Math.min(99, Math.round((uploaded / totalBytes) * 100)));
		};

		setUploadingAttachment(true);
		setUploadProgress(0);
		try {
			const requests: Promise<void>[] = [];

			if (imageFiles.length) {
				const formData = new FormData();
				formData.append(
					'operations',
					JSON.stringify({
						query: `mutation ImagesUploader($files: [Upload!]!, $target: String!) {
							imagesUploader(files: $files, target: $target)
						}`,
						variables: { files: imageFiles.map(() => null), target: 'message' },
					}),
				);
				formData.append(
					'map',
					JSON.stringify(Object.fromEntries(imageFiles.map((_, n) => [n, [`variables.files.${n}`]]))),
				);
				imageFiles.forEach((file, n) => formData.append(String(n), file));

				requests.push(
					axios
						.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
							headers: {
								'Content-Type': 'multipart/form-data',
								'apollo-require-preflight': true,
								Authorization: `Bearer ${getJwtToken()}`,
							},
							onUploadProgress: (evt) => {
								progressByRequest.images = evt.loaded;
								reportProgress();
							},
						})
						.then((response) => {
							const uploaded: string[] = response.data?.data?.imagesUploader ?? [];
							if (response.data?.errors?.length) throw new Error(response.data.errors[0]?.message);
							if (!uploaded.length) throw new Error(t('Image upload failed.') as string);
							setPendingImages((prev) => [...prev, ...uploaded]);
						}),
				);
			}

			if (documentFiles.length) {
				const formData = new FormData();
				formData.append(
					'operations',
					JSON.stringify({
						query: `mutation DocumentsUploader($files: [Upload!]!, $target: String!) {
							documentsUploader(files: $files, target: $target) {
								url
								fileName
								fileSize
								mimeType
							}
						}`,
						variables: { files: documentFiles.map(() => null), target: 'message' },
					}),
				);
				formData.append(
					'map',
					JSON.stringify(Object.fromEntries(documentFiles.map((_, n) => [n, [`variables.files.${n}`]]))),
				);
				documentFiles.forEach((file, n) => formData.append(String(n), file));

				requests.push(
					axios
						.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
							headers: {
								'Content-Type': 'multipart/form-data',
								'apollo-require-preflight': true,
								Authorization: `Bearer ${getJwtToken()}`,
							},
							onUploadProgress: (evt) => {
								progressByRequest.documents = evt.loaded;
								reportProgress();
							},
						})
						.then((response) => {
							const uploaded: MessageAttachment[] = response.data?.data?.documentsUploader ?? [];
							if (response.data?.errors?.length) throw new Error(response.data.errors[0]?.message);
							if (!uploaded.length) throw new Error(t('File upload failed.') as string);
							setPendingFiles((prev) => [...prev, ...uploaded]);
						}),
				);
			}

			await Promise.all(requests);
			setUploadProgress(100);
		} catch (err: any) {
			setAttachmentError(err?.message ?? (t('Upload failed. Check the file format and try again.') as string));
		} finally {
			setUploadingAttachment(false);
			setTimeout(() => setUploadProgress(null), 400);
		}
	};

	const removePendingImage = (path: string) => setPendingImages((prev) => prev.filter((p) => p !== path));
	const removePendingFile = (url: string) => setPendingFiles((prev) => prev.filter((f) => f.url !== url));

	const sendHandler = useCallback(async () => {
		const text = draft.trim();
		const images = pendingImages;
		const files = pendingFiles;
		if (!text && !images.length && !files.length) return;
		if (!active?.partner?._id) return;
		setDraft('');
		setPendingImages([]);
		setPendingFiles([]);
		try {
			await sendMessage({
				variables: {
					input: {
						receiverId: active.partner._id,
						messageText: text,
						messageImages: images,
						messageFiles: files.map(({ url, fileName, fileSize, mimeType }) => ({ url, fileName, fileSize, mimeType })),
					},
				},
			});
			await Promise.all([
				refetchMessages({ input: { page: 1, limit: MESSAGE_LIMIT, conversationId: activeId } }),
				refetchConversations({ input: CONVERSATION_INPUT }),
			]);
		} catch {
			setDraft(text); /* Restore so nothing typed or attached is lost. */
			setPendingImages(images);
			setPendingFiles(files);
		}
	}, [draft, pendingImages, pendingFiles, active, activeId, sendMessage, refetchMessages, refetchConversations]);

	/* Enter sends; Shift+Enter inserts a newline. */
	const keyHandler = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendHandler();
		}
	};

	/* Opening any conversation — from the list or from search — closes the
	   popover so the chat takes over, matching the pre-popover behaviour where
	   picking a row already showed the full thread. */
	const selectConversation = (id: string) => {
		setActiveId(id);
		setListOpen(false);
	};

	/* Starting a chat from search. sendMessage creates the conversation on the
	   server, so there is no separate "create" round trip. */
	const openWithMember = async (partner: Member) => {
		setSearch('');
		setListOpen(false);
		const existing = conversations.find((c) => c.partner?._id === partner._id);
		if (existing) return setActiveId(existing._id);
		try {
			await sendMessage({ variables: { input: { receiverId: partner._id, messageText: '👋' } } });
			const refreshed = await refetchConversations({ input: CONVERSATION_INPUT });
			const created = refreshed.data?.getMyConversations?.list?.find(
				(c: Conversation) => c.partner?._id === partner._id,
			);
			if (created) setActiveId(created._id);
		} catch {
			/* The list simply stays as it was. */
		}
	};

	if (!user?._id) return null;

	return (
		<div className="ms-wrap">
			<div className="ms-topbar" ref={topbarRef}>
				<div className="ms-search">
					<svg viewBox="0 0 24 24">
						<circle cx="11" cy="11" r="7" />
						<path d="M20 20l-3.2-3.2" />
					</svg>
					<input
						aria-label={t('Search people to message') as string}
						onChange={(e) => {
							setSearch(e.target.value);
							if (e.target.value.trim()) setListOpen(true);
						}}
						onFocus={() => setListOpen(true)}
						placeholder={t('Search people…') as string}
						value={search}
					/>
				</div>

				<button
					aria-expanded={listOpen}
					aria-label={listOpen ? (t('Close conversations') as string) : (t('Open conversations') as string)}
					className="ms-list-toggle"
					onClick={() => setListOpen((v) => !v)}
					type="button"
				>
					<svg viewBox="0 0 24 24">
						<path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
					</svg>
					{totalUnread > 0 && (
						<i className="ms-badge ms-list-toggle-badge">{totalUnread > 9 ? '9+' : totalUnread}</i>
					)}
				</button>

				{listOpen && (
					<div className="ms-list-popover">
						<div className="ms-list-popover-head">
							<span>{t('Conversations')}</span>
						</div>

						{search.trim().length >= 2 && (
							<div className="ms-results">
								<span className="ms-results-title">{t('People')}</span>
								{foundMembers.length === 0 && <p className="ms-empty-mini">{t('No members found.')}</p>}
								{foundMembers.map((m) => (
									<button className="ms-row" key={m._id} onClick={() => openWithMember(m)} type="button">
										<img alt="" className="ms-av" src={getImageUrl(m.memberImage)} />
										<span className="ms-row-body">
											<b>{m.memberNick}</b>
											<small>{t(m.memberType)}</small>
										</span>
									</button>
								))}
							</div>
						)}

						<div className="ms-list">
							{loadingConversations && conversations.length === 0 && <p className="ms-empty-mini">{t('Loading…')}</p>}
							{!loadingConversations && conversations.length === 0 && (
								<div className="ms-empty">
									<b>{t('No conversations yet')}</b>
									<span>{t('Search for a member above to start chatting.')}</span>
								</div>
							)}
							{conversations.map((c) => (
								<button
									className={c._id === activeId ? 'ms-row is-active' : 'ms-row'}
									key={c._id}
									onClick={() => selectConversation(c._id)}
									type="button"
								>
									<img alt="" className="ms-av" src={getImageUrl(c.partner?.memberImage)} />
									<span className="ms-row-body">
										<b>{c.partner?.memberNick ?? t('Member')}</b>
										<small>{c.lastMessageText || t('No messages yet')}</small>
									</span>
									<span className="ms-row-meta">
										{c.lastMessageAt && <time>{moment(c.lastMessageAt).format('HH:mm')}</time>}
										{c.unreadCount > 0 && <i className="ms-badge">{c.unreadCount > 9 ? '9+' : c.unreadCount}</i>}
									</span>
								</button>
							))}
						</div>
					</div>
				)}
			</div>

			<section className="ms-chat">
				{!active && (
					<div className="ms-empty ms-empty--chat">
						<b>{t('Select a conversation')}</b>
						<span>{t('Your messages are private and stay here permanently.')}</span>
					</div>
				)}

				{active && (
					<>
						<header className="ms-chat-head">
							<img alt="" className="ms-av" src={getImageUrl(active.partner?.memberImage)} />
							<div>
								<b>{active.partner?.memberNick ?? t('Member')}</b>
								<small>{active.partner?.memberType ? t(active.partner.memberType) : ''}</small>
							</div>
						</header>

						<div className="ms-thread" ref={threadRef}>
							{loadingMessages && messages.length === 0 && (
								<p className="ms-empty-mini">{t('Loading messages…')}</p>
							)}
							{hasOlder && (
								<button className="ms-older" disabled={loadingOlder} onClick={loadOlder} type="button">
									{loadingOlder
										? t('Loading…')
										: t('Load older messages ({{count}})', { count: totalMessages - messages.length })}
								</button>
							)}
							{messages.map((m, i) => {
								const mine = String(m.senderId) === String(user._id);
								const prev = messages[i - 1];
								const newDay = !prev || !moment(prev.createdAt).isSame(moment(m.createdAt), 'day');
								return (
									<React.Fragment key={m._id}>
										{newDay && <div className="ms-day">{dayLabel(m.createdAt, t)}</div>}
										<div className={mine ? 'ms-bubble is-mine' : 'ms-bubble'}>
											{!!m.messageImages?.length && (
												<div className={m.messageImages.length === 1 ? 'ms-attach-grid is-single' : 'ms-attach-grid'}>
													{m.messageImages.map((img, idx) => (
														<a
															aria-label={t('Open attachment') as string}
															className="ms-attach-thumb"
															href={getImageUrl(img)}
															key={img + idx}
															rel="noreferrer"
															target="_blank"
														>
															<img alt={t('Attachment') as string} src={getImageUrl(img)} />
														</a>
													))}
												</div>
											)}
											{!!m.messageFiles?.length && (
												<div className="ms-attach-files">
													{m.messageFiles.map((file, idx) => (
														<a
															aria-label={t('Download {{fileName}}', { fileName: file.fileName }) as string}
															className="ms-attach-file"
															download={file.fileName}
															href={getImageUrl(file.url)}
															key={file.url + idx}
															rel="noreferrer"
															target="_blank"
														>
															<FileTypeIcon fileName={file.fileName} />
															<span className="ms-attach-file-body">
																<b>{file.fileName}</b>
																<small>{formatFileSize(file.fileSize)}</small>
															</span>
															<svg className="ms-attach-file-dl" viewBox="0 0 24 24">
																<path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
															</svg>
														</a>
													))}
												</div>
											)}
											{!!m.messageText && <p>{m.messageText}</p>}
											<span className="ms-bubble-meta">
												{moment(m.createdAt).format('HH:mm')}
												{mine && (
													<span
														aria-label={(m.messageStatus === 'READ' ? t('Read') : t('Delivered')) as string}
														className={m.messageStatus === 'READ' ? 'ms-tick is-read' : 'ms-tick'}
													>
														<svg className="ms-tick-icon" viewBox="0 0 24 24">
															<path d="M20 6L9 17l-5-5" />
														</svg>
														{m.messageStatus === 'READ' && (
															<svg className="ms-tick-icon ms-tick-icon--second" viewBox="0 0 24 24">
																<path d="M20 6L9 17l-5-5" />
															</svg>
														)}
													</span>
												)}
											</span>
										</div>
									</React.Fragment>
								);
							})}
							<div ref={listEndRef} />
						</div>

						{(pendingImages.length > 0 || pendingFiles.length > 0 || uploadingAttachment || attachmentError) && (
							<div className="ms-attach-preview">
								<div className="ms-attach-preview-row">
									{pendingImages.map((img) => (
										<div className="ms-attach-preview-item" key={img}>
											<img alt={t('Attachment preview') as string} src={getImageUrl(img)} />
											<button
												aria-label={t('Remove attachment') as string}
												onClick={() => removePendingImage(img)}
												type="button"
											>
												<svg viewBox="0 0 24 24">
													<path d="M18 6L6 18M6 6l12 12" />
												</svg>
											</button>
										</div>
									))}
									{pendingFiles.map((file) => (
										<div className="ms-attach-preview-item ms-attach-preview-item--file" key={file.url}>
											<FileTypeIcon fileName={file.fileName} />
											<span className="ms-attach-preview-file-name">{file.fileName}</span>
											<small>{formatFileSize(file.fileSize)}</small>
											<button
												aria-label={t('Remove {{fileName}}', { fileName: file.fileName }) as string}
												onClick={() => removePendingFile(file.url)}
												type="button"
											>
												<svg viewBox="0 0 24 24">
													<path d="M18 6L6 18M6 6l12 12" />
												</svg>
											</button>
										</div>
									))}
								</div>
								{uploadingAttachment && (
									<div className="ms-attach-loading">
										<span>{t('Uploading… {{percent}}%', { percent: uploadProgress ?? 0 })}</span>
										<div className="ms-attach-progress">
											<i style={{ width: `${uploadProgress ?? 0}%` }} />
										</div>
									</div>
								)}
								{attachmentError && <span className="ms-attach-error">{attachmentError}</span>}
							</div>
						)}

						<div className="ms-composer">
							<button
								aria-label={t('Attach photo or file') as string}
								className="ms-attach"
								disabled={uploadingAttachment || (pendingImages.length >= MAX_ATTACHMENTS && pendingFiles.length >= MAX_ATTACHMENTS)}
								onClick={() => fileInputRef.current?.click()}
								type="button"
							>
								<svg viewBox="0 0 24 24">
									<path d="M21 12.5l-8.5 8.5a5 5 0 01-7-7l9-9a3.5 3.5 0 015 5l-9 9a2 2 0 01-3-3l8-8" />
								</svg>
							</button>
							<input
								accept={ACCEPTED_ATTACHMENT_TYPES}
								className="ms-file-input"
								multiple
								onChange={(e) => {
									uploadAttachments(e.target.files);
									e.target.value = '';
								}}
								ref={fileInputRef}
								type="file"
							/>
							<textarea
								aria-label={t('Write a message') as string}
								onChange={(e) => setDraft(e.target.value)}
								onKeyDown={keyHandler}
								placeholder={t('Write a message…') as string}
								rows={1}
								value={draft}
							/>
							<button
								aria-label={t('Send message') as string}
								className="ms-send"
								disabled={sending || uploadingAttachment || (!draft.trim() && !pendingImages.length && !pendingFiles.length)}
								onClick={sendHandler}
								type="button"
							>
								<svg viewBox="0 0 24 24">
									<path d="M4 12l16-8-6 16-2.5-6z" />
								</svg>
							</button>
						</div>
					</>
				)}
			</section>
		</div>
	);
};

export default MessagesCenter;
