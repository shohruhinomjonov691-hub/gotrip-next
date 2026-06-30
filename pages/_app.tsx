import type { AppProps } from 'next/app';
import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { useApollo } from '../apollo/client';
import { appWithTranslation } from 'next-i18next';
import { ColorModeProvider } from '../libs/theme/ColorModeProvider';
import '../scss/app.scss';
import '../scss/pc/main.scss';
import '../scss/mobile/main.scss';

const App = ({ Component, pageProps }: AppProps) => {
	const client = useApollo(pageProps.initialApolloState);

	return (
		<ApolloProvider client={client}>
			<ColorModeProvider>
				<Component {...pageProps} />
			</ColorModeProvider>
		</ApolloProvider>
	);
};

export default appWithTranslation(App);
