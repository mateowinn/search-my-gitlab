<template>
	<q-list separator bordered class="rounded-borders" ref="parentList">
		<!-- Woo-hoo! We've got results to show! -->
		<transition name="fade" v-for="(group, groupId) in projectsToShow" :key="'group-results-' + groupId">
			<template v-if="group && Object.keys(group).length">
				<!-- If the user has marked this group for hiding, then we show this Undo invitation message for 10 seconds before deleting -->
				<RestoreCard v-if="groupsHidden.indexOf(+groupId) !== -1" type="group" :restore-fn="restoreResults.bind(null, groupId)" />

				<!-- Otherwise, we just have an expansion list of the results -->
				<q-expansion-item v-else>
					<template v-slot:header>
						<!-- Group picture -->
						<q-item-section avatar>
							<Avatar :entity="getGroupById(groupId)" />
						</q-item-section>

						<q-item-section>
							{{ getGroupById(groupId).name }}
						</q-item-section>

						<q-space />

						<!-- Allows the user to hide/remove this result from the list -->
						<q-btn icon="delete" color="grey-7" size="sm" flat style="vertical-align: middle;" @click.stop.prevent="hideResults(groupId)">
							<q-tooltip>
								Remove group from search results
							</q-tooltip>
						</q-btn>
					</template>

					<q-separator />

					<!-- Create an expandansion item for every project inside of every group expansion item -->
					<q-list class="expansion-inset">
						<transition name="fade" v-for="(projectResults, projectId) in group" :key="'project-results' + projectId">
							<template v-if="projectResults && projectResults.length">
								<!-- If the user has marked this project for hiding, then we show this Undo invitation message for 10 seconds before deleting -->
								<RestoreCard
									v-if="projectsHidden.indexOf(+projectId) !== -1"
									type="project"
									:restore-fn="restoreResults.bind(null, groupId, projectId)"
								/>

								<!-- Otherwise, we just have an expansion list of the results -->
								<q-expansion-item v-else>
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

										<q-space />

										<!-- Allows the user to hide/remove this project and its results from the list -->
										<q-btn
											icon="delete"
											color="grey-7"
											size="sm"
											flat
											style="vertical-align: middle;"
											@click.stop.prevent="hideResults(groupId, projectId)"
										>
											<q-tooltip>
												Remove project from search results
											</q-tooltip>
										</q-btn>
									</template>

									<!-- Loop through the children (projects) and show them all -->
									<q-list class="expansion-inset">
										<transition
											name="fade"
											v-for="(searchResult, index) of projectResults"
											:key="`result-${projectId}-${searchResult.index}`"
										>
											<SearchResult
												v-if="searchResult"
												:id="`result-${projectId}-${searchResult.index}`"
												:result="searchResult"
												:result-index="index"
												:search-query="searchQuery"
												:expand-all="expandAll"
												:group-id="groupId"
												:hide-result="hideResults"
												:restore-result="restoreResults"
											/>
										</transition>
									</q-list>

									<!-- Show them a load more button if we think there might be more -->
									<q-btn
										v-if="
											projectsQueried[projectId].hasMore &&
												!projectsQueried[projectId].loading &&
												!projectsQueried[projectId].error
										"
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
										<span v-else class="text-subtitle1"
											>Uhh, never mind...looks like that was actually the last of it. Carry on!</span
										>
									</div>

									<q-separator />
								</q-expansion-item>
							</template>
						</transition>
					</q-list>
				</q-expansion-item>
			</template>
		</transition>
	</q-list>
</template>

<script>
import SearchResult from './SearchResult';
import Avatar from 'components/shared/Avatar';
import RestoreCard from 'components/shared/RestoreCard';

export default {
	name: 'SearchResultList',
	props: {
		groups: {
			type: Array,
			default: () => []
		},
		projectsToShow: {
			type: Object,
			default: () => ({})
		},
		projectsQueried: {
			type: Object,
			default: () => ({})
		},
		results: {
			type: Object,
			default: () => ({})
		},
		getProjectByIds: {
			type: Function,
			default: () => {
				// Nothing, I guess
			}
		},
		searchQuery: {
			type: String,
			default: ''
		},
		expandAll: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			projectsHidden: [],
			groupsHidden: []
		};
	},
	methods: {
		/**
		 * A convenience for grabbing ALL data of a group
		 *
		 * @param {Int|String} groupId - the ID of the group whose data you want
		 */
		getGroupById(groupId) {
			return this.groups.find((group) => group.id === +groupId);
		},

		/**
		 * Marks as hidden the entry/project/group indicated in its parameters.
		 * Is a kind of overloaded function - if passed only `groupId`, then it hides a group; if passed `groupId` and `projectId`, then it hides a project; if passed all 3 parameters, then it hides a single search result entry.
		 *
		 * @param {Int|String} groupId - the ID of the group in which we want to hide something
		 * @param {Int|String} projectId - (optional) the ID of the project in which we want to hide something
		 * @param {Int|String} resultIdx - (optional) the index (in the project results array) of the entry that we want to hide
		 */
		hideResults(groupId, projectId, resultIdx) {
			console.log('hiding', groupId, projectId, resultIdx);
			const group = this.results[+groupId];
			const project = group[+projectId];

			if (!project) {
				// No project ID passed, hide the group!
				this.groupsHidden.push(+groupId); // We have to track this in a separate array group doesn't end up in projectToShow

				window.setTimeout(() => {
					if (this.groupsHidden.indexOf(+groupId) !== -1) {
						// Grace period is past - just go ahead and delete the whole group from the results
						// Since `results` actually comes from the parent, we should send this operation to the parent
						this.$emit('deleteResultGroup', +groupId);
					}
				}, 10000);
			} else {
				const result = project[+resultIdx];

				if (!result) {
					// No legit result index passed, hide the project!
					this.projectsHidden.push(+projectId); // We have to track this in a separate array because project is an array

					window.setTimeout(() => {
						if (this.projectsHidden.indexOf(+projectId) !== -1) {
							// Grace period is past - just go ahead and delete the whole project from the results
							this.$delete(group, +projectId);
						}
					}, 10000);
				} else {
					// All right, just a single result hidden
					this.$set(result, 'hidden', true);

					window.setTimeout(() => {
						if (result.hidden) {
							// Grace period is past - just go ahead and delete it from the results
							this.$delete(project, +resultIdx);
						}
					}, 5000);
				}
			}
		},

		/**
		 * Marks as no longer hidden the entry/project/group indicated in its parameters.
		 * Is a kind of overloaded function - if passed only `groupId`, then it restores a group; if passed `groupId` and `projectId`, then it restores a project; if passed all 3 parameters, then it restores a single search result entry.
		 *
		 * @param {Int|String} groupId - the ID of the group in which we want to restore something
		 * @param {Int|String} projectId - (optional) the ID of the project in which we want to restore something
		 * @param {Int|String} resultIdx - (optional) the index (in the project results array) of the entry that we want to restore
		 */
		restoreResults(groupId, projectId, resultIdx) {
			const group = this.results[+groupId];
			const project = group[+projectId];

			if (!project) {
				// No project ID passed, they must want to restore the group
				const groupIdx = this.groupsHidden.indexOf(+groupId);

				if (groupIdx > -1) {
					this.groupsHidden.splice(groupIdx, 1);
				}
			} else {
				const result = project[+resultIdx];

				if (!result) {
					// No legit result index passed, they must want to restore the project
					const projectIdx = this.projectsHidden.indexOf(+projectId);

					if (projectIdx > -1) {
						this.projectsHidden.splice(projectIdx, 1);
					}
				} else {
					// All right, just a single result to restore
					this.$set(result, 'hidden', false);
				}
			}
		}
	},
	watch: {
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
		SearchResult,
		Avatar,
		RestoreCard
	}
};
</script>

<style lang="scss">
.expansion-inset {
	padding-left: 12px;

	&__name {
		flex-direction: row;
		justify-content: flex-start;
		align-content: center;
	}
}

// Just for Vue transitions
.fade-leave-active {
	transition: opacity 0.5s;
}
.fade-leave-to {
	opacity: 0;
}
</style>
