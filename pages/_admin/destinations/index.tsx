import React, { useState } from 'react';
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
import { DestinationList } from '../../../libs/components/admin/destinations/DestinationList';
import { GET_ALL_DESTINATIONS_BY_ADMIN } from '../../../apollo/admin/query';
import {
	CREATE_DESTINATION_BY_ADMIN,
	DELETE_DESTINATION_BY_ADMIN,
	UPDATE_DESTINATION_BY_ADMIN,
} from '../../../apollo/admin/mutation';
import { Destination } from '../../../libs/types/destination/destination';
import { AllDestinationsInquiry, DestinationInput } from '../../../libs/types/destination/destination.input';
import { Direction } from '../../../libs/enums/common.enum';
import { DestinationStatus } from '../../../libs/enums/tour.enum';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../libs/sweetAlert';
import { T } from '../../../libs/types/common';

interface AdminDestinationsProps {
	initialInquiry?: AllDestinationsInquiry;
}

interface DestinationEditor {
	mode: 'create' | 'edit';
	destinationId?: string;
	destinationStatus: DestinationStatus;
	destinationCountry: string;
	destinationCity: string;
	destinationAddress: string;
	destinationTitle: string;
	destinationDesc: string;
	destinationImagesText: string;
}

interface DestinationEditorErrors {
	destinationCountry?: string;
	destinationCity?: string;
	destinationAddress?: string;
	destinationTitle?: string;
	destinationDesc?: string;
	destinationImagesText?: string;
}

interface DestinationUpdateInput {
	_id: string;
	destinationStatus?: DestinationStatus;
	destinationCountry?: string;
	destinationCity?: string;
	destinationAddress?: string | null;
	destinationTitle?: string;
	destinationDesc?: string | null;
	destinationImages?: string[];
}

interface DestinationPageMotionTarget {
	opacity: number;
	y?: number;
}

type DestinationStatusFilter = 'ALL' | DestinationStatus;

const DEFAULT_INQUIRY: AllDestinationsInquiry = {
	page: 1,
	limit: 10,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};
const DESTINATION_STATUSES: readonly DestinationStatus[] = Object.values(DestinationStatus) as DestinationStatus[];
const ROWS_PER_PAGE_OPTIONS: number[] = [10, 20, 40, 60];

const createEmptyEditor = (): DestinationEditor => ({
	mode: 'create',
	destinationStatus: DestinationStatus.ACTIVE,
	destinationCountry: '',
	destinationCity: '',
	destinationAddress: '',
	destinationTitle: '',
	destinationDesc: '',
	destinationImagesText: '',
});

const createEditorForDestination = (destination: Destination): DestinationEditor => ({
	mode: 'edit',
	destinationId: destination._id,
	destinationStatus: destination.destinationStatus,
	destinationCountry: destination.destinationCountry,
	destinationCity: destination.destinationCity,
	destinationAddress: destination.destinationAddress ?? '',
	destinationTitle: destination.destinationTitle,
	destinationDesc: destination.destinationDesc ?? '',
	destinationImagesText: (destination.destinationImages ?? []).join('\n'),
});

const parseDestinationImages = (value: string): string[] => value.split('\n').map((image) => image.trim()).filter(Boolean);

const validateDestinationEditor = (editor: DestinationEditor): DestinationEditorErrors => {
	const errors: DestinationEditorErrors = {};
	const countryLength = editor.destinationCountry.trim().length;
	const cityLength = editor.destinationCity.trim().length;
	const addressLength = editor.destinationAddress.trim().length;
	const titleLength = editor.destinationTitle.trim().length;
	const descriptionLength = editor.destinationDesc.trim().length;

	if (countryLength < 2 || countryLength > 80) errors.destinationCountry = 'Country must be between 2 and 80 characters.';
	if (cityLength < 2 || cityLength > 80) errors.destinationCity = 'City must be between 2 and 80 characters.';
	if (addressLength && (addressLength < 2 || addressLength > 150)) errors.destinationAddress = 'Address must be between 2 and 150 characters.';
	if (titleLength < 3 || titleLength > 100) errors.destinationTitle = 'Title must be between 3 and 100 characters.';
	if (descriptionLength && (descriptionLength < 5 || descriptionLength > 700)) errors.destinationDesc = 'Description must be between 5 and 700 characters.';
	if (!parseDestinationImages(editor.destinationImagesText).length) errors.destinationImagesText = 'Add at least one image path or URL.';

	return errors;
};

const AdminDestinations: NextPage<AdminDestinationsProps> = ({ initialInquiry = DEFAULT_INQUIRY }) => {
	const [inquiry, setInquiry] = useState<AllDestinationsInquiry>(initialInquiry);
	const [destinations, setDestinations] = useState<Destination[]>([]);
	const [total, setTotal] = useState(0);
	const [status, setStatus] = useState<DestinationStatusFilter>('ALL');
	const [country, setCountry] = useState('');
	const [city, setCity] = useState('');
	const [searchText, setSearchText] = useState('');
	const [editor, setEditor] = useState<DestinationEditor | null>(null);
	const [editorErrors, setEditorErrors] = useState<DestinationEditorErrors>({});
	const [editorError, setEditorError] = useState('');
	const reduceMotion = Boolean(useReducedMotion());
	const [createDestinationByAdmin, { loading: creatingDestination }] = useMutation(CREATE_DESTINATION_BY_ADMIN);
	const [updateDestinationByAdmin, { loading: updatingDestination }] = useMutation(UPDATE_DESTINATION_BY_ADMIN);
	const [deleteDestinationByAdmin] = useMutation(DELETE_DESTINATION_BY_ADMIN);
	const { loading, error, refetch } = useQuery(GET_ALL_DESTINATIONS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setDestinations(data?.getAllDestinationsByAdmin?.list ?? []);
			setTotal(data?.getAllDestinationsByAdmin?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const editorBusy = creatingDestination || updatingDestination;
	const currentEditorErrors = editor ? validateDestinationEditor(editor) : {};
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
	const statusHandler = (nextStatus: DestinationStatusFilter) => {
		setStatus(nextStatus);
		const search = { ...inquiry.search };
		if (nextStatus === 'ALL') delete search.destinationStatus;
		else search.destinationStatus = nextStatus;
		setInquiry({ ...inquiry, page: 1, search });
	};
	const applySearchHandler = () => {
		setInquiry((current) => ({
			...current,
			page: 1,
			search: {
				...current.search,
				country: country.trim() || undefined,
				city: city.trim() || undefined,
				text: searchText.trim() || undefined,
			},
		}));
	};
	const clearSearchHandler = () => {
		setCountry('');
		setCity('');
		setSearchText('');
		setInquiry((current) => {
			const search = { ...current.search };
			delete search.country;
			delete search.city;
			delete search.text;
			return { ...current, page: 1, search };
		});
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
	const openEditEditor = (destination: Destination) => {
		setEditor(createEditorForDestination(destination));
		setEditorErrors({});
		setEditorError('');
	};
	const updateEditor = (updates: Partial<DestinationEditor>) => {
		setEditor((current) => current ? { ...current, ...updates } : current);
		setEditorErrors({});
		setEditorError('');
	};
	const saveDestinationHandler = async () => {
		if (!editor) return;

		const validationErrors = validateDestinationEditor(editor);
		setEditorErrors(validationErrors);
		if (Object.keys(validationErrors).length) return;

		const destinationCountry = editor.destinationCountry.trim();
		const destinationCity = editor.destinationCity.trim();
		const destinationAddress = editor.destinationAddress.trim();
		const destinationTitle = editor.destinationTitle.trim();
		const destinationDesc = editor.destinationDesc.trim();
		const destinationImages = parseDestinationImages(editor.destinationImagesText);

		try {
			if (editor.mode === 'create') {
				const input: DestinationInput = {
					destinationCountry,
					destinationCity,
					destinationTitle,
					destinationImages,
					...(destinationAddress ? { destinationAddress } : {}),
					...(destinationDesc ? { destinationDesc } : {}),
				};
				await createDestinationByAdmin({ variables: { input } });
			} else {
				const input: DestinationUpdateInput = {
					_id: editor.destinationId as string,
					destinationStatus: editor.destinationStatus,
					destinationCountry,
					destinationCity,
					destinationAddress: destinationAddress || null,
					destinationTitle,
					destinationDesc: destinationDesc || null,
					destinationImages,
				};
				await updateDestinationByAdmin({ variables: { input } });
			}
		} catch (_err: unknown) {
			setEditorError('We could not save this destination. Please review the fields and try again.');
			return;
		}

		resetEditor();
		try {
			await refetch({ input: inquiry });
		} catch (err: unknown) {
			sweetErrorHandling(err).then();
		}
	};
	const deleteDestinationHandler = async (destinationId: string) => {
		try {
			if (!(await sweetConfirmAlert('Delete this destination?'))) return;
			await deleteDestinationByAdmin({ variables: { destinationId } });
			await refetch({ input: inquiry });
		} catch (err: unknown) {
			sweetErrorHandling(err).then();
		}
	};

	const renderHeading = (): React.ReactElement => (
		<div className="admin-page__heading">
			<div>
				<Typography component="span">Place management</Typography>
				<Typography component="h1">Destinations</Typography>
				<Typography component="p">Maintain the places travelers discover before choosing a GoTrip experience.</Typography>
			</div>
			<div className="admin-page__heading-actions">
				<Typography className="admin-page__count">{total} destinations</Typography>
				<Button className="admin-primary-action" startIcon={<AddRoundedIcon />} onClick={openCreateEditor}>
					Create destination
				</Button>
			</div>
		</div>
	);

	const renderSearchAdornment = (): React.ReactElement => (
		<InputAdornment position="end">
			{(country || city || searchText) && (
				<Button className="admin-icon-button" aria-label="Clear destination filters" onClick={clearSearchHandler}>
					<CancelRoundedIcon />
				</Button>
			)}
			<Button className="admin-icon-button" aria-label="Search destinations" onClick={applySearchHandler}>
				<SearchRoundedIcon />
			</Button>
		</InputAdornment>
	);

	const renderFilters = (): React.ReactElement => {
		const statusItems: React.ReactElement[] = DESTINATION_STATUSES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>);
		return (
			<div className="admin-filterbar admin-filterbar--destinations">
				<Select<DestinationStatusFilter>
					value={status}
					onChange={(event: SelectChangeEvent<DestinationStatusFilter>) => statusHandler(event.target.value as DestinationStatusFilter)}
					aria-label="Filter destinations by status"
				>
					<MenuItem value="ALL">All statuses</MenuItem>
					{statusItems}
				</Select>
				<div className="admin-search-controls admin-destination-filters">
					<OutlinedInput aria-label="Filter destinations by country" placeholder="Country" value={country} onChange={(event) => setCountry(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && applySearchHandler()} />
					<OutlinedInput aria-label="Filter destinations by city" placeholder="City" value={city} onChange={(event) => setCity(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && applySearchHandler()} />
					<OutlinedInput aria-label="Search destinations" placeholder="Search destinations" value={searchText} onChange={(event) => setSearchText(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && applySearchHandler()} endAdornment={renderSearchAdornment()} />
				</div>
			</div>
		);
	};

	const renderResults = (): React.ReactElement => {
		if (error) {
			return (
				<div className="admin-state admin-state--error">
					<Typography>We could not load destination inventory.</Typography>
					<Button onClick={() => refetch({ input: inquiry })}>Try again</Button>
				</div>
			);
		}

		return <DestinationList destinations={destinations} loading={loading && !destinations.length} onEditDestination={openEditEditor} onDeleteDestination={deleteDestinationHandler} />;
	};

	const renderPagination = (): React.ReactElement => (
		<TablePagination rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS} component="div" count={total} rowsPerPage={inquiry.limit} page={inquiry.page - 1} onPageChange={changePageHandler} onRowsPerPageChange={changeRowsPerPageHandler} />
	);

	const renderEditor = (): React.ReactElement | null => {
		if (!editor) return null;

		const statusItems: React.ReactElement[] = DESTINATION_STATUSES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>);
		return (
			<Dialog open onClose={() => !editorBusy && resetEditor()} className="admin-destination-dialog" fullWidth maxWidth="md" aria-labelledby="admin-destination-editor-title">
				<form onSubmit={(event) => { event.preventDefault(); saveDestinationHandler().then(); }} noValidate>
					<DialogTitle id="admin-destination-editor-title">{editor.mode === 'create' ? 'Create destination' : 'Edit destination'}</DialogTitle>
					<DialogContent dividers>
						<div className="admin-destination-editor">
							<div className="admin-destination-editor__grid">
								<TextField label="Country" value={editor.destinationCountry} onChange={(event) => updateEditor({ destinationCountry: event.target.value })} error={Boolean(editorErrors.destinationCountry)} helperText={editorErrors.destinationCountry} inputProps={{ maxLength: 80 }} required fullWidth />
								<TextField label="City" value={editor.destinationCity} onChange={(event) => updateEditor({ destinationCity: event.target.value })} error={Boolean(editorErrors.destinationCity)} helperText={editorErrors.destinationCity} inputProps={{ maxLength: 80 }} required fullWidth />
							</div>
							<TextField label="Destination title" value={editor.destinationTitle} onChange={(event) => updateEditor({ destinationTitle: event.target.value })} error={Boolean(editorErrors.destinationTitle)} helperText={editorErrors.destinationTitle || `${editor.destinationTitle.length}/100`} inputProps={{ maxLength: 100 }} required fullWidth />
							{editor.mode === 'edit' && <TextField select label="Status" value={editor.destinationStatus} onChange={(event) => updateEditor({ destinationStatus: event.target.value as DestinationStatus })} fullWidth>{statusItems}</TextField>}
							<TextField label="Address" value={editor.destinationAddress} onChange={(event) => updateEditor({ destinationAddress: event.target.value })} error={Boolean(editorErrors.destinationAddress)} helperText={editorErrors.destinationAddress || `${editor.destinationAddress.length}/150 (optional)`} inputProps={{ maxLength: 150 }} fullWidth />
							<TextField label="Description" value={editor.destinationDesc} onChange={(event) => updateEditor({ destinationDesc: event.target.value })} error={Boolean(editorErrors.destinationDesc)} helperText={editorErrors.destinationDesc || `${editor.destinationDesc.length}/700 (optional)`} inputProps={{ maxLength: 700 }} multiline minRows={5} fullWidth />
							<TextField label="Image paths or URLs" value={editor.destinationImagesText} onChange={(event) => updateEditor({ destinationImagesText: event.target.value })} error={Boolean(editorErrors.destinationImagesText)} helperText={editorErrors.destinationImagesText || 'Use one existing image path or URL per line.'} multiline minRows={4} required fullWidth />
							{editorError && <p className="admin-destination-editor__error" role="alert">{editorError}</p>}
						</div>
					</DialogContent>
					<DialogActions>
						<Button type="button" onClick={resetEditor} disabled={editorBusy}>Cancel</Button>
						<Button type="submit" className="admin-primary-action" disabled={!isEditorValid || editorBusy}>{editorBusy ? 'Saving...' : editor.mode === 'create' ? 'Create destination' : 'Save changes'}</Button>
					</DialogActions>
				</form>
			</Dialog>
		);
	};

	const initialAnimation: DestinationPageMotionTarget = reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 };
	const animateAnimation: DestinationPageMotionTarget = { opacity: 1, y: 0 };
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

	return <motion.div initial={initialAnimation} animate={animateAnimation} transition={{ duration: 0.22 }}>{pageContent}</motion.div>;
};

export default withAdminLayout(AdminDestinations);
