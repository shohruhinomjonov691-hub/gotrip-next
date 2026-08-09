import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useReactiveVar } from '@apollo/client';
import { FollowInquiry } from '../../types/follow/follow.input';
import { Follower, Following } from '../../types/follow/follow';
import { getImageUrl } from '../../config';
import { userVar } from '../../../apollo/store';
import { GET_MEMBER_FOLLOWERS, GET_MEMBER_FOLLOWINGS } from '../../../apollo/user/query';
import { useTranslation } from '../../i18n/useTranslation';

/**
 * Shared renderer for the Followers and Followings screens. Both used to be
 * byte-for-byte identical apart from the query, the search key and which side of
 * the relation holds the member data — so that is all this takes as config.
 */
export type FollowMode = 'followers' | 'followings';

interface FollowListProps {
	mode: FollowMode;
	initialInput?: FollowInquiry;
	subscribeHandler: any;
	unsubscribeHandler: any;
	likeMemberHandler: any;
	redirectToMemberPageHandler: any;
}

const DEFAULT_INPUT: FollowInquiry = { page: 1, limit: 12, search: { followingId: '' } };

const HeartIcon = ({ filled }: { filled?: boolean }) => (
	<svg className={filled ? 'fl-heart on' : 'fl-heart'} viewBox="0 0 24 24">
		<path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0112 8.2a4.1 4.1 0 017.5 2.4C19.5 15.4 12 20 12 20z" />
	</svg>
);

const FollowList = (props: FollowListProps) => {
	const { t } = useTranslation();
	const {
		mode,
		initialInput = DEFAULT_INPUT,
		subscribeHandler,
		unsubscribeHandler,
		likeMemberHandler,
		redirectToMemberPageHandler,
	} = props;

	const isFollowers = mode === 'followers';
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [followInquiry, setFollowInquiry] = useState<FollowInquiry>(initialInput);

	/** APOLLO REQUESTS — unchanged queries, one or the other by mode. **/
	const searchKey = isFollowers ? 'followingId' : 'followerId';
	const { data, loading, error, refetch } = useQuery(isFollowers ? GET_MEMBER_FOLLOWERS : GET_MEMBER_FOLLOWINGS, {
		fetchPolicy: 'network-only',
		variables: { input: followInquiry },
		skip: !(followInquiry?.search as any)?.[searchKey],
		notifyOnNetworkStatusChange: true,
	});

	const rows: (Follower & Following)[] = isFollowers
		? data?.getMemberFollowers?.list ?? []
		: data?.getMemberFollowings?.list ?? [];
	const total: number = isFollowers
		? data?.getMemberFollowers?.metaCounter?.[0]?.total ?? 0
		: data?.getMemberFollowings?.metaCounter?.[0]?.total ?? 0;
	const totalPages = Math.ceil(total / (followInquiry.limit || 12)) || 1;

	/** LIFECYCLES **/
	useEffect(() => {
		const id = (router.query.memberId as string) || user?._id;
		setFollowInquiry((prev) => ({ ...prev, search: { [searchKey]: id } as any }));
	}, [router.query.memberId, user?._id, searchKey]);

	/** HANDLERS **/
	const paginationHandler = (value: number) => setFollowInquiry({ ...followInquiry, page: value });

	return (
		<div className="acc-panel">
			<div className="pg-toolbar acc-toolbar">
				<div className="pg-count">
					{isFollowers ? t('{{count}} followers', { count: total }) : t('{{count}} followings', { count: total })}
				</div>
			</div>

			{loading && rows.length === 0 && (
				<div className="fl-grid">
					{Array.from({ length: 6 }, (_, i) => (
						<div className="pg-skeleton" key={i} style={{ height: 180, borderRadius: 20 }} />
					))}
				</div>
			)}

			{error && rows.length === 0 && !loading && (
				<div className="pg-state">
					<h3>{isFollowers ? t('Could not load followers') : t('Could not load followings')}</h3>
					<p>{t('Please try again in a moment.')}</p>
					<button className="btn btn-sky" onClick={() => refetch({ input: followInquiry })} type="button">
						{t('Try again')}
					</button>
				</div>
			)}

			{!loading && !error && rows.length === 0 && (
				<div className="pg-state">
					<h3>{isFollowers ? t('No followers yet') : t('No followings yet')}</h3>
					<p>
						{isFollowers
							? t('Travellers who follow you will show up here.')
							: t('Follow guides and travellers to see them here.')}
					</p>
				</div>
			)}

			{rows.length > 0 && (
				<>
					<div className="fl-grid">
						{rows.map((row) => {
							const person = isFollowers ? row.followerData : row.followingData;
							const relationId = isFollowers ? row.followerId : row.followingId;
							/* getImageUrl passes absolute URLs through untouched — seeded members
							   store full https URLs, which raw concatenation broke. */
							const image = getImageUrl(person?.memberImage);
							const iFollow = row.meFollowed && row.meFollowed[0]?.myFollowing;
							const iLike = row.meLiked && row.meLiked[0]?.myFavorite;

							return (
								<article className="fl-card" key={row._id}>
									<button
										className="fl-id"
										onClick={() => redirectToMemberPageHandler(person?._id)}
										type="button"
									>
										<img alt="" className="fl-av" src={image} />
										<b>{person?.memberNick}</b>
										{person?.memberType && <span className="fl-role">{t(person.memberType)}</span>}
									</button>

									<div className="fl-stats">
										<div>
											<b>{person?.memberFollowers ?? 0}</b>
											<small>{t('Followers')}</small>
										</div>
										<div>
											<b>{person?.memberFollowings ?? 0}</b>
											<small>{t('Following')}</small>
										</div>
										<button
											aria-label={(iLike ? t('Unlike member') : t('Like member')) as string}
											className="fl-like"
											onClick={() => likeMemberHandler(person?._id, refetch, followInquiry)}
											type="button"
										>
											<HeartIcon filled={!!iLike} />
											<small>{person?.memberLikes ?? 0}</small>
										</button>
									</div>

									{user?._id !== relationId && (
										<div className="fl-act">
											{iFollow ? (
												<button
													className="btn btn-outline fl-unfollow"
													onClick={() => unsubscribeHandler(person?._id, refetch, followInquiry)}
													type="button"
												>
													{t('Unfollow')}
												</button>
											) : (
												<button
													className="btn btn-sky"
													onClick={() => subscribeHandler(person?._id, refetch, followInquiry)}
													type="button"
												>
													{t('Follow')}
												</button>
											)}
										</div>
									)}
								</article>
							);
						})}
					</div>

					{totalPages > 1 && (
						<nav aria-label={isFollowers ? t('Followers pages') : t('Followings pages')} className="pg-pager">
							<button
								disabled={(followInquiry.page || 1) <= 1}
								onClick={() => paginationHandler((followInquiry.page || 1) - 1)}
								type="button"
							>
								{t('Prev')}
							</button>
							{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
								<button
									aria-current={p === followInquiry.page ? 'page' : undefined}
									className={p === followInquiry.page ? 'on' : ''}
									key={p}
									onClick={() => paginationHandler(p)}
									type="button"
								>
									{p}
								</button>
							))}
							<button
								disabled={(followInquiry.page || 1) >= totalPages}
								onClick={() => paginationHandler((followInquiry.page || 1) + 1)}
								type="button"
							>
								{t('Next')}
							</button>
						</nav>
					)}
				</>
			)}
		</div>
	);
};

export default FollowList;
