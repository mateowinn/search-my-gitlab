<template>
	<q-card flat class="q-py-md q-px-sm text-center removed-entry">
		<div>Removed {{ type }} from search results</div>
		<a href="#" @click.prevent.stop="restoreFn">Undo</a>

		<!-- Figured it would be nice to give a bit of extra instruction when there are whole collections of searches the user doesn't seem to care about -->
		<div v-if="type === 'group' || type === 'project'">
			If you'd like to omit results for this {{ type }} every time, de-select it in the "Adjust Search Scope" drawer
		</div>
	</q-card>
</template>

<script>
export default {
	props: {
		type: {
			type: String,
			default: ''
		},
		restoreFn: {
			type: Function,
			default: () => {
				// Nothing, I guess
			}
		}
	}
};
</script>

<style lang="scss">
.removed-entry {
	width: 500px;
	max-width: 90%;
	margin: 10px auto;
	background-color: rgba(0, 0, 0, 0.05);

	& > *:not(:first-child) {
		padding-top: 10px;
	}
}
</style>
