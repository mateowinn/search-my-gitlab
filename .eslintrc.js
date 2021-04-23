module.exports = {
	// https://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy
	// This option interrupts the configuration hierarchy at this file
	// Remove this if you have an higher level ESLint config file (it usually happens into a monorepos)
	root: true,

	parserOptions: {
		parser: 'babel-eslint',
		ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
		sourceType: 'module' // Allows for the use of imports
	},

	env: {
		browser: true,
		jest: true,
		es6: true,
		commonjs: true,
		node: true
	},

	// Rules order is important, please avoid shuffling them
	extends: [
		// Base ESLint recommended rules
		'eslint:recommended',

		// Uncomment any of the lines below to choose desired strictness,
		// but leave only one uncommented!
		// See https://eslint.vuejs.org/rules/#available-rules
		'plugin:vue/essential', // Priority A: Essential (Error Prevention)
		// 'plugin:vue/strongly-recommended', // Priority B: Strongly Recommended (Improving Readability)
		// 'plugin:vue/recommended', // Priority C: Recommended (Minimizing Arbitrary Choices and Cognitive Overhead)

		// https://github.com/prettier/eslint-config-prettier#installation
		// usage with Prettier, provided by 'eslint-config-prettier'.
		'prettier'
	],

	plugins: [
		// https://eslint.vuejs.org/user-guide/#why-doesn-t-it-work-on-vue-file
		// required to lint *.vue files
		'vue'
	],

	globals: {
		ga: 'readonly', // Google Analytics
		cordova: 'readonly',
		__statics: 'readonly',
		process: 'readonly',
		Capacitor: 'readonly',
		chrome: 'readonly'
	},

	// add your custom rules here
	rules: {
		'import/namespace': 0,
		'import/newline-after-import': 0,
		'import/no-anonymous-default-export': 0,
		'no-alert': 2,
		// 'no-console': 2,
		'no-new': 0,
		'no-unused-vars': 1,
		'no-warning-comments': 1,
		'no-var': 2,
		quotes: ['error', 'single', { allowTemplateLiterals: true, avoidEscape: true }],
		'no-useless-escape': [0],
		'no-case-declarations': [0],
		semi: [2, 'always'],
		eqeqeq: [1],
		'no-empty-function': [2],
		'no-loop-func': 1,
		'no-prototype-builtins': 0,
		'no-path-concat': 0,
		'space-before-function-paren': 0,
		'prefer-promise-reject-errors': 'off',
		'vue/no-async-in-computed-properties': 'off',
		'vue/no-unused-components': 1,

		// allow debugger during development only
		'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
	}
};
