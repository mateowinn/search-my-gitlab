module.exports = {
	globals: {
		__DEV__: true
	},
	// noStackTrace: true,
	// bail: true,
	// cache: false,
	// verbose: true,
	// watch: true,
	collectCoverage: true,
	coverageDirectory: '<rootDir>/test/jest/coverage',
	collectCoverageFrom: [
		'<rootDir>/src/**/*.js',
		'<rootDir>/server/**/*.js',
		'!<rootDir>/src-pwa/**/*.js',
		'!<rootDir>/**/spec.js'
	],
	coverageReporters: ['text'],
	coverageThreshold: {
		global: {
			//  branches: 50,
			//  functions: 50,
			//  lines: 50,
			//  statements: 50
		}
	},
	testMatch: ['<rootDir>/src/**/test.js', '<rootDir>/server/**/test.js'],
	moduleFileExtensions: ['js', 'json', 'vue'],
	moduleNameMapper: {
		'^vue$': '<rootDir>/node_modules/vue/dist/vue.esm.js',
		'^src(.*)$': '<rootDir>/src$1',
		'^~/(.*)$': '<rootDir>/$1',
		// Quasar doesn't add these by default for some reason
		'^components(.*)$': '<rootDir>/src/components$1',
		'^boot(.*)$': '<rootDir>/src/boot$1',
		'^pages(.*)$': '<rootDir>/src/pages$1',
		'^layouts(.*)$': '<rootDir>/src/layouts$1',
		// We also need to add any custom aliases
		'^mutations(.*)$': '<rootDir>/src/graphql/mutations$1',
		'^queries(.*)$': '<rootDir>/src/graphql/queries$1',
		'^store(.*)$': '<rootDir>/src/store$1',
		'^utilities(.*)$': '<rootDir>/src/utilities$1',
		'^__mocks__/(.*)$': '<rootDir>/__mocks__/$1'
	},
	transform: {
		'.*\\.vue$': 'vue-jest',
		'.*\\.js$': 'babel-jest',
		'.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$':
			'jest-transform-stub'
		// use these if NPM is being flaky
		// '.*\\.vue$': '<rootDir>/node_modules/@quasar/quasar-app-extension-testing-unit-jest/node_modules/vue-jest',
		// '.*\\.js$': '<rootDir>/node_modules/@quasar/quasar-app-extension-testing-unit-jest/node_modules/babel-jest'
	},
	transformIgnorePatterns: ['<rootDir>/node_modules/(?!quasar/lang|vue)'],
	snapshotSerializers: ['<rootDir>/node_modules/jest-serializer-vue']
};
