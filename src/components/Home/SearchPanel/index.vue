<template>
	<!-- Show them the form for creating a new connection if this is the Add tab -->
	<AddConnection v-if="conn.icon" :has-none="conn.hasNone" />

	<!-- Otherwise, show them the full glory of the search tab! -->
	<div v-else class="q-gutter-md" style="width: 100vw;">
		<!-- Our search bar and link to open filters -->
		<SearchBar
			:toggle-drawer="toggleDrawer"
			:search-query="searchQuery"
			:search-branch="searchBranch"
			:initiate-search="initiateSearch"
			@queryChange="(newVal) => (searchQuery = newVal)"
			@branchChange="(newVal) => (searchBranch = newVal)"
		/>

		<!-- Here we show the user if we failed to fetch results from any of the projects -->
		<SearchErrors :loading="loading" :projects-queried="projectsQueried" :get-project-by-ids="getProjectByIds" />

		<!-- Search metadata, i.e. how many results we found -->
		<SearchStats
			v-if="projectsToShow && Object.keys(projectsToShow).length > 0 && !projectsToShow.none"
			:results-count="resultsCount"
			:some-have-more="someHaveMore"
			:projects-with-results="projectsWithResults"
			:expand-all="expandAll"
		/>

		<!-- Loading bar and messages for *searches* -->
		<SearchLoader v-if="loading" :projects-queried="projectsQueried" :query-time="queryTime" />

		<!-- Show a polite message if we actually have no results to show them -->
		<div v-if="!loading && searchQuery && projectsToShow && projectsToShow.none" class="text-h6 text-center q-pt-md">
			Well, poop. We've got nothing that matches that criteria.
		</div>

		<SearchResultList
			v-if="!loading && projectsToShow && Object.keys(projectsToShow).length > 0 && !projectsToShow.none"
			:groups="groups"
			:projects-to-show="projectsToShow"
			:projects-queried="projectsQueried"
			:results="results"
			:get-project-by-ids="getProjectByIds"
			:search-query="searchQuery"
			:expand-all="expandAll"
			@deleteResultGroup="(groupId) => $delete(results, groupId)"
		/>
	</div>
</template>

<script>
import axios from 'axios';
import logger from 'utilities/logger';
import AddConnection from './AddConnection/index';
import SearchBar from './SearchBar';
import SearchErrors from './SearchErrors';
import SearchStats from './SearchStats';
import SearchLoader from './SearchLoader';
import SearchResultList from './SearchResultList';

export default {
	name: 'SearchPanel',
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
			searchBranch: '',
			confirmQuery: false,
			pageSize: 20,
			results: {},
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
		}
	},
	methods: {
		/**
		 * A convenience for grabbing ALL data of a project
		 *
		 * @param {Int|String} projectId - the ID of the project whose data you want
		 */
		getProjectByIds(projectId) {
			return this.$store.Project.project(this.conn.index, projectId);
		},

		/**
		 * Simply modifies our URL search query param, which triggers a search
		 */
		initiateSearch() {
			// Update our URL, which will trigger a search
			const routeQuery = {
				...this.$route.query
			};
			routeQuery.search = this.searchQuery;

			if (this.searchBranch === '') {
				// If they've reverted to clearing the branch name, then we revert to simply clearing this from the URL so that we search by repo default branch
				delete routeQuery.branch;
			} else {
				routeQuery.branch = this.searchBranch;
			}

			this.$router.push({ path: this.$route.path, query: routeQuery });
		},

		/**
		 * The function that actually executes the search. Is notified whenever a new query and/or filter changes are submitted and takes it away!
		 *
		 * @param {Object} projectsToSearch - the list (technically object) of projects, within their group divisions, that we should fetch search results for
		 */
		async executeSearch(projectsToSearch) {
			// We only want to actually execute the query if we're looking at the right tab and we have a real search
			if (
				this.$route.query.search &&
				this.conn.domain &&
				this.conn.domain.includes(this.$route.params.domain) &&
				Object.keys(projectsToSearch).length > 0
			) {
				this.queryTime = 0;
				this.loading = true; // Show the loading animation

				logger.info(
					{ query: this.searchQuery, branch: this.searchBranch, connIndex: this.conn.index, projects: projectsToSearch },
					'Executing search'
				);

				// Now comes the fun part....cycling through every selected project in every group and aggregating the results
				try {
					const allSearchPromises = [];

					for (const groupId of Object.keys(projectsToSearch)) {
						for (const project of projectsToSearch[groupId]) {
							let searchUrl = `${this.conn.domain}/api/v4/projects/${project.id}/search?scope=blobs&per_page=${
								this.pageSize
							}&search=${encodeURIComponent(this.searchQuery)}`;

							if (this.searchBranch !== '') {
								// In the event that the user actually specifies a particular branch they want to search throughout the repos
								searchUrl += `&ref=${this.searchBranch}`;
							}

							// Fire off a search for every project in every group that the user has specified
							allSearchPromises.push(
								axios({
									method: 'get',
									headers: {
										'Private-Token': this.conn.token
									},
									url: searchUrl
								})
									.then((response) => {
										// I don't really want this to pop up in the list if it didn't actually return anything
										if (response.data && response.data.length > 0) {
											this.$set(this.results, groupId, this.results[groupId] || {});
											this.$set(this.results[groupId], project.id, response.data);

											// Append a dynamic link to this in order to be able to just open it in a new tab
											const { webUrl } = this.getProjectByIds(project.id);
											for (let i = 0; i < this.results[groupId][project.id].length; i++) {
												const result = this.results[groupId][project.id][i];

												// Yes, this is the Gitlab convention for accessing a single file in the branch
												result.url = `${webUrl}/-/blob/${result.ref}/${result.path}`;

												// Find out file extensions for syntax highlighting later on
												const extIndex = result.filename.lastIndexOf('.');

												if (extIndex > 0) {
													result.ext = result.filename.substr(extIndex + 1);
												} else {
													result.ext = 'generic';
												}

												// Also tag on the original index of each of these so that we have a unique tracking ID
												result.index = i;
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
												branch: this.searchBranch,
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
					logger.error({ error: e, query: this.searchQuery, branch: this.searchBranch }, 'Error executing searches');
				}

				// Turn off the loading animation
				this.loading = false;
			}
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
				let searchUrl = `${this.conn.domain}/api/v4/projects/${projectId}/search?scope=blobs&per_page=${this.pageSize}&page=${
					this.projectsQueried[projectId].page
				}&search=${encodeURIComponent(this.searchQuery)}`;

				if (this.searchBranch !== '') {
					// In the event that the user actually specifies a particular branch they want to search throughout the repos
					searchUrl += `&ref=${this.searchBranch}`;
				}

				const moreResults = await axios({
					method: 'get',
					headers: {
						'Private-Token': this.conn.token
					},
					url: searchUrl
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
					for (let i = 0; i < this.results[groupId][projectId].length; i++) {
						const result = this.results[groupId][projectId][i];

						// Yes, this is the Gitlab convention for accessing a single file in the branch
						result.url = `${webUrl}/-/blob/${result.ref}/${result.path}`;

						// Find out file extensions for syntax highlighting later on
						const extIndex = result.filename.lastIndexOf('.');

						if (extIndex > 0) {
							result.ext = result.filename.substr(extIndex + 1);
						} else {
							result.ext = 'generic';
						}

						// Also tag on the original index of each of these so that we have a unique tracking ID
						result.index = i;
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

				logger.error(
					{ projectId, query: this.searchQuery, branch: this.searchBranch, error: e },
					'Failed to get additional results for project'
				);
			}

			// Turn off the loading animation
			this.$set(this.projectsQueried[projectId], 'loading', false);
		},

		/**
		 * Every time we get a new query, we want to re-execute the entire thing
		 */
		resetSearch() {
			// Reset a bunch of figures related to our results
			this.$set(this, 'results', {});
			this.$set(this, 'projectsQueried', {});
			this.$set(this, 'projectsWithResults', 0);
			this.$set(this, 'resultsCount', 0);
			this.$set(this, 'someHaveMore', false);
			this.searchQuery = this.$route.query.search;

			// Keep tabs, as well, on what branch we ought to be searching
			if (this.$route.query.branch) {
				this.searchBranch = this.$route.query.branch;
			} else {
				this.searchBranch = '';
			}

			// Re-execute the search every time the search changes
			this.executeSearch(this.projects);
		}
	},
	watch: {
		'$route.query.search': {
			immediate: true,
			handler() {
				this.resetSearch();
			}
		},
		'$route.query.branch'() {
			this.resetSearch();
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
		}
	},
	components: {
		AddConnection,
		SearchBar,
		SearchErrors,
		SearchStats,
		SearchLoader,
		SearchResultList
	}
};
</script>
