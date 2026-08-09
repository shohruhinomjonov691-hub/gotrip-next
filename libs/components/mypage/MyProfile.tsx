import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NextPage } from 'next';
import axios from 'axios';
import { getImageUrl, Messages, REACT_APP_API_URL } from '../../config';
import { getJwtToken, updateStorage, updateUserInfo } from '../../auth';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { MemberType } from '../../enums/member.enum';
import { MemberUpdate } from '../../types/member/member.update';
import { UPDATE_MEMBER } from '../../../apollo/user/mutation';
import { sweetErrorHandling, sweetMixinSuccessAlert } from '../../sweetAlert';
import { useTranslation } from '../../i18n/useTranslation';

/** Decorative cover behind the profile header. */
const COVER = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80';

const CameraIcon = () => (
	<svg viewBox="0 0 24 24">
		<path d="M4.5 8h3l1.5-2h6l1.5 2h3a1.5 1.5 0 011.5 1.5v8A1.5 1.5 0 0119.5 19h-15A1.5 1.5 0 013 17.5v-8A1.5 1.5 0 014.5 8z" />
		<circle cx="12" cy="13" r="3.4" />
	</svg>
);

const MyProfile: NextPage = ({ initialValues }: any) => {
	const { t } = useTranslation();
	const token = getJwtToken();
	const user = useReactiveVar(userVar);
	const fileRef = useRef<HTMLInputElement>(null);
	/* Seed straight from the session so the fields are populated on first paint;
	   the effect below keeps them in sync when userVar updates. */
	const [updateData, setUpdateData] = useState<MemberUpdate>(() => ({
		...(initialValues ?? {}),
		memberNick: user.memberNick ?? '',
		memberPhone: user.memberPhone ?? '',
		memberAddress: user.memberAddress ?? '',
		memberImage: user.memberImage ?? '',
		memberDesc: user.memberDesc ?? '',
	}));
	const [formError, setFormError] = useState('');
	const [uploadingImage, setUploadingImage] = useState(false);

	/** APOLLO REQUESTS **/
	const [updateMember, { loading: updatingProfile }] = useMutation(UPDATE_MEMBER);

	const profileImage = getImageUrl(updateData?.memberImage);

	/**
	 * Only an AGENT publishes tours, so the Tours figure is meaningless on a USER
	 * or ADMIN profile and is omitted entirely rather than shown as a zero.
	 * Everyone sees Followers / Followings / Articles.
	 */
	const profileStats = useMemo(
		() => [
			...(user.memberType === MemberType.AGENT ? [{ label: 'Tours', value: user.memberTours ?? 0 }] : []),
			{ label: 'Followers', value: user.memberFollowers ?? 0 },
			{ label: 'Followings', value: user.memberFollowings ?? 0 },
			{ label: 'Articles', value: user.memberArticles ?? 0 },
			{ label: 'Views', value: user.memberViews ?? 0 },
			{ label: 'Likes', value: user.memberLikes ?? 0 },
		],
		[user],
	);

	/** LIFECYCLES **/
	useEffect(() => {
		setUpdateData((prevData) => ({
			...prevData,
			memberNick: user.memberNick,
			memberPhone: user.memberPhone,
			memberAddress: user.memberAddress,
			memberImage: user.memberImage,
			memberDesc: user.memberDesc,
		}));
	}, [user]);

	/** HANDLERS **/
	const uploadImage = async (e: any) => {
		try {
			const image = e.target.files?.[0];
			if (!image) return;
			setFormError('');
			setUploadingImage(true);

			const formData = new FormData();
			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImageUploader($file: Upload!, $target: String!) {
						imageUploader(file: $file, target: $target)
				  }`,
					variables: {
						file: null,
						target: 'member',
					},
				}),
			);
			formData.append(
				'map',
				JSON.stringify({
					'0': ['variables.file'],
				}),
			);
			formData.append('0', image);

			const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});

			const responseImage = response.data.data.imageUploader;
			setUpdateData((prevData) => ({ ...prevData, memberImage: responseImage }));

			return `${REACT_APP_API_URL}/${responseImage}`;
		} catch (err: any) {
			setFormError(err?.message ?? t('Image upload failed. Please try again.'));
			console.log('Error, uploadImage:', err);
		} finally {
			setUploadingImage(false);
		}
	};

	const updateProfileHandler = useCallback(async () => {
		try {
			setFormError('');
			if (!user._id) throw new Error(Messages.error2);
			const result = await updateMember({
				variables: {
					input: {
						...updateData,
						_id: user._id,
					},
				},
			});

			// @ts-ignore
			const jwtToken = result.data.updateMember?.accessToken;
			await updateStorage({ jwtToken });
			updateUserInfo(result.data.updateMember?.accessToken);
			await sweetMixinSuccessAlert(t('Information updated successfully.'));
		} catch (err: any) {
			setFormError(err?.message ?? t('Profile update failed. Please try again.'));
			sweetErrorHandling(err).then();
		}
	}, [updateData, updateMember, user._id]);

	const doDisabledCheck = () => {
		if (
			updateData.memberNick === '' ||
			updateData.memberPhone === '' ||
			updateData.memberAddress === '' ||
			updateData.memberImage === ''
		) {
			return true;
		}
		return uploadingImage || updatingProfile;
	};

	return (
		<div className="pf-wrap">
			{/* ---------- Header ---------- */}
			<header className="pf-head">
				<div className="pf-cover">
					<img alt="" loading="lazy" src={COVER} />
				</div>

				<div className="pf-id">
					<div className="pf-av-wrap">
						<img alt="" className="pf-av" src={profileImage} />
						<button
							aria-label={t('Change profile photo') as string}
							className="pf-av-btn"
							disabled={uploadingImage}
							onClick={() => fileRef.current?.click()}
							type="button"
						>
							<CameraIcon />
						</button>
						<input
							accept="image/jpg, image/jpeg, image/png"
							className="pf-file"
							onChange={uploadImage}
							ref={fileRef}
							type="file"
						/>
					</div>

					<div className="pf-id-body">
						<h3>{user.memberNick}</h3>
						<div className="pf-badges">
							<span className="pf-badge">{t(user.memberType || 'USER')}</span>
							{user.memberType === MemberType.AGENT && <span className="pf-badge ok">{t('Verified guide')}</span>}
							{user.memberAddress && <span className="pf-loc">{user.memberAddress}</span>}
						</div>
					</div>

					{/* Administrator privileges are surfaced next to the badge rather than
					    buried in the sidebar, so the capability is obvious on arrival. */}
					{user.memberType === MemberType.ADMIN && (
						<a className="pf-admin-cta" href="/_admin" rel="noreferrer" target="_blank">
							<span className="pf-admin-ico">
								<svg viewBox="0 0 24 24">
									<path d="M12 3.5l7 3v5c0 4.4-3 8-7 9-4-1-7-4.6-7-9v-5z" />
									<path d="M9 12l2 2 4-4" />
								</svg>
							</span>
							<span className="pf-admin-txt">
								<b>{t('Platform Control')}</b>
								<small>{t('Members, guides, catalogue & moderation')}</small>
							</span>
							<svg aria-hidden="true" className="pf-admin-arrow" viewBox="0 0 24 24">
								<path d="M5 12h13M13 6l6 6-6 6" />
							</svg>
						</a>
					)}
				</div>

				<div className="pf-stats">
					{profileStats.map((s) => (
						<div key={s.label}>
							<b>{s.value}</b>
							<small>{t(s.label)}</small>
						</div>
					))}
				</div>
			</header>

			{/* ---------- Edit form ---------- */}
			<section className="pg-panel pf-form">
				<h3 className="pg-panel-title">{t('Edit profile')}</h3>
				<p className="pf-form-note">
					{uploadingImage ? t('Uploading your photo…') : t('These details appear on your public profile.')}
				</p>

				{formError && (
					<div className="au-error" role="alert">
						{formError}
					</div>
				)}

				<div className="fl-row">
					<div className="fl-field">
						<label htmlFor="pf-nick">{t('Nickname')}</label>
						<input
							id="pf-nick"
							onChange={(e) => setUpdateData({ ...updateData, memberNick: e.target.value })}
							placeholder={t('Your nickname') as string}
							type="text"
							value={updateData.memberNick ?? ''}
						/>
					</div>
					<div className="fl-field">
						<label htmlFor="pf-phone">{t('Phone')}</label>
						<input
							id="pf-phone"
							onChange={(e) => setUpdateData({ ...updateData, memberPhone: e.target.value })}
							placeholder={t('Your phone') as string}
							type="tel"
							value={updateData.memberPhone ?? ''}
						/>
					</div>
				</div>

				<div className="fl-field">
					<label htmlFor="pf-address">{t('Address')}</label>
					<input
						id="pf-address"
						onChange={(e) => setUpdateData({ ...updateData, memberAddress: e.target.value })}
						placeholder={t('City, country') as string}
						type="text"
						value={updateData.memberAddress ?? ''}
					/>
				</div>

				<div className="fl-field">
					<label htmlFor="pf-desc">{t('About you')}</label>
					<textarea
						id="pf-desc"
						onChange={(e) => setUpdateData({ ...updateData, memberDesc: e.target.value })}
						placeholder={t('Tell travellers a little about yourself…') as string}
						rows={5}
						value={updateData.memberDesc ?? ''}
					/>
				</div>

				<div className="fl-actions">
					<button className="btn btn-sky" disabled={doDisabledCheck()} onClick={updateProfileHandler} type="button">
						{updatingProfile ? t('Saving…') : t('Update profile')}
					</button>
				</div>
			</section>
		</div>
	);
};

MyProfile.defaultProps = {
	initialValues: {
		_id: '',
		memberImage: '',
		memberNick: '',
		memberPhone: '',
		memberAddress: '',
		memberDesc: '',
	},
};

export default MyProfile;
