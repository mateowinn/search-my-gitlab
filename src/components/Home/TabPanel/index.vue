<template>
	<!-- Show them the form for creating a new connection if this is the Add tab -->
	<AddConnection v-if="conn.icon" :has-none="conn.hasNone" />
	<div v-else class="q-gutter-md" style="width: 100vw;">
		<q-card flat class="search-container text-right q-pa-none">
			<a href="#" @click.prevent.stop="toggleDrawer">Narrow Search Scope</a>
			<q-input filled v-model="searchQuery" label="Search" hint="E.g. 'foo bar baz'" @keyup.enter="initiateSearch(searchQuery)">
				<template v-slot:append>
					<q-icon name="search" @click="initiateSearch(searchQuery)" />
				</template>
			</q-input>
		</q-card>

		<q-linear-progress v-if="loading" :value="projectsQueried / projectCount" class="search-loader" />

		<div v-if="results && Object.keys(results).length > 0" class="search-stats">
			<span class="text-grey-6">{{ resultsCount }}{{ hasMore ? '+' : '' }} results found in {{ projectsWithResults }} projects</span>
			<a href="#" @click.prevent.stop="expandAll = !expandAll">{{ expandAll ? 'Collapse All' : 'Expand All' }}</a>
		</div>

		<q-list v-if="!loading && results && Object.keys(results).length > 0" separator bordered class="rounded-borders" ref="parentList">
			<q-expansion-item v-for="(projects, groupId) in results" :key="'group-results-' + groupId">
				<template v-slot:header>
					<q-item-section avatar>
						<Avatar :entity="getGroupById(groupId)" />
					</q-item-section>

					<q-item-section>
						{{ getGroupById(groupId).name }}
					</q-item-section>
				</template>

				<!-- Create an expandansion item for every project inside of every group expansion item -->
				<q-list class="expansion-inset">
					<q-expansion-item
						v-for="(searchResults, projectId) of projects"
						:key="'project-results' + projectId"
						v-bind="{ 'default-opened': expandAll }"
					>
						<template v-slot:header>
							<q-item-section avatar>
								<Avatar :entity="getProjectByIds(groupId, projectId)" />
							</q-item-section>

							<q-item-section>
								{{ getProjectByIds(groupId, projectId).name }}
							</q-item-section>
						</template>

						<!-- Loop through the children (projects) and show them all -->
						<q-list class="expansion-inset">
							<SearchResult
								v-for="(searchResult, index) of searchResults"
								:key="`result-${projectId}-${index}`"
								:result="searchResult"
								:result-index="index"
								:search-query="searchQuery"
							/>
						</q-list>
					</q-expansion-item>
				</q-list>
			</q-expansion-item>
		</q-list>
	</div>
</template>

<script>
import axios from 'axios';
import AddConnection from './AddConnection/index';
import SearchResult from './SearchResult/index';
import Avatar from 'components/shared/Avatar/index';

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
			results: {},
			loading: false,
			projectsQueried: 0,
			projectsWithResults: 0,
			resultsCount: 0,
			hasMore: false,
			expandAll: false
		};
	},
	computed: {
		/**
		 * Just fetches the group objects of all the groups tied to the projects (filtered or unfiltered) that we've been given
		 */
		groups() {
			const allGroups = this.$store.Group.groups(this.conn) || [];
			const filteredGroupIds = Object.keys(this.projects);

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
			if (this.$route.query.search && +this.$route.query.domain === this.conn.index) {
				// Reset a bunch of figures related to our results
				this.results = {};
				this.errors = [];
				this.projectsQueried = 0;
				this.projectsWithResults = 0;
				this.resultsCount = 0;

				this.loading = true; // Show the loading animation

				const aggregatedResults = {};
				this.searchQuery = this.$route.query.search;

				console.log({ query: this.searchQuery, connIndex: this.conn.index }, 'Executing search');

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
									}/search?scope=blobs&per_page=100&search=${encodeURIComponent(this.searchQuery)}`
								})
									.then((response) => {
										if (response.data && response.data.length > 0) {
											// I don't really want this to pop up in the list if it didn't actually return anything
											aggregatedResults[group.id] = aggregatedResults[group.id] || {};
											aggregatedResults[group.id][project.id] = response.data;

											// Also add to our metadata, please
											this.projectsWithResults += 1;
											this.resultsCount += response.data.length;

											if (response.data.length === 100) {
												// If we know we have to do any pagination
												this.hasMore = true;
											}
										}
									})
									.catch((e) => {
										// Tracking the failed repo IDs so that we can show the user what we couldn't search
										this.errors.push({
											projectId: project.id,
											error: e
										});

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
					this.$set(this, 'results', aggregatedResults);
				} catch (e) {
					console.error({ error: e, query: this.searchQuery }, 'Error executing searches');
				}

				// Turn off the loading animation
				this.loading = false;
			}
		},

		getGroupById(groupId) {
			return this.groups.find((group) => group.id === +groupId);
		},

		getProjectByIds(groupId, projectId) {
			return this.projects[groupId].find((project) => project.id === +projectId);
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
				// Re-execute the search every time the list of filtered projects changes
				this.executeSearch();
			}
		},
		expandAll: {
			handler(newVal) {
				for (const expansionItem of this.$refs.parentList.$children) {
					// Expand/Collapse all of the group-level lines
					if (newVal) {
						expansionItem.show();
					} else {
						expansionItem.hide();
					}

					// Also search through all of the projects inside of each group and expand/collapse them
					for (const childItem of expansionItem.$children[1].$children[0].$children) {
						if (newVal) {
							childItem.show();
						} else {
							childItem.hide();
						}
					}
				}
			}
		}
	},
	components: {
		AddConnection,
		SearchResult,
		Avatar
	}
};
</script>

<style lang="scss">
.search-container {
	& > a {
		text-decoration: underline;
	}
}

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

.search-stats {
	padding: 0px 5px;
	display: flex;
	justify-content: space-between;
}

.expansion-inset {
	padding-left: 8px;
}
</style>
