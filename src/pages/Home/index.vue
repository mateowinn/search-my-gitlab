<template>
	<q-page>
		<q-card square style="min-height: inherit; padding-bottom: 20px">
			<!-- Tab dividers -->
			<q-tabs
				:value="tabIndex"
				@input="navigateToDomain"
				dense
				no-caps
				inline-label
				outside-arrows
				indicator-color="transparent"
				class="bg-secondary text-white shadow-2"
				active-color="black"
				active-bg-color="white"
				align="left"
				breakpoint="0"
			>
				<!-- One tab for each connection, plus the option to add. If an `icon` is present, then we know it's the add tab. -->
				<q-tab
					v-for="conn of connections"
					:key="'tab-' + conn.index"
					:name="conn.index"
					:icon="conn.icon"
					:label="conn.domain && conn.domain.split('//')[1]"
					class="shadow-1"
				/>
			</q-tabs>

			<!-- The actual content under each tab -->
			<q-tab-panels v-model="tabIndex" style="overflow: hidden">
				<q-tab-panel v-for="conn of connections" :key="'panel-' + conn.index" :name="conn.index" class="flex flex-center tab-panel">
					<TabPanel
						:conn="conn"
						:projects="conn.index === tabIndex ? filteredProjects : {}"
						:groups="conn.index === tabIndex ? filteredGroups : []"
						:toggle-drawer="toggleDrawer"
						:search-branch="searchBranch"
					/>
				</q-tab-panel>
			</q-tab-panels>

			<!-- Loading animation for while we're still loading project info -->
			<q-inner-loading :showing="loadingProjects">
				<q-spinner-gears size="65px" color="primary" />
				<div>Loading Project Metadata...</div>
			</q-inner-loading>
		</q-card>

		<!-- The drawer with its filters -->
		<FilterDrawer
			:drawer-open="filterDrawerOpen"
			:drawer-filters="drawerFilters"
			:toggle-drawer="toggleDrawer"
			:toggle-filter="toggleFilter"
			:clear-filters="clearAllFilters"
			:show-archived="showArchived"
			:toggle-archives="toggleArchives"
			:search-branch="searchBranch"
			:update-search-branch="updateSearchBranch"
		/>

		<!-- A pop-up dialog we can use for telling the user what happened in event of error -->
		<ErrorDialog :error="error" :hide="() => (error = '')" :action="reloadWindow" :action-label="'Refresh'" />
	</q-page>
</template>

<script>
import TabPanel from 'src/components/Home/TabPanel/index';
import FilterDrawer from 'src/components/Home/FilterDrawer/index';
import ErrorDialog from 'src/components/shared/ErrorDialog/index';

const arrayProto = Object.prototype.toString.call([]);

export default {
	name: 'Home',
	data() {
		return {
			filterDrawerOpen: false,
			showArchived: window.localStorage.getItem('showArchived') === 'true',
			searchBranch: '',
			error: '',
			loadingProjects: false
		};
	},
	computed: {
		/**
		 * Simply calculates which tab (connection) we should show based on the URL path param
		 *
		 * @returns {Int|String} - the index or name of the tab we should focus on
		 */
		tabIndex() {
			const domain = this.$route.params.domain;
			const conn = this.connections.find((c) => c.domain && c.domain.includes(domain));

			if (conn) {
				return this.connections.indexOf(conn);
			} else {
				// Should really only be "add"
				return domain;
			}
		},

		/**
		 * Grabs our stored connections and throws in the ever-present option of adding a new one
		 *
		 * @returns {Array<Object>}
		 */
		connections() {
			const realConns = this.$store.Connection.conns;
			const allConns = [...realConns];

			// Add an empty one to show a creation option
			allConns.push({ index: 'add', icon: 'add' });
			if (allConns.length === 1) {
				// Add an indicator to show the welcome message
				allConns[0].hasNone = true;
			}

			return allConns;
		},

		currentConn() {
			return this.connections[this.tabIndex];
		},

		currentProjects() {
			let projects = [];

			// Grab all the projects we can
			if (this.currentConn && this.currentConn.index !== undefined) {
				projects = this.$store.Project.projects(this.currentConn);

				// Real quick, check for errors
				if (Object.keys(this.$store.Project.pageErrors[this.currentConn.index]).length > 0) {
					// Looks like we ran into some kind of issue getting projects
					const pageErrors = this.$store.Project.pageErrors[this.currentConn.index];
					const errors = Object.values(pageErrors);

					/* eslint-disable vue/no-side-effects-in-computed-properties */
					if (errors.includes('BAD_REQUEST')) {
						// Show them a network error message
						this.error = `We couldn't pull the data for your projects. This usually means there's a network issue. Perhaps your internet connection is spotty or you need to be on a specific network?`;
					} else {
						// Show them a generic we had problems message
						let text = `We encountered some difficulties trying to load your project info.`;
						if (projects && projects.length > 0) {
							text += ` Some of your projects won't show up here because we couldn't wrangle them out of Gitlab.`;
						}
						text += ` You can try refreshing the page if you want (that usually works).`;
						this.error = text;
					}
				}

				if (projects && projects.length > 0) {
					// Once we get some projects, only keep the particular attributes we care to have in this module to conserve memory
					return projects.map((project) => {
						return {
							id: project.id,
							name: project.name,
							avatarUrl: project.avatarUrl,
							archived: project.archived,
							groupId: project.group.id
						};
					});
				}
			}

			return projects;
		},

		searchableProjects() {
			// Filter out the archived projects, if indicated
			if (this.showArchived) {
				return this.currentProjects;
			} else {
				return this.currentProjects.filter((project) => {
					return !project.archived;
				});
			}
		},

		currentGroups() {
			const groups = [];

			// Compile group details by project namespaces
			for (const project of this.searchableProjects) {
				if (!groups.find((group) => group.id === project.groupId)) {
					// Add the details of this group if we haven't already
					const fullProject = this.$store.Project.project(this.currentConn.index, project.id);
					groups.push(fullProject.group);
				}
			}

			return groups;
		},

		groupedProjects() {
			const grouped = {};

			for (const group of this.currentGroups) {
				grouped[group.id] = this.searchableProjects.filter((project) => {
					return project.groupId === group.id;
				});
			}

			return grouped;
		},

		filters() {
			const filters = {};

			// All of our filters are synced to the URL through query parameters
			if (this.$route.query.groups) {
				// Group IDs
				filters.groups = this.$route.query.groups.split(',').map((groupId) => +groupId); // Just to turn the string numbers into actual Ints
			}

			if (this.$route.query.projects) {
				// Community IDs
				filters.projects = this.$route.query.projects.split(',').map((projectId) => +projectId); // Just to turn the string numbers into actual Ints
			}

			// Always try to keep the search query parameters
			if (this.$route.query.search) {
				filters.search = this.$route.query.search;
			}

			return filters;
		},

		/**
		 * An simple computed function to tell us whether we actually have any search filters specified
		 */
		noFilters() {
			return !this.filters.projects && !this.filters.groups;
		},

		filteredProjects() {
			if (this.noFilters) {
				return this.groupedProjects;
			} else {
				const filteredProjects = {};

				// Go through every project in every group to determine whether it should be included in the searches
				Object.keys(this.groupedProjects).forEach((groupId) => {
					// Skip the wait if this whole group has been requested
					if (this.filters.groups && this.filters.groups.includes(+groupId)) {
						filteredProjects[groupId] = [...this.groupedProjects[groupId]];
					} else if (this.filters.projects) {
						const eligibleProjects = this.groupedProjects[groupId].filter((project) => {
							// Include this if it has been named specifically in the filters
							if (this.filters.projects.includes(project.id)) {
								return true;
							}

							// Guess it didn't make the cut
							return false;
						});

						// If any projects in this group should be searched, then throw it in along with the group reference
						if (eligibleProjects.length > 0) {
							filteredProjects[groupId] = eligibleProjects;
						}
					}
				});

				return filteredProjects;
			}
		},

		filteredGroups() {
			if (this.noFilters) {
				return this.currentGroups;
			} else {
				const filteredGroups = [];

				// To keep this list and the projects list in sync, we just base this on the filtered projects
				for (const group of this.currentGroups) {
					if (this.filteredProjects[group.id] !== undefined) {
						filteredGroups.push(group);
					}
				}

				return filteredGroups;
			}
		},

		drawerFilters() {
			const drawerFilters = [];

			// Grab all categories as filter options
			for (const group of this.currentGroups) {
				const entry = {
					id: group.id,
					avatarUrl: group.avatarUrl,
					label: group.name
				};

				// Don't forget to include all of this group's projects - IF they have them!
				const groupProjects = this.groupedProjects[group.id];

				if (!groupProjects || groupProjects.length < 1) {
					// Uhh...nope. Not gonna deal with you.
					continue;
				}

				// Now insert those as children of the group link
				entry.children = groupProjects.map((project) => {
					return {
						id: project.id,
						label: project.name,
						avatarUrl: project.avatarUrl,
						checked: !!(this.filters.projects && this.filters.projects.indexOf(project.id) > -1)
					};
				});

				// Compute how we want to show the group checkbox - checked, unchecked, or partially (because a group child is checked)
				if (this.filters.groups && this.filters.groups.indexOf(group.id) > -1) {
					entry.checked = true;
				} else if (entry.children && entry.children.length && entry.children.find((project) => project.checked === true)) {
					entry.checked = null;
				} else {
					entry.checked = false;
				}

				drawerFilters.push(entry);
			}

			// Alphabetize the filters
			drawerFilters.sort(function(a, b) {
				const groupA = a.label.toUpperCase();
				const groupB = b.label.toUpperCase();
				return groupA < groupB ? -1 : groupA > groupB ? 1 : 0;
			});

			return drawerFilters;
		}
	},
	methods: {
		toggleDrawer() {
			this.filterDrawerOpen = !this.filterDrawerOpen;
		},

		toggleFilter(type, value) {
			const filters = { ...this.filters };

			// Toggle the indicated filter, first of all
			if (filters[type]) {
				// This assumes that we're only toggling *arrays* in the filters
				const idx = filters[type].indexOf(value);

				if (idx === -1) {
					// This filter value doesn't exist in our current set. Let's add it.
					filters[type].push(value);
				} else {
					// This does exist in our current set. Let's remove it.
					filters[type].splice(idx, 1);

					if (filters[type].length < 1) {
						// That was the last entry in the filter array. Remove the array altogether.
						delete filters[type];
					}
				}
			} else {
				// Perhaps this filter is the first of its kind so far
				filters[type] = [value];
			}

			// Now to update the actual router query with a reconstructed query
			if (Object.keys(filters).length < 1) {
				// No filters anymore. Just clear the whole thing
				this.clearAllFilters();
			} else {
				Object.keys(filters).forEach((filterKey) => {
					const value = filters[filterKey];

					// We need to pass along a slightly modified query object to the router to make it work
					if (Object.prototype.toString.call(value) === arrayProto) {
						// This is an array that we need to convert to a comma-delimited string
						filters[filterKey] = value.join(',');
					} // Non-array values don't need to be changed
				});

				this.$router.replace({
					...this.$router.currentRoute,
					query: filters
				});
			}

			return false;
		},
		clearAllFilters() {
			// Clear the router query
			this.$router.replace({
				...this.$router.currentRoute,
				query: {
					// Clear everything BUT the current search
					search: this.$route.query.search
				}
			});
		},
		toggleArchives(showArchived) {
			this.showArchived = showArchived;

			// Also save this to local storage so that it persists when the user returns to the site
			window.localStorage.setItem('showArchived', showArchived);
		},
		navigateToDomain(domainIdx) {
			let domain = domainIdx;
			const conn = this.connections[domainIdx];

			// Most of the time, this should be the index of one of our existing connections' domain strings
			if (conn && conn.domain.includes('//')) {
				domain = conn.domain.split('//')[1];
			}

			if (domain !== this.$route.params.domain) {
				this.$router.replace({ path: `/search/${domain}` });
			}
		},
		reloadWindow() {
			window.location.reload();
		},
		updateSearchBranch(event) {
			console.log('event', event);
			this.searchBranch = event.target.value;
		}
	},
	watch: {
		/**
		 * When the user switches between domains/connections, we don't want to carry any other filters or search queries in the URL
		 */
		'$route.params.domain': {
			handler(newDomain) {
				this.navigateToDomain(newDomain);
			}
		},

		/**
		 * Allows us to track when we're in the middle of loading project metadata so that we can show an animation
		 */
		currentProjects: {
			handler(currentVal) {
				if ((!currentVal || currentVal.length === 0) && this.tabIndex !== 'add' && !this.error) {
					// Looks like we're still loading
					this.loadingProjects = true;
				} else {
					this.loadingProjects = false;
				}
			}
		}
	},
	components: {
		TabPanel,
		FilterDrawer,
		ErrorDialog
	},

	/**
	 * Gets our query param (and therefore our focused tab) started on the right foot
	 */
	created() {
		// Do we already have a domain specified to show?
		const isNum = +this.tabIndex === +this.tabIndex;

		// if ((!isNum && this.tabIndex !== 'add') || (isNum && this.connections.length < 2)) {
		if (!isNum && this.tabIndex !== 'add') {
			// Looks like we don't, so, let's set one!
			if (this.connections.length > 1) {
				// The user already has connection info setup but didn't specify which one to look at yet
				this.navigateToDomain(0);
			} else {
				// New user - just take them straight to adding a connection
				this.navigateToDomain('add');
			}
		}
	}
};
</script>

<style lang="scss">
.q-tab {
	border-right: 1px rgba(0, 0, 0, 0.28) solid;

	&.q-tab--active,
	&:last-child {
		border-top-right-radius: 5px;
	}
	&.q-tab--active:not(:first-child) {
		border-top-left-radius: 5px;
	}
}

.tab-panel {
	overflow: hidden;
	padding: 16px 0;

	@media (min-width: $breakpoint-sm-min) {
		padding: 16px;
	}
}
</style>
