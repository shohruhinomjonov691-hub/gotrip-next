import Swal from 'sweetalert2';
import 'animate.css';
import i18next from 'i18next';
import { Messages } from './config';

/**
 * Translates a message if it is a recognised UI/validation string (i.e. a key
 * in common.json — this covers the frontend's own `Message` enum values).
 * Backend-originated error text is not translated (the backend doesn't emit
 * locale-aware strings) — i18next's default missing-key behaviour returns the
 * string unchanged, so this is a safe no-op passthrough for those.
 */
const tr = (msg: string) => (msg ? i18next.t(msg) : msg);

export const sweetErrorHandling = async (err: any) => {
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
			confirmButtonText: i18next.t('OK'),
			cancelButtonText: i18next.t('Cancel'),
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
			confirmButtonText: i18next.t('Log in'),
			cancelButtonText: i18next.t('Cancel'),
		}).then((response) => {
			if (response?.isConfirmed) resolve(true);
			else resolve(false);
		});
	});
};

export const sweetErrorAlert = async (msg: string, duration: number = 3000) => {
	await Swal.fire({
		icon: 'error',
		title: tr(msg),
		showConfirmButton: false,
		timer: duration,
	});
};

export const sweetMixinErrorAlert = async (msg: string, duration: number = 3000) => {
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
