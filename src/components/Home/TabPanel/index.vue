<template>
	<!-- Show them the form for creating a new connection if this is the Add tab -->
	<AddConnection v-if="conn.icon" :has-none="conn.hasNone" />
	<div v-else class="q-gutter-md" style="width: 100vw;">
		<!-- Our search bar and link to open filters -->
		<q-card flat class="search-container text-right q-pa-none">
			<a href="#" @click.prevent.stop="toggleDrawer">Adjust Search Scope</a>
			<q-input filled v-model="searchQuery" label="Search" hint="E.g. 'foo bar baz'" @keyup.enter="initiateSearch(searchQuery)" clearable>
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

				<!-- Possible actions to take -->
				<q-card-actions align="around">
					<q-btn flat label="No, thanks. I'd rather not crash my browser." color="secondary" v-close-popup />
					<q-btn flat label="Proceed anyway" color="grey-8" @click="initiateSearch(searchQuery, true)" v-close-popup />
				</q-card-actions>
			</q-card>
		</q-dialog>

		<!-- Here we show the user if we failed to fetch results from any of the projects -->
		<q-card v-if="!loading && errorsToShow && errorsToShow.length > 0" class="bg-warning" style="width: fit-content;">
			<q-card-section class="q-pb-none"
				>Shoot. We had a {{ errorsToShow.length > 1 ? 'couple of projects' : 'project' }} that we couldn't seem to wrangle anything out
				of:</q-card-section
			>

			<!-- A list of projects we couldn't get results from in form of a link to the project -->
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
		<div v-if="projectsToShow && Object.keys(projectsToShow).length > 0 && !projectsToShow.none" class="search-stats">
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

		<!-- Show a polite message if we actually have no results to show them -->
		<div v-if="!loading && searchQuery && projectsToShow && projectsToShow.none" class="text-h6 text-center">
			Well, poop. We've got nothing that matches that criteria.
		</div>

		<q-list
			v-if="!loading && projectsToShow && Object.keys(projectsToShow).length > 0 && !projectsToShow.none"
			separator
			bordered
			class="rounded-borders"
			ref="parentList"
		>
			<!-- Woo-hoo! We've got results to show! -->
			<q-expansion-item v-for="(group, groupId) in projectsToShow" :key="'group-results-' + groupId">
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
								<Avatar :entity="getProjectByIds(projectId)" />
							</q-item-section>

							<q-item-section class="expansion-inset__name">
								<span>{{ getProjectByIds(projectId).name }}</span>

								<!-- An icon link to allow users to open this project directly -->
								<q-btn
									type="a"
									icon="open_in_new"
									color="grey-8"
									size="sm"
									flat
									:href="getProjectByIds(projectId).webUrl"
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

						<!-- Show them a load more button if we think there might be more -->
						<q-btn
							v-if="projectsQueried[projectId].hasMore && !projectsQueried[projectId].loading && !projectsQueried[projectId].error"
							@click.prevent="loadMore(groupId, projectId)"
							color="primary"
							class="q-my-lg q-mx-auto"
							style="display: block; min-width: 200px;"
							>Load More</q-btn
						>

						<!-- Our loading animation while we fetch more -->
						<q-circular-progress
							v-if="projectsQueried[projectId].loading"
							indeterminate
							size="50px"
							color="secondary"
							class="q-my-lg q-mx-auto"
							style="display: block;"
						/>

						<div v-if="projectsQueried[projectId].done" class="text-center q-pa-lg">
							<q-icon name="sd_card_alert" color="warning" size="sm" class="vertical-top" />
							<span v-if="projectsQueried[projectId].error" class="text-subtitle1"
								>Dang it! Your account seems to think I'm bugging it too much. Maybe...refresh?</span
							>
							<span v-else class="text-subtitle1">Uhh, never mind...looks like that was actually the last of it. Carry on!</span>
						</div>

						<q-separator />
					</q-expansion-item>
				</q-list>
			</q-expansion-item>
		</q-list>
	</div>
</template>

<script>
import axios from 'axios';
import logger from 'utilities/logger';
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
		groups: {
			type: Array,
			default: () => []
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
			pageSize: 20,
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
		 * Simply counts how many projects we have to search from (i.e. not filtered out)
		 *
		 * @returns {Int} - the number of projects in our list of searchable projects
		 */
		projectCount() {
			let count = 0;

			for (const projectArr of Object.values(this.projects)) {
				if (projectArr) {
					count += projectArr.length;
				}
			}

			return count;
		},

		/**
		 * Dynamically calculates the percentage of projects successfully queried
		 *
		 * @returns {Float} - the number of projects queried divided by the number of projects still to finish querying
		 */
		loadingPerc() {
			return Object.values(this.projectsQueried).filter((project) => project.loading === false).length / this.projectCount;
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
		},

		/**
		 * Filters our search results based on which projects we should actually be showing.This is useful because it means we don't have to
		 * re-execute a search against all unfiltered projects each time that a user adds or removes a project or group from the filters.
		 *
		 * @returns {Object} - the search results we want to show according to the filters that the user has indicated. Is grouped by group and project.
		 */
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
								// If we think that any of these projects have more results, then raise the flag to show a "+" in our results count
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

		/**
		 * Automatically compiles a list of projects that we failed to get results from and their metadata
		 *
		 * @returns {Array<Object>} - an array of objects detailing the projects that we failed to get search results from
		 */
		errorsToShow() {
			const projectsWithErrors = [];

			for (const group of this.groups) {
				for (const project of this.projects[group.id]) {
					// Add each project with results that hasn't been filtered out
					if (this.projectsQueried[project.id] && this.projectsQueried[project.id].error) {
						const { webUrl } = this.getProjectByIds(project.id);

						projectsWithErrors.push({
							id: project.id,
							name: project.name,
							url: webUrl
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
		 *
		 * @param {String} query - the text to search for which the user has entered
		 * @param {Boolean} confirmed - whether or not we've already warned this user about their small search query
		 */
		initiateSearch(query, confirmed) {
			if (query.length < 4 && !confirmed) {
				// If the user is attempting a really small query, then I'd really rather warn them of the consequences
				this.confirmQuery = true;
			} else {
				// Update our URL, which will trigger a search
				const routeQuery = {
					...this.$route.query
				};
				routeQuery.search = query;

				this.$router.push({ path: this.$route.path, query: routeQuery });
			}
		},

		/**
		 * The function that actually executes the search. Is notified whenever a new query and/or filter changes are submitted and takes it away!
		 *
		 * @param {Object} projectsToSearch - the list (technically object) of projects, within their group divisions, that we should fetch search results for
		 */
		async executeSearch(projectsToSearch) {
			// We only want to actually execute the query if we're looking at the right tab and we have a real search
			if (this.$route.query.search && +this.$route.params.domain === this.conn.index && Object.keys(projectsToSearch).length > 0) {
				this.queryTime = 0;
				this.loading = true; // Show the loading animation

				logger.info({ query: this.searchQuery, connIndex: this.conn.index, projects: projectsToSearch }, 'Executing search');

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
									url: `${this.conn.domain}/api/v4/projects/${project.id}/search?scope=blobs&per_page=${
										this.pageSize
									}&search=${encodeURIComponent(this.searchQuery)}`
								})
									.then((response) => {
										// I don't really want this to pop up in the list if it didn't actually return anything
										if (response.data && response.data.length > 0) {
											this.$set(this.results, groupId, this.results[groupId] || {});
											this.$set(this.results[groupId], project.id, response.data);

											// Append a dynamic link to this in order to be able to just open it in a new tab
											const { webUrl } = this.getProjectByIds(project.id);
											for (const result of this.results[groupId][project.id]) {
												result.url = `${webUrl}/-/blob/${result.ref}/${result.path}`;

												// Find out file extensions for syntax highlighting later on
												const extIndex = result.filename.lastIndexOf('.');

												if (extIndex > 0) {
													result.ext = result.filename.substr(extIndex + 1);
												} else {
													result.ext = 'generic';
												}
											}

											// Update some metadata figures
											this.resultsCount += response.data.length;
											this.projectsWithResults += 1;
											if (response.data.length === this.pageSize) {
												this.$set(this.projectsQueried[project.id], 'hasMore', true);
											}
										}
									})
									.catch((e) => {
										// Tracking the failures so that we can show the user what we couldn't search
										this.$set(this.projectsQueried[project.id], 'error', e);

										logger.error(
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
					logger.error({ error: e, query: this.searchQuery }, 'Error executing searches');
				}

				// Turn off the loading animation
				this.loading = false;
			}
		},

		/**
		 * A convenience for grabbing ALL data of a group
		 *
		 * @param {Int|String} groupId - the ID of the group whose data you want
		 */
		getGroupById(groupId) {
			return this.groups.find((group) => group.id === +groupId);
		},

		/**
		 * A convenience for grabbing ALL data of a project
		 *
		 * @param {Int|String} projectId - the ID of the project whose data you want
		 */
		getProjectByIds(projectId) {
			return this.$store.Project.project(this.conn.index, projectId);
		},

		/**
		 * Helps us determine whether we need to actually re-execute a search. Looks at what projects we've already queried vs which we still need to query to find out the difference.
		 *
		 * @param {Object} projects - the list (technically) of projects that we've been notified we want searches of.
		 */
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
		},

		/**
		 * A function that allows us to load additional results for a single project. Adds the normal animations and extra data that we want.
		 *
		 * @param {Int|String} groupId - the ID of the project's group
		 * @param {Int|String} projectId - the ID of the project we want to fetch more results from
		 */
		async loadMore(groupId, projectId) {
			// A small animation to show the user we're fetching their additional results
			this.$set(this.projectsQueried[projectId], 'loading', true);

			// Bump the page we're searching for
			this.$set(this.projectsQueried[projectId], 'page', this.projectsQueried[projectId].page + 1);

			try {
				const moreResults = await axios({
					method: 'get',
					headers: {
						'Private-Token': this.conn.token
					},
					url: `${this.conn.domain}/api/v4/projects/${projectId}/search?scope=blobs&per_page=${this.pageSize}&page=${
						this.projectsQueried[projectId].page
					}&search=${encodeURIComponent(this.searchQuery)}`
				});

				if (moreResults.data.length < 1) {
					// Who knows? Maybe it had exactly results perfectly divisible by our page size.
					this.$set(this.projectsQueried[projectId], 'done', true);
					this.$set(this.projectsQueried[projectId], 'hasMore', false);
				} else {
					// Combine these results with the previous
					this.$set(this.results[groupId], projectId, [...this.results[groupId][projectId], ...moreResults.data]);

					// Append a dynamic link to this in order to be able to just open it in a new tab
					const { webUrl } = this.getProjectByIds(projectId);
					for (const result of this.results[groupId][projectId]) {
						result.url = `${webUrl}/-/blob/${result.ref}/${result.path}`;

						// Find out file extensions for syntax highlighting later on
						const extIndex = result.filename.lastIndexOf('.');

						if (extIndex > 0) {
							result.ext = result.filename.substr(extIndex + 1);
						} else {
							result.ext = 'generic';
						}
					}

					if (moreResults.data.length < this.pageSize) {
						// Stop showing the load more button if there aren't more pages to fetch
						this.$set(this.projectsQueried[projectId], 'hasMore', false);
					}
				}
			} catch (e) {
				// Set the stage to show them that an error occurred during fetching
				this.$set(this.projectsQueried[projectId], 'error', e);
				this.$set(this.projectsQueried[projectId], 'done', true);

				logger.error({ projectId, query: this.searchQuery, error: e }, 'Failed to get additional results for project');
			}

			// Turn off the loading animation
			this.$set(this.projectsQueried[projectId], 'loading', false);
		}
	},
	watch: {
		/**
		 * Every time we get a new query, we want to re-execute the entire thing
		 */
		'$route.query.search': {
			immediate: true,
			handler() {
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
		/**
		 * Every time our list of searchable projects changes we want to see if a search execution is necessary
		 */
		projects: {
			immediate: true,
			handler(newVal) {
				// We do NOT want to run any searches if this is simply removing some projects from the list
				const needs = this.getDiffNeeds(newVal);

				// Re-execute the search every time the list of filtered projects changes
				this.executeSearch(needs);
			}
		},
		/**
		 * If the user clicked on expand/collapse all, we use this to find all expansion items in the results and update their state
		 *
		 * @param {Boolean} newVal - the updated state; `true` for expand, `false` for collapse
		 */
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
					for (const childItem of expansionItem.$children[1].$children[1].$children) {
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
