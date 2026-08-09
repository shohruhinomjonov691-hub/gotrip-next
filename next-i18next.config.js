module.exports = {
	i18n: {
		defaultLocale: 'en',
		locales: ['en', 'uz', 'ko', 'ru'],
		localeDetection: false,
	},
	trailingSlash: true,
	/* Translation keys in this app are full English sentences, not `namespace:key`
	   paths — several contain literal ':' (e.g. "Mon–Fri, 09:00–18:00 (PT)") or '.'
	   (e.g. "Please try again in a moment."). i18next's default nsSeparator (':')
	   and keySeparator ('.') would silently mis-split those keys, so both are
	   disabled here. */
	nsSeparator: false,
	keySeparator: false,
};
