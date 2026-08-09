import React from 'react';
import FollowList from './FollowList';
import { FollowInquiry } from '../../types/follow/follow.input';

interface MemberFollowsProps {
	initialInput?: FollowInquiry;
	subscribeHandler: any;
	unsubscribeHandler: any;
	likeMemberHandler: any;
	redirectToMemberPageHandler: any;
}

const MemberFollowers = (props: MemberFollowsProps) => <FollowList mode="followers" {...props} />;

export default MemberFollowers;
