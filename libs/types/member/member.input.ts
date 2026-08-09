import { MemberAuthType, MemberStatus, MemberType, AgentRequestStatus } from '../../enums/member.enum';
import { Direction } from '../../enums/common.enum';
import { TourCategory, TourLanguage } from '../../enums/tour.enum';

export interface MemberInput {
	memberNick: string;
	memberPassword: string;
	memberPhone: string;
	memberType?: MemberType;
	memberAuthType?: MemberAuthType;
}

export interface LoginInput {
	memberNick: string;
	memberPassword: string;
}

interface AISearch {
	text?: string;
	languages?: TourLanguage[];
	specialties?: TourCategory[];
	location?: string;
}

export interface AgentsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: AISearch;
}

interface MISearch {
	memberStatus?: MemberStatus;
	memberType?: MemberType;
	/* Backend MISearch already accepts this — used by the admin Guide Requests screen. */
	agentRequestStatus?: AgentRequestStatus;
	text?: string;
}

export interface MembersInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: MISearch;
}
