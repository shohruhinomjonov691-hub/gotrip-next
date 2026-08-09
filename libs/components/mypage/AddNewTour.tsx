import React, { useRef, useState } from 'react';
import axios from 'axios';
import { useMutation } from '@apollo/client';
import { getImageUrl, Messages } from '../../config';
import { getJwtToken } from '../../auth';
import { CREATE_TOUR } from '../../../apollo/user/mutation';
import { TourCategory, TourDifficulty, TourLanguage, TourLocation } from '../../enums/tour.enum';
import { TourInput } from '../../types/tour/tour.input';
import { sweetErrorHandling, sweetMixinSuccessAlert } from '../../sweetAlert';
import { useTranslation } from '../../i18n/useTranslation';

const initial: TourInput = {
	tourCategory: TourCategory.CITY,
	tourLocation: TourLocation.SEOUL,
	tourTitle: '',
	tourPrice: 0,
	tourDuration: 1,
	tourMaxPeople: 10,
	tourMinPeople: 1,
	tourAvailableSeats: 10,
	tourImages: [],
	tourDesc: '',
	tourMeetingPoint: '',
	tourLanguage: TourLanguage.ENGLISH,
	tourDifficulty: TourDifficulty.EASY,
};

/** The backend caps a single upload batch; this matches the UX the form asks for. */
const MAX_IMAGES = 5;
const ACCEPTED = 'image/jpg, image/jpeg, image/png';

const NUMBER_FIELDS: { key: keyof TourInput; label: string }[] = [
	{ key: 'tourPrice', label: 'Price ($)' },
	{ key: 'tourDuration', label: 'Duration (days)' },
	{ key: 'tourAvailableSeats', label: 'Available seats' },
	{ key: 'tourMinPeople', label: 'Min people' },
	{ key: 'tourMaxPeople', label: 'Max people' },
];

export default function AddNewTour() {
	const { t } = useTranslation();
	const [i, setI] = useState<TourInput>(initial);
	const [c, { loading }] = useMutation(CREATE_TOUR);
	const fileRef = useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = useState(false);
	const [uploadError, setUploadError] = useState('');

	const set = (k: keyof TourInput, v: any) => setI({ ...i, [k]: v });

	/**
	 * BUG THIS FIXES (reproduced in the browser): typing "100" into Price, which
	 * starts pre-filled at 0, produced "0100". Root cause — a native
	 * `<input type="number">` does not canonicalize what has been typed until
	 * blur, and clicking into the field placed the cursor before the existing
	 * "0" rather than selecting it, so each keystroke inserted around it instead
	 * of replacing it. `onFocus` selecting the field's text is the primary fix
	 * (the first keystroke then replaces the old value outright); stripping a
	 * leading zero here is the second layer, so even a paste or a fast multi-key
	 * sequence still resolves to a clean number.
	 */
	const numberChangeHandler = (key: keyof TourInput, raw: string) => {
		const cleaned = raw.replace(/^0+(?=\d)/, '');
		set(key, cleaned === '' ? 0 : Number(cleaned));
	};

	/**
	 * Reuses the existing `imagesUploader` mutation with target "tour" — the same
	 * multipart flow the profile and article editors already use. No new upload
	 * API is introduced. Paths returned by the server are stored on tourImages.
	 */
	const uploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const picked = Array.from(e.target.files ?? []);
		if (!picked.length) return;
		setUploadError('');

		const room = MAX_IMAGES - i.tourImages.length;
		if (room <= 0) {
			setUploadError(t('You can upload up to {{count}} images.', { count: MAX_IMAGES }));
			e.target.value = '';
			return;
		}
		const files = picked.slice(0, room);

		try {
			setUploading(true);
			const formData = new FormData();
			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImagesUploader($files: [Upload!]!, $target: String!) {
						imagesUploader(files: $files, target: $target)
					}`,
					variables: { files: files.map(() => null), target: 'tour' },
				}),
			);
			formData.append('map', JSON.stringify(Object.fromEntries(files.map((_, n) => [n, [`variables.files.${n}`]]))));
			files.forEach((file, n) => formData.append(String(n), file));

			const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${getJwtToken()}`,
				},
			});

			const uploaded: string[] = response.data?.data?.imagesUploader ?? [];
			if (!uploaded.length) throw new Error(Messages.error1);
			setI((prev) => ({ ...prev, tourImages: [...prev.tourImages, ...uploaded] }));
		} catch (err: any) {
			setUploadError(err?.message ?? t('Upload failed. Only jpg, jpeg and png are allowed.'));
		} finally {
			setUploading(false);
			e.target.value = '';
		}
	};

	const removeImage = (path: string) =>
		setI((prev) => ({ ...prev, tourImages: prev.tourImages.filter((p) => p !== path) }));

	const submit = async () => {
		try {
			await c({ variables: { input: i } });
			setI(initial);
			setUploadError('');
			await sweetMixinSuccessAlert(t('Tour created successfully.'));
		} catch (e) {
			await sweetErrorHandling(e);
		}
	};

	return (
		<div className="acc-panel">
			<section className="pg-panel at-form">
				<h3 className="pg-panel-title">{t('Tour essentials')}</h3>
				<p className="at-note">{t('Everything travellers need to book with confidence.')}</p>

				<div className="fl-field">
					<label htmlFor="at-title">{t('Tour title')}</label>
					<input
						id="at-title"
						onChange={(e) => set('tourTitle', e.target.value)}
						placeholder={t('e.g. Seoul Palaces & Night Markets') as string}
						type="text"
						value={i.tourTitle}
					/>
				</div>

				<div className="fl-row">
					<div className="fl-field">
						<label htmlFor="at-cat">{t('Categories')}</label>
						<select id="at-cat" onChange={(e) => set('tourCategory', e.target.value)} value={i.tourCategory}>
							{Object.values(TourCategory).map((x) => (
								<option key={x} value={x}>
									{t(x)}
								</option>
							))}
						</select>
					</div>
					<div className="fl-field">
						<label htmlFor="at-loc">{t('Location')}</label>
						<select id="at-loc" onChange={(e) => set('tourLocation', e.target.value)} value={i.tourLocation}>
							{Object.values(TourLocation).map((x) => (
								<option key={x} value={x}>
									{t(x)}
								</option>
							))}
						</select>
					</div>
				</div>

				<div className="fl-row">
					<div className="fl-field">
						<label htmlFor="at-lang">{t('Language')}</label>
						<select id="at-lang" onChange={(e) => set('tourLanguage', e.target.value)} value={i.tourLanguage}>
							{Object.values(TourLanguage).map((x) => (
								<option key={x} value={x}>
									{t(x)}
								</option>
							))}
						</select>
					</div>
					<div className="fl-field">
						<label htmlFor="at-diff">{t('Difficulty')}</label>
						<select id="at-diff" onChange={(e) => set('tourDifficulty', e.target.value)} value={i.tourDifficulty}>
							{Object.values(TourDifficulty).map((x) => (
								<option key={x} value={x}>
									{t(x)}
								</option>
							))}
						</select>
					</div>
				</div>

				<div className="at-nums">
					{NUMBER_FIELDS.map((f) => (
						<div className="fl-field" key={f.key}>
							<label htmlFor={`at-${f.key}`}>{t(f.label)}</label>
							<input
								id={`at-${f.key}`}
								onChange={(e) => numberChangeHandler(f.key, e.target.value)}
								onFocus={(e) => e.target.select()}
								type="number"
								value={(i as any)[f.key]}
							/>
						</div>
					))}
				</div>

				<div className="fl-field">
					<label htmlFor="at-meet">{t('Meeting point')}</label>
					<input
						id="at-meet"
						onChange={(e) => set('tourMeetingPoint', e.target.value)}
						placeholder={t('Where the group gathers') as string}
						type="text"
						value={i.tourMeetingPoint}
					/>
				</div>

				<div className="fl-field">
					<label htmlFor="at-desc">{t('Description')}</label>
					<textarea
						id="at-desc"
						onChange={(e) => set('tourDesc', e.target.value)}
						placeholder={t('What travellers will see and do…') as string}
						rows={6}
						value={i.tourDesc}
					/>
				</div>

				{/* ---------------- images ---------------- */}
				<div className="fl-field">
					<label htmlFor="at-images">{t('Tour images')}</label>
					<div className="at-up">
						<button
							className="at-up-drop"
							disabled={uploading || i.tourImages.length >= MAX_IMAGES}
							onClick={() => fileRef.current?.click()}
							type="button"
						>
							<svg viewBox="0 0 24 24">
								<path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" />
								<path d="M4 15v3.5A1.5 1.5 0 005.5 20h13a1.5 1.5 0 001.5-1.5V15" />
							</svg>
							<b>{uploading ? t('Uploading…') : t('Add photos')}</b>
							<span>
								{i.tourImages.length}/{MAX_IMAGES} · {t('jpg, jpeg or png')}
							</span>
						</button>
						<input
							accept={ACCEPTED}
							className="pf-file"
							id="at-images"
							multiple
							onChange={uploadImages}
							ref={fileRef}
							type="file"
						/>

						{i.tourImages.length > 0 && (
							<ul className="at-thumbs">
								{i.tourImages.map((path, idx) => (
									<li key={path}>
										<img alt={t('Tour image {{number}}', { number: idx + 1 }) as string} src={getImageUrl(path)} />
										{idx === 0 && <span className="at-cover">{t('Cover')}</span>}
										<button
											aria-label={t('Remove image {{number}}', { number: idx + 1 }) as string}
											className="at-thumb-x"
											onClick={() => removeImage(path)}
											type="button"
										>
											<svg viewBox="0 0 24 24">
												<path d="M18 6L6 18M6 6l12 12" />
											</svg>
										</button>
									</li>
								))}
							</ul>
						)}
					</div>
					{uploadError ? (
						<small className="fl-hint at-up-err">{uploadError}</small>
					) : (
						<small className="fl-hint">{t('The first image becomes the tour cover.')}</small>
					)}
				</div>

				<div className="fl-actions">
					<button
						className="btn btn-sky"
						disabled={loading || uploading || !i.tourTitle || i.tourPrice <= 0}
						onClick={submit}
						type="button"
					>
						{loading ? t('Creating…') : t('Create tour')}
					</button>
				</div>
			</section>
		</div>
	);
}
