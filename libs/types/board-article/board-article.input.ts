import { BoardArticleCategory, BoardArticleStatus } from '../../enums/board-article.enum';
import { Direction } from '../../enums/common.enum';

export interface BoardArticleInput {
	articleCategory: BoardArticleCategory;
	articleTitle: string;
	articleContent: string;
	articleImage: string;
	memberId?: string;
}

interface BAISearch {
	// All three are optional on the server (BAISearch in board-article.input.ts) — an
	// omitted category means "every category".
	articleCategory?: BoardArticleCategory;
	text?: string;
	memberId?: string;
}

export interface BoardArticlesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: BAISearch;
}

interface ABAISearch {
	articleStatus?: BoardArticleStatus;
	articleCategory?: BoardArticleCategory;
}

export interface AllBoardArticlesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: ABAISearch;
}
