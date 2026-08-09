import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const MODAL_ROOT_ID = 'gt-modal-root';

function getOrCreateModalRoot(): HTMLElement {
	let root = document.getElementById(MODAL_ROOT_ID);
	if (!root) {
		root = document.createElement('div');
		root.id = MODAL_ROOT_ID;
		document.body.appendChild(root);
	}
	return root;
}

/**
 * The one shared mount point for every blocking dialog/alert/confirmation.
 * Portals children straight to `document.body`, so a dialog's `position:
 * fixed` box is never at the mercy of an ancestor picking up `transform` /
 * `filter` / `will-change` somewhere in the page tree (framer-motion panels,
 * MUI Stacks, etc.) — the class of bug that let dialogs render clipped or
 * out of place despite a "correct" z-index. Pair with the `--gt-z-modal`
 * token (scss/foundation/_tokens.scss) on the portaled content so it also
 * outranks the AI launcher/window and toasts.
 *
 * Content is wrapped in a `.gth-root` div. The site's colors, fonts, dark-
 * mode overrides, and even `.btn`'s own base shape are all custom properties
 * and rules scoped to `.gth-root` (scss/pc/homepage-html/_tokens.scss) —
 * portaling straight to `document.body` put dialogs outside that scope
 * entirely, so every `.gth-root`-scoped style silently stopped applying
 * (wrong width, unstyled buttons, unthemed text) despite the dialog's own
 * stylesheet being completely correct. Re-establishing the `.gth-root`
 * ancestor here fixes it for this dialog and every future one built the
 * same way, in one place, instead of duplicating tokens per-component.
 */
const ModalPortal = ({ children }: { children: React.ReactNode }) => {
	const [root, setRoot] = useState<HTMLElement | null>(null);

	useEffect(() => {
		setRoot(getOrCreateModalRoot());
	}, []);

	if (!root) return null;
	return createPortal(<div className="gth-root">{children}</div>, root);
};

export default ModalPortal;
