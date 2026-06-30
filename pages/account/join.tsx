import React, { FormEvent, useCallback, useState } from 'react';
import { NextPage } from 'next';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Button, Checkbox, CircularProgress, FormControlLabel, Stack } from '@mui/material';
import { useRouter } from 'next/router';
import { logIn, signUp } from '../../libs/auth';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { MemberType } from '../../libs/enums/member.enum';
import { MemberInput } from '../../libs/types/member/member.input';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { easeOutExpo, tapPress } from '../../libs/components/homepage/motion';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Join: NextPage = () => {
	const router = useRouter();
	const reduceMotion = useReducedMotion();
	const [input, setInput] = useState<MemberInput>({
		memberNick: '',
		memberPassword: '',
		memberPhone: '',
		memberType: MemberType.USER,
		wantsToBecomeAgent: false,
		agentRequestMessage: '',
		agentExperience: '',
	});
	const [loginView, setLoginView] = useState<boolean>(true);
	const [submitting, setSubmitting] = useState<boolean>(false);
	const [formError, setFormError] = useState<string>('');

	const cardInitial = reduceMotion ? { opacity: 0 } : { opacity: 0, y: 28 };
	const cardAnimate = { opacity: 1, y: 0 };
	const panelInitial = reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 };
	const panelTransition = reduceMotion ? { duration: 0.12 } : { duration: 0.28, ease: easeOutExpo };

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
			setFormError(err.message ?? 'Login failed. Please check your details and try again.');
			await sweetMixinErrorAlert(err.message);
		} finally {
			setSubmitting(false);
		}
	}, [input, router]);

	const buildSignupInput = useCallback((): MemberInput => {
		const payload: MemberInput = {
			memberNick: input.memberNick.trim(),
			memberPassword: input.memberPassword,
			memberPhone: input.memberPhone.trim(),
			memberType: MemberType.USER,
		};

		if (input.wantsToBecomeAgent) {
			const agentRequestMessage = input.agentRequestMessage?.trim();
			const agentExperience = input.agentExperience?.trim();

			payload.wantsToBecomeAgent = true;
			if (agentRequestMessage) payload.agentRequestMessage = agentRequestMessage;
			if (agentExperience) payload.agentExperience = agentExperience;
		}

		return payload;
	}, [input]);

	const doSignUp = useCallback(async () => {
		try {
			setSubmitting(true);
			setFormError('');
			const signupInput = buildSignupInput();
			console.log('signup form payload:', signupInput);
			await signUp(signupInput);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			console.error('signup form error:', err);
			setFormError(err.message ?? 'Signup failed. Please check your details and try again.');
			await sweetMixinErrorAlert(err.message ?? 'Signup failed');
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

	return (
		<Stack className={'join-page'}>
			<motion.div
				className="join-bg-drift"
				aria-hidden="true"
				animate={reduceMotion ? undefined : { scale: [1, 1.045, 1], x: ['0%', '-0.8%', '0%'] }}
				transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
			/>
			<Stack className={'container join-shell'}>
				<motion.div
					className={'join-card'}
					initial={cardInitial}
					animate={cardAnimate}
					transition={reduceMotion ? { duration: 0.12 } : { duration: 0.48, ease: easeOutExpo }}
				>
					<aside className="join-brand-panel" aria-label="GoTrip travel account">
						<div>
							<div className={'logo'}>
								<img src="/img/logo/logoWhite.svg" alt="GoTrip" />
								<span>GoTrip</span>
							</div>
							<p className="join-kicker">Luxury travel concierge</p>
							<h1>Travel, curated for you.</h1>
							<p className="join-brand-copy">
								Access curated tours, saved destinations, bookings, and guide/operator tools from one secure
								account.
							</p>
						</div>
						<div className="join-trust-list">
							<span>Secure account access</span>
							<span>Wishlist and booking continuity</span>
							<span>Guide approval requests reviewed by admins</span>
						</div>
					</aside>

					<section className="join-form-panel" aria-labelledby="join-title">
						<div className="join-mobile-brand">
							<img src="/img/logo/logoText.svg" alt="GoTrip" />
							<span>GoTrip</span>
						</div>

						<div className="join-tabs" role="tablist" aria-label="Authentication mode">
							<button
								type="button"
								role="tab"
								aria-selected={loginView}
								className={loginView ? 'active' : ''}
								onClick={() => viewChangeHandler(true)}
							>
								Login
							</button>
							<button
								type="button"
								role="tab"
								aria-selected={!loginView}
								className={!loginView ? 'active' : ''}
								onClick={() => viewChangeHandler(false)}
							>
								Sign Up
							</button>
						</div>

						<div className="join-heading">
							<p>{loginView ? 'Welcome back' : 'Create your traveler account'}</p>
							<h2 id="join-title">{loginView ? 'Continue your GoTrip journey.' : 'Start planning with GoTrip.'}</h2>
						</div>

						{formError && (
							<div className="join-error" role="alert" aria-live="polite">
								{formError}
							</div>
						)}

						<form className="join-form" onSubmit={submitHandler}>
							<AnimatePresence mode="wait" initial={false}>
								<motion.div
									key={loginView ? 'login' : 'signup'}
									className="join-form-stage"
									initial={panelInitial}
									animate={{ opacity: 1, y: 0 }}
									exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
									transition={panelTransition}
								>
									<label className={'input-box'} htmlFor="memberNick">
										<span>Nickname</span>
										<input
											id="memberNick"
											name="memberNick"
											type="text"
											autoComplete="username"
											value={input.memberNick}
											onChange={(e) => handleInput('memberNick', e.target.value)}
											required
										/>
									</label>

									<label className={'input-box'} htmlFor="memberPassword">
										<span>Password</span>
										<input
											id="memberPassword"
											name="memberPassword"
											type="password"
											autoComplete={loginView ? 'current-password' : 'new-password'}
											value={input.memberPassword}
											onChange={(e) => handleInput('memberPassword', e.target.value)}
											required
										/>
									</label>

									{!loginView && (
										<>
											<label className={'input-box'} htmlFor="memberPhone">
												<span>Phone</span>
												<input
													id="memberPhone"
													name="memberPhone"
													type="tel"
													autoComplete="tel"
													value={input.memberPhone}
													onChange={(e) => handleInput('memberPhone', e.target.value)}
													required
												/>
											</label>

											<div className={'guide-request'}>
												<FormControlLabel
													control={
														<Checkbox
															size="small"
															checked={Boolean(input.wantsToBecomeAgent)}
															onChange={(event) => handleInput('wantsToBecomeAgent', event.target.checked)}
															inputProps={{ 'aria-label': 'Request guide or operator approval' }}
														/>
													}
													label="Request guide/operator approval"
												/>
												<p>Traveler account is the default. Admins review guide access separately.</p>
												<AnimatePresence initial={false}>
													{input.wantsToBecomeAgent && (
														<motion.div
															className="guide-fields"
															initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
															animate={{ opacity: 1, y: 0 }}
															exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
															transition={panelTransition}
														>
															<label className={'input-box'} htmlFor="agentRequestMessage">
																<span>Request message</span>
																<textarea
																	id="agentRequestMessage"
																	name="agentRequestMessage"
																	rows={3}
																	value={input.agentRequestMessage ?? ''}
																	onChange={(event) => handleInput('agentRequestMessage', event.target.value)}
																/>
															</label>
															<label className={'input-box'} htmlFor="agentExperience">
																<span>Experience</span>
																<textarea
																	id="agentExperience"
																	name="agentExperience"
																	rows={3}
																	value={input.agentExperience ?? ''}
																	onChange={(event) => handleInput('agentExperience', event.target.value)}
																/>
															</label>
														</motion.div>
													)}
												</AnimatePresence>
											</div>
										</>
									)}
								</motion.div>
							</AnimatePresence>

							{loginView && (
								<div className={'remember-info'}>
									<FormControlLabel control={<Checkbox defaultChecked size="small" />} label="Remember me" />
									<span>Lost your password?</span>
								</div>
							)}

							<motion.div whileTap={submitting ? undefined : tapPress}>
								<Button
									type="submit"
									variant="contained"
									disabled={loginView ? loginDisabled : signupDisabled}
									className="join-submit"
								>
									{submitting && <CircularProgress size={18} color="inherit" />}
									{loginView ? 'Login' : 'Create account'}
								</Button>
							</motion.div>
						</form>

						<div className={'ask-info'}>
							{loginView ? (
								<p>
									Not registered yet?
									<button type="button" onClick={() => viewChangeHandler(false)}>
										Sign up
									</button>
								</p>
							) : (
								<p>
									Already have an account?
									<button type="button" onClick={() => viewChangeHandler(true)}>
										Login
									</button>
								</p>
							)}
						</div>
					</section>
				</motion.div>
			</Stack>
		</Stack>
	);
};

export default withLayoutBasic(Join);
