<template>
	<q-card v-if="highlightingOff" class="bg-warning" style="width: fit-content;">
		<q-card-section>
			<!-- Warn them! Safari sucks! -->
			<q-icon size="sm" class="q-pr-xs" name="warning" />
			Syntax highlighting is unavailable. See <a target="_blank" href="https://caniuse.com/js-regexp-lookbehind">browser support</a> for
			required RegEx capabilities.
			<q-tooltip v-if="safariOperaBurn">
				<span v-html="safariOperaBurn"></span>
			</q-tooltip>
		</q-card-section>
	</q-card>
</template>

<script>
import { canSyntaxHighlight } from 'src/syntax/highlightCode';

export default {
	name: 'HighlightingUnavailable',
	data() {
		return {
			highlightingOff: false,
			isSafari: /^((?!chrome|android).)*safari/i.test(window.navigator.userAgent),
			isOperaMini: window.navigator.userAgent.indexOf('Opera Mini') > -1
		};
	},
	computed: {
		/**
		 * Creates an informative and scathing message to show when the browser is Safari or Opera Mini
		 */
		safariOperaBurn() {
			if (this.isSafari || this.isOperaMini) {
				return ' Safari and Opera Mini are the only major browsers in the world that do not support advanced RegEx features like Lookbehind expressions.<br>You are better off with a different browser. ¯\\_(ツ)_/¯';
			} else {
				return '';
			}
		}
	},
	mounted() {
		// Every time this is mounted, we check if the highlighting is still available/unavailable
		if (!canSyntaxHighlight()) {
			this.highlightingOff = true;
		}
	}
};
</script>
