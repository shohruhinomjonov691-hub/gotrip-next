import React from 'react';
import Moment from 'react-moment';
import { Button, IconButton, Menu, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { motion, useReducedMotion } from 'framer-motion';
import { Notice } from '../../../types/notice/notice';
import { NoticeStatus } from '../../../enums/notice.enum';
import { useTranslation } from '../../../i18n/useTranslation';

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
	const { t } = useTranslation();
	const reduceMotion = Boolean(useReducedMotion());
	const fadeDuration = reduceMotion ? 0 : 0.2;

	const renderLoadingState = (): React.ReactElement => (
		<div className="admin-table-skeleton" role="status" aria-label={t('Loading notices') as string}>
			{SKELETON_ROWS.map((index) => <span key={index} />)}
		</div>
	);

	const renderEmptyState = (): React.ReactElement => (
		<div className="admin-state admin-state--empty">{t('No notices match these controls.')}</div>
	);

	const renderStatusControl = (notice: Notice, statusKey: string): React.ReactElement => {
		if (notice.noticeStatus === NoticeStatus.DELETE) {
			return <span className={noticeStatusClass(notice.noticeStatus)}>{t(notice.noticeStatus)}</span>;
		}

		const statusOptions: NoticeStatus[] = CHANGEABLE_STATUSES.filter((status) => status !== notice.noticeStatus);
		return (
			<>
				<Button className={noticeStatusClass(notice.noticeStatus)} onClick={(event: React.MouseEvent<HTMLElement>) => menuIconClickHandler(event, statusKey)}>
					{t(notice.noticeStatus)}
				</Button>
				<Menu anchorEl={anchorEl[statusKey]} open={Boolean(anchorEl[statusKey])} onClose={menuIconCloseHandler}>
					{statusOptions.map((status) => (
						<MenuItem key={status} onClick={() => updateNoticeHandler(notice._id, status)}>
							{t(status)}
						</MenuItem>
					))}
				</Menu>
			</>
		);
	};

	const renderDeleteControl = (notice: Notice): React.ReactElement | null => {
		if (notice.noticeStatus === NoticeStatus.DELETE) return null;
		return (
			<Tooltip title={t('Delete notice')}>
				<IconButton className="admin-icon-action admin-icon-action--danger" aria-label={t('Delete notice') as string} onClick={() => deleteNoticeHandler(notice._id)}>
					<DeleteOutlineRoundedIcon />
				</IconButton>
			</Tooltip>
		);
	};

	const renderEditControl = (notice: Notice): React.ReactElement => (
		<Tooltip title={t('Edit notice')}>
			<IconButton className="admin-icon-action" aria-label={t('Edit notice') as string} onClick={() => editNoticeHandler(notice)}>
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
				<TableCell>{t(notice.noticeCategory)}</TableCell>
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
					<span className={noticeStatusClass(notice.noticeStatus)}>{t(notice.noticeStatus)}</span>
				</div>
				<p>{t(notice.noticeCategory)} · <Moment format="DD MMM YYYY">{notice.createdAt}</Moment></p>
				<div className="admin-mobile-card__copy"><span>{notice.noticeContent}</span></div>
				<div className="admin-mobile-card__actions">
					<Button className="admin-action-button" onClick={() => editNoticeHandler(notice)}>
						{t('Edit')}
					</Button>
					{notice.noticeStatus !== NoticeStatus.DELETE && (
						<>
						{renderStatusControl(notice, statusKey)}
						<Button className="admin-action-button admin-action-button--danger" onClick={() => deleteNoticeHandler(notice._id)}>
							{t('Delete')}
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
				<Table aria-label={t('Platform notices') as string}>
					<TableHead>
						<TableRow>
							<TableCell>{t('Notices')}</TableCell>
							<TableCell>{t('Categories')}</TableCell>
							<TableCell>{t('Published')}</TableCell>
							<TableCell>{t('Status')}</TableCell>
							<TableCell align="right">{t('Actions')}</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>{desktopRows}</TableBody>
				</Table>
			</TableContainer>
			<div className="admin-mobile-cards">{mobileCards}</div>
		</motion.div>
	);
};
