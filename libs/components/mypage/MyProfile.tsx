import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { Button, Stack, Typography } from '@mui/material';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import axios from 'axios';
import { motion, useReducedMotion } from 'framer-motion';
import { Messages, REACT_APP_API_URL } from '../../config';
import { getJwtToken, updateStorage, updateUserInfo } from '../../auth';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { MemberUpdate } from '../../types/member/member.update';
import { UPDATE_MEMBER } from '../../../apollo/user/mutation';
import { sweetErrorHandling, sweetMixinSuccessAlert } from '../../sweetAlert';
import { formatterStr } from '../../utils';

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

const MyProfile: NextPage = ({ initialValues }: any) => {
	const token = getJwtToken();
	const user = useReactiveVar(userVar);
	const shouldReduceMotion = useReducedMotion();
	const [updateData, setUpdateData] = useState<MemberUpdate>(initialValues);
	const [formError, setFormError] = useState('');
	const [uploadingImage, setUploadingImage] = useState(false);

	/** APOLLO REQUESTS **/
	const [updateMember, { loading: updatingProfile }] = useMutation(UPDATE_MEMBER);

	const sectionMotion = {
		hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 18 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: shouldReduceMotion ? 0.18 : 0.42, ease: easeOutExpo },
		},
	};

	const listMotion = {
		hidden: {},
		visible: {
			transition: {
				staggerChildren: shouldReduceMotion ? 0 : 0.05,
				delayChildren: shouldReduceMotion ? 0 : 0.08,
			},
		},
	};

	const profileImage = updateData?.memberImage
		? `${REACT_APP_API_URL}/${updateData.memberImage}`
		: '/img/profile/defaultUser.svg';

	const profileStats = useMemo(
		() => [
			{ label: 'Tours', value: user.memberTours ?? 0 },
			{ label: 'Articles', value: user.memberArticles ?? 0 },
			{ label: 'Views', value: user.memberViews ?? 0 },
			{ label: 'Likes', value: user.memberLikes ?? 0 },
			{ label: 'Points', value: user.memberPoints ?? 0 },
			{ label: 'Rank', value: user.memberRank ?? 0 },
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
			setFormError(err?.message ?? 'Image upload failed. Please try again.');
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
			await sweetMixinSuccessAlert('Information updated successfully.');
		} catch (err: any) {
			setFormError(err?.message ?? 'Profile update failed. Please try again.');
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
		<motion.div id="my-profile-page" variants={listMotion} initial="hidden" animate="visible">
			<motion.div className="profile-hero" variants={sectionMotion}>
				<Stack className="profile-hero-copy">
					<Typography className="profile-kicker">GoTrip Concierge</Typography>
					<Typography className="main-title">My Profile</Typography>
					<Typography className="sub-title">Keep your traveler profile ready for the next reservation.</Typography>
				</Stack>
				<Stack className="profile-status-card">
					<Stack className="status-row">
						<BadgeOutlinedIcon />
						<span>{user.memberType || 'USER'}</span>
					</Stack>
					<Stack className="status-row">
						<WorkspacePremiumOutlinedIcon />
						<span>Guide request: {user.agentRequestStatus || 'NONE'}</span>
					</Stack>
					{user.isVerifiedAgent && (
						<Stack className="status-row verified">
							<CheckCircleRoundedIcon />
							<span>Verified guide/operator</span>
						</Stack>
					)}
				</Stack>
			</motion.div>

			<motion.div className="profile-grid" variants={listMotion}>
				<motion.aside className="traveler-card" variants={sectionMotion}>
					<div className="avatar-frame">
						<img src={profileImage} alt={`${user.memberNick || 'GoTrip traveler'} profile`} />
					</div>
					<div className="traveler-card-copy">
						<Typography className="traveler-name">{user.memberNick || 'GoTrip traveler'}</Typography>
						<Typography className="traveler-phone">{user.memberPhone || 'Phone number not added'}</Typography>
						<Typography className="traveler-address">{user.memberAddress || 'Address not added'}</Typography>
					</div>
					<motion.div className="profile-stats" variants={listMotion}>
						{profileStats.map((stat) => (
							<motion.div className="profile-stat" key={stat.label} variants={sectionMotion}>
								<strong>{formatterStr(stat.value) || stat.value}</strong>
								<span>{stat.label}</span>
							</motion.div>
						))}
					</motion.div>
					{user.agentRequestMessage && (
						<div className="guide-note">
							<span>Request message</span>
							<p>{user.agentRequestMessage}</p>
						</div>
					)}
					{user.agentExperience && (
						<div className="guide-note">
							<span>Experience</span>
							<p>{user.agentExperience}</p>
						</div>
					)}
				</motion.aside>

				<motion.section className="profile-editor" variants={sectionMotion}>
					<Stack className="photo-panel">
						<div className="photo-preview">
							<img src={profileImage} alt="Profile preview" />
						</div>
						<Stack className="photo-actions">
							<Typography className="section-title">Photo</Typography>
							<Typography className="helper-text">A photo must be in JPG, JPEG or PNG format.</Typography>
							<input
								type="file"
								hidden
								id="hidden-input"
								onChange={uploadImage}
								accept="image/jpg, image/jpeg, image/png"
							/>
							<motion.label htmlFor="hidden-input" className="upload-button" whileTap={{ scale: 0.97 }}>
								<PhotoCameraOutlinedIcon />
								<span>{uploadingImage ? 'Uploading...' : 'Upload profile image'}</span>
							</motion.label>
						</Stack>
					</Stack>

					<form className="profile-form" onSubmit={(event) => event.preventDefault()}>
						<div className="form-field">
							<label htmlFor="memberNick">Username</label>
							<input
								id="memberNick"
								type="text"
								placeholder="Your username"
								value={updateData.memberNick || ''}
								onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberNick: value })}
							/>
						</div>
						<div className="form-field">
							<label htmlFor="memberPhone">Phone</label>
							<input
								id="memberPhone"
								type="tel"
								placeholder="Your phone"
								value={updateData.memberPhone || ''}
								onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberPhone: value })}
							/>
						</div>
						<div className="form-field full">
							<label htmlFor="memberAddress">Address</label>
							<input
								id="memberAddress"
								type="text"
								placeholder="Your address"
								value={updateData.memberAddress || ''}
								onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberAddress: value })}
							/>
						</div>
						<div className="form-field full">
							<label htmlFor="memberDesc">About your travel style</label>
							<textarea
								id="memberDesc"
								placeholder="Share a little about how you like to travel"
								value={updateData.memberDesc || ''}
								onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberDesc: value })}
							/>
						</div>
					</form>

					{formError && (
						<Typography className="profile-error" role="alert">
							{formError}
						</Typography>
					)}

					<Stack className="profile-actions">
						<Stack className="profile-assurance">
							<ExploreOutlinedIcon />
							<span>Your account stays traveler-first. Guide/operator approval is handled separately.</span>
						</Stack>
						<motion.div whileTap={{ scale: 0.97 }}>
							<Button
								className="update-button"
								onClick={updateProfileHandler}
								disabled={doDisabledCheck()}
								endIcon={<ArrowOutwardRoundedIcon />}
							>
								{updatingProfile ? 'Saving...' : 'Update profile'}
							</Button>
						</motion.div>
					</Stack>
				</motion.section>
			</motion.div>
		</motion.div>
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
