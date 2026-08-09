import { useMemo } from 'react';
import { ApolloClient, ApolloLink, InMemoryCache, split, from, NormalizedCacheObject } from '@apollo/client';
import createUploadLink from 'apollo-upload-client/public/createUploadLink.js';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { onError } from '@apollo/client/link/error';
import { getJwtToken } from '../libs/auth';
import { TokenRefreshLink } from 'apollo-link-token-refresh';
import { sweetErrorAlert } from '../libs/sweetAlert';
import { resolveWsUrl } from '../libs/config';
let apolloClient: ApolloClient<NormalizedCacheObject>;

function getHeaders() {
	const headers: Record<string, string> = {};
	const token = getJwtToken();
	if (token) headers['Authorization'] = `Bearer ${token}`;
	return headers;
}

const tokenRefreshLink = new TokenRefreshLink({
	accessTokenField: 'accessToken',
	isTokenValidOrUndefined: () => {
		return true;
	},
	// Intentional no-op: the GoTrip backend has no refresh-token endpoint by design, and
	// isTokenValidOrUndefined always returns true, so this is never invoked at runtime.
	// Genuine library type gap: FetchAccessToken is typed as () => Promise<Response>, which an
	// honest no-op cannot satisfy without fabricating a Response — hence the suppression below.
	// @ts-ignore
	fetchAccessToken: () => {
		return null;
	},
});

// Custom WebSocket client
class LoggingWebSocket {
	private socket: WebSocket;

	constructor(url: string) {
		this.socket = new WebSocket(`${url}?token=${getJwtToken()}`);
		/* socketVar is deliberately NOT published here any more.
		   This wrapper belongs to subscriptions-transport-ws, and the app defines
		   no GraphQL subscriptions — so that client has nothing to keep alive and
		   never reconnects after a drop. Messaging owns its own self-healing
		   socket instead; see libs/messagingSocket.ts. */

		this.socket.onerror = (error) => {
			console.log('WebSocket, error:', error);
		};
	}

	send(data: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView) {
		this.socket.send(data);
	}

	close() {
		this.socket.close();
	}
}

function createIsomorphicLink() {
	if (typeof window !== 'undefined') {
		const authLink = new ApolloLink((operation, forward) => {
			operation.setContext(({ headers = {} }) => ({
				headers: {
					...headers,
					...getHeaders(),
				},
			}));
			return forward(operation);
		});

		const link = createUploadLink({
			uri: process.env.REACT_APP_API_GRAPHQL_URL,
		});

		/* WEBSOCKET SUBSCRIPTION LINK. The app defines no GraphQL subscriptions (see
		   libs/messagingSocket.ts's doc comment), so this link never actually carries
		   traffic — the fallback below only needs to be a syntactically valid ws:// URL,
		   never a real production endpoint. resolveWsUrl() still logs the missing-env-var
		   case once in production, for consistency with the real chat socket's handling. */
		const wsLink = new WebSocketLink({
			uri: resolveWsUrl() ?? 'ws://127.0.0.1:3007',
			options: {
				reconnect: true,
				timeout: 30000,
				connectionParams: () => {
					return { headers: getHeaders() };
				},
			},
			webSocketImpl: LoggingWebSocket,
		});

		// This backend surfaces auth failures as GraphQL errors over an HTTP 200, never as a
		// networkError with statusCode 401 — confirmed empirically against the running API: an
		// invalid/expired token throws inside jwtService.verifyAsync (a raw jsonwebtoken error,
		// not a mapped NestJS exception), producing extensions.code "INTERNAL_SERVER_ERROR" with
		// message "jwt expired"/"invalid signature"/etc.; a deleted/blocked member re-checked by
		// AuthGuard produces Message.NOT_AUTHENTICATED / Message.BLOCKED_USER instead. extensions.code
		// is therefore not a reliable signal here — detection matches on the actual message text
		// this backend is known to produce for each case (grep-confirmed unique among every message
		// in libs/enums/common.enum.ts, so this can't collide with an unrelated business error).
		const AUTH_INVALIDATION_MESSAGES = [
			'You are not authenticated, please login first!', // Message.NOT_AUTHENTICATED
			'You have been blocked!', // Message.BLOCKED_USER
		];
		const isAuthInvalidationMessage = (message: string): boolean => {
			if (AUTH_INVALIDATION_MESSAGES.includes(message)) return true;
			return /jwt|invalid (token|signature)/i.test(message);
		};

		const errorLink = onError(({ graphQLErrors, networkError, response }) => {
			if (graphQLErrors) {
				graphQLErrors.map(({ message, locations, path, extensions }) => {
					console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
					if (!message.includes('input')) sweetErrorAlert(message);
				});

				// Only clear/redirect if we currently hold a token — i.e. we believed we were
				// logged in. Login/Signup failures reuse some of these same message strings (e.g.
				// a blocked user's login attempt also says "You have been blocked!") but never carry
				// a stored token, so this guard keeps them from being wrongly treated as a session
				// expiry and also rules out a redirect loop (once cleared, nothing here can re-trigger).
				const hasInvalidatingError = graphQLErrors.some((error) => isAuthInvalidationMessage(error.message));
				if (typeof window !== 'undefined' && getJwtToken() && hasInvalidatingError) {
					localStorage.removeItem('accessToken');
					window.location.href = '/account/join';
				}
			}
			if (networkError) console.log(`[Network error]: ${networkError}`);
			if (networkError && 'statusCode' in networkError && networkError.statusCode === 401) {
				// Kept as a defensive fallback in case a network-layer 401 is ever introduced
				// (e.g. a reverse proxy auth check) — this backend itself doesn't produce one today.
				if (typeof window !== 'undefined') {
					localStorage.removeItem('accessToken');
					window.location.href = '/account/join';
				}
			}
		});

		const splitLink = split(
			({ query }) => {
				const definition = getMainDefinition(query);
				return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
			},
			wsLink,
			authLink.concat(link),
		);

		return from([errorLink, tokenRefreshLink, splitLink]);
	}
}

function createApolloClient() {
	return new ApolloClient({
		ssrMode: typeof window === 'undefined',
		link: createIsomorphicLink(),
		cache: new InMemoryCache(),
		resolvers: {},
	});
}

export function initializeApollo(initialState = null) {
	const _apolloClient = apolloClient ?? createApolloClient();
	if (initialState) _apolloClient.cache.restore(initialState);
	if (typeof window === 'undefined') return _apolloClient;
	if (!apolloClient) apolloClient = _apolloClient;

	return _apolloClient;
}

export function useApollo(initialState: any) {
	return useMemo(() => initializeApollo(initialState), [initialState]);
}

/**
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

// No Subscription required for develop process

const httpLink = createHttpLink({
  uri: "http://localhost:3007/graphql",
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;
*/
