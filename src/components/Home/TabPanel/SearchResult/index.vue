<template>
	<q-card class="q-ma-sm" bordered>
		<q-card-section class="q-pa-sm" style="overflow: auto; white-space: nowrap;">
			<div class="text-subtitle1 text-weight-bold">
				<q-icon name="description" size="xs" />
				{{ result.path }}
			</div>
		</q-card-section>

		<q-card-section horizontal class="q-pa-xs bg-black text-white">
			<q-card-section class="q-pa-none">
				<p
					v-for="(piece, index) of getPieces(result.data)"
					:key="`result-${result.project_id}-${resultIndex}-line-${index}`"
					class="q-mb-none q-pa-xs q-px-sm code-line"
					:class="{
						'bg-grey-8': piece && piece.toLowerCase().includes(searchQuery.toLowerCase())
					}"
				>
					{{ result.startline + index }}
				</p>
			</q-card-section>

			<q-separator vertical dark />

			<q-card-section class="q-pa-none" style="overflow-x:auto;white-space: nowrap;">
				<p
					v-for="(piece, index) of getPieces(result.data)"
					:key="`result-${result.project_id}-${resultIndex}-text-${index}`"
					class="q-mb-none q-pa-xs q-px-sm code-line"
					:class="{
						'bg-grey-8': piece && piece.toLowerCase().includes(searchQuery.toLowerCase())
					}"
				>
					{{ piece || '&nbsp;' }}
				</p>
			</q-card-section>
		</q-card-section>
	</q-card>
</template>

<script>
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
	}
};
</script>

<style lang="scss">
.code-line {
	width: 100%;
}
</style>
