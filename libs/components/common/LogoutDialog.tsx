import React, { useEffect, useRef } from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import ModalPortal from './ModalPortal';

interface LogoutDialogProps {
	open: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

/**
 * Replaces the generic SweetAlert2 logout confirmation with a dialog that
 * matches the GoTrip design system (.gt-modal / .gt-scrim tokens from
 * scss/foundation/_components.scss, .btn variants from .gth-root). Rendered
 * through ModalPortal (into document.body) so it's never at the mercy of an
 * ancestor's stacking context — the .btn and .gt-modal classes are global
 * SCSS, not CSS-modules-scoped, so portaling doesn't lose access to them.
 */
const LogoutDialog = ({ open, onConfirm, onCancel }: LogoutDialogProps) => {
	const { t } = useTranslation();
	const cancelRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (!open) return;
		cancelRef.current?.focus();

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onCancel();
		};
		document.addEventListener('keydown', onKeyDown);
		return () => document.removeEventListener('keydown', onKeyDown);
	}, [open, onCancel]);

	if (!open) return null;

	return (
		<ModalPortal>
			<div className="gt-scrim" onClick={onCancel} />
			<div className="gt-modal" role="presentation" onClick={onCancel}>
				<div
					aria-describedby="logout-dialog-desc"
					aria-labelledby="logout-dialog-title"
					aria-modal="true"
					className="gt-modal__panel logout-dlg"
					role="alertdialog"
					onClick={(e) => e.stopPropagation()}
				>
					<span className="logout-dlg__icon" aria-hidden="true">
						<svg viewBox="0 0 24 24">
							<path d="M14 7.5V5.5a2 2 0 00-2-2H6a2 2 0 00-2 2v13a2 2 0 002 2h6a2 2 0 002-2v-2" />
							<path d="M10 12h10m0 0l-3-3m3 3l-3 3" />
						</svg>
					</span>
					<h3 className="logout-dlg__title" id="logout-dialog-title">
						{t('Log out of GoTrip?')}
					</h3>
					<p className="logout-dlg__desc" id="logout-dialog-desc">
						{t("You'll need to sign in again to access your account and messages.")}
					</p>
					<div className="logout-dlg__actions">
						<button className="btn btn-outline" ref={cancelRef} type="button" onClick={onCancel}>
							{t('Cancel')}
						</button>
						<button className="btn btn-error" type="button" onClick={onConfirm}>
							{t('Logout')}
						</button>
					</div>
				</div>
			</div>
		</ModalPortal>
	);
};

export default LogoutDialog;
