import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from '@apollo/client';
import TourCard from '../homepage-html/TourCard';
import { GET_FAVORITE_TOURS } from '../../../apollo/user/query';
import { LIKE_TARGET_TOUR } from '../../../apollo/user/mutation';
import { Tour } from '../../types/tour/tour';
import { sweetErrorHandling } from '../../sweetAlert';
import { useTranslation } from '../../i18n/useTranslation';

const SORTS = [
	{ key: 'recent', label: 'Recently added' },
	{ key: 'priceLow', label: 'Price: low to high' },
	{ key: 'priceHigh', label: 'Price: high to low' },
	{ key: 'rating', label: 'Top rated' },
];

const SavedTours = () => {
	const { t } = useTranslation();
	const [sort, setSort] = useState('recent');
	const input = useMemo(() => ({ page: 1, limit: 12 }), []);
	const [likeTargetTour] = useMutation(LIKE_TARGET_TOUR);

	const { data, loading, error, refetch } = useQuery(GET_FAVORITE_TOURS, {
		fetchPolicy: 'cache-and-network',
		notifyOnNetworkStatusChange: true,
		variables: { input },
	});
	const savedTours: Tour[] = data?.getFavorites?.list ?? [];
	const total = data?.getFavorites?.metaCounter?.[0]?.total ?? savedTours.length;

	/** Client-side ordering only — the favourites query itself is unchanged. */
	const sorted = useMemo(() => {
		const list = [...savedTours];
		switch (sort) {
			case 'priceLow':
				return list.sort((a, b) => a.tourPrice - b.tourPrice);
			case 'priceHigh':
				return list.sort((a, b) => b.tourPrice - a.tourPrice);
			case 'rating':
				return list.sort((a, b) => (b.tourRating ?? 0) - (a.tourRating ?? 0));
			default:
				return list;
		}
	}, [savedTours, sort]);

	/** Un-hearting a tour removes it from favourites — same mutation as everywhere else. */
	const removeHandler = async (tourId: string) => {
		try {
			await likeTargetTour({ variables: { tourId } });
			await refetch({ input });
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	return (
		<div className="acc-panel">
			<div className="pg-toolbar acc-toolbar">
				<div className="pg-count">{t('{{count}} saved tours', { count: total })}</div>
				{savedTours.length > 0 && (
					<label className="pg-sort">
						<span>{t('Sort by')}</span>
						<select onChange={(e) => setSort(e.target.value)} value={sort}>
							{SORTS.map((s) => (
								<option key={s.key} value={s.key}>
									{t(s.label)}
								</option>
							))}
						</select>
					</label>
				)}
			</div>

			{loading && savedTours.length === 0 && (
				<div className="pg-grid">
					{Array.from({ length: 6 }, (_, i) => (
						<div className="pg-skeleton" key={i} style={{ height: 330 }} />
					))}
				</div>
			)}

			{error && savedTours.length === 0 && !loading && (
				<div className="pg-state">
					<h3>{t('Could not load your saved tours')}</h3>
					<p>{t('Please try again in a moment.')}</p>
					<button className="btn btn-sky" onClick={() => refetch({ input })} type="button">
						{t('Try again')}
					</button>
				</div>
			)}

			{!loading && !error && savedTours.length === 0 && (
				<div className="pg-state">
					<h3>{t('Nothing saved yet')}</h3>
					<p>{t('Tap the heart on any tour and it will wait for you here.')}</p>
					<Link className="btn btn-sky" href="/tour">
						{t('Browse tours')}
					</Link>
				</div>
			)}

			{sorted.length > 0 && (
				<div className="pg-grid">
					{sorted.map((tour) => (
						<TourCard detailed key={tour._id} onLike={removeHandler} tour={tour} />
					))}
				</div>
			)}
		</div>
	);
};

export default SavedTours;
