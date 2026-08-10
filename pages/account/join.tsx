import React, { FormEvent, useCallback, useMemo, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutGth from '../../libs/components/layout/LayoutGth';
import { useTranslation } from '../../libs/i18n/useTranslation';
import { logIn, signUp } from '../../libs/auth';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { MemberType } from '../../libs/enums/member.enum';
import { MemberInput } from '../../libs/types/member/member.input';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

/** Panel artwork — one per view so switching tabs feels like a different moment. */
const ART = {
	login: {
		image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1400&q=80',
		eyebrow: 'Welcome back',
		title: 'Your next route is\nalready waiting',
		copy: 'Pick up where you left off — saved tours, guide replies and trip plans all in one place.',
	},
	signup: {
		image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1400&q=80',
		eyebrow: 'Start exploring',
		title: 'Travel with people\nwho know the way',
		copy: 'Join GoTrip to book guided routes from verified local guides — real prices, no hidden fees.',
	},
};

const STATS = [
	{ value: '65+', label: 'Tours' },
	{ value: '10+', label: 'Destinations' },
	{ value: '10+', label: 'Guides' },
];

const MailIcon = () => (
	<svg viewBox="0 0 24 24">
		<rect height="15" rx="2.4" width="19" x="2.5" y="4.5" />
		<path d="M3 6l9 6.5L21 6" />
	</svg>
);
const LockIcon = () => (
	<svg viewBox="0 0 24 24">
		<rect height="11" rx="2.4" width="15" x="4.5" y="10.5" />
		<path d="M8 10.5V7.5a4 4 0 018 0v3" />
	</svg>
);
const PhoneIcon = () => (
	<svg viewBox="0 0 24 24">
		<path d="M6.5 3.5h3l1.5 4-2 1.4a12 12 0 006.1 6.1l1.4-2 4 1.5v3a2 2 0 01-2.2 2A17 17 0 014.5 5.7a2 2 0 012-2.2z" />
	</svg>
);
const EyeIcon = ({ off }: { off?: boolean }) => (
	<svg viewBox="0 0 24 24">
		<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
		<circle cx="12" cy="12" r="3" />
		{off && <path d="M4 4l16 16" />}
	</svg>
);

/** Informational only — never blocks submission. */
const scorePassword = (value: string) => {
	if (!value) return 0;
	let score = 0;
	if (value.length >= 8) score++;
	if (value.length >= 12) score++;
	if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
	if (/\d/.test(value)) score++;
	if (/[^A-Za-z0-9]/.test(value)) score++;
	return Math.min(score, 4);
};
const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];

const Join: NextPage = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const [input, setInput] = useState<MemberInput>({
		memberNick: '',
		memberPassword: '',
		memberPhone: '',
		memberType: MemberType.USER,
	});
	const [loginView, setLoginView] = useState<boolean>(true);
	const [submitting, setSubmitting] = useState<boolean>(false);
	const [formError, setFormError] = useState<string>('');
	const [showPassword, setShowPassword] = useState(false);

	/** HANDLERS **/
	const viewChangeHandler = (state: boolean) => {
		setFormError('');
		setLoginView(state);
	};

	const handleInput = useCallback((name: keyof MemberInput, value: any) => {
		setInput((prev) => {
			return { ...prev, [name]: value };
		});
	}, []);

	const doLogin = useCallback(async () => {
		try {
			setSubmitting(true);
			setFormError('');
			await logIn(input.memberNick.trim(), input.memberPassword);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			console.error('login form error:', err);
			const message = err.message ?? 'Login failed. Please check your details and try again.';
			setFormError(t(message));
			await sweetMixinErrorAlert(message);
		} finally {
			setSubmitting(false);
		}
	}, [input, router, t]);

	const buildSignupInput = useCallback((): MemberInput => {
		return {
			memberNick: input.memberNick.trim(),
			memberPassword: input.memberPassword,
			memberPhone: input.memberPhone.trim(),
			memberType: MemberType.USER,
		};
	}, [input]);

	const doSignUp = useCallback(async () => {
		try {
			setSubmitting(true);
			setFormError('');
			const signupInput = buildSignupInput();
			await signUp(signupInput);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			console.error('signup form error:', err);
			setFormError(err.message ?? t('Signup failed. Please check your details and try again.'));
			await sweetMixinErrorAlert(err.message ?? t('Signup failed'));
		} finally {
			setSubmitting(false);
		}
	}, [buildSignupInput, router]);

	const loginDisabled = submitting || input.memberNick.trim() === '' || input.memberPassword === '';
	const signupDisabled =
		submitting || input.memberNick.trim() === '' || input.memberPassword === '' || input.memberPhone.trim() === '';

	const submitHandler = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (loginView) await doLogin();
		else await doSignUp();
	};

	const strength = useMemo(() => scorePassword(input.memberPassword), [input.memberPassword]);
	const art = loginView ? ART.login : ART.signup;

	return (
		<section className="au-sec">
			<div className="wrap">
				<div className="au-card">
					{/* ---------- Artwork panel ---------- */}
					<aside className="au-art">
						<img alt="" className="au-art-img" loading="lazy" src={art.image} />
						<div className="au-art-body">
							<span className="au-eyebrow">{t(art.eyebrow)}</span>
							<h1 className="au-art-title">{t(art.title)}</h1>
							<p className="au-art-copy">{t(art.copy)}</p>
							<div className="au-art-stats">
								{STATS.map((s) => (
									<div key={s.label}>
										<b>{s.value}</b>
										<small>{t(s.label)}</small>
									</div>
								))}
							</div>
						</div>
					</aside>

					{/* ---------- Form panel ---------- */}
					<div className="au-form-panel">
						<div className="au-tabs" role="tablist" aria-label={t('Authentication mode') as string}>
							<button
								aria-selected={loginView}
								className={loginView ? 'au-tab on' : 'au-tab'}
								onClick={() => viewChangeHandler(true)}
								role="tab"
								type="button"
							>
								{t('Log in')}
							</button>
							<button
								aria-selected={!loginView}
								className={!loginView ? 'au-tab on' : 'au-tab'}
								onClick={() => viewChangeHandler(false)}
								role="tab"
								type="button"
							>
								{t('Sign up')}
							</button>
						</div>

						<h2 className="au-h2">{loginView ? t('Welcome back') : t('Create your account')}</h2>
						<p className="au-sub">
							{loginView
								? t('Log in to manage your trips, saved tours and guide messages.')
								: t('It takes under a minute. No card needed to browse or enquire.')}
						</p>

						{formError && (
							<div className="au-error" role="alert">
								{formError}
							</div>
						)}

						<form className="au-form" onSubmit={submitHandler}>
							<div className="fl-field">
								<label htmlFor="memberNick">{t('Nickname')}</label>
								<div className="au-input">
									<MailIcon />
									<input
										autoComplete="username"
										id="memberNick"
										name="memberNick"
										onChange={(e) => handleInput('memberNick', e.target.value)}
										placeholder={t('Your nickname') as string}
										required
										type="text"
										value={input.memberNick}
									/>
								</div>
							</div>

							<div className="fl-field">
								<label htmlFor="memberPassword">{t('Password')}</label>
								<div className="au-input">
									<LockIcon />
									<input
										autoComplete={loginView ? 'current-password' : 'new-password'}
										id="memberPassword"
										name="memberPassword"
										onChange={(e) => handleInput('memberPassword', e.target.value)}
										placeholder={t('Your password') as string}
										required
										type={showPassword ? 'text' : 'password'}
										value={input.memberPassword}
									/>
									<button
										aria-label={(showPassword ? t('Hide password') : t('Show password')) as string}
										className="au-eye"
										onClick={() => setShowPassword((v) => !v)}
										type="button"
									>
										<EyeIcon off={showPassword} />
									</button>
								</div>

								{!loginView && input.memberPassword.length > 0 && (
									<div className="au-strength" aria-live="polite">
										<div className={`au-bars s${strength}`}>
											<i />
											<i />
											<i />
											<i />
										</div>
										<span>{t(STRENGTH_LABELS[strength])}</span>
									</div>
								)}
							</div>

							{!loginView && (
								<div className="fl-field">
									<label htmlFor="memberPhone">{t('Phone')}</label>
									<div className="au-input">
										<PhoneIcon />
										<input
											autoComplete="tel"
											id="memberPhone"
											name="memberPhone"
											onChange={(e) => handleInput('memberPhone', e.target.value)}
											placeholder={t('e.g. +1 234 567 890') as string}
											required
											type="tel"
											value={input.memberPhone}
										/>
									</div>
								</div>
							)}

							{loginView && (
								<div className="au-row">
									<label className="au-check">
										<input defaultChecked type="checkbox" />
										<span>{t('Remember me')}</span>
									</label>
									<Link className="au-link" href="/cs?tab=inquiry">
										{t('Lost your password?')}
									</Link>
								</div>
							)}

							<button
								className="btn btn-sky au-submit"
								disabled={loginView ? loginDisabled : signupDisabled}
								type="submit"
							>
								{submitting ? t('Please wait…') : loginView ? t('Log in') : t('Create account')}
							</button>

							{!loginView && (
								<p className="au-terms">
									{t('By creating an account you agree to our')}{' '}
									<Link className="au-link" href="/cs?tab=terms">
										{t('terms and privacy policy')}
									</Link>
									.
								</p>
							)}
						</form>

						<div className="au-switch">
							{loginView ? (
								<p>
									{t('Not registered yet?')}{' '}
									<button onClick={() => viewChangeHandler(false)} type="button">
										{t('Sign up')}
									</button>
								</p>
							) : (
								<p>
									{t('Already have an account?')}{' '}
									<button onClick={() => viewChangeHandler(true)} type="button">
										{t('Log in')}
									</button>
								</p>
							)}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default withLayoutGth(Join);
