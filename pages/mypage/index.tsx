import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import withLayoutGth from '../../libs/components/layout/LayoutGth';
import MyTours from '../../libs/components/mypage/MyTours';
import SavedTours from '../../libs/components/mypage/SavedTours';
import RecentlyViewedTours from '../../libs/components/mypage/RecentlyViewedTours';
import AddNewTour from '../../libs/components/mypage/AddNewTour';
import MyProfile from '../../libs/components/mypage/MyProfile';
import MyArticles from '../../libs/components/mypage/MyArticles';
import NotificationsCenter from '../../libs/components/mypage/NotificationsCenter';
import MessagesCenter from '../../libs/components/mypage/MessagesCenter';
import BecomeGuide from '../../libs/components/mypage/BecomeGuide';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { getJwtToken } from '../../libs/auth';
import MyMenu from '../../libs/components/mypage/MyMenu';
import WriteArticle from '../../libs/components/mypage/WriteArticle';
import MemberFollowers from '../../libs/components/member/MemberFollowers';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import MemberFollowings from '../../libs/components/member/MemberFollowings';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { Messages } from '../../libs/config';
import { useTranslation } from '../../libs/i18n/useTranslation';

const legacyCategoryAliases: Record<string, string> = {
	addProperty: 'addTour',
	myProperties: 'myTours',
	myFavorites: 'savedTours',
	recentlyVisited: 'recentlyViewed',
};

/** Heading shown above the panel for each section. */
const SECTION_META: Record<string, { title: string; sub: string }> = {
	myProfile: { title: 'My profile', sub: 'Your public details and how other travellers see you.' },
	becomeGuide: { title: 'Become a Guide', sub: 'Publish your own tours and take travellers along.' },
	savedTours: { title: 'Saved tours', sub: 'Everything you have hearted, ready when you are.' },
	recentlyViewed: { title: 'Recently viewed', sub: 'Pick up browsing where you left off.' },
	notifications: { title: 'Notifications', sub: 'Replies, follows, likes and platform notices.' },
	/* Copy updated with the move from the single global "lounge" room to private
	   one-to-one conversations. */
	messages: { title: 'Messages', sub: 'Your private conversations with travellers and guides.' },
	followers: { title: 'Followers', sub: 'Travellers following your trips and articles.' },
	followings: { title: 'Followings', sub: 'People and guides you follow.' },
	myArticles: { title: 'My articles', sub: 'Everything you have published to the community.' },
	writeArticle: { title: 'Write an article', sub: 'Share a route, a tip or a story from the road.' },
	myTours: { title: 'My tours', sub: 'Tours you run, with live views, likes and seats.' },
	addTour: { title: 'Add a tour', sub: 'Publish a new guided route to the catalogue.' },
};

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const MyPage: NextPage = () => {
	const { t } = useTranslation();
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const [urlCategory, setUrlCategory] = useState<string>('');

	/* On this statically-optimised page router.query is empty until the router
	   hydrates, so a deep link such as /mypage?category=writeArticle rendered the
	   Profile section instead. Read the URL directly as a fallback. */
	useEffect(() => {
		if (typeof window === 'undefined') return;
		setUrlCategory(new URLSearchParams(window.location.search).get('category') ?? '');
	}, [router.asPath]);

	const routeCategory = (router.query?.category as string | undefined) || urlCategory || undefined;
	const category: any =
		(typeof routeCategory === 'string' && legacyCategoryAliases[routeCategory]) || routeCategory || 'myProfile';

	/** APOLLO REQUESTS **/
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	/** LIFECYCLES **/
	/* userVar is populated by the layout's effect, and React runs a child's
	   effects BEFORE its parent's — so on a direct hit, refresh or bookmark of
	   /mypage this guard used to see the empty default user and bounce an
	   authenticated member straight back to '/'. Verified in the browser: the
	   page redirected to '/' while a valid ADMIN token was in localStorage.
	   The token is the source of truth available synchronously, so redirect only
	   when there genuinely is no session; once userVar hydrates the guard is a
	   no-op for signed-in members and still ejects real guests. */
	useEffect(() => {
		if (user._id) return;
		if (!getJwtToken()) router.push('/').then();
	}, [user, router]);

	useEffect(() => {
		if (!router.isReady || typeof routeCategory !== 'string') return;
		const canonicalCategory = legacyCategoryAliases[routeCategory];
		if (!canonicalCategory) return;

		router.replace(
			{
				pathname: router.pathname,
				query: { ...router.query, category: canonicalCategory },
			},
			undefined,
			{ shallow: true, scroll: false },
		);
	}, [routeCategory, router]);

	/** HANDLERS **/
	const subscribeHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);

			await subscribe({
				variables: {
					input: id,
				},
			});
			await sweetTopSmallSuccessAlert(t('Subscribed!'), 800);
			await refetch({ input: query });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const unsubscribeHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);

			await unsubscribe({
				variables: {
					input: id,
				},
			});
			await sweetTopSmallSuccessAlert(t('Subscribed!'), 800);
			await refetch({ input: query });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const likeMemberHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) return;
			if (!user?._id) throw new Error(Messages.error2);

			await likeTargetMember({
				variables: {
					input: id,
				},
			});
			await sweetTopSmallSuccessAlert(t('Success!'), 800);
			await refetch({ input: query });
		} catch (err: any) {
			console.log('ERROR, likeMemberHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const redirectToMemberPageHandler = async (memberId: string) => {
		try {
			if (memberId === user?._id) await router.push(`/mypage?memberId=${memberId}`);
			else await router.push(`/member?memberId=${memberId}`);
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	const rawMeta = SECTION_META[category] ?? SECTION_META.myProfile;
	const meta = { title: t(rawMeta.title), sub: t(rawMeta.sub) };
	/* Messages runs its own full-height chrome, so it opts out of the standard panel. */
	const bare = category === 'messages';

	return (
		<section className="pg-sec acc-sec">
			<div className="wrap">
				<div className="acc-layout">
					<MyMenu />

					<div className="acc-main">
						<header className="acc-head">
							<h2>{meta.title}</h2>
							<p>{meta.sub}</p>
						</header>

						<div className={bare ? 'acc-body bare' : 'acc-body'}>
							{category === 'addTour' && <AddNewTour />}
							{category === 'myTours' && <MyTours />}
							{category === 'savedTours' && <SavedTours />}
							{category === 'recentlyViewed' && <RecentlyViewedTours />}
							{category === 'notifications' && <NotificationsCenter />}
							{category === 'messages' && <MessagesCenter />}
							{category === 'becomeGuide' && <BecomeGuide />}
							{category === 'myArticles' && <MyArticles />}
							{category === 'writeArticle' && <WriteArticle />}
							{category === 'myProfile' && <MyProfile />}
							{category === 'followers' && (
								<MemberFollowers
									subscribeHandler={subscribeHandler}
									unsubscribeHandler={unsubscribeHandler}
									likeMemberHandler={likeMemberHandler}
									redirectToMemberPageHandler={redirectToMemberPageHandler}
								/>
							)}
							{category === 'followings' && (
								<MemberFollowings
									subscribeHandler={subscribeHandler}
									unsubscribeHandler={unsubscribeHandler}
									likeMemberHandler={likeMemberHandler}
									redirectToMemberPageHandler={redirectToMemberPageHandler}
								/>
							)}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default withLayoutGth(MyPage);
