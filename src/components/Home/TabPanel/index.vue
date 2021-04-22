<template>
	<!-- Show them the form for creating a new connection if this is the Add tab -->
	<AddConnection v-if="conn.icon" :has-none="conn.hasNone" />
	<div v-else class="q-gutter-md q-pa-sm" style="width: 100vw;">
		<q-card flat class="search-container text-right q-pa-none">
			<a href="#" @click.prevent.stop="toggleDrawer"
				>Narrow Search Scope</a
			>
			<q-input
				filled
				v-model="searchQuery"
				label="Search"
				hint="E.g. 'foo bar baz'"
				@keyup.enter="initiateSearch(searchQuery)"
			>
				<template v-slot:append>
					<q-icon
						name="search"
						@click="initiateSearch(searchQuery)"
					/>
				</template>
			</q-input>
		</q-card>

		<q-linear-progress
			v-if="loading"
			:value="projectsQueried / projectCount"
			class="q-mt-xl"
			style="width: auto;"
		/>

		<template v-else>
			<SearchResult
				v-for="(result, index) of results"
				:key="`result-${result.project_id}-${index}`"
				:result="result"
				:result-index="index"
				:search-query="searchQuery"
			/>
		</template>
	</div>
</template>

<script>
import axios from 'axios';
import AddConnection from './AddConnection/index';
import SearchResult from './SearchResult/index';

export default {
	name: 'TabPanel',
	props: {
		conn: {
			type: Object,
			default: () => ({})
		},
		projects: {
			type: Object,
			default: () => ({})
		},
		toggleDrawer: {
			type: Function,
			default: () => {
				// Nothing, I guess
			}
		}
	},
	data() {
		return {
			searchQuery: '',
			results: [],
			loading: false,
			projectsQueried: 0
		};
	},
	computed: {
		/**
		 * Just fetches the group objects of all the groups tied to the projects (filtered or unfiltered) that we've been given
		 */
		groups() {
			const allGroups = this.$store.Group.groups(this.conn) || [];
			const filteredGroupIds = Object.keys(this.projects);
			console.log('filtered group IDs', filteredGroupIds);
			return allGroups.filter((group) => {
				return filteredGroupIds.includes(group.id.toString());
			});
		},

		projectCount() {
			let count = 0;

			for (const projectArr of Object.values(this.projects)) {
				if (projectArr) {
					count += projectArr.length;
				}
			}

			return count;
		}
	},
	methods: {
		/**
		 * Simply modifies our URL search query param, which triggers a search
		 */
		initiateSearch(query) {
			const routeQuery = {
				...this.$route.query
			};
			routeQuery.search = query;

			this.$router.push({ path: '/', query: routeQuery });
		},

		/**
		 * The function that actually executes the search. Watches for a new query and/or filter changes to be submitted and takes it away!
		 */
		async executeSearch() {
			// We only want to actually execute the query if we're looking at the right tab and we have a real search
			if (
				this.$route.query.search &&
				+this.$route.query.domain === this.conn.index
			) {
				this.results = []; // Reset our results
				this.errors = []; // Also reset our errors
				this.projectsQueried = 0; // And the number of projects we've queried
				this.loading = true; // Show the loading animation

				this.searchQuery = this.$route.query.search;
				console.log('executing search', this.searchQuery, this.groups);

				// Now comes the fun part....cycling through every selected project in every group and aggregating the results
				try {
					const allSearchPromises = [];

					for (const group of this.groups) {
						for (const project of this.projects[group.id]) {
							// Fire off a search for every project in every group that the user has specified
							allSearchPromises.push(
								axios({
									method: 'get',
									headers: {
										'Private-Token': this.conn.token
									},
									url: `${this.conn.domain}/api/v4/projects/${
										project.id
									}/search?scope=blobs&search=${encodeURIComponent(
										this.searchQuery
									)}`
								})
									.then((response) => {
										this.results = [
											...this.results,
											...response.data
										];
									})
									.catch((e) => {
										console.error(
											{
												error: e,
												query: this.searchQuery,
												groupId: group.id,
												projectId: project.id
											},
											'Error searching project'
										);
									})
									.finally(() => {
										this.projectsQueried += 1;
									})
							);
						}
					}

					// Fire them all off at the same time and wait for them all to resolve
					await Promise.all(allSearchPromises);
				} catch (e) {
					console.error(
						{ error: e, query: this.searchQuery },
						'Error executing searches'
					);
				}

				// Turn off the loading animation
				this.loading = false;
			}
		}
	},
	watch: {
		'$route.query.search': {
			immediate: true,
			handler() {
				// Re-execute the search every time the search changes
				this.executeSearch();
			}
		},
		projects: {
			immediate: true,
			handler() {
				console.log('projects updated!', this.projects);
				// Re-execute the search every time the list of filtered projects changes
				this.executeSearch();
			}
		}
	},
	components: {
		AddConnection,
		SearchResult
	}
};
</script>

<style lang="scss">
.search-container {
	& > a {
		text-decoration: underline;
	}
}
</style>
