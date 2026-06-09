import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en">
			<Head>
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
