import React, { useState } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { NextPage } from 'next';
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	InputAdornment,
	MenuItem,
	OutlinedInput,
	Select,
	TablePagination,
	TextField,
	Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { motion, useReducedMotion } from 'framer-motion';
import { useMutation, useQuery } from '@apollo/client';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { NoticeList } from '../../../libs/components/admin/cs/NoticeList';
import { GET_ALL_NOTICES_BY_ADMIN } from '../../../apollo/admin/query';
import { CREATE_NOTICE_BY_ADMIN, DELETE_NOTICE_BY_ADMIN, UPDATE_NOTICE_BY_ADMIN } from '../../../apollo/admin/mutation';
import { Notice } from '../../../libs/types/notice/notice';
import { NoticeCategory, NoticeStatus } from '../../../libs/enums/notice.enum';
import { Direction } from '../../../libs/enums/common.enum';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../libs/sweetAlert';
import { T } from '../../../libs/types/common';
import { useTranslation } from '../../../libs/i18n/useTranslation';

interface AllNoticesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: { noticeStatus?: NoticeStatus; noticeCategory?: NoticeCategory; text?: string };
}

interface AdminNoticeProps {
	initialInquiry?: AllNoticesInquiry;
}

interface NoticeEditor {
	mode: 'create' | 'edit';
	noticeId?: string;
	noticeCategory: NoticeCategory | '';
	noticeStatus: NoticeStatus | '';
	noticeTitle: string;
	noticeContent: string;
}

interface NoticeEditorErrors {
	noticeCategory?: string;
	noticeTitle?: string;
	noticeContent?: string;
}

interface NoticeTab {
	value: 'ALL' | NoticeStatus;
	label: string;
}

interface NoticePageMotionTarget {
	opacity: number;
	y?: number;
}

type NoticeTabValue = NoticeTab['value'];
type NoticeCategoryValue = 'ALL' | NoticeCategory;

const DEFAULT_INQUIRY: AllNoticesInquiry = {
	page: 1,
	limit: 10,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};
const NOTICE_TABS: readonly NoticeTab[] = [
	{ value: 'ALL', label: 'All notices' },
	{ value: NoticeStatus.ACTIVE, label: 'Active' },
	{ value: NoticeStatus.HOLD, label: 'On hold' },
	{ value: NoticeStatus.DELETE, label: 'Deleted' },
];
const NOTICE_CATEGORIES: readonly NoticeCategory[] = Object.values(NoticeCategory) as NoticeCategory[];
const NOTICE_STATUSES: readonly NoticeStatus[] = Object.values(NoticeStatus) as NoticeStatus[];
const CREATE_NOTICE_STATUSES: readonly NoticeStatus[] = [NoticeStatus.ACTIVE, NoticeStatus.HOLD];
const ROWS_PER_PAGE_OPTIONS: number[] = [10, 20, 40, 60];

const createEmptyEditor = (): NoticeEditor => ({
	mode: 'create',
	noticeCategory: '',
	noticeStatus: '',
	noticeTitle: '',
	noticeContent: '',
});

const createEditorForNotice = (notice: Notice): NoticeEditor => ({
	mode: 'edit',
	noticeId: notice._id,
	noticeCategory: notice.noticeCategory,
	noticeStatus: notice.noticeStatus,
	noticeTitle: notice.noticeTitle,
	noticeContent: notice.noticeContent,
});

const validateNoticeEditor = (editor: NoticeEditor): NoticeEditorErrors => {
	const errors: NoticeEditorErrors = {};
	const titleLength = editor.noticeTitle.trim().length;
	const contentLength = editor.noticeContent.trim().length;

	if (!editor.noticeCategory) errors.noticeCategory = 'Choose a notice category.';
	if (titleLength < 3 || titleLength > 120) errors.noticeTitle = 'Title must be between 3 and 120 characters.';
	if (contentLength < 3 || contentLength > 2000) errors.noticeContent = 'Content must be between 3 and 2000 characters.';

	return errors;
};

const AdminNotice: NextPage<AdminNoticeProps> = ({ initialInquiry = DEFAULT_INQUIRY }) => {
	const { t } = useTranslation();
	const [inquiry, setInquiry] = useState<AllNoticesInquiry>(initialInquiry);
	const [notices, setNotices] = useState<Notice[]>([]);
	const [total, setTotal] = useState(0);
	const [value, setValue] = useState<NoticeTabValue>('ALL');
	const [category, setCategory] = useState<NoticeCategoryValue>('ALL');
	const [searchText, setSearchText] = useState('');
	const [anchorEl, setAnchorEl] = useState<Record<string, HTMLElement | null>>({});
	const [editor, setEditor] = useState<NoticeEditor | null>(null);
	const [editorErrors, setEditorErrors] = useState<NoticeEditorErrors>({});
	const [editorError, setEditorError] = useState('');
	const reduceMotion = Boolean(useReducedMotion());
	const [createNoticeByAdmin, { loading: creatingNotice }] = useMutation(CREATE_NOTICE_BY_ADMIN);
	const [updateNoticeByAdmin, { loading: updatingNotice }] = useMutation(UPDATE_NOTICE_BY_ADMIN);
	const [deleteNoticeByAdmin] = useMutation(DELETE_NOTICE_BY_ADMIN);
	const { loading, error, refetch } = useQuery(GET_ALL_NOTICES_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setNotices(data?.getAllNoticesByAdmin?.list ?? []);
			setTotal(data?.getAllNoticesByAdmin?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const editorBusy = creatingNotice || updatingNotice;
	const currentEditorErrors = editor ? validateNoticeEditor(editor) : {};
	const isEditorValid = Boolean(editor) && Object.keys(currentEditorErrors).length === 0;

	const changePageHandler = async (_: unknown, newPage: number) => {
		const next = { ...inquiry, page: newPage + 1 };
		setInquiry(next);
		await refetch({ input: next });
	};
	const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const next = { ...inquiry, page: 1, limit: parseInt(event.target.value, 10) };
		setInquiry(next);
		await refetch({ input: next });
	};
	const statusHandler = (nextValue: NoticeTabValue) => {
		setValue(nextValue);
		const search = { ...inquiry.search };
		if (nextValue === 'ALL') delete search.noticeStatus;
		else search.noticeStatus = nextValue;
		setInquiry({ ...inquiry, page: 1, search });
	};
	const categoryHandler = (nextValue: NoticeCategoryValue) => {
		setCategory(nextValue);
		const search = { ...inquiry.search };
		if (nextValue === 'ALL') delete search.noticeCategory;
		else search.noticeCategory = nextValue;
		setInquiry({ ...inquiry, page: 1, search });
	};
	const searchHandler = () => setInquiry({ ...inquiry, page: 1, search: { ...inquiry.search, text: searchText } });
	const clearSearchHandler = () => {
		setSearchText('');
		setInquiry({ ...inquiry, page: 1, search: { ...inquiry.search, text: '' } });
	};
	const menuIconClickHandler = (event: React.MouseEvent<HTMLElement>, key: string) => setAnchorEl({ [key]: event.currentTarget });
	const menuIconCloseHandler = () => setAnchorEl({});
	const updateNoticeHandler = async (noticeId: string, noticeStatus: NoticeStatus) => {
		try {
			await updateNoticeByAdmin({ variables: { input: { _id: noticeId, noticeStatus } } });
			menuIconCloseHandler();
			await refetch({ input: inquiry });
		} catch (err: unknown) {
			menuIconCloseHandler();
			sweetErrorHandling(err).then();
		}
	};
	const deleteNoticeHandler = async (noticeId: string) => {
		try {
			if (!(await sweetConfirmAlert(t('Delete this notice?') as string))) return;
			await deleteNoticeByAdmin({ variables: { noticeId } });
			await refetch({ input: inquiry });
		} catch (err: unknown) {
			sweetErrorHandling(err).then();
		}
	};
	const resetEditor = () => {
		setEditor(null);
		setEditorErrors({});
		setEditorError('');
	};
	const openCreateEditor = () => {
		setEditor(createEmptyEditor());
		setEditorErrors({});
		setEditorError('');
	};
	const openEditEditor = (notice: Notice) => {
		setEditor(createEditorForNotice(notice));
		setEditorErrors({});
		setEditorError('');
	};
	const updateEditor = (updates: Partial<NoticeEditor>) => {
		setEditor((current) => current ? { ...current, ...updates } : current);
		setEditorErrors({});
		setEditorError('');
	};
	const saveNoticeHandler = async () => {
		if (!editor) return;

		const validationErrors = validateNoticeEditor(editor);
		setEditorErrors(validationErrors);
		if (Object.keys(validationErrors).length) return;

		const noticeCategory = editor.noticeCategory as NoticeCategory;
		const noticeTitle = editor.noticeTitle.trim();
		const noticeContent = editor.noticeContent.trim();

		try {
			if (editor.mode === 'create') {
				const input: {
					noticeCategory: NoticeCategory;
					noticeStatus?: NoticeStatus;
					noticeTitle: string;
					noticeContent: string;
				} = { noticeCategory, noticeTitle, noticeContent };
				if (editor.noticeStatus) input.noticeStatus = editor.noticeStatus;
				await createNoticeByAdmin({ variables: { input } });
			} else {
				await updateNoticeByAdmin({
					variables: {
						input: {
							_id: editor.noticeId,
							noticeCategory,
							noticeStatus: editor.noticeStatus as NoticeStatus,
							noticeTitle,
							noticeContent,
						},
					},
				});
			}
		} catch (_err: unknown) {
			setEditorError(t('We could not save this notice. Please review the fields and try again.'));
			return;
		}

		resetEditor();
		try {
			await refetch({ input: inquiry });
		} catch (err: unknown) {
			sweetErrorHandling(err).then();
		}
	};

	const renderHeading = (): React.ReactElement => (
		<div className="admin-page__heading">
			<div>
				<Typography component="span">{t('Help center governance')}</Typography>
				<Typography component="h1">{t('Notices')}</Typography>
				<Typography component="p">{t('Review and publish platform guidance. FAQ, Terms, and Inquiry are managed as notice categories here.')}</Typography>
			</div>
			<div className="admin-page__heading-actions">
				<Typography className="admin-page__count">{t('{{count}} notices', { count: total })}</Typography>
				<Button className="admin-primary-action" startIcon={<AddRoundedIcon />} onClick={openCreateEditor}>
					{t('Create notice')}
				</Button>
			</div>
		</div>
	);

	const renderSearchAdornment = (): React.ReactElement => (
		<InputAdornment position="end">
			{searchText && (
				<Button className="admin-icon-button" aria-label={t('Clear notice search') as string} onClick={clearSearchHandler}>
					<CancelRoundedIcon />
				</Button>
			)}
			<Button className="admin-icon-button" aria-label={t('Search notices') as string} onClick={searchHandler}>
				<SearchRoundedIcon />
			</Button>
		</InputAdornment>
	);

	const renderFilters = (): React.ReactElement => {
		const tabButtons: React.ReactElement[] = NOTICE_TABS.map((tab) => (
			<Button
				key={tab.value}
				role="tab"
				aria-selected={value === tab.value}
				className={value === tab.value ? 'is-active' : ''}
				onClick={() => statusHandler(tab.value)}
			>
				{t(tab.label)}
			</Button>
		));
		const categoryItems: React.ReactElement[] = NOTICE_CATEGORIES.map((item) => <MenuItem key={item} value={item}>{t(item)}</MenuItem>);

		return (
			<div className="admin-filterbar">
				<div className="admin-tabs" role="tablist" aria-label={t('Notice status') as string}>{tabButtons}</div>
				<div className="search-area admin-search-controls">
					<Select<NoticeCategoryValue>
						value={category}
						onChange={(event: SelectChangeEvent<NoticeCategoryValue>) => categoryHandler(event.target.value as NoticeCategoryValue)}
						aria-label={t('Filter notices by category') as string}
					>
						<MenuItem value="ALL">{t('All categories')}</MenuItem>
						{categoryItems}
					</Select>
					<OutlinedInput
						aria-label={t('Search notices') as string}
						value={searchText}
						onChange={(event) => setSearchText(event.target.value)}
						placeholder={t('Search notices') as string}
						onKeyDown={(event) => event.key === 'Enter' && searchHandler()}
						endAdornment={renderSearchAdornment()}
					/>
				</div>
			</div>
		);
	};

	const renderResults = (): React.ReactElement => {
		if (error) {
			return (
				<div className="admin-state admin-state--error">
					<Typography>{t('We could not load platform notices.')}</Typography>
					<Button onClick={() => refetch({ input: inquiry })}>{t('Try again')}</Button>
				</div>
			);
		}

		return (
			<NoticeList
				notices={notices}
				anchorEl={anchorEl}
				menuIconClickHandler={menuIconClickHandler}
				menuIconCloseHandler={menuIconCloseHandler}
				editNoticeHandler={openEditEditor}
				updateNoticeHandler={updateNoticeHandler}
				deleteNoticeHandler={deleteNoticeHandler}
				loading={loading && !notices.length}
			/>
		);
	};

	const renderPagination = (): React.ReactElement => (
		<TablePagination
			rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
			component="div"
			count={total}
			rowsPerPage={inquiry.limit}
			page={inquiry.page - 1}
			onPageChange={changePageHandler}
			onRowsPerPageChange={changeRowsPerPageHandler}
		/>
	);

	const renderEditor = (): React.ReactElement | null => {
		if (!editor) return null;

		const statusOptions = editor.mode === 'create' ? CREATE_NOTICE_STATUSES : NOTICE_STATUSES;
		const categoryItems: React.ReactElement[] = NOTICE_CATEGORIES.map((item) => <MenuItem key={item} value={item}>{t(item)}</MenuItem>);
		const statusItems: React.ReactElement[] = statusOptions.map((item) => <MenuItem key={item} value={item}>{t(item)}</MenuItem>);

		return (
			<Dialog
				open
				onClose={() => !editorBusy && resetEditor()}
				className="admin-notice-dialog"
				fullWidth
				maxWidth="sm"
				aria-labelledby="admin-notice-editor-title"
			>
				<form
					onSubmit={(event) => {
						event.preventDefault();
						saveNoticeHandler().then();
					}}
					noValidate
				>
					<DialogTitle id="admin-notice-editor-title">
						{editor.mode === 'create' ? t('Create notice') : t('Edit notice')}
					</DialogTitle>
					<DialogContent dividers>
						<div className="admin-notice-editor">
							<div className="admin-notice-editor__grid">
								<TextField
									select
									label={t('Categories')}
									value={editor.noticeCategory}
									onChange={(event) => updateEditor({ noticeCategory: event.target.value as NoticeCategory })}
									error={Boolean(editorErrors.noticeCategory)}
									helperText={editorErrors.noticeCategory ? t(editorErrors.noticeCategory) : undefined}
									required
									fullWidth
								>
									<MenuItem value="" disabled>{t('Choose a category')}</MenuItem>
									{categoryItems}
								</TextField>
								<TextField
									select
									label={editor.mode === 'create' ? t('Publication status (optional)') : t('Publication status')}
									value={editor.noticeStatus}
									onChange={(event) => updateEditor({ noticeStatus: event.target.value as NoticeStatus })}
									required={editor.mode === 'edit'}
									fullWidth
								>
									{editor.mode === 'create' && <MenuItem value="">{t('Use backend default')}</MenuItem>}
									{statusItems}
								</TextField>
							</div>
							<TextField
								label={t('Title')}
								value={editor.noticeTitle}
								onChange={(event) => updateEditor({ noticeTitle: event.target.value })}
								error={Boolean(editorErrors.noticeTitle)}
								helperText={editorErrors.noticeTitle ? t(editorErrors.noticeTitle) : `${editor.noticeTitle.length}/120`}
								inputProps={{ maxLength: 120 }}
								required
								fullWidth
							/>
							<TextField
								label={t('Content')}
								value={editor.noticeContent}
								onChange={(event) => updateEditor({ noticeContent: event.target.value })}
								error={Boolean(editorErrors.noticeContent)}
								helperText={editorErrors.noticeContent ? t(editorErrors.noticeContent) : `${editor.noticeContent.length}/2000`}
								inputProps={{ maxLength: 2000 }}
								multiline
								minRows={7}
								required
								fullWidth
							/>
							{editorError && <p className="admin-notice-editor__error" role="alert">{editorError}</p>}
						</div>
					</DialogContent>
					<DialogActions>
						<Button type="button" onClick={resetEditor} disabled={editorBusy}>{t('Cancel')}</Button>
						{/* BUG FIXED HERE (measured in-browser): with a fully valid, enabled
						    form this button computed rgb(94,108,111) text on rgb(246,251,252) —
						    a numerically-passing 5.23:1, but visually indistinguishable from a
						    disabled ghost button, because `variant="contained"` was never set
						    and it fell back to MUI's default `text` variant despite the
						    `.admin-primary-action` class intending a filled CTA. */}
						<Button
							type="submit"
							variant="contained"
							className="admin-primary-action"
							disabled={!isEditorValid || editorBusy}
						>
							{editorBusy ? t('Saving...') : editor.mode === 'create' ? t('Create notice') : t('Save changes')}
						</Button>
					</DialogActions>
				</form>
			</Dialog>
		);
	};

	const initialAnimation: NoticePageMotionTarget = reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 };
	const animateAnimation: NoticePageMotionTarget = { opacity: 1, y: 0 };
	const pageContent: React.ReactElement = (
		<section className="content admin-page">
			{renderHeading()}
			<div className="table-wrap admin-surface">
				{renderFilters()}
				{renderResults()}
				{renderPagination()}
			</div>
			{renderEditor()}
		</section>
	);

	return (
		<motion.div initial={initialAnimation} animate={animateAnimation} transition={{ duration: 0.22 }}>
			{pageContent}
		</motion.div>
	);
};

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

export default withAdminLayout(AdminNotice);
