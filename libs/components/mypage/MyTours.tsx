import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from '@apollo/client';
import TourCard from '../homepage-html/TourCard';
import { GET_AGENT_TOURS } from '../../../apollo/user/query';
import { UPDATE_TOUR } from '../../../apollo/user/mutation';
import { Direction } from '../../enums/common.enum';
import { TourStatus } from '../../enums/tour.enum';
import { Tour } from '../../types/tour/tour';
import { TourUpdate } from '../../types/tour/tour.update';
import { sweetErrorHandling, sweetMixinSuccessAlert } from '../../sweetAlert';
import { useTranslation } from '../../i18n/useTranslation';

const base = { page: 1, limit: 12, sort: 'createdAt', direction: Direction.DESC };

export default function MyTours() {
	const { t } = useTranslation();
	const [status, setStatus] = useState<TourStatus>(TourStatus.ACTIVE);
	const [editTour, setEditTour] = useState<TourUpdate | null>(null);

	const toursQuery = useQuery(GET_AGENT_TOURS, {
		fetchPolicy: 'cache-and-network',
		notifyOnNetworkStatusChange: true,
		variables: { input: { ...base, search: { tourStatus: status } } },
	});
	const tours: Tour[] = toursQuery.data?.getAgentTours?.list ?? [];

	const [updateTour, { loading: updatingTour }] = useMutation(UPDATE_TOUR);

	const stats = useMemo(
		() => [
			{ label: 'Active', value: tours.filter((tour) => tour.tourStatus === TourStatus.ACTIVE).length },
			{ label: 'Seats', value: tours.reduce((count, tour) => count + tour.tourAvailableSeats, 0) },
			{ label: 'Views', value: tours.reduce((count, tour) => count + tour.tourViews, 0) },
			{ label: 'Likes', value: tours.reduce((count, tour) => count + tour.tourLikes, 0) },
		],
		[tours],
	);

	const saveTour = async () => {
		try {
			if (!editTour) return;
			await updateTour({ variables: { input: editTour } });
			await toursQuery.refetch();
			setEditTour(null);
			await sweetMixinSuccessAlert(t('Tour updated successfully.'));
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	/** Same fix as AddNewTour's numberChangeHandler: a native number input pre-filled
	 *  with 0 doesn't select its text on click, so the first keystroke inserts before
	 *  the existing "0" instead of replacing it (typing "100" produced "0100"). Select
	 *  the field on focus (primary fix) and strip any leading zero here as a second
	 *  layer, so a paste or fast keystroke sequence still resolves to a clean number. */
	const numberChangeHandler = (key: keyof TourUpdate, raw: string) => {
		if (!editTour) return;
		const cleaned = raw.replace(/^0+(?=\d)/, '');
		setEditTour({ ...editTour, [key]: cleaned === '' ? 0 : Number(cleaned) });
	};

	const openEditor = (tour: Tour) =>
		setEditTour({
			_id: tour._id,
			tourTitle: tour.tourTitle,
			tourPrice: tour.tourPrice,
			tourCategory: tour.tourCategory,
			tourLocation: tour.tourLocation,
			tourStatus: tour.tourStatus,
			tourDuration: tour.tourDuration,
			tourAvailableSeats: tour.tourAvailableSeats,
			tourMinPeople: tour.tourMinPeople,
			tourMaxPeople: tour.tourMaxPeople,
			tourDesc: tour.tourDesc,
		});

	return (
		<div className="acc-panel">
			{/* KPIs */}
			<div className="acc-kpis">
				{stats.map((s) => (
					<div className="acc-kpi" key={s.label}>
						<b>{s.value}</b>
						<small>{t(s.label)}</small>
					</div>
				))}
			</div>

			<div className="pg-toolbar acc-toolbar">
				<div className="cm-tabs">
					{Object.values(TourStatus).map((item) => (
						<button
							className={status === item ? 'cm-tab on' : 'cm-tab'}
							key={item}
							onClick={() => setStatus(item)}
							type="button"
						>
							{t(item)}
						</button>
					))}
				</div>
				<Link className="btn btn-sky" href={{ pathname: '/mypage', query: { category: 'addTour' } }}>
					{t('Add tour')}
				</Link>
			</div>

			{toursQuery.loading && tours.length === 0 && (
				<div className="pg-grid">
					{Array.from({ length: 6 }, (_, i) => (
						<div className="pg-skeleton" key={i} style={{ height: 330 }} />
					))}
				</div>
			)}

			{toursQuery.error && tours.length === 0 && !toursQuery.loading && (
				<div className="pg-state">
					<h3>{t('Portfolio could not load')}</h3>
					<p>{t('Please try again in a moment.')}</p>
					<button className="btn btn-sky" onClick={() => toursQuery.refetch()} type="button">
						{t('Try again')}
					</button>
				</div>
			)}

			{!toursQuery.loading && !toursQuery.error && tours.length === 0 && (
				<div className="pg-state">
					<h3>{t('No {{status}} tours', { status: t(status) })}</h3>
					<p>{t('Publish a route and it will appear here with live views, likes and seats.')}</p>
					<Link className="btn btn-sky" href={{ pathname: '/mypage', query: { category: 'addTour' } }}>
						{t('Add your first tour')}
					</Link>
				</div>
			)}

			{tours.length > 0 && (
				<div className="pg-grid">
					{tours.map((tour) => (
						<div className="acc-tour-wrap" key={tour._id}>
							<TourCard detailed tour={tour} />
							<button className="btn btn-outline acc-edit-btn" onClick={() => openEditor(tour)} type="button">
								{t('Edit tour')}
							</button>
						</div>
					))}
				</div>
			)}

			{/* Edit dialog — same fields and same UPDATE_TOUR mutation as before. */}
			{editTour && (
				<div className="acc-modal" onClick={() => setEditTour(null)} role="presentation">
					<div
						aria-labelledby="edit-tour-title"
						aria-modal="true"
						className="acc-modal-card"
						onClick={(e) => e.stopPropagation()}
						role="dialog"
					>
						<h3 id="edit-tour-title">{t('Edit tour')}</h3>

						<div className="fl-field">
							<label htmlFor="et-title">{t('Title')}</label>
							<input
								id="et-title"
								onChange={(e) => setEditTour({ ...editTour, tourTitle: e.target.value })}
								type="text"
								value={editTour.tourTitle || ''}
							/>
						</div>

						<div className="fl-row">
							<div className="fl-field">
								<label htmlFor="et-status">{t('Status')}</label>
								<select
									id="et-status"
									onChange={(e) => setEditTour({ ...editTour, tourStatus: e.target.value as TourStatus })}
									value={editTour.tourStatus || TourStatus.ACTIVE}
								>
									{Object.values(TourStatus).map((item) => (
										<option key={item} value={item}>
											{t(item)}
										</option>
									))}
								</select>
							</div>
							<div className="fl-field">
								<label htmlFor="et-price">{t('Price ($)')}</label>
								<input
									id="et-price"
									onChange={(e) => numberChangeHandler('tourPrice', e.target.value)}
									onFocus={(e) => e.target.select()}
									type="number"
									value={editTour.tourPrice}
								/>
							</div>
						</div>

						<div className="fl-field">
							<label htmlFor="et-desc">{t('Description')}</label>
							<textarea
								id="et-desc"
								onChange={(e) => setEditTour({ ...editTour, tourDesc: e.target.value })}
								rows={4}
								value={editTour.tourDesc || ''}
							/>
						</div>

						<div className="acc-modal-actions">
							<button className="btn btn-outline" onClick={() => setEditTour(null)} type="button">
								{t('Cancel')}
							</button>
							<button className="btn btn-sky" disabled={updatingTour} onClick={saveTour} type="button">
								{updatingTour ? t('Saving…') : t('Save changes')}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
