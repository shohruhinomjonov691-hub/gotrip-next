import React from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import TourCard from '../homepage-html/TourCard';
import { GET_VISITED_TOURS } from '../../../apollo/user/query';
import { Tour } from '../../types/tour/tour';
import { useTranslation } from '../../i18n/useTranslation';

const input = { page: 1, limit: 12 };

const RecentlyViewedTours = () => {
	const { t } = useTranslation();
	const { data, loading, error, refetch } = useQuery(GET_VISITED_TOURS, {
		fetchPolicy: 'cache-and-network',
		notifyOnNetworkStatusChange: true,
		variables: { input },
	});
	const tours: Tour[] = data?.getVisited?.list ?? [];
	const total = data?.getVisited?.metaCounter?.[0]?.total ?? tours.length;

	return (
		<div className="acc-panel">
			<div className="pg-toolbar acc-toolbar">
				<div className="pg-count">{t('{{count}} tours viewed', { count: total })}</div>
			</div>

			{loading && tours.length === 0 && (
				<div className="pg-grid">
					{Array.from({ length: 6 }, (_, i) => (
						<div className="pg-skeleton" key={i} style={{ height: 330 }} />
					))}
				</div>
			)}

			{error && tours.length === 0 && !loading && (
				<div className="pg-state">
					<h3>{t('Could not load your history')}</h3>
					<p>{t('Please try again in a moment.')}</p>
					<button className="btn btn-sky" onClick={() => refetch({ input })} type="button">
						{t('Try again')}
					</button>
				</div>
			)}

			{!loading && !error && tours.length === 0 && (
				<div className="pg-state">
					<h3>{t('Nothing viewed yet')}</h3>
					<p>{t('Tours you open will appear here so you can find them again.')}</p>
					<Link className="btn btn-sky" href="/tour">
						{t('Start exploring')}
					</Link>
				</div>
			)}

			{tours.length > 0 && (
				<div className="pg-grid">
					{tours.map((tour) => (
						<TourCard detailed key={tour._id} tour={tour} />
					))}
				</div>
			)}
		</div>
	);
};

export default RecentlyViewedTours;
