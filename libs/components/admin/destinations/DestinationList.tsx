import React from 'react';
import Moment from 'react-moment';
import { Button, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { motion, useReducedMotion } from 'framer-motion';
import { Destination } from '../../../types/destination/destination';
import { DestinationStatus } from '../../../enums/tour.enum';
import { REACT_APP_API_URL } from '../../../config';

interface DestinationListProps {
	destinations: Destination[];
	loading?: boolean;
	onEditDestination: (destination: Destination) => void;
	onDeleteDestination: (destinationId: string) => void;
}

const SKELETON_ROWS: readonly number[] = [0, 1, 2, 3, 4, 5];
const destinationStatusClass = (status?: string) => `admin-status admin-status--${(status ?? 'paused').toLowerCase()}`;

const destinationImage = (destination: Destination): string => {
	const image = destination.destinationImages?.[0];
	if (!image) return '/img/banner/joinBg.svg';
	if (image.startsWith('http') || image.startsWith('/')) return image;
	return `${REACT_APP_API_URL}/${image}`;
};

export const DestinationList = ({
	destinations,
	loading = false,
	onEditDestination,
	onDeleteDestination,
}: DestinationListProps): React.ReactElement => {
	const reduceMotion = Boolean(useReducedMotion());

	const renderLoadingState = (): React.ReactElement => (
		<div className="admin-table-skeleton" role="status" aria-label="Loading destinations">
			{SKELETON_ROWS.map((index) => <span key={index} />)}
		</div>
	);

	const renderEmptyState = (): React.ReactElement => (
		<div className="admin-state admin-state--empty">No destinations match these controls.</div>
	);

	const renderActions = (destination: Destination, mobile = false): React.ReactElement | null => {
		if (destination.destinationStatus === DestinationStatus.DELETED) return null;

		if (mobile) {
			return (
				<div className="admin-mobile-card__actions">
					<Button className="admin-action-button" onClick={() => onEditDestination(destination)}>Edit</Button>
					<Button className="admin-action-button admin-action-button--danger" onClick={() => onDeleteDestination(destination._id)}>
						Delete
					</Button>
				</div>
			);
		}

		return (
			<div className="admin-destination-actions">
				<Tooltip title="Edit destination">
					<IconButton className="admin-icon-action" aria-label="Edit destination" onClick={() => onEditDestination(destination)}>
						<EditRoundedIcon />
					</IconButton>
				</Tooltip>
				<Tooltip title="Delete destination">
					<IconButton className="admin-icon-action admin-icon-action--danger" aria-label="Delete destination" onClick={() => onDeleteDestination(destination._id)}>
						<DeleteOutlineRoundedIcon />
					</IconButton>
				</Tooltip>
			</div>
		);
	};

	const renderDesktopRow = (destination: Destination): React.ReactElement => (
		<TableRow key={destination._id}>
			<TableCell>
				<div className="admin-destination-cell">
					<img src={destinationImage(destination)} alt="" />
					<div>
						<strong>{destination.destinationTitle}</strong>
						<span>{destination.destinationDesc || 'No description provided.'}</span>
					</div>
				</div>
			</TableCell>
			<TableCell>
				<div className="admin-location-cell">
					<strong>{destination.destinationCity}</strong>
					<span>{destination.destinationCountry}</span>
					{destination.destinationAddress && <small>{destination.destinationAddress}</small>}
				</div>
			</TableCell>
			<TableCell><span className={destinationStatusClass(destination.destinationStatus)}>{destination.destinationStatus}</span></TableCell>
			<TableCell>
				<div className="admin-date-cell">
					<span>Created <Moment format="DD MMM YYYY">{destination.createdAt}</Moment></span>
					<span>Updated <Moment format="DD MMM YYYY">{destination.updatedAt}</Moment></span>
				</div>
			</TableCell>
			<TableCell align="right">{renderActions(destination)}</TableCell>
		</TableRow>
	);

	const renderMobileCard = (destination: Destination, index: number): React.ReactElement => (
		<motion.article
			key={destination._id}
			className="admin-mobile-card admin-mobile-card--destination"
			initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.18, delay: reduceMotion ? 0 : Math.min(index * 0.025, 0.12) }}
		>
			<img src={destinationImage(destination)} alt="" />
			<div className="admin-mobile-card__title">
				<strong>{destination.destinationTitle}</strong>
				<span className={destinationStatusClass(destination.destinationStatus)}>{destination.destinationStatus}</span>
			</div>
			<p>{destination.destinationCity}, {destination.destinationCountry}</p>
			{destination.destinationAddress && <div className="admin-mobile-card__copy"><span>{destination.destinationAddress}</span></div>}
			<div className="admin-mobile-card__meta">
				<span>Created <Moment format="DD MMM YYYY">{destination.createdAt}</Moment></span>
				<span>Updated <Moment format="DD MMM YYYY">{destination.updatedAt}</Moment></span>
			</div>
			{renderActions(destination, true)}
		</motion.article>
	);

	if (loading) return renderLoadingState();
	if (!destinations.length) return renderEmptyState();

	const desktopRows: React.ReactElement[] = destinations.map(renderDesktopRow);
	const mobileCards: React.ReactElement[] = destinations.map(renderMobileCard);

	return (
		<>
			<TableContainer className="admin-data-table">
				<Table aria-label="Destination inventory">
					<TableHead>
						<TableRow>
							<TableCell>Destination</TableCell>
							<TableCell>Location</TableCell>
							<TableCell>Status</TableCell>
							<TableCell>Dates</TableCell>
							<TableCell align="right">Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>{desktopRows}</TableBody>
				</Table>
			</TableContainer>
			<div className="admin-mobile-cards">{mobileCards}</div>
		</>
	);
};
