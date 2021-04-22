<template>
	<q-page>
		<q-card square style="min-height: inherit;">
			<!-- Tab dividers -->
			<q-tabs
				v-model="tabIndex"
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
					:key="'tab' + conn.index"
					:name="conn.index"
					:icon="conn.icon"
					:label="conn.domain && conn.domain.split('//')[1]"
					class="shadow-3"
				/>
			</q-tabs>

			<!-- The actual content under each tab -->
			<q-tab-panels v-model="tabIndex" style="overflow: hidden;">
				<q-tab-panel
					v-for="conn of connections"
					:key="'panel' + conn.index"
					:name="conn.index"
					class="flex flex-center"
					style="overflow: hidden;"
				>
					<TabPanel
						:conn="conn"
						:projects="
							conn.index === tabIndex ? filteredProjects : {}
						"
						:toggle-drawer="toggleDrawer"
					/>
				</q-tab-panel>
			</q-tab-panels>
		</q-card>

		<!-- The drawer with its filters -->
		<FilterDrawer
			:drawer-open="filterDrawerOpen"
			:drawer-filters="drawerFilters"
			:toggle-drawer="toggleDrawer"
			:toggle-filter="toggleFilter"
			:clear-filters="clearAllFilters"
		/>
	</q-page>
</template>

<script>
import TabPanel from 'src/components/Home/TabPanel/index';
import FilterDrawer from 'src/components/Home/FilterDrawer/index';

const arrayProto = Object.prototype.toString.call([]);

export default {
	name: 'Home',
	data() {
		return {
			filterDrawerOpen: false
		};
	},
	computed: {
		/**
		 * Simply calculates which tab (connection) we should show based on the URL query param
		 *
		 * @returns {Int|String} - the index or name of the tab we should focus on
		 */
		tabIndex() {
			const domain = this.$route.query.domain;

			if (+domain === +domain) {
				return +domain;
			} else {
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

		currentGroups() {
			let groups = [];

			// If we have legit connection details, go and fetch all available groups from that connection
			if (this.currentConn && this.currentConn.index !== undefined) {
				groups = this.$store.Group.groups(this.currentConn) || [];
			}

			return groups;
		},

		currentProjects() {
			const projects = {};

			// If we have our groups, go ahead and grab all of the projects accessible to us through those groups
			for (const group of this.currentGroups) {
				projects[group.id] = this.$store.Project.projects(
					this.currentConn,
					group
				);
			}

			return projects;
		},

		filters() {
			const filters = {};

			// All of our filters are synced to the URL through query parameters
			if (this.$route.query.groups) {
				// Group IDs
				filters.groups = this.$route.query.groups
					.split(',')
					.map((groupId) => +groupId); // Just to turn the string numbers into actual Ints
			}

			if (this.$route.query.projects) {
				// Community IDs
				filters.projects = this.$route.query.projects
					.split(',')
					.map((projectId) => +projectId); // Just to turn the string numbers into actual Ints
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
			// We don't want to keep computing all of this until we've actually tried fetching all groups
			if (
				this.currentGroups.length !==
					Object.keys(this.currentProjects).length ||
				Object.values(this.currentProjects).some((arr) => {
					return arr === undefined;
				})
			) {
				console.log('Returning empty filtered projects');
				return {};
			}

			if (this.noFilters) {
				return this.currentProjects;
			} else {
				const filteredProjects = {};

				console.log('projects in filtered', this.currentProjects);

				// Go through every project in every group to determine whether it should be included in the searches
				Object.keys(this.currentProjects).forEach((groupId) => {
					// Skip the wait if this whole group has been requested
					if (
						this.filters.groups &&
						this.filters.groups.includes(+groupId)
					) {
						filteredProjects[groupId] = [
							...this.currentProjects[groupId]
						];
					} else if (this.filters.projects) {
						const eligibleProjects = this.currentProjects[
							groupId
						].filter((project) => {
							// Include this if it has been named specifically in the filters
							if (this.filters.projects.includes(project.id)) {
								return true;
							}

							// Guess it didn't make the cut
							return false;
						});

						console.log('eligible projects', eligibleProjects);
						// If any projects in this group should be searched, then throw it in along with the group reference
						if (eligibleProjects.length > 0) {
							filteredProjects[groupId] = eligibleProjects;
						}
					}
				});

				return filteredProjects;
			}
		},

		drawerFilters() {
			const drawerFilters = [];

			// We don't want to keep computing all of this until we've actually tried fetching all groups
			if (
				this.currentGroups.length !==
					Object.keys(this.currentProjects).length ||
				Object.values(this.currentProjects).some((arr) => {
					return arr === undefined;
				})
			) {
				return drawerFilters;
			}

			console.log('defining filters, current groups', this.currentGroups);
			// Grab all categories as filter options
			for (const group of this.currentGroups) {
				const entry = {
					id: group.id,
					type: 'groups',
					label: group.name
				};

				// Don't forget to include all of this group's projects!
				const groupProjects = this.currentProjects[group.id];

				// Now insert those as children of the group link
				if (groupProjects && groupProjects.length) {
					entry.children = groupProjects.map((project) => {
						return {
							id: project.id,
							type: 'projects',
							label: project.name,
							checked: !!(
								this.noFilters || // We want to show (only visually) everything as checked if the user has not specified any search filters
								(this.filters.projects &&
									this.filters.projects.indexOf(project.id) >
										-1)
							)
						};
					});
				}

				// Compute how we want to show the group checkbox - checked, unchecked, or partially (because a group child is checked)
				if (
					this.noFilters || // We want to show (only visually) everything as checked if the user has not specified any search filters
					(this.filters.groups &&
						this.filters.groups.indexOf(group.id) > -1)
				) {
					entry.checked = true;
				} else if (
					entry.children &&
					entry.children.length &&
					entry.children.find((project) => project.checked === true)
				) {
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

				// Also, don't forget to keep the domain index!
				filters.domain = this.$route.query.domain;

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
					domain: this.$route.query.domain // Clear everything BUT the current domain index
				}
			});
		}
	},
	watch: {
		/**
		 * When the user switches between domains/connections, we don't want to carry any other filters or search queries in the URL
		 */
		'$route.query.domain': {
			handler() {
				this.clearAllFilters();
			}
		}
	},
	components: {
		TabPanel,
		FilterDrawer
	},

	/**
	 * Gets our query param (and therefore our focused tab) started on the right foot
	 */
	created() {
		// Do we already have a domain specified to show?
		const queryDomain = this.$route.query.domain;
		const isNum = +queryDomain === +queryDomain;

		if (
			(!isNum && queryDomain !== 'add') ||
			(isNum && this.connections.length < 2)
		) {
			// Looks like we don't, so, let's set one!
			const newRoute = {
				...this.$route,
				query: {}
			};

			if (this.connections.length > 1) {
				// The user already has connection info setup but didn't specify which one to look at yet
				newRoute.query.domain = 0;
			} else {
				// New user - just take them straight to adding a connection
				newRoute.query.domain = 'add';
			}

			this.$router.replace(newRoute);
		}
	}
};
</script>
