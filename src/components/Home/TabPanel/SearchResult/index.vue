<template>
	<!-- We display each search results in a stylish card-like element -->
	<q-card class="q-ma-sm" bordered>
		<!-- If the user clicks on the header of the card, they can expand/collapse the card's contents -->
		<q-card-actions class="q-pa-sm cursor-pointer" style="overflow: auto; white-space: nowrap;" @click.prevent="expanded = !expanded">
			<div class="text-subtitle1 text-weight-bold">
				<!-- Show the file name and path, and add a link icon that will allow the user to go straight to that file in Gitlab -->
				<q-icon name="description" size="xs" style="vertical-align: text-top;" />
				{{ result.path }}
				<q-btn
					type="a"
					icon="open_in_new"
					color="grey-8"
					size="sm"
					flat
					style="vertical-align: middle;"
					:href="result.url"
					target="_blank"
					@click="(e) => e.stopPropagation()"
				/>
			</div>

			<q-space />

			<!-- An icon that simply makes it clear that the card is expandable/collapsible -->
			<q-icon color="grey-7" size="sm" :name="expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'" />
		</q-card-actions>

		<!-- The actual code contents and line numbers -->
		<q-slide-transition>
			<div v-show="expanded">
				<q-card-section horizontal class="q-pa-xs bg-black text-white">
					<!-- This section simply shows line numbers alongside a link that allows the user to jump straight to that line in Gitlab -->
					<q-card-section class="q-pa-none">
						<a
							v-for="(piece, index) of highlightedPieces"
							:key="`result-${result.project_id}-${resultIndex}-line-${index}`"
							:href="`${result.url}#L${result.startline + index}`"
							target="_blank"
							class="code-line code-line__number"
						>
							<p class="q-mb-none q-pa-xs q-px-sm">
								<q-icon name="link" size="xs" class="q-pr-xs" />

								<span>{{ result.startline + index }}</span>
							</p>
						</a>
					</q-card-section>

					<!-- A semantic separator between line numbers and actual lines of code -->
					<q-separator vertical dark />

					<!-- This is the section that actually has the code in its divided lines -->
					<q-card-section class="q-pa-none code-line-container" style="overflow-x:auto;white-space: nowrap;">
						<!-- Additional classes are added to the lines that we detect actually contain the search query -->
						<pre
							v-for="(piece, index) of highlightedPieces"
							:key="`result-${result.project_id}-${resultIndex}-text-${index}`"
							class="q-mb-none q-pa-xs q-px-sm code-line"
							:class="{
								'bg-grey-9': piece && piece.toLowerCase().includes(searchQuery.toLowerCase())
							}"
							v-html="piece || '&nbsp;'"
						></pre>
					</q-card-section>
				</q-card-section>
			</div>
		</q-slide-transition>
	</q-card>
</template>

<script>
import highlightCode from 'src/syntax/highlightCode';

export default {
	name: 'SearchResult',
	props: {
		result: {
			type: Object,
			default: () => ({})
		},
		resultIndex: {
			type: Number,
			default: 0
		},
		searchQuery: {
			type: String,
			default: ''
		},
		expandAll: {
			type: Boolean,
			default: true
		}
	},
	data() {
		return {
			expanded: true
		};
	},
	computed: {
		/**
		 * Hands off the string of code to a utility function that injects highlight spans so that we can show syntax-highlighted code wherever possible
		 *
		 * @returns {String} - the search result, possibly highlighted
		 */
		highlightedData() {
			const highlighted = highlightCode(this.result.data, this.result.ext);
			return highlighted;
		},

		/**
		 * Splits a return search text value from Gitlab based on newline characters
		 *
		 * @returns {Array<String>} - a list of code lines to display, divided by newline characters
		 */
		highlightedPieces() {
			const pieces = this.highlightedData.split('\n');

			for (let i = pieces.length - 1; i > -1; i--) {
				// Our highlighting process sometimes closes its spans on different lines
				if (pieces[i] && pieces[i].startsWith('</span>')) {
					pieces[i - 1] += '</span>';
					pieces[i] = pieces[i].substr(7, pieces[i].length - 1);
				}
			}

			// We often get blank lines at the end (don't know why), so let's filter those out
			if (!pieces[pieces.length - 1]) {
				pieces.splice(pieces.length - 1, 1);
			}
			return pieces;
		}
	},
	watch: {
		/**
		 * Watches for if the user clicks on the overall expand/collapse button and updates this card accordingly
		 */
		expandAll: {
			handler(newVal) {
				this.expanded = newVal;
			}
		}
	}
};
</script>

<style lang="scss">
.code-line,
.code-line-container {
	width: 100%;
}

.code-line {
	&__number {
		color: white !important;
		text-decoration: none;

		& > p {
			width: 100%;
			display: flex;

			& > i {
				visibility: hidden;
			}
		}

		// Only show the link icon when it's hovered over
		&:hover {
			& > p {
				& > span {
					text-decoration: underline;
				}

				& > i {
					visibility: visible;
					text-decoration: none;
				}
			}
		}
	}
}
</style>
