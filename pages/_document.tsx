import { Html, Head, Main, NextScript } from 'next/document';

const themeScript = `
(function() {
	try {
		var storageKey = 'gotrip-theme';
		var stored = window.localStorage.getItem(storageKey);
		var mode = stored === 'light' || stored === 'dark'
			? stored
			: (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
		document.documentElement.dataset.theme = mode;
		document.documentElement.style.colorScheme = mode;
	} catch (error) {
		document.documentElement.dataset.theme = 'light';
		document.documentElement.style.colorScheme = 'light';
	}
})();
`;

export default function Document() {
	return (
		<Html lang="en" data-theme="light">
			<Head>
				<script dangerouslySetInnerHTML={{ __html: themeScript }} />
				<meta name="robots" content="index,follow" />
				<link rel="icon" type="image/png" href="/img/logo/favicon.svg" />

				{/* SEO */}
				<meta name="keyword" content={'gotrip, travel tours, guided trips, destinations, Korea tours'} />
				<meta
					name={'description'}
					content={
						'GoTrip helps travelers discover guided tours, local experiences, saved trips, and destination inspiration across Korea.'
					}
				/>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
