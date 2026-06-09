import React, { useCallback, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Box, Button, Checkbox, FormControlLabel, FormGroup, Stack } from '@mui/material';
import { useRouter } from 'next/router';
import { logIn, signUp } from '../../libs/auth';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { MemberType } from '../../libs/enums/member.enum';
import { MemberInput } from '../../libs/types/member/member.input';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Join: NextPage = () => {
	const router = useRouter();
	const device = useDeviceDetect();
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

	/** HANDLERS **/
	const viewChangeHandler = (state: boolean) => {
		setLoginView(state);
	};

	const handleInput = useCallback((name: keyof MemberInput, value: any) => {
		setInput((prev) => {
			return { ...prev, [name]: value };
		});
	}, []);

	const doLogin = useCallback(async () => {
		try {
			await logIn(input.memberNick.trim(), input.memberPassword);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			console.error('login form error:', err);
			await sweetMixinErrorAlert(err.message);
		}
	}, [input]);

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
			const signupInput = buildSignupInput();
			console.log('signup form payload:', signupInput);
			await signUp(signupInput);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			console.error('signup form error:', err);
			await sweetMixinErrorAlert(err.message ?? 'Signup failed');
		}
	}, [buildSignupInput, router]);

	if (device === 'mobile') {
		return <div>LOGIN MOBILE</div>;
	} else {
		return (
			<Stack className={'join-page'}>
				<Stack className={'container'}>
					<Stack className={'main'}>
						<Stack className={'left'}>
							{/* @ts-ignore */}
							<Box className={'logo'}>
								<img src="/img/logo/logoText.svg" alt="" />
								<span>GoTrip</span>
							</Box>
							<Box className={'info'}>
								<span>{loginView ? 'login' : 'signup'}</span>
								<p>{loginView ? 'Login' : 'Sign'} in with this account across the following sites.</p>
							</Box>
							<Box className={'input-wrap'}>
								<div className={'input-box'}>
									<span>Nickname</span>
									<input
										type="text"
										placeholder={'Enter Nickname'}
										value={input.memberNick}
										onChange={(e) => handleInput('memberNick', e.target.value)}
										required={true}
										onKeyDown={(event) => {
											if (event.key == 'Enter' && loginView) doLogin();
											if (event.key == 'Enter' && !loginView) doSignUp();
										}}
									/>
								</div>
								<div className={'input-box'}>
									<span>Password</span>
									<input
										type="password"
										placeholder={'Enter Password'}
										value={input.memberPassword}
										onChange={(e) => handleInput('memberPassword', e.target.value)}
										required={true}
										onKeyDown={(event) => {
											if (event.key == 'Enter' && loginView) doLogin();
											if (event.key == 'Enter' && !loginView) doSignUp();
										}}
									/>
								</div>
								{!loginView && (
									<div className={'input-box'}>
										<span>Phone</span>
										<input
											type="text"
											placeholder={'Enter Phone'}
											value={input.memberPhone}
											onChange={(e) => handleInput('memberPhone', e.target.value)}
											required={true}
											onKeyDown={(event) => {
												if (event.key == 'Enter') doSignUp();
											}}
										/>
									</div>
								)}
							</Box>
							<Box className={'register'}>
								{!loginView && (
									<div className={'type-option'}>
										<span className={'text'}>Traveler account is the default.</span>
										<FormGroup>
											<FormControlLabel
												control={
													<Checkbox
														size="small"
														checked={Boolean(input.wantsToBecomeAgent)}
														onChange={(event) => handleInput('wantsToBecomeAgent', event.target.checked)}
													/>
												}
												label="Request guide/operator approval"
											/>
										</FormGroup>
										{input.wantsToBecomeAgent && (
											<>
												<div className={'input-box'}>
													<span>Request message</span>
													<input
														type="text"
														placeholder={'Tell admins why you want to guide travelers'}
														value={input.agentRequestMessage ?? ''}
														onChange={(event) => handleInput('agentRequestMessage', event.target.value)}
													/>
												</div>
												<div className={'input-box'}>
													<span>Experience</span>
													<input
														type="text"
														placeholder={'Describe your tour or travel experience'}
														value={input.agentExperience ?? ''}
														onChange={(event) => handleInput('agentExperience', event.target.value)}
													/>
												</div>
											</>
										)}
									</div>
								)}

								{loginView && (
									<div className={'remember-info'}>
										<FormGroup>
											<FormControlLabel control={<Checkbox defaultChecked size="small" />} label="Remember me" />
										</FormGroup>
										<a>Lost your password?</a>
									</div>
								)}

								{loginView ? (
									<Button
										variant="contained"
										endIcon={<img src="/img/icons/rightup.svg" alt="" />}
										disabled={input.memberNick.trim() == '' || input.memberPassword == ''}
										onClick={doLogin}
									>
										LOGIN
									</Button>
								) : (
									<Button
										variant="contained"
										disabled={
											input.memberNick.trim() == '' || input.memberPassword == '' || input.memberPhone.trim() == ''
										}
										onClick={doSignUp}
										endIcon={<img src="/img/icons/rightup.svg" alt="" />}
									>
										SIGNUP
									</Button>
								)}
							</Box>
							<Box className={'ask-info'}>
								{loginView ? (
									<p>
										Not registered yet?
										<b
											onClick={() => {
												viewChangeHandler(false);
											}}
										>
											SIGNUP
										</b>
									</p>
								) : (
									<p>
										Have account?
										<b onClick={() => viewChangeHandler(true)}> LOGIN</b>
									</p>
								)}
							</Box>
						</Stack>
						<Stack className={'right'}></Stack>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default withLayoutBasic(Join);
