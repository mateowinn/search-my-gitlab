<template>
	<div class="search-stats">
		<span class="text-grey-6"
			>{{ resultsCount }}{{ someHaveMore ? '+' : '' }} result{{ resultsCount === 1 ? '' : 's' }} found in {{ projectsWithResults }} project{{
				projectsWithResults === 1 ? '' : 's'
			}}</span
		>
		<a href="#" @click.prevent.stop="expandAllLocal = !expandAllLocal">{{ expandAllLocal ? 'Collapse All' : 'Expand All' }}</a>
	</div>
</template>

<script>
export default {
	name: 'SearchStats',
	props: {
		resultsCount: {
			type: Number,
			default: 0
		},
		someHaveMore: {
			type: Boolean,
			default: false
		},
		projectsWithResults: {
			type: Number,
			default: 0
		},
		expandAll: {
			type: Boolean,
			default: false
		}
	},
	// Allows us to use v-model in the parent and $emit in this component with no further wiring!
	model: {
		prop: 'expandAll',
		event: 'changeExpandAll'
	},
	computed: {
		expandAllLocal: {
			get() {
				return this.expandAll;
			},
			set(newVal) {
				this.$emit('changeExpandAll', newVal);
			}
		}
	}
};
</script>

<style lang="scss">
.search-stats {
	padding: 0px 5px;
	display: flex;
	justify-content: space-between;
}
</style>
