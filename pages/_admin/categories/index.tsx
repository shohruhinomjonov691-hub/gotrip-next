import React, { useRef, useState } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client';
import axios from 'axios';
import {
	Avatar,
	Button,
	Chip,
	MenuItem,
	Select,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { GET_ALL_CATEGORIES_BY_ADMIN } from '../../../apollo/admin/query';
import {
	CREATE_CATEGORY_BY_ADMIN,
	DELETE_CATEGORY_BY_ADMIN,
	UPDATE_CATEGORY_BY_ADMIN,
} from '../../../apollo/admin/mutation';
import { CategoryStatus, CategoryType } from '../../../libs/enums/category.enum';
import { TourCategory } from '../../../libs/enums/tour.enum';
import { BoardArticleCategory } from '../../../libs/enums/board-article.enum';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { Direction } from '../../../libs/enums/common.enum';
import { Category } from '../../../libs/types/category/category';
import { getImageUrl } from '../../../libs/config';
import { getJwtToken } from '../../../libs/auth';
import { sweetConfirmAlert, sweetErrorHandling, sweetMixinSuccessAlert } from '../../../libs/sweetAlert';
import { useTranslation } from '../../../libs/i18n/useTranslation';

const ACCEPTED_IMAGE_TYPES = 'image/jpg, image/jpeg, image/png';
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/**
 * Category catalogue.
 *
 * categoryKey must stay aligned with the TourCategory / BoardArticleCategory
 * enums — that rule is enforced server-side, so this screen never edits the key.
 * It manages visibility (categoryStatus) and ordering only.
 */

const LIMIT = 50;

/* The server rejects a categoryKey that is not one of these enum values
   (assertCategoryKeyConsistency), so the dialog offers them as a dropdown. */
const KEYS_FOR = (t: CategoryType): string[] =>
	t === CategoryType.TOUR ? Object.values(TourCategory) : Object.values(BoardArticleCategory);

const EMPTY_DRAFT = {
	categoryType: CategoryType.TOUR,
	categoryKey: '',
	categoryName: '',
	categoryDesc: '',
	categoryOrder: 0,
	categoryImage: '',
};

const AdminCategories: NextPage = () => {
	const { t } = useTranslation();
	const [type, setType] = useState<CategoryType | ''>('');
	const [page, setPage] = useState(1);

	const input = {
		page,
		limit: LIMIT,
		sort: 'categoryOrder',
		direction: Direction.ASC,
		search: type ? { categoryType: type } : {},
	};

	const { data, loading, error, refetch } = useQuery(GET_ALL_CATEGORIES_BY_ADMIN, {
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
		variables: { input },
	});

	const rows: Category[] = data?.getAllCategoriesByAdmin?.list ?? [];
	const total: number = data?.getAllCategoriesByAdmin?.metaCounter?.[0]?.total ?? 0;
	const pages = Math.ceil(total / LIMIT) || 1;

	const [createOpen, setCreateOpen] = useState(false);
	const [draft, setDraft] = useState({ ...EMPTY_DRAFT });
	const [createError, setCreateError] = useState('');
	const [uploadingImage, setUploadingImage] = useState(false);
	const imageInputRef = useRef<HTMLInputElement>(null);

	const [create, { loading: creating }] = useMutation(CREATE_CATEGORY_BY_ADMIN);
	const [update, { loading: updating }] = useMutation(UPDATE_CATEGORY_BY_ADMIN);
	const [remove, { loading: removing }] = useMutation(DELETE_CATEGORY_BY_ADMIN);
	const busy = updating || removing;

	/** Reuses the existing singular `imageUploader` mutation — the same one
	 *  MyProfile.tsx uses for the avatar — with target "category". No new
	 *  backend endpoint; `validImageTargets` already allow-listed "category". */
	const uploadCategoryImage = async (file: File | undefined) => {
		if (!file) return;
		setCreateError('');
		if (file.size > MAX_IMAGE_BYTES) {
			setCreateError(t('Image is over 8MB — pick a smaller file.'));
			return;
		}
		setUploadingImage(true);
		try {
			const formData = new FormData();
			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImageUploader($file: Upload!, $target: String!) {
						imageUploader(file: $file, target: $target)
					}`,
					variables: { file: null, target: 'category' },
				}),
			);
			formData.append('map', JSON.stringify({ '0': ['variables.file'] }));
			formData.append('0', file);

			const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${getJwtToken()}`,
				},
			});
			const uploaded = response.data?.data?.imageUploader;
			if (!uploaded) throw new Error(response.data?.errors?.[0]?.message ?? t('Upload failed.'));
			setDraft((prev) => ({ ...prev, categoryImage: uploaded }));
		} catch (err: any) {
			setCreateError(err?.message ?? t('Upload failed. Only jpg, jpeg and png are allowed.'));
		} finally {
			setUploadingImage(false);
		}
	};

	const setStatusHandler = async (_id: string, categoryStatus: CategoryStatus) => {
		try {
			await update({ variables: { input: { _id, categoryStatus } } });
			await refetch({ input });
			await sweetMixinSuccessAlert(t('Category set to {{status}}.', { status: t(categoryStatus) }));
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const createHandler = async () => {
		setCreateError('');
		if (!draft.categoryKey || draft.categoryName.trim().length < 2) {
			setCreateError(t('Pick a key and give the category a name (2 characters or more).'));
			return;
		}
		try {
			await create({
				variables: {
					input: {
						categoryType: draft.categoryType,
						categoryKey: draft.categoryKey,
						categoryName: draft.categoryName.trim(),
						categoryDesc: draft.categoryDesc.trim() || undefined,
						categoryOrder: Number(draft.categoryOrder) || 0,
						categoryImage: draft.categoryImage || undefined,
					},
				},
			});
			setCreateOpen(false);
			setDraft({ ...EMPTY_DRAFT });
			await refetch({ input });
			await sweetMixinSuccessAlert(t('Category created.'));
		} catch (err: any) {
			setCreateError(err?.message ?? t('Could not create the category.'));
		}
	};

	const deleteHandler = async (categoryId: string) => {
		if (!(await sweetConfirmAlert(t('Delete this category?') as string))) return;
		try {
			await remove({ variables: { categoryId } });
			await refetch({ input });
			await sweetMixinSuccessAlert(t('Category deleted.'));
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	return (
		<Stack className="admin-page content admin-table-cards">
			<Stack className="admin-page__heading">
				<Typography className="admin-kicker">{t('Platform control')}</Typography>
				<Typography className="admin-title" component="h1">
					{t('Categories')}
				</Typography>
				<Typography className="admin-copy">
					{t('Presentation layer for the tour and article category enums — image, description and ordering.')}
				</Typography>
			</Stack>

			<Stack alignItems="center" className="admin-filters" direction="row" spacing={2}>
				<Typography className="admin-cell-copy">{t('Type')}</Typography>
				<Select
					onChange={(e) => {
						setType(e.target.value as CategoryType | '');
						setPage(1);
					}}
					size="small"
					value={type}
				>
					<MenuItem value="">{t('All types')}</MenuItem>
					{Object.values(CategoryType).map((ct) => (
						<MenuItem key={ct} value={ct}>
							{t(ct)}
						</MenuItem>
					))}
				</Select>
				<Typography className="admin-page__count">
					{loading && rows.length === 0 ? t('Loading…') : t('{{count}} categories', { count: total })}
				</Typography>
				<Button onClick={() => setCreateOpen(true)} sx={{ ml: 'auto' }} variant="contained">
					{t('New category')}
				</Button>
			</Stack>

			{error && rows.length === 0 && !loading && (
				<div className="admin-empty">
					{t('Could not load categories.')}
					<Button onClick={() => refetch({ input })}>{t('Retry')}</Button>
				</div>
			)}

			{!loading && !error && rows.length === 0 && <div className="admin-empty">{t('No categories found.')}</div>}

			{rows.length > 0 && (
				<TableContainer>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>{t('Categories')}</TableCell>
								<TableCell>{t('Key')}</TableCell>
								<TableCell>{t('Type')}</TableCell>
								<TableCell align="right">{t('Order')}</TableCell>
								<TableCell>{t('Status')}</TableCell>
								<TableCell align="right">{t('Actions')}</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{rows.map((c) => (
								<TableRow key={c._id}>
									{/* data-label drives the mobile card layout: under 960px the table
									    reflows to stacked cards and each cell prints its column name
									    from this attribute, matching Users/Tours/Community. */}
									<TableCell data-col="identity" data-label={t('Category')}>
										<Stack alignItems="center" direction="row" spacing={1.5}>
											<Avatar alt={c.categoryName} src={getImageUrl(c.categoryImage)} variant="rounded" />
											<div>
												<strong>{c.categoryName}</strong>
												{c.categoryDesc && (
													<Typography className="admin-cell-copy" variant="body2">
														{c.categoryDesc}
													</Typography>
												)}
											</div>
										</Stack>
									</TableCell>
									<TableCell data-label={t('Key')}>
										<code className="admin-code">{c.categoryKey}</code>
									</TableCell>
									<TableCell data-label={t('Type')}>
										<Chip label={t(c.categoryType)} size="small" />
									</TableCell>
									<TableCell align="right" data-label={t('Order')}>
										{c.categoryOrder}
									</TableCell>
									<TableCell data-label={t('Status')}>
										<Chip
											color={c.categoryStatus === CategoryStatus.ACTIVE ? 'success' : 'warning'}
											label={t(c.categoryStatus)}
											size="small"
										/>
									</TableCell>
									<TableCell align="right" data-col="actions" data-label={t('Actions')}>
										<Stack direction="row" justifyContent="flex-end" spacing={1}>
											{c.categoryStatus === CategoryStatus.ACTIVE ? (
												<Button
													className="admin-action-button admin-action-button--neutral"
													disabled={busy}
													onClick={() => setStatusHandler(c._id, CategoryStatus.HOLD)}
												>
													{t('Hide')}
												</Button>
											) : (
												<Button
													className="admin-action-button admin-action-button--success"
													disabled={busy}
													onClick={() => setStatusHandler(c._id, CategoryStatus.ACTIVE)}
												>
													{t('Publish')}
												</Button>
											)}
											<Button
												className="admin-action-button admin-action-button--danger"
												disabled={busy}
												onClick={() => deleteHandler(c._id)}
											>
												{t('Delete')}
											</Button>
										</Stack>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			)}

			{pages > 1 && (
				<Stack alignItems="center" className="admin-pager" direction="row" justifyContent="center" spacing={1}>
					<Button disabled={page <= 1} onClick={() => setPage(page - 1)}>
						{t('Prev')}
					</Button>
					<Typography className="admin-cell-copy">
						{t('Page {{page}} of {{pages}}', { page, pages })}
					</Typography>
					<Button disabled={page >= pages} onClick={() => setPage(page + 1)}>
						{t('Next')}
					</Button>
				</Stack>
			)}
			{/* Create — reuses the existing createCategoryByAdmin operation. */}
			<Dialog
				fullWidth
				maxWidth="sm"
				onClose={() => {
					setCreateOpen(false);
					setDraft({ ...EMPTY_DRAFT });
					setCreateError('');
				}}
				open={createOpen}
			>
				<DialogTitle>{t('New category')}</DialogTitle>
				<DialogContent>
					<Stack gap={2} mt={1}>
						{createError && (
							<Typography color="error" variant="body2">
								{createError}
							</Typography>
						)}

						<Stack alignItems="center" direction="row" gap={2}>
							<Avatar
								src={draft.categoryImage ? getImageUrl(draft.categoryImage) : undefined}
								sx={{ width: 64, height: 64 }}
								variant="rounded"
							>
								{!draft.categoryImage && draft.categoryName.slice(0, 1).toUpperCase()}
							</Avatar>
							<Stack gap={0.75}>
								<Stack direction="row" gap={1}>
									<Button
										disabled={uploadingImage}
										onClick={() => imageInputRef.current?.click()}
										size="small"
										variant="outlined"
									>
										{uploadingImage ? t('Uploading…') : draft.categoryImage ? t('Replace image') : t('Upload image')}
									</Button>
									{draft.categoryImage && (
										<Button
											color="error"
											disabled={uploadingImage}
											onClick={() => setDraft((prev) => ({ ...prev, categoryImage: '' }))}
											size="small"
										>
											{t('Remove')}
										</Button>
									)}
								</Stack>
								<Typography color="text.secondary" variant="caption">
									{t('JPG or PNG, up to 8MB. One image per category.')}
								</Typography>
							</Stack>
							<input
								accept={ACCEPTED_IMAGE_TYPES}
								hidden
								onChange={(e) => {
									uploadCategoryImage(e.target.files?.[0]);
									e.target.value = '';
								}}
								ref={imageInputRef}
								type="file"
							/>
						</Stack>

						<TextField
							helperText={t('Tour categories power the Home rail; article categories power Community.')}
							label={t('Type')}
							onChange={(e) =>
								setDraft({ ...draft, categoryType: e.target.value as CategoryType, categoryKey: '' })
							}
							select
							value={draft.categoryType}
						>
							{Object.values(CategoryType).map((ct) => (
								<MenuItem key={ct} value={ct}>
									{t(ct)}
								</MenuItem>
							))}
						</TextField>
						<TextField
							helperText={t('Must match an existing enum value — enforced by the backend.')}
							label={t('Key')}
							onChange={(e) => setDraft({ ...draft, categoryKey: e.target.value })}
							select
							value={draft.categoryKey}
						>
							{KEYS_FOR(draft.categoryType).map((k) => (
								<MenuItem key={k} value={k}>
									{t(k)}
								</MenuItem>
							))}
						</TextField>
						<TextField
							label={t('Display name')}
							onChange={(e) => setDraft({ ...draft, categoryName: e.target.value })}
							value={draft.categoryName}
						/>
						<TextField
							label={t('Description')}
							minRows={2}
							multiline
							onChange={(e) => setDraft({ ...draft, categoryDesc: e.target.value })}
							value={draft.categoryDesc}
						/>
						<TextField
							label={t('Order')}
							onChange={(e) => setDraft({ ...draft, categoryOrder: Number(e.target.value) })}
							type="number"
							value={draft.categoryOrder}
						/>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => {
							setCreateOpen(false);
							setDraft({ ...EMPTY_DRAFT });
							setCreateError('');
						}}
					>
						{t('Cancel')}
					</Button>
					<Button disabled={creating || uploadingImage} onClick={createHandler} variant="contained">
						{creating ? t('Creating…') : t('Create category')}
					</Button>
				</DialogActions>
			</Dialog>
		</Stack>
	);
};

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

export default withAdminLayout(AdminCategories);
