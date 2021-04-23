/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

const path = require('path');

// Configuration for your app
// https://v1.quasar.dev/quasar-cli/quasar-conf-js
/* eslint-env node */
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = function(/* ctx */) {
	return {
		// https://v1.quasar.dev/quasar-cli/supporting-ts
		supportTS: false,

		// https://v1.quasar.dev/quasar-cli/prefetch-feature
		// preFetch: true,

		// app boot file (/src/boot)
		// --> boot files are part of "main.js"
		// https://v1.quasar.dev/quasar-cli/boot-files
		boot: ['store'],

		// https://v1.quasar.dev/quasar-cli/quasar-conf-js#Property%3A-css
		css: ['app.scss'],

		// https://github.com/quasarframework/quasar/tree/dev/extras
		extras: [
			// 'ionicons-v4',
			// 'mdi-v5',
			// 'fontawesome-v5',
			// 'eva-icons',
			// 'themify',
			// 'line-awesome',
			// 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

			'roboto-font', // optional, you are not bound to it
			'material-icons' // optional, you are not bound to it
		],

		// Full list of options: https://v1.quasar.dev/quasar-cli/quasar-conf-js#Property%3A-build
		build: {
			vueRouterMode: 'history', // available values: 'hash', 'history'

			// transpile: false,

			// Add dependencies for transpiling with Babel (Array of string/regex)
			// (from node_modules, which are by default not transpiled).
			// Applies only if "transpile" is set to true.
			// transpileDependencies: [],

			// rtl: false, // https://v1.quasar.dev/options/rtl-support
			// preloadChunks: true,
			// showProgress: false,
			// gzip: true,
			// analyze: true,

			// Options below are automatically set depending on the env, set them if you want to override
			// extractCSS: false,

			// https://v1.quasar.dev/quasar-cli/handling-webpack
			extendWebpack(cfg) {
				// Add our own alias in addition to the Quasar defaults
				cfg.resolve.alias = {
					...cfg.resolve.alias,
					store: path.resolve(__dirname, './src/store'),
					utilities: path.resolve(__dirname, './src/utilities')
				};
			},

			// "chain" is a webpack-chain object https://github.com/neutrinojs/webpack-chain
			chainWebpack(chain) {
				chain.plugin('eslint-webpack-plugin').use(ESLintPlugin, [{ extensions: ['js', 'vue'] }]);

				// Remove the plugin that automatically marks all async components with the prefetch tag
				chain.plugins.delete('prefetch');
				chain.module.rule('vue').uses.delete('cache-loader');
				chain.module.rule('js').uses.delete('cache-loader');
			}
		},

		// Full list of options: https://v1.quasar.dev/quasar-cli/quasar-conf-js#Property%3A-devServer
		devServer: {
			https: true,
			host: 'www.localtest.me',
			port: 8080,
			historyApiFallback: true,
			open: true, // opens browser window automatically
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
				'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
			},
			before: (app) => {
				app.set('etag', 'strong');
				app.use((req, res, next) => {
					res.set('Cache-Control', 'no-cache');
					next();
				});
			}
		},

		// https://v1.quasar.dev/quasar-cli/quasar-conf-js#Property%3A-framework
		framework: {
			iconSet: 'material-icons', // Quasar icon set
			lang: 'en-us', // Quasar language pack
			config: {},

			// Possible values for "importStrategy":
			// * 'auto' - (DEFAULT) Auto-import needed Quasar components & directives
			// * 'all'  - Manually specify what to import
			importStrategy: 'auto',

			// For special cases outside of where "auto" importStrategy can have an impact
			// (like functional components as one of the examples),
			// you can manually specify Quasar components/directives to be available everywhere:
			//
			// components: [],
			// directives: [],

			// Quasar plugins
			plugins: []
		},

		// animations: 'all', // --- includes all animations
		// https://v1.quasar.dev/options/animations
		animations: [],

		// https://v1.quasar.dev/quasar-cli/developing-ssr/configuring-ssr
		ssr: {
			pwa: false
		},

		// https://v1.quasar.dev/quasar-cli/developing-pwa/configuring-pwa
		pwa: {
			workboxPluginMode: 'GenerateSW', // 'GenerateSW' or 'InjectManifest'
			workboxOptions: {}, // only for GenerateSW
			manifest: {
				name: `Search My Gitlab`,
				short_name: `Search My Gitlab`,
				description: `An interface for searching all of your Gitlab repositories at once, since this is a feature not available in standard Gitlab.`,
				display: 'standalone',
				orientation: 'portrait',
				background_color: '#ffffff',
				theme_color: '#548',
				icons: [
					{
						src: 'icons/icon-128x128.png',
						sizes: '128x128',
						type: 'image/png'
					},
					{
						src: 'icons/icon-192x192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: 'icons/icon-256x256.png',
						sizes: '256x256',
						type: 'image/png'
					},
					{
						src: 'icons/icon-384x384.png',
						sizes: '384x384',
						type: 'image/png'
					},
					{
						src: 'icons/icon-512x512.png',
						sizes: '512x512',
						type: 'image/png'
					}
				]
			}
		},

		// Full list of options: https://v1.quasar.dev/quasar-cli/developing-cordova-apps/configuring-cordova
		cordova: {
			// noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
		},

		// Full list of options: https://v1.quasar.dev/quasar-cli/developing-capacitor-apps/configuring-capacitor
		capacitor: {
			hideSplashscreen: true
		},

		// Full list of options: https://v1.quasar.dev/quasar-cli/developing-electron-apps/configuring-electron
		electron: {
			bundler: 'packager', // 'packager' or 'builder'

			packager: {
				// https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options
				// OS X / Mac App Store
				// appBundleId: '',
				// appCategoryType: '',
				// osxSign: '',
				// protocol: 'myapp://path',
				// Windows only
				// win32metadata: { ... }
			},

			builder: {
				// https://www.electron.build/configuration/configuration

				appId: 'search-my-gitlab'
			},

			// More info: https://v1.quasar.dev/quasar-cli/developing-electron-apps/node-integration
			nodeIntegration: true,

			extendWebpack(/* cfg */) {
				// do something with Electron main process Webpack cfg
				// chainWebpack also available besides this extendWebpack
			}
		}
	};
};
