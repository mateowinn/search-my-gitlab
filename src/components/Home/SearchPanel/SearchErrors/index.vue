<template>
	<q-card v-if="!loading && errorsToShow && errorsToShow.length > 0" class="bg-warning" style="width: fit-content;">
		<q-card-section class="q-pb-none"
			>Shoot. We had {{ errorsToShow.length > 1 ? 'some projects' : 'a project' }} that we couldn't seem to wrangle anything out
			of:</q-card-section
		>

		<!-- A list of projects we couldn't get results from in form of a link to the project -->
		<q-card-section class="q-py-xs">
			<template v-for="(error, index) of errorsToShow">
				<a :href="error.url" target="_blank" :key="`search-error-${error.id}`" rel="nofollow noopener noreferrer">{{ error.name }}</a
				>{{ errorsToShow.length - 1 > index ? ', ' : '' }}
			</template>
		</q-card-section>

		<q-card-section class="q-pt-none"
			>Refreshing might do the trick. Otherwise, it's probably a permissions or project visibility problem.</q-card-section
		>
	</q-card>
</template>

<script>
export default {
	name: 'SearchErrors',
	props: {
		loading: {
			type: Boolean,
			default: false
		},
		projectsQueried: {
			type: Object,
			default: () => ({})
		},
		getProjectByIds: {
			type: Function,
			default: () => {
				// Nothing, I guess
			}
		}
	},
	computed: {
		/**
		 * Automatically compiles a list of projects that we failed to get results from and their metadata
		 *
		 * @returns {Array<Object>} - an array of objects detailing the projects that we failed to get search results from
		 */
		errorsToShow() {
			const projectsWithErrors = [];

			for (const project of Object.values(this.projectsQueried)) {
				// Add each project with results that hasn't been filtered out
				if (this.projectsQueried[project.id] && this.projectsQueried[project.id].error) {
					const { webUrl, name } = this.getProjectByIds(project.id);

					projectsWithErrors.push({
						id: project.id,
						name: name,
						url: webUrl
					});
				}
			}

			return projectsWithErrors;
		}
	}
};
</script>
