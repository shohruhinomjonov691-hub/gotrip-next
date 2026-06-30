import React from 'react';
import Moment from 'react-moment';
import { Button, IconButton, Menu, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { motion, useReducedMotion } from 'framer-motion';
import { Notice } from '../../../types/notice/notice';
import { NoticeStatus } from '../../../enums/notice.enum';

interface NoticeListProps {
	notices: Notice[];
	anchorEl: Record<string, HTMLElement | null>;
	menuIconClickHandler: (event: React.MouseEvent<HTMLElement>, key: string) => void;
	menuIconCloseHandler: () => void;
	editNoticeHandler: (notice: Notice) => void;
	updateNoticeHandler: (noticeId: string, noticeStatus: NoticeStatus) => void;
	deleteNoticeHandler: (noticeId: string) => void;
	loading?: boolean;
}

const SKELETON_ROWS: readonly number[] = [0, 1, 2, 3, 4, 5];
const CHANGEABLE_STATUSES: readonly NoticeStatus[] = [NoticeStatus.ACTIVE, NoticeStatus.HOLD];
const noticeStatusClass = (status?: string) => `admin-status admin-status--${(status ?? 'hold').toLowerCase()}`;

export const NoticeList = ({
	notices,
	anchorEl,
	menuIconClickHandler,
	menuIconCloseHandler,
	editNoticeHandler,
	updateNoticeHandler,
	deleteNoticeHandler,
	loading = false,
}: NoticeListProps): React.ReactElement => {
	const reduceMotion = Boolean(useReducedMotion());
	const fadeDuration = reduceMotion ? 0 : 0.2;

	const renderLoadingState = (): React.ReactElement => (
		<div className="admin-table-skeleton" role="status" aria-label="Loading notices">
			{SKELETON_ROWS.map((index) => <span key={index} />)}
		</div>
	);

	const renderEmptyState = (): React.ReactElement => (
		<div className="admin-state admin-state--empty">No notices match these controls.</div>
	);

	const renderStatusControl = (notice: Notice, statusKey: string): React.ReactElement => {
		if (notice.noticeStatus === NoticeStatus.DELETE) {
			return <span className={noticeStatusClass(notice.noticeStatus)}>{notice.noticeStatus}</span>;
		}

		const statusOptions: NoticeStatus[] = CHANGEABLE_STATUSES.filter((status) => status !== notice.noticeStatus);
		return (
			<>
				<Button className={noticeStatusClass(notice.noticeStatus)} onClick={(event) => menuIconClickHandler(event, statusKey)}>
					{notice.noticeStatus}
				</Button>
				<Menu anchorEl={anchorEl[statusKey]} open={Boolean(anchorEl[statusKey])} onClose={menuIconCloseHandler}>
					{statusOptions.map((status) => (
						<MenuItem key={status} onClick={() => updateNoticeHandler(notice._id, status)}>
							{status}
						</MenuItem>
					))}
				</Menu>
			</>
		);
	};

	const renderDeleteControl = (notice: Notice): React.ReactElement | null => {
		if (notice.noticeStatus === NoticeStatus.DELETE) return null;
		return (
			<Tooltip title="Delete notice">
				<IconButton className="admin-icon-action admin-icon-action--danger" aria-label="Delete notice" onClick={() => deleteNoticeHandler(notice._id)}>
					<DeleteOutlineRoundedIcon />
				</IconButton>
			</Tooltip>
		);
	};

	const renderEditControl = (notice: Notice): React.ReactElement => (
		<Tooltip title="Edit notice">
			<IconButton className="admin-icon-action" aria-label="Edit notice" onClick={() => editNoticeHandler(notice)}>
				<EditRoundedIcon />
			</IconButton>
		</Tooltip>
	);

	const renderDesktopRow = (notice: Notice): React.ReactElement => {
		const statusKey = `${notice._id}-status`;
		return (
			<TableRow key={notice._id}>
				<TableCell>
					<div className="admin-notice-cell">
						<strong>{notice.noticeTitle}</strong>
						<span>{notice.noticeContent}</span>
					</div>
				</TableCell>
				<TableCell>{notice.noticeCategory}</TableCell>
				<TableCell><Moment format="DD MMM YYYY">{notice.createdAt}</Moment></TableCell>
				<TableCell>{renderStatusControl(notice, statusKey)}</TableCell>
				<TableCell align="right">
					<div className="admin-notice-actions">
						{renderEditControl(notice)}
						{renderDeleteControl(notice)}
					</div>
				</TableCell>
			</TableRow>
		);
	};

	const renderMobileCard = (notice: Notice): React.ReactElement => {
		const statusKey = `${notice._id}-mobile-status`;
		return (
			<article className="admin-mobile-card" key={notice._id}>
				<div className="admin-mobile-card__title">
					<strong>{notice.noticeTitle}</strong>
					<span className={noticeStatusClass(notice.noticeStatus)}>{notice.noticeStatus}</span>
				</div>
				<p>{notice.noticeCategory} · <Moment format="DD MMM YYYY">{notice.createdAt}</Moment></p>
				<div className="admin-mobile-card__copy"><span>{notice.noticeContent}</span></div>
				<div className="admin-mobile-card__actions">
					<Button className="admin-action-button" onClick={() => editNoticeHandler(notice)}>
						Edit
					</Button>
					{notice.noticeStatus !== NoticeStatus.DELETE && (
						<>
						{renderStatusControl(notice, statusKey)}
						<Button className="admin-action-button admin-action-button--danger" onClick={() => deleteNoticeHandler(notice._id)}>
							Delete
						</Button>
						</>
					)}
				</div>
			</article>
		);
	};

	if (loading) return renderLoadingState();
	if (!notices.length) return renderEmptyState();

	const desktopRows: React.ReactElement[] = notices.map(renderDesktopRow);
	const mobileCards: React.ReactElement[] = notices.map(renderMobileCard);

	return (
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: fadeDuration }}>
			<TableContainer className="admin-data-table">
				<Table aria-label="Platform notices">
					<TableHead>
						<TableRow>
							<TableCell>Notice</TableCell>
							<TableCell>Category</TableCell>
							<TableCell>Published</TableCell>
							<TableCell>Status</TableCell>
							<TableCell align="right">Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>{desktopRows}</TableBody>
				</Table>
			</TableContainer>
			<div className="admin-mobile-cards">{mobileCards}</div>
		</motion.div>
	);
};
