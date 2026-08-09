import React from 'react';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import { useTranslation } from '../../i18n/useTranslation';

/* The TUI editor is browser-only and carries the whole article submit flow. */
const TuiEditor = dynamic(() => import('../community/Teditor'), { ssr: false });

const WriteArticle: NextPage = () => {
	const { t } = useTranslation();
	return (
		<div className="acc-panel wa-wrap">
			<div className="wa-tips">
				<h4>{t('Before you publish')}</h4>
				<ul>
					<li>{t('Give the piece a clear title — it is the first thing travellers see.')}</li>
					<li>{t('Pick the category that matches your story so the right readers find it.')}</li>
					<li>{t('A cover image makes a card far more likely to be opened.')}</li>
				</ul>
			</div>

			<div className="wa-editor">
				<TuiEditor />
			</div>
		</div>
	);
};

export default WriteArticle;
