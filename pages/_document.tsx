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

				{/* Brand fonts — display (Fraunces) · text (Manrope + Noto Sans KR) · mono (IBM Plex Mono) */}
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link
					rel="stylesheet"
					href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=Manrope:wght@400;500;600;700;800&family=Noto+Sans+KR:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
				/>

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
