import Swal from 'sweetalert2';
import 'animate.css';
import { i18n as activeI18n } from 'next-i18next';
import { Messages } from './config';
import { Message } from './enums/common.enum';

/**
 * Looks up a UI/validation string in common.json via next-i18next's own live
 * instance — its `i18n` export, kept up to date by appWithTranslation on
 * every render (see node_modules/next-i18next's appWithTranslation.js).
 *
 * This is NOT the same object a plain `import i18next from 'i18next'` would
 * give you: next-i18next calls `i18next.createInstance()` internally, so
 * that bare import resolves to a permanently separate, never-initialized
 * instance whose `t()` returns `undefined` for every key — which is what
 * made every SweetAlert2 dialog in this file render with an empty
 * title/text regardless of the message passed in, however that message was
 * styled. `activeI18n` can briefly be null before the app's first render
 * (e.g. very early SSR), so a missing/untranslated key still falls back to
 * the raw string rather than showing nothing — the same safe passthrough
 * this always intended to have.
 */
const t = (key: string) => activeI18n?.t(key) ?? key;

/**
 * Translates a message if it is a recognised UI/validation string (i.e. a key
 * in common.json — this covers the frontend's own `Message` enum values).
 * Backend-originated error text is not translated (the backend doesn't emit
 * locale-aware strings), so it passes through unchanged via the same
 * fallback `t()` already has.
 */
const tr = (msg: string) => (msg ? t(msg) : msg);

/**
 * Every message that means "you must be logged in to do this" — the frontend's
 * own pre-check (Message.NOT_AUTHENTICATED, thrown before a protected action
 * ever reaches the network) and the backend AuthGuard's matching message for a
 * session that expired mid-use. Mirrors the same two-string detection
 * apollo/client.ts already uses for session invalidation, so both paths are
 * recognised consistently instead of drifting apart.
 */
const LOGIN_REQUIRED_MESSAGES = [Message.NOT_AUTHENTICATED, 'You are not authenticated, please login first!'];
const isLoginRequiredMessage = (msg: unknown): boolean =>
	typeof msg === 'string' && LOGIN_REQUIRED_MESSAGES.includes(msg as Message);

/**
 * A protected action (like, save, follow, ...) attempted while logged out is
 * an expected gate, not a failure — shown with an info icon and an explicit,
 * clickable "OK" rather than the bare error rendering (icon:'error', no
 * title, no button) that otherwise made this look broken/empty.
 */
const fireLoginRequiredAlert = async () => {
	await Swal.fire({
		icon: 'info',
		title: tr(Message.NOT_AUTHENTICATED),
		showConfirmButton: true,
		confirmButtonText: t('OK'),
	});
};

export const sweetErrorHandling = async (err: any) => {
	if (isLoginRequiredMessage(err?.message)) {
		await fireLoginRequiredAlert();
		return;
	}
	await Swal.fire({
		icon: 'error',
		text: tr(err.message),
		showConfirmButton: false,
	});
};

export const sweetTopSuccessAlert = async (msg: string, duration: number = 2000) => {
	await Swal.fire({
		position: 'center',
		icon: 'success',
		title: tr(msg.replace('Definer: ', '')),
		showConfirmButton: false,
		timer: duration,
	});
};

export const sweetContactAlert = async (msg: string, duration: number = 10000) => {
	await Swal.fire({
		title: tr(msg),
		showClass: {
			popup: 'animate__bounceIn',
		},
		showConfirmButton: false,
		timer: duration,
	}).then();
};

export const sweetConfirmAlert = (msg: string) => {
	return new Promise(async (resolve, reject) => {
		await Swal.fire({
			icon: 'question',
			text: tr(msg),
			showClass: {
				popup: 'animate__bounceIn',
			},
			showCancelButton: true,
			showConfirmButton: true,
			confirmButtonColor: '#e92C28',
			cancelButtonColor: '#bdbdbd',
			confirmButtonText: t('OK'),
			cancelButtonText: t('Cancel'),
		}).then((response) => {
			if (response?.isConfirmed) resolve(true);
			else resolve(false);
		});
	});
};

export const sweetLoginConfirmAlert = (msg: string) => {
	return new Promise(async (resolve, reject) => {
		await Swal.fire({
			text: tr(msg),
			showCancelButton: true,
			showConfirmButton: true,
			color: '#212121',
			confirmButtonColor: '#e92C28',
			cancelButtonColor: '#bdbdbd',
			confirmButtonText: t('Log in'),
			cancelButtonText: t('Cancel'),
		}).then((response) => {
			if (response?.isConfirmed) resolve(true);
			else resolve(false);
		});
	});
};

export const sweetErrorAlert = async (msg: string, duration: number = 3000) => {
	if (isLoginRequiredMessage(msg)) {
		await fireLoginRequiredAlert();
		return;
	}
	await Swal.fire({
		icon: 'error',
		title: tr(msg),
		showConfirmButton: false,
		timer: duration,
	});
};

export const sweetMixinErrorAlert = async (msg: string, duration: number = 3000) => {
	if (isLoginRequiredMessage(msg)) {
		await fireLoginRequiredAlert();
		return;
	}
	await Swal.fire({
		icon: 'error',
		title: tr(msg),
		showConfirmButton: false,
		timer: duration,
	});
};

export const sweetMixinSuccessAlert = async (msg: string, duration: number = 2000) => {
	await Swal.fire({
		icon: 'success',
		title: tr(msg),
		showConfirmButton: false,
		timer: duration,
	});
};

export const sweetBasicAlert = async (text: string) => {
	Swal.fire(tr(text));
};

export const sweetErrorHandlingForAdmin = async (err: any) => {
	const errorMessage = err.message ?? Messages.error1;
	await Swal.fire({
		icon: 'error',
		text: tr(errorMessage),
		showConfirmButton: false,
	});
};

export const sweetTopSmallSuccessAlert = async (
	msg: string,
	duration: number = 2000,
	enable_forward: boolean = false,
) => {
	const Toast = Swal.mixin({
		toast: true,
		position: 'top-end',
		showConfirmButton: false,
		timer: duration,
		timerProgressBar: true,
	});

	Toast.fire({
		icon: 'success',
		title: tr(msg),
	}).then((data) => {
		if (enable_forward) {
			window.location.reload();
		}
	});
};
