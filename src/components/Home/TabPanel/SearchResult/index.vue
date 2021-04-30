<template>
	<q-card class="q-ma-sm" bordered>
		<q-card-actions class="q-pa-sm cursor-pointer" style="overflow: auto; white-space: nowrap;" @click.prevent="expanded = !expanded">
			<div class="text-subtitle1 text-weight-bold">
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

			<q-icon color="grey-7" size="sm" :name="expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'" />
		</q-card-actions>

		<q-slide-transition>
			<div v-show="expanded">
				<q-card-section horizontal class="q-pa-xs bg-black text-white">
					<q-card-section class="q-pa-none">
						<a
							v-for="(piece, index) of getPieces(highlightedData)"
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

					<q-separator vertical dark />

					<q-card-section class="q-pa-none code-line-container" style="overflow-x:auto;white-space: nowrap;">
						<pre
							v-for="(piece, index) of getPieces(highlightedData)"
							:key="`result-${result.project_id}-${resultIndex}-text-${index}`"
							class="q-mb-none q-pa-xs q-px-sm code-line"
							:class="{
								'bg-grey-8': piece && piece.toLowerCase().includes(searchQuery.toLowerCase())
							}"
							v-html="piece || '&nbsp;'"
						></pre>
						<!-- <pre v-html="highlightedData">
						<div
								v-for="(piece, index) of getPieces(highlightedData)"
								:key="`result-${result.project_id}-${resultIndex}-text-${index}`"
								class="q-mb-none q-pa-xs q-px-sm code-line"
								:class="{
									'bg-grey-8': piece && piece.toLowerCase().includes(searchQuery.toLowerCase())
								}"
								v-html="piece"
							/>
						</pre> -->
					</q-card-section>
				</q-card-section>
			</div>
		</q-slide-transition>
	</q-card>
</template>

<script>
import highlightCode from 'utilities/highlightCode';

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
		highlightedData() {
			// const highlighted = global.Rainbow.colorSync(this.result.data, this.result.ext);
			const highlighted = highlightCode(this.result.data, this.result.ext);
			// console.log('highlighted', this.result.ext, JSON.stringify(highlighted));
			return highlighted;
		}
	},
	methods: {
		/**
		 * Splits a return search text value from Gitlab based on newline characters
		 */
		getPieces(resultStr) {
			const pieces = resultStr.split('\n');

			// We often get blank lines (don't know why), so let's filter those out
			for (let i = pieces.length - 1; i > 0; i--) {
				if (!pieces[i]) {
					pieces.splice(i, 1);
				}
			}

			return pieces;
		}
	},
	watch: {
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
