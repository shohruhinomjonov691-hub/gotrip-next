import { MemberAuthType, MemberStatus, MemberType, AgentRequestStatus } from '../../enums/member.enum';
import { TourCategory, TourLanguage } from '../../enums/tour.enum';
import { MeLiked, TotalCounter } from '../shared';
import { MeFollowed } from '../follow/follow';
import { TranslationEntry } from '../../i18n/localization';

export interface MemberTranslation extends TranslationEntry<Member> {}

export interface MemberSocial {
	facebook?: string;
	twitter?: string;
	linkedin?: string;
	youtube?: string;
	instagram?: string;
}

export interface Member {
	_id: string;
	memberType: MemberType;
	memberStatus: MemberStatus;
	memberAuthType: MemberAuthType;
	memberPhone: string;
	memberNick: string;
	memberPassword?: string;
	memberFullName?: string;
	memberImage?: string;
	memberCoverImage?: string;
	memberAddress?: string;
	memberDesc?: string;
	agentExperience?: string;
	agentRequestStatus?: AgentRequestStatus;
	agentRequestMessage?: string;
	memberLanguages?: TourLanguage[];
	memberSpecialties?: TourCategory[];
	memberSocial?: MemberSocial;
	translations?: MemberTranslation[];
	memberTours: number;
	memberProperties?: number;
	memberRank: number;
	memberArticles: number;
	memberPoints: number;
	memberLikes: number;
	memberFollowers?: number;
	memberFollowings?: number;
	memberViews: number;
	memberComments: number;
	memberWarnings: number;
	memberBlocks: number;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	// Enable for authentications
	meLiked?: MeLiked[];
	meFollowed?: MeFollowed[];
	accessToken?: string;
}

export interface Members {
	list: Member[];
	metaCounter: TotalCounter[];
}
