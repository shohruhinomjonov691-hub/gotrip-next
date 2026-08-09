export const REACT_APP_API_URL = `${process.env.REACT_APP_API_URL}`;

let loggedMissingWsUrl = false;

// A silent fallback to a localhost WS URL is harmless in dev (that's genuinely where the
// API runs) but meaningless in a production build — no real user's browser can reach
// 127.0.0.1:3007, so every connection attempt would fail anyway, just without ever telling
// anyone why. In production, treat a missing REACT_APP_API_WS as a real misconfiguration:
// log it once (loudly, so it's impossible to miss in the console) and return null so callers
// skip trying to connect at all, instead of quietly retrying a URL that can never work.
export const resolveWsUrl = (): string | null => {
	const configured = process.env.REACT_APP_API_WS;
	if (configured) return configured;

	if (process.env.NODE_ENV === 'production') {
		if (!loggedMissingWsUrl) {
			loggedMissingWsUrl = true;
			console.error(
				'[GoTrip] REACT_APP_API_WS is not set in this production build — chat/WebSocket features are disabled until it is configured.',
			);
		}
		return null;
	}

	return 'ws://127.0.0.1:3007';
};

// Image fields sometimes hold a relative path uploaded to our own /uploads (needs the API
// origin prefixed) and sometimes an absolute URL from an external source (used as-is).
// Centralizing this avoids malformed `http://api-origin/https://...` URLs at every call site.
export const getImageUrl = (path?: string | null, fallback: string = '/img/profile/defaultUser.svg'): string => {
	if (!path) return fallback;
	if (/^https?:\/\//i.test(path)) return path;
	return `${REACT_APP_API_URL}/${path}`;
};

export const Messages = {
	error1: 'Something went wrong!',
	error2: 'Please login first!',
	error3: 'Please fulfill all inputs!',
	error4: 'Message is empty!',
	error5: 'Only images with jpeg, jpg, png format allowed!',
};
