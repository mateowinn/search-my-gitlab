<template>
	<div>
		<!-- Actual progress bar -->
		<q-linear-progress :value="loadingPerc" class="search-loader" />

		<!-- Fun text inserts while loading -->
		<div class="text-h6 text-center q-pt-md">{{ loadingText }}</div>
	</div>
</template>

<script>
export default {
	name: 'SearchLoader',
	props: {
		projectsQueried: {
			type: Object,
			default: () => ({})
		},
		queryTime: {
			type: Number,
			default: 0
		}
	},
	computed: {
		/**
		 * Dynamically calculates the percentage of projects successfully queried
		 *
		 * @returns {Float} - the number of projects queried divided by the number of projects still to finish querying
		 */
		loadingPerc() {
			return (
				Object.values(this.projectsQueried).filter((project) => project.loading === false).length / Object.values(this.projectsQueried).length
			);
		},

		/**
		 * Shows various messages during loading time. One dependent on the actual progress but the rest dependent on how long it takes to load.
		 *
		 * @returns {String} - the loading message we want to show to the user at any given moment
		 */
		loadingText() {
			if (this.loadingPerc > 0.95) {
				// A constant message we show when the search is almost finished
				return 'Putting a bow on it...';
			} else {
				// Various messages depending on how long it has taken us to compile results
				if (this.queryTime > 12) {
					return '...or maybe your connection is just slow?';
				} else if (this.queryTime > 9) {
					return 'Holy cow this is a big place';
				} else if (this.queryTime > 6) {
					return 'Rounding up stragglers...';
				} else if (this.queryTime > 3) {
					return "Searching dark corners you've never even touched...";
				} else {
					return 'Running the Gitlab Gauntlet...';
				}
			}
		}
	}
};
</script>

<style lang="scss">
.search-loader {
	width: auto;
	margin-top: 60px;
	margin-left: 10%;
	margin-right: 6%; // I don't know why they can't be the same. Probably some weird parent right padding.

	@media (min-width: $breakpoint-sm-min) {
		max-width: 800px;
		margin-top: 100px;
		margin-left: auto;
		margin-right: auto;
	}
}
</style>
