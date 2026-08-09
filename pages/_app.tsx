import type { AppProps } from 'next/app';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import moment from 'moment';
import 'moment/locale/ko';
import 'moment/locale/ru';
import 'moment/locale/uz-latn';
import { ApolloProvider } from '@apollo/client';
import { useApollo } from '../apollo/client';
import { appWithTranslation } from 'next-i18next';
import { ColorModeProvider } from '../libs/theme/ColorModeProvider';
import { useScrollRestoration } from '../libs/hooks/useScrollRestoration';
import '../scss/app.scss';
import '../scss/pc/main.scss';
import '../scss/mobile/main.scss';

/* Maps routing locale ids to moment's locale keys — 'uz' alone loads
   moment's Cyrillic Uzbek data, but the app's Uzbek translations are Latin. */
const MOMENT_LOCALES: Record<string, string> = { ko: 'ko', ru: 'ru', uz: 'uz-latn' };

const App = ({ Component, pageProps }: AppProps) => {
	const client = useApollo(pageProps.initialApolloState);
	const router = useRouter();
	useScrollRestoration();

	useEffect(() => {
		moment.locale(MOMENT_LOCALES[router.locale ?? ''] ?? 'en');
	}, [router.locale]);

	return (
		<ApolloProvider client={client}>
			<ColorModeProvider>
				<Component {...pageProps} />
			</ColorModeProvider>
		</ApolloProvider>
	);
};

export default appWithTranslation(App);
