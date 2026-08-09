import { TotalCounter } from '../shared';
import { CategoryStatus, CategoryType } from '../../enums/category.enum';
import { TranslationEntry } from '../../i18n/localization';

/** One locale's translated override for a subset of Category's text fields. */
export interface CategoryTranslation extends TranslationEntry<Category> {
	categoryName?: string;
	categoryDesc?: string;
}

export interface Category {
	_id: string;
	categoryType: CategoryType;
	categoryKey: string;
	categoryStatus: CategoryStatus;
	categoryName: string;
	categoryDesc?: string;
	categoryImage?: string;
	categoryIcon?: string;
	categoryOrder: number;
	translations?: CategoryTranslation[];
	createdAt: Date;
	updatedAt: Date;
}

export interface Categories {
	list: Category[];
	metaCounter: TotalCounter[];
}
