import React, { useState } from 'react';
import { useMutation, useReactiveVar } from '@apollo/client';
import { REQUEST_AGENT_ROLE } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { AgentRequestStatus, MemberType } from '../../enums/member.enum';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { useTranslation } from '../../i18n/useTranslation';

/**
 * Become a Guide
 * --------------
 * Front end for the existing `requestAgentRole` workflow. Nothing new is
 * invented server-side: AgentRequestInput accepts exactly two optional fields
 * (agentRequestMessage, agentExperience, both 0–500), so the modal collects
 * those two and nothing else. The status shown comes from the member's own
 * agentRequestStatus, which the backend already maintains.
 *
 * Visible to USER accounts only — AGENT and ADMIN never render this.
 */

const MESSAGE_MAX = 500;
const EXPERIENCE_MAX = 500;

const PERKS = [
	{ title: 'Earn from your routes', copy: 'Set your own prices and keep running the trips you already know best.' },
	{ title: 'Publish real tours', copy: 'Your itineraries go live on GoTrip with photos, schedule and seat counts.' },
	{ title: 'Meet travellers', copy: 'Enquiries come straight to you, so you talk to guests before they book.' },
	{ title: 'A guide dashboard', copy: 'Manage tours, views, likes and reviews from your own workspace.' },
];

const CheckIcon = () => (
	<svg viewBox="0 0 24 24">
		<circle cx="12" cy="12" r="9" />
		<path d="M8.4 12.4l2.5 2.4 4.7-5.2" />
	</svg>
);

const BecomeGuide = () => {
	const { t } = useTranslation();
	const user = useReactiveVar(userVar);
	const [open, setOpen] = useState(false);
	const [message, setMessage] = useState('');
	const [experience, setExperience] = useState('');
	const [touched, setTouched] = useState(false);
	const [formError, setFormError] = useState('');

	const [requestAgentRole, { loading }] = useMutation(REQUEST_AGENT_ROLE);

	/* Only USER accounts can apply — mirrors @Roles(MemberType.USER) on the resolver. */
	if (user?.memberType !== MemberType.USER) return null;

	const status = user?.agentRequestStatus ?? AgentRequestStatus.NONE;
	const isPending = status === AgentRequestStatus.PENDING;
	const isRejected = status === AgentRequestStatus.REJECTED;

	const validation = !message.trim()
		? t('Tell us a little about why you want to guide.')
		: message.trim().length > MESSAGE_MAX
			? t('Please keep this under {{count}} characters.', { count: MESSAGE_MAX })
			: experience.length > EXPERIENCE_MAX
				? t('Please keep your experience under {{count}} characters.', { count: EXPERIENCE_MAX })
				: '';

	const submit = async () => {
		setTouched(true);
		setFormError('');
		if (validation) return;
		try {
			const result = await requestAgentRole({
				variables: {
					input: {
						agentRequestMessage: message.trim(),
						agentExperience: experience.trim() || undefined,
					},
				},
			});
			/* The mutation returns the updated Member but not a fresh token, so refresh
			   the session view from the existing token to pick up the new status. */
			const updated = result?.data?.requestAgentRole;
			if (updated) {
				userVar({ ...userVar(), agentRequestStatus: updated.agentRequestStatus, agentRequestMessage: updated.agentRequestMessage ?? '' });
			}
			setOpen(false);
			setMessage('');
			setExperience('');
			setTouched(false);
			await sweetTopSmallSuccessAlert(t('Application sent — our team will review it.'), 1400);
		} catch (err: any) {
			setFormError(err?.message ?? t('Could not send your application. Please try again.'));
			await sweetErrorHandling(err);
		}
	};

	/* ---------------- submitted / rejected states ---------------- */
	if (isPending || isRejected) {
		return (
			<section className={isRejected ? 'bg-status rejected' : 'bg-status'}>
				<div className="bg-status-head">
					<span className={isRejected ? 'bg-pill rejected' : 'bg-pill pending'}>
						{isRejected ? t('Not approved') : t('Pending review')}
					</span>
					<h3>{isRejected ? t('Application not approved') : t('Application submitted')}</h3>
				</div>

				<dl className="bg-status-grid">
					<div>
						<dt>{t('Status')}</dt>
						<dd>{isRejected ? t('Rejected') : t('Pending review')}</dd>
					</div>
					<div>
						<dt>{t('Account')}</dt>
						<dd>{user?.memberNick}</dd>
					</div>
				</dl>

				{user?.agentRequestMessage && (
					<div className="bg-status-note">
						<small>{t('What you told us')}</small>
						<p>{user.agentRequestMessage}</p>
					</div>
				)}

				<p className="bg-status-foot">
					{isRejected
						? t('Our team reviewed your application and could not approve it this time. You are welcome to apply again with more detail.')
						: t('An administrator will review your application. You will keep full traveller access in the meantime.')}
				</p>

				{isRejected && (
					<button className="btn btn-sky" onClick={() => setOpen(true)} type="button">
						{t('Apply again')}
					</button>
				)}

				{open && (
					<GuideModal
						experience={experience}
						formError={formError}
						loading={loading}
						message={message}
						onClose={() => setOpen(false)}
						onSubmit={submit}
						setExperience={setExperience}
						setMessage={setMessage}
						touched={touched}
						validation={validation}
					/>
				)}
			</section>
		);
	}

	/* ---------------- invitation card ---------------- */
	return (
		<section className="bg-card">
			<div className="bg-card-art" aria-hidden="true">
				<img
					alt=""
					loading="lazy"
					src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1000&q=80"
				/>
			</div>

			<div className="bg-card-body">
				<span className="eyebrow">{t('Guide with us')}</span>
				<h3>{t('Become a Guide')}</h3>
				<p className="bg-card-lead">
					{t('You already know the routes. Publish them on GoTrip, set your own prices and take travellers along.')}
				</p>

				<ul className="bg-perks">
					{PERKS.map((p) => (
						<li key={p.title}>
							<span className="bg-check">
								<CheckIcon />
							</span>
							<div>
								<b>{t(p.title)}</b>
								<span>{t(p.copy)}</span>
							</div>
						</li>
					))}
				</ul>

				<button className="btn btn-sky bg-cta" onClick={() => setOpen(true)} type="button">
					{t('Become a Guide')}
				</button>
			</div>

			{open && (
				<GuideModal
					experience={experience}
					formError={formError}
					loading={loading}
					message={message}
					onClose={() => setOpen(false)}
					onSubmit={submit}
					setExperience={setExperience}
					setMessage={setMessage}
					touched={touched}
					validation={validation}
				/>
			)}
		</section>
	);
};

interface ModalProps {
	message: string;
	setMessage: (v: string) => void;
	experience: string;
	setExperience: (v: string) => void;
	validation: string;
	touched: boolean;
	formError: string;
	loading: boolean;
	onSubmit: () => void;
	onClose: () => void;
}

const GuideModal = ({
	message,
	setMessage,
	experience,
	setExperience,
	validation,
	touched,
	formError,
	loading,
	onSubmit,
	onClose,
}: ModalProps) => {
	const { t } = useTranslation();
	return (
		<div className="acc-modal" onClick={onClose} role="presentation">
			<div
				aria-labelledby="bg-modal-title"
				aria-modal="true"
				className="acc-modal-card bg-modal"
				onClick={(e) => e.stopPropagation()}
				role="dialog"
			>
				<h3 id="bg-modal-title">{t('Guide application')}</h3>
				<p className="bg-modal-sub">{t('Two questions is all we need. An administrator reads every application.')}</p>

				{formError && (
					<div className="au-error" role="alert">
						{formError}
					</div>
				)}

				<div className="fl-field">
					<label htmlFor="bg-message">{t('Why do you want to guide? *')}</label>
					<textarea
						aria-invalid={touched && !!validation}
						id="bg-message"
						maxLength={MESSAGE_MAX}
						onChange={(e) => setMessage(e.target.value)}
						placeholder={t('The places you know, the kind of trips you would run, the languages you speak…') as string}
						rows={5}
						value={message}
					/>
					<div className="sp-help">
						{touched && validation ? <span className="sp-help-err">{validation}</span> : <span>{t('Required')}</span>}
						<span className={message.length > MESSAGE_MAX - 60 ? 'sp-count warn' : 'sp-count'}>
							{message.length}/{MESSAGE_MAX}
						</span>
					</div>
				</div>

				<div className="fl-field">
					<label htmlFor="bg-experience">{t('Your guiding experience')}</label>
					<textarea
						id="bg-experience"
						maxLength={EXPERIENCE_MAX}
						onChange={(e) => setExperience(e.target.value)}
						placeholder={t('Years guiding, licences, regions you cover…') as string}
						rows={4}
						value={experience}
					/>
					<div className="sp-help">
						<span>{t('Optional — shown on your guide profile')}</span>
						<span className={experience.length > EXPERIENCE_MAX - 60 ? 'sp-count warn' : 'sp-count'}>
							{experience.length}/{EXPERIENCE_MAX}
						</span>
					</div>
				</div>

				<div className="acc-modal-actions">
					<button className="btn btn-outline" onClick={onClose} type="button">
						{t('Cancel')}
					</button>
					<button className="btn btn-sky" disabled={loading || !!validation} onClick={onSubmit} type="button">
						{loading ? t('Sending…') : t('Submit application')}
					</button>
				</div>
			</div>
		</div>
	);
};

export default BecomeGuide;
