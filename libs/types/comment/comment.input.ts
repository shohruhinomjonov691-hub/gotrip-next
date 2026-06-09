import { CommentGroup } from '../../enums/comment.enum';
import { Direction } from '../../enums/common.enum';

export interface CommentInput {
	commentGroup: CommentGroup;
	commentContent: string;
	commentRefId: string;
	rating?: number;
	parentCommentId?: string;
	memberId?: string;
}

interface CISearch {
	commentGroup: CommentGroup;
	commentRefId: string;
	parentCommentId?: string;
}

export interface CommentsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: CISearch;
}
