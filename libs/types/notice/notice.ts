import { NoticeCategory, NoticeStatus } from '../../enums/notice.enum';
import { TotalCounter } from '../shared';
import { TranslationEntry } from '../../i18n/localization';

/** One locale's translated override for a subset of Notice's text fields (also backs FAQ content). */
export interface NoticeTranslation extends TranslationEntry<Notice> {
	noticeTitle?: string;
	noticeContent?: string;
}

export interface Notice {
	_id: string;
	noticeCategory: NoticeCategory;
	noticeStatus: NoticeStatus;
	noticeTitle: string;
	noticeContent: string;
	memberId: string;
	translations?: NoticeTranslation[];
	createdAt: Date;
	updatedAt: Date;
}

export interface Notices {
	list: Notice[];
	metaCounter: TotalCounter[];
}
