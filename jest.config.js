/**
 * Focused unit-test setup for client hooks (currently only GoTrip AI).
 *
 * Uses the jest 26 / jsdom / babel-jest / @babel/preset-* copies already in
 * node_modules (pulled in transitively, e.g. by react-scripts) — nothing new
 * is installed. Babel is configured inline (configFile/babelrc: false) so no
 * .babelrc exists to switch `next build` off SWC. Tests are plain .js so the
 * TypeScript program (tsconfig include: **\/*.ts, **\/*.tsx) — and therefore
 * `yarn typecheck` / `next build` — never sees them without @types/jest.
 *
 * Run: npx jest --config jest.config.js
 */
module.exports = {
	testEnvironment: 'jsdom',
	roots: ['<rootDir>/libs'],
	testMatch: ['**/__tests__/**/*.test.js'],
	transform: {
		'^.+\\.(t|j)sx?$': [
			'babel-jest',
			{
				configFile: false,
				babelrc: false,
				presets: [
					['@babel/preset-env', { targets: { node: 'current' } }],
					['@babel/preset-react', { runtime: 'automatic' }],
					'@babel/preset-typescript',
				],
			},
		],
	},
};
