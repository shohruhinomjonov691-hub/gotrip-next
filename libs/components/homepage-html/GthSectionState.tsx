import React from 'react';
import { useTranslation } from '../../i18n/useTranslation';

interface GthSectionStateProps {
	loading?: boolean;
	error?: boolean;
	empty?: boolean;
	loadingText?: string;
	emptyText?: string;
	errorText?: string;
	absolute?: boolean;
}

const GthSectionState = ({
	loading,
	error,
	empty,
	loadingText,
	emptyText,
	errorText,
	absolute,
}: GthSectionStateProps) => {
	const { t } = useTranslation();
	if (!loading && !error && !empty) return null;

	const resolvedLoadingText = loadingText ?? t('Loading…');
	const resolvedEmptyText = emptyText ?? t('Nothing to show yet.');
	const resolvedErrorText = errorText ?? t("Couldn't load this section. Please try again later.");

	return (
		<div className={absolute ? 'gth-state gth-state--absolute' : 'gth-state'}>
			{loading && <span className="gth-state-spinner" aria-hidden="true" />}
			<span>{error ? resolvedErrorText : loading ? resolvedLoadingText : resolvedEmptyText}</span>
		</div>
	);
};

export default GthSectionState;
