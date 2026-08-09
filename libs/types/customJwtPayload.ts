import { JwtPayload } from 'jwt-decode';

export interface CustomJwtPayload extends JwtPayload {
	_id: string;
	memberType: string;
	memberStatus: string;
	memberAuthType: string;
	memberPhone: string;
	memberNick: string;
	memberFullName?: string;
	memberImage?: string;
	memberAddress?: string;
	memberDesc?: string;
	memberTours: number;
	memberProperties?: number;
	memberRank: number;
	memberArticles: number;
	/* Present in the signed token (see Member.model) — declared so the account
	   sidebar can show follow counts without an extra query. */
	memberFollowers?: number;
	memberFollowings?: number;
	/* Also signed into the token; drives the Become-a-Guide card state. */
	agentRequestStatus?: string;
	agentRequestMessage?: string;
	memberPoints: number;
	memberLikes: number;
	memberViews: number;
	memberWarnings: number;
	memberBlocks: number;
}
