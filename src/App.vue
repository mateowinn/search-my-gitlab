<template>
	<div id="q-app">
		<router-view />
	</div>
</template>

<script>
import logger from 'utilities/logger';

// Simple flags to keep track of what we've modified in PrismJS
let vueAdded = false;
let jsExtended = false;

export default {
	name: 'App',
	created() {
		logger.info('Running app version', process.env.PACKAGE_VERSION);

		// Pre-load these languages because we'll pretty much always need them
		window.Prism.plugins.autoloader.loadLanguages('markup');
		window.Prism.plugins.autoloader.loadLanguages('js');

		// Extend the capabilities of the existing Prism highlighting
		window.Prism.hooks.add('before-highlightall', () => {
			if (!vueAdded && window.Prism.languages['markup']) {
				vueAdded = true;

				// Add a definition for Vue files (just mimics markup for now)
				window.Prism.languages['vue'] = window.Prism.languages.extend('markup', {});
			}

			if (!jsExtended && window.Prism.languages['js']) {
				jsExtended = true;

				// Upgrades the existing highlighting for JS to something...I like
				window.Prism.languages.js.comment[0].pattern = /(?<!(:|"|'|`|import))(\/\/|\/\*|\s+?\*)(.*?)(\*\/|\n|\r|$)/;
				window.Prism.languages.insertBefore('js', 'keyword', {
					variable: {
						pattern: /(^|[^.]|\.\.\.\s*)\b(const|function|let|var)\b/,
						lookbehind: !0
					}
				});
			}
		});
	}
};
</script>
