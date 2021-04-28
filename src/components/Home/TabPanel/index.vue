<template>
	<!-- Show them the form for creating a new connection if this is the Add tab -->
	<AddConnection v-if="conn.icon" :has-none="conn.hasNone" />
	<div v-else class="q-gutter-md" style="width: 100vw;">
		<!-- Our search bar and link to open filters -->
		<q-card flat class="search-container text-right q-pa-none">
			<a href="#" @click.prevent.stop="toggleDrawer">Adjust Search Scope</a>
			<q-input filled v-model="searchQuery" label="Search" hint="E.g. 'foo bar baz'" @keyup.enter="initiateSearch(searchQuery)">
				<template v-slot:append>
					<q-icon name="search" @click="initiateSearch(searchQuery)" />
				</template>
			</q-input>
		</q-card>

		<!-- A modal for confirming the user's intentions if they try doing a search with less than 4 letters -->
		<q-dialog v-model="confirmQuery" persistent>
			<q-card>
				<!-- Warning icon, front and center -->
				<q-card-section class="text-center">
					<q-icon name="warning" color="warning" size="lg" />
				</q-card-section>

				<q-card-section class="text-center">
					<span class="q-ml-sm"
						>Are you sure you want to search for "{{ searchQuery }}"? Such a small search term could result in wayyy more results than
						desired.</span
					>
				</q-card-section>

				<q-card-actions align="around">
					<q-btn flat label="No, thanks. I'd rather not crash my browser." color="secondary" v-close-popup />
					<q-btn flat label="Proceed anyway" color="grey-8" @click="initiateSearch(searchQuery, true)" v-close-popup />
				</q-card-actions>
			</q-card>
		</q-dialog>

		<!-- Here we show the user if we failed to fetch results from any of the projects -->
		<q-card v-if="!loading && errorsToShow && errorsToShow.length > 0" class="bg-warning">
			<q-card-section class="q-pb-none">Shoot. We had a couple of projects that we couldn't seem to wrangle anything out of:</q-card-section>

			<q-card-section class="q-py-xs">
				<template v-for="(error, index) of errorsToShow">
					<a :href="error.url" target="_blank" :key="`search-error-${error.id}`">{{ error.name }}</a
					>{{ errorsToShow.length - 1 > index ? ', ' : '' }}
				</template>
			</q-card-section>

			<q-card-section class="q-pt-none"
				>Refreshing might do the trick. Otherwise, it's probably a permissions or project visibility problem.</q-card-section
			>
		</q-card>

		<!-- Search metadata, i.e. how many results we found -->
		<div v-if="results && Object.keys(results).length > 0" class="search-stats">
			<span class="text-grey-6"
				>{{ resultsCount }}{{ someHaveMore ? '+' : '' }} result{{ resultsCount === 1 ? '' : 's' }} found in
				{{ projectsWithResults }} project{{ projectsWithResults === 1 ? '' : 's' }}</span
			>
			<a href="#" @click.prevent.stop="expandAll = !expandAll">{{ expandAll ? 'Collapse All' : 'Expand All' }}</a>
		</div>

		<!-- Loading bar and messages -->
		<template v-if="loading">
			<q-linear-progress :value="loadingPerc" class="search-loader" />
			<div class="text-h6 text-center">{{ loadingText }}</div>
		</template>

		<q-list v-if="!loading && projectsToShow && Object.keys(results).length > 0" separator bordered class="rounded-borders" ref="parentList">
			<!-- Show a polite message if we actually have no results to show them -->
			<div v-if="results.none" class="text-h6 text-center">Well, poop. We've got nothing that matches that criteria.</div>

			<!-- Woo-hoo! We've got results to show! -->
			<q-expansion-item v-else v-for="(group, groupId) in projectsToShow" :key="'group-results-' + groupId">
				<template v-slot:header>
					<!-- Group picture -->
					<q-item-section avatar>
						<Avatar :entity="getGroupById(groupId)" />
					</q-item-section>

					<q-item-section>
						{{ getGroupById(groupId).name }}
					</q-item-section>
				</template>

				<q-separator />

				<!-- Create an expandansion item for every project inside of every group expansion item -->
				<q-list class="expansion-inset">
					<q-expansion-item v-for="(projectResults, projectId) in group" :key="'project-results' + projectId">
						<template v-slot:header>
							<!-- Project picture -->
							<q-item-section avatar>
								<Avatar :entity="getProjectByIds(groupId, projectId)" />
							</q-item-section>

							<q-item-section class="expansion-inset__name">
								<span>{{ getProjectByIds(groupId, projectId).name }}</span>

								<!-- An icon link to allow users to open this project directly -->
								<q-btn
									type="a"
									icon="open_in_new"
									color="grey-8"
									size="sm"
									flat
									:href="getProjectByIds(groupId, projectId).webUrl"
									target="_blank"
								/>
							</q-item-section>
						</template>

						<!-- Loop through the children (projects) and show them all -->
						<q-list class="expansion-inset">
							<SearchResult
								v-for="(searchResult, index) of projectResults"
								:key="`result-${projectId}-${index}`"
								:result="searchResult"
								:result-index="index"
								:search-query="searchQuery"
								:expand-all="expandAll"
							/>
						</q-list>

						<q-separator />
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
			confirmQuery: false,
			results: {},
			errors: [],
			loading: false,
			projectsQueried: {},
			projectsWithResults: 0,
			resultsCount: 0,
			someHaveMore: false,
			expandAll: false,
			queryTime: 0
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
		},

		loadingPerc() {
			return Object.values(this.projectsQueried).filter((project) => project.loading === false).length / this.projectCount;
		},

		loadingText() {
			if (this.loadingPerc > 0.95) {
				return 'Putting a bow on it...';
			} else {
				if (this.queryTime > 12) {
					return '...or maybe your connection is just slow?';
				} else if (this.queryTime > 9) {
					return 'Holy cow this is a lot of stuff';
				} else if (this.queryTime > 6) {
					return 'Rounding up stragglers...';
				} else if (this.queryTime > 3) {
					return "Searching dark corners you've never even touched...";
				} else {
					return 'Running the Gitlab Gauntlet...';
				}
			}
		},

		projectsToShow() {
			const toShow = {};
			// We also want to tally metadata
			let resultsCount = 0;
			let projectsWithResults = 0;
			let someHaveMore = false;

			for (const group of this.groups) {
				// Only show results for a group if a group has any results from its project searches
				if (this.results[group.id]) {
					toShow[group.id] = {};

					for (const project of this.projects[group.id]) {
						// Add each project with results that hasn't been filtered out
						if (this.results[group.id][project.id]) {
							const searchResults = this.results[group.id][project.id];
							toShow[group.id][project.id] = searchResults;

							// Metadata additions!
							resultsCount += searchResults.length;
							projectsWithResults += 1;

							if (this.projectsQueried[project.id].hasMore) {
								someHaveMore = true;
							}
						}
					}

					// If it turns out that we didn't actually have any results in this group, kindly prevent the group from being shown
					if (Object.keys(toShow[group.id]).length < 1) {
						delete toShow[group.id];
					}
				}
			}

			// Update some metadata to help the user
			this.$set(this, 'resultsCount', resultsCount);
			this.$set(this, 'projectsWithResults', projectsWithResults);
			this.$set(this, 'someHaveMore', someHaveMore);

			if (Object.keys(toShow).length < 1 && Object.keys(this.projectsQueried).length > 0) {
				// Show a no results message if we don't actually have any matching results to show
				toShow.none = true;
			}

			return toShow;
		},

		errorsToShow() {
			const projectsWithErrors = [];

			for (const group of this.groups) {
				for (const project of this.projects[group.id]) {
					// Add each project with results that hasn't been filtered out
					if (this.projectsQueried[project.id] && this.projectsQueried[project.id].error) {
						projectsWithErrors.push({
							id: project.id,
							name: project.name,
							url: project.webUrl
						});
					}
				}
			}

			return projectsWithErrors;
		}
	},
	methods: {
		/**
		 * Simply modifies our URL search query param, which triggers a search
		 */
		initiateSearch(query, confirmed) {
			if (query.length < 4 && !confirmed) {
				this.confirmQuery = true;
			} else {
				const routeQuery = {
					...this.$route.query
				};
				routeQuery.search = query;

				this.$router.replace({ path: '/', query: routeQuery });
			}
		},

		/**
		 * The function that actually executes the search. Is notified whenever a new query and/or filter changes are submitted and takes it away!
		 */
		async executeSearch(projectsToSearch) {
			// We only want to actually execute the query if we're looking at the right tab and we have a real search
			if (this.$route.query.search && +this.$route.query.domain === this.conn.index && Object.keys(projectsToSearch).length > 0) {
				this.queryTime = 0;
				this.loading = true; // Show the loading animation

				console.log({ query: this.searchQuery, connIndex: this.conn.index, projects: projectsToSearch }, 'Executing search');

				// Now comes the fun part....cycling through every selected project in every group and aggregating the results
				try {
					const allSearchPromises = [];

					for (const groupId of Object.keys(projectsToSearch)) {
						for (const project of projectsToSearch[groupId]) {
							// Fire off a search for every project in every group that the user has specified
							allSearchPromises.push(
								axios({
									method: 'get',
									headers: {
										'Private-Token': this.conn.token
									},
									url: `${this.conn.domain}/api/v4/projects/${
										project.id
									}/search?scope=blobs&per_page=20&search=${encodeURIComponent(this.searchQuery)}`
								})
									.then((response) => {
										if (response.data && response.data.length > 0) {
											// I don't really want this to pop up in the list if it didn't actually return anything
											this.$set(this.results, groupId, this.results[groupId] || {});
											this.$set(this.results[groupId], project.id, response.data);

											// Append a dynamic link to this in order to be able to just open it in a new tab
											for (const result of this.results[groupId][project.id]) {
												result.url = `${project.webUrl}/-/blob/${result.ref}/${result.path}`;
											}

											// Update some metadata figures
											this.resultsCount += response.data.length;
											this.projectsWithResults += 1;
											if (response.data.length === 20) {
												this.$set(this.projectsQueried[project.id], 'hasMore', true);
											}
										}
									})
									.catch((e) => {
										// Tracking the failures so that we can show the user what we couldn't search
										this.$set(this.projectsQueried[project.id], 'error', e);

										console.error(
											{
												error: e,
												query: this.searchQuery,
												groupId: groupId,
												projectId: project.id
											},
											'Error searching project'
										);
									})
									.finally(() => {
										// Make sure they know that we're no longer loading this
										this.$set(this.projectsQueried[project.id], 'loading', false);
									})
							);

							// Mark that we've started searching this project
							this.$set(this.projectsQueried, project.id, {
								id: project.id,
								loading: true,
								page: 1
							});
						}
					}

					// Useful for tracking how long this current search is taking
					if (allSearchPromises.length > 0) {
						const queryInterval = window.setInterval(() => {
							if (this.loading) {
								// If we're still loading, then add 1 second and keep up the cycle
								this.queryTime += 1;
							} else {
								// If we're no longer loading, then clear this out so we don't bloat memory
								window.clearInterval(queryInterval);
							}
						}, 1000); // Runs every second
					}

					// Fire them all off at the same time and wait for them all to resolve
					await Promise.all(allSearchPromises);
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
		},

		// Helps us determine whether we need to actually re-execute a search
		getDiffNeeds(projects) {
			const diff = {};

			Object.keys(projects).forEach((groupId) => {
				for (const project of projects[groupId]) {
					// If we haven't already queried this project, then add it to our diff!
					if (!this.projectsQueried[project.id]) {
						diff[groupId] = diff[groupId] || [];
						diff[groupId].push(project);
					}
				}
			});

			return diff;
		}
	},
	watch: {
		'$route.query.search': {
			immediate: true,
			handler() {
				// Every time we get a new query, we want to re-execute the entire thing
				// Reset a bunch of figures related to our results
				this.$set(this, 'results', {});
				this.$set(this, 'projectsQueried', {});
				this.$set(this, 'projectsWithResults', 0);
				this.$set(this, 'resultsCount', 0);
				this.$set(this, 'someHaveMore', false);
				this.searchQuery = this.$route.query.search;

				// Re-execute the search every time the search changes
				this.executeSearch(this.projects);
			}
		},
		projects: {
			immediate: true,
			handler(newVal) {
				// We do NOT want to run any searches if this is simply removing some projects from the list
				const needs = this.getDiffNeeds(newVal);

				// Re-execute the search every time the list of filtered projects changes
				this.executeSearch(needs);
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
	padding-left: 12px;

	&__name {
		flex-direction: row;
		justify-content: flex-start;
		align-content: center;
	}
}
</style>
