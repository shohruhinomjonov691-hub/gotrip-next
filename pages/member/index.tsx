import React, { useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutGth from '../../libs/components/layout/LayoutGth';
import TourCard from '../../libs/components/homepage-html/TourCard';
import ArticleCard from '../../libs/components/homepage-html/ArticleCard';
import FollowList from '../../libs/components/member/FollowList';
import { GET_BOARD_ARTICLES, GET_MEMBER, GET_TOURS } from '../../apollo/user/query';
import { LIKE_TARGET_MEMBER, LIKE_TARGET_TOUR, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { Direction, Message } from '../../libs/enums/common.enum';
import { Member } from '../../libs/types/member/member';
import { MemberType } from '../../libs/enums/member.enum';
import { Tour, Tours } from '../../libs/types/tour/tour';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { userVar } from '../../apollo/store';
import { getImageUrl, Messages } from '../../libs/config';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { useTranslation } from '../../libs/i18n/useTranslation';
import { getLocalizedField } from '../../libs/i18n/localization';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

/**
 * Tabs by member type. Only an AGENT publishes tours, so USER and ADMIN
 * profiles never show a Tours tab (it would always be empty and implies a
 * capability they do not have). Everything else is common to all profiles.
 */
const COMMON_TABS = [
	{ key: 'articles', label: 'Articles' },
	{ key: 'followers', label: 'Followers' },
	{ key: 'followings', label: 'Followings' },
];
const TOURS_TAB = { key: 'tours', label: 'Tours' };

const tabsFor = (memberType?: string) =>
	memberType === MemberType.AGENT ? [TOURS_TAB, ...COMMON_TABS] : COMMON_TABS;

const COVER_FALLBACK = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80';

const GuideProfilePage: NextPage = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [memberId, setMemberId] = useState<string>('');
	const [mounted, setMounted] = useState(false);

	const routeCategory: any = router.query?.category;

	/** APOLLO REQUESTS **/
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);
	const [likeTargetTour] = useMutation(LIKE_TARGET_TOUR);

	/** LIFECYCLES **/
	// On a statically-optimised page router.query is empty pre-hydration, so the
	// id is also read straight off the URL (same pattern as the other detail pages).
	useEffect(() => {
		setMounted(true);
		const fromRouter = router.query?.memberId as string | undefined;
		if (fromRouter) {
			setMemberId(fromRouter);
			return;
		}
		if (typeof window !== 'undefined') {
			const fromUrl = new URLSearchParams(window.location.search).get('memberId');
			if (fromUrl) setMemberId(fromUrl);
		}
	}, [router.query?.memberId]);

	const {
		data: memberData,
		loading: memberLoading,
		error: memberError,
		refetch: refetchMember,
	} = useQuery(GET_MEMBER, {
		fetchPolicy: 'cache-and-network',
		skip: !memberId,
		variables: { input: memberId },
	});
	const guide: Member | undefined = memberData?.getMember;
	const locale = router.locale ?? 'en';
	const localizedGuideDesc = guide ? getLocalizedField(guide, 'memberDesc', locale) : undefined;

	const tabs = tabsFor(guide?.memberType);

	/* `properties` is a legacy alias kept so old links still land on Tours.
	   A non-guide has no Tours tab, so anything pointing there falls back to the
	   first tab that type actually has. */
	const requested: string = routeCategory === 'properties' ? 'tours' : routeCategory ?? 'tours';
	const category: string = tabs.some((tab) => tab.key === requested) ? requested : tabs[0].key;

	const { data: toursData, loading: toursLoading, refetch: refetchTours } = useQuery<{ getTours: Tours }>(GET_TOURS, {
		fetchPolicy: 'cache-and-network',
		skip: !memberId || category !== 'tours',
		variables: {
			input: { page: 1, limit: 12, sort: 'createdAt', direction: Direction.DESC, search: { memberId } },
		},
	});
	const tours: Tour[] = toursData?.getTours?.list ?? [];

	const { data: articlesData, loading: articlesLoading } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		skip: !memberId || category !== 'articles',
		variables: {
			input: { page: 1, limit: 9, sort: 'createdAt', direction: Direction.DESC, search: { memberId } },
		},
	});
	const articles: BoardArticle[] = articlesData?.getBoardArticles?.list ?? [];

	const isSelf = !!user?._id && user._id === memberId;
	const iFollow = !!guide?.meFollowed?.[0]?.myFollowing;

	const stats = useMemo(
		() => [
			...(guide?.memberType === MemberType.AGENT ? [{ label: 'Tours', value: guide?.memberTours ?? 0 }] : []),
			{ label: 'Articles', value: guide?.memberArticles ?? 0 },
			{ label: 'Followers', value: guide?.memberFollowers ?? 0 },
			{ label: 'Following', value: guide?.memberFollowings ?? 0 },
			{ label: 'Likes', value: guide?.memberLikes ?? 0 },
			{ label: 'Views', value: guide?.memberViews ?? 0 },
		],
		[guide],
	);

	/** HANDLERS — unchanged mutations, refetch the profile so counts stay honest. */
	const setTab = (key: string) =>
		router.push({ pathname: '/member', query: { memberId, category: key } }, undefined, {
			shallow: true,
			scroll: false,
		});

	/* Persist tour likes from the profile too — the card previously toggled
	   locally only, so nothing was saved and the state reset on refresh. */
	const likeTourHandler = async (tourId: string) => {
		try {
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetTour({ variables: { tourId } });
			await refetchTours();
			await sweetTopSmallSuccessAlert(t('success'), 800);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const followHandler = async () => {
		try {
			if (!user?._id) throw new Error(Messages.error2);
			await subscribe({ variables: { input: memberId } });
			await sweetTopSmallSuccessAlert(t('Followed!'), 800);
			await refetchMember({ input: memberId });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const unfollowHandler = async () => {
		try {
			if (!user?._id) throw new Error(Messages.error2);
			await unsubscribe({ variables: { input: memberId } });
			await sweetTopSmallSuccessAlert(t('Unfollowed!'), 800);
			await refetchMember({ input: memberId });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const likeHandler = async () => {
		try {
			if (!user?._id) throw new Error(Messages.error2);
			await likeTargetMember({ variables: { input: memberId } });
			await sweetTopSmallSuccessAlert(t('Success!'), 800);
			await refetchMember({ input: memberId });
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	/* Handlers the shared FollowList expects. */
	const listSubscribe = async (id: string, refetch: any, query: any) => {
		try {
			if (!user?._id) throw new Error(Messages.error2);
			await subscribe({ variables: { input: id } });
			await sweetTopSmallSuccessAlert(t('Followed!'), 800);
			await refetch({ input: query });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};
	const listUnsubscribe = async (id: string, refetch: any, query: any) => {
		try {
			if (!user?._id) throw new Error(Messages.error2);
			await unsubscribe({ variables: { input: id } });
			await sweetTopSmallSuccessAlert(t('Unfollowed!'), 800);
			await refetch({ input: query });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};
	const listLike = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) return;
			if (!user?._id) throw new Error(Messages.error2);
			await likeTargetMember({ variables: { input: id } });
			await sweetTopSmallSuccessAlert(t('Success!'), 800);
			await refetch({ input: query });
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};
	const redirectToMemberPageHandler = async (id: string) => {
		try {
			if (id === user?._id) await router.push(`/mypage?memberId=${id}`);
			else await router.push(`/member?memberId=${id}`);
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	if (!guide && (memberError || (mounted && !memberId))) {
		return (
			<section className="pg-sec">
				<div className="wrap">
					<div className="pg-state">
						<h3>{t('Guide not found')}</h3>
						<p>{t('This profile may have been removed.')}</p>
					</div>
				</div>
			</section>
		);
	}

	const guideName = guide?.memberFullName || guide?.memberNick || '';

	return (
		<section className="pg-sec acc-sec">
			<div className="wrap">
				{/* ---------------- Profile header ---------------- */}
				<header className="pf-head gp-head">
					<div className="pf-cover">
						<img alt="" loading="lazy" src={guide?.memberCoverImage ? getImageUrl(guide.memberCoverImage) : COVER_FALLBACK} />
					</div>

					<div className="pf-id">
						<div className="pf-av-wrap">
							<img
								alt={guideName}
								className="pf-av"
								src={getImageUrl(guide?.memberImage, '/img/profile/defaultUser.svg')}
							/>
						</div>
						<div className="pf-id-body">
							<h2>{guideName || (memberLoading ? t('Loading…') : '')}</h2>
							<div className="pf-badges">
								{guide?.memberType && <span className="pf-badge">{t(guide.memberType)}</span>}
								{guide?.memberType === 'AGENT' && <span className="pf-badge ok">{t('Verified guide')}</span>}
								{guide?.memberAddress && <span className="pf-loc">{guide.memberAddress}</span>}
							</div>
						</div>

						{/* Follow / like — hidden on your own profile. */}
						{!isSelf && guide && (
							<div className="gp-actions">
								{iFollow ? (
									<button className="btn btn-outline" onClick={unfollowHandler} type="button">
										{t('Following')}
									</button>
								) : (
									<button className="btn btn-sky" onClick={followHandler} type="button">
										{t('Follow')}
									</button>
								)}
								<button className="btn btn-outline" onClick={likeHandler} type="button">
									{guide.meLiked?.[0]?.myFavorite ? t('Liked') : t('Like')}
								</button>
							</div>
						)}
					</div>

					{localizedGuideDesc && <p className="gp-bio">{localizedGuideDesc}</p>}

					<div className="pf-stats">
						{stats.map((s) => (
							<div key={s.label}>
								<b>{s.value}</b>
								<small>{t(s.label)}</small>
							</div>
						))}
					</div>
				</header>

				{/* ---------------- Tabs ---------------- */}
				<div className="cm-tabs gp-tabs" role="tablist" aria-label={t('Profile sections') as string}>
					{tabs.map((tab) => (
						<button
							aria-selected={category === tab.key}
							className={category === tab.key ? 'cm-tab on' : 'cm-tab'}
							key={tab.key}
							onClick={() => setTab(tab.key)}
							role="tab"
							type="button"
						>
							{t(tab.label)}
						</button>
					))}
				</div>

				{/* ---------------- Panels ---------------- */}
				<div className="acc-body">
					{category === 'tours' && (
						<>
							{toursLoading && tours.length === 0 && (
								<div className="pg-grid">
									{Array.from({ length: 3 }, (_, i) => (
										<div className="pg-skeleton" key={i} style={{ height: 330 }} />
									))}
								</div>
							)}
							{!toursLoading && tours.length === 0 && (
								<div className="pg-state">
									<h3>{t('No published tours')}</h3>
									<p>{t('{{name}} has not published any routes yet.', { name: guideName || t('This guide') })}</p>
								</div>
							)}
							{tours.length > 0 && (
								<div className="pg-grid">
									{tours.map((tour) => (
										<TourCard detailed key={tour._id} onLike={likeTourHandler} tour={tour} />
									))}
								</div>
							)}
						</>
					)}

					{category === 'articles' && (
						<>
							{articlesLoading && articles.length === 0 && (
								<div className="pg-grid">
									{Array.from({ length: 3 }, (_, i) => (
										<div className="pg-skeleton" key={i} style={{ height: 380 }} />
									))}
								</div>
							)}
							{!articlesLoading && articles.length === 0 && (
								<div className="pg-state">
									<h3>{t('No articles yet')}</h3>
									<p>{t('{{name}} has not written anything for the community.', { name: guideName || t('This guide') })}</p>
								</div>
							)}
							{articles.length > 0 && (
								<div className="pg-grid">
									{articles.map((article) => (
										<ArticleCard article={article} key={article._id} />
									))}
								</div>
							)}
						</>
					)}

					{category === 'followers' && (
						<FollowList
							likeMemberHandler={listLike}
							mode="followers"
							redirectToMemberPageHandler={redirectToMemberPageHandler}
							subscribeHandler={listSubscribe}
							unsubscribeHandler={listUnsubscribe}
						/>
					)}

					{category === 'followings' && (
						<FollowList
							likeMemberHandler={listLike}
							mode="followings"
							redirectToMemberPageHandler={redirectToMemberPageHandler}
							subscribeHandler={listSubscribe}
							unsubscribeHandler={listUnsubscribe}
						/>
					)}
				</div>
			</div>
		</section>
	);
};

export default withLayoutGth(GuideProfilePage);
