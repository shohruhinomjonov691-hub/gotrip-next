import { BoardArticleCategory, BoardArticleStatus } from '../../enums/board-article.enum';
import { Member } from '../member/member';
import { MeLiked, TotalCounter } from '../shared';
import { TranslationEntry } from '../../i18n/localization';

/** One locale's translated override for a subset of BoardArticle's text fields. */
export interface BoardArticleTranslation extends TranslationEntry<BoardArticle> {
	articleTitle?: string;
	articleContent?: string;
}

export interface BoardArticle {
	_id: string;
	articleCategory: BoardArticleCategory;
	articleStatus: BoardArticleStatus;
	articleTitle: string;
	articleContent: string;
	articleImage: string;
	articleImages?: string[];
	articleViews: number;
	articleLikes: number;
	articleComments: number;
	memberId: string;
	translations?: BoardArticleTranslation[];
	createdAt: Date;
	updatedAt: Date;
	/** from aggregation **/
	meLiked?: MeLiked[];
	memberData?: Member;
	readers?: Member[];
	readersCount?: number;
}

export interface BoardArticles {
	list: BoardArticle[];
	metaCounter: TotalCounter[];
}
