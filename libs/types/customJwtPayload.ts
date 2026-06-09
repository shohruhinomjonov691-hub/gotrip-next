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
	memberPoints: number;
	memberLikes: number;
	memberViews: number;
	memberWarnings: number;
	memberBlocks: number;
	agentRequestStatus?: string;
	agentRequestMessage?: string;
	agentExperience?: string;
	agentApprovedAt?: Date;
	agentRejectedAt?: Date;
	isVerifiedAgent?: boolean;
}
