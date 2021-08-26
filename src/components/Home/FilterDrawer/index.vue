<template>
	<q-drawer
		:value="drawerOpen"
		@click.native="drawerClick"
		no-swipe-open
		no-swipe-close
		side="left"
		persistent
		bordered
		overlay
		content-class="bg-white"
		class="bg-white"
	>
		<!-- All of the sidebar links -->
		<q-scroll-area class="fit">
			<q-card flat square class="text-white bg-primary">
				<!-- The title section -->
				<q-card-section class="row items-center">
					<div class="text-h6">Filters</div>

					<!-- Our toggle for showing archived projects or not -->
					<q-toggle color="secondary" :value="showArchived" label="Show Archived" @input="toggleArchives" />

					<q-space />

					<!-- X icon for closing the slide-out -->
					<q-btn @click.prevent.stop="toggleDrawer" class="icon-close" icon="close" flat round dense />
				</q-card-section>
			</q-card>

			<!-- One line at the top to show whether we're searching ALL projects -->
			<q-item>
				<q-item-section side>
					<q-checkbox :value="!someSelected" v-on:click.native="clearFilters" />
				</q-item-section>

				<q-item-section avatar>
					<Avatar :entity="{ name: 'All', avatarUrl: '/img/all-checked.png' }" />
				</q-item-section>

				<q-item-section>
					All Projects
				</q-item-section>
			</q-item>

			<q-list v-for="group of drawerFilters" :key="'group' + group.id">
				<!-- We want an expansion item for every group, which will contain its own projects -->
				<q-separator />
				<q-expansion-item v-if="group.children" tag="label" expand-separator :content-inset-level="0.5">
					<template v-slot:header>
						<!-- Checkbox -->
						<q-item-section side>
							<q-checkbox toggle-indeterminate v-model="group.checked" v-on:click.native="toggleFilter('groups', group.id)" />
						</q-item-section>

						<q-item-section avatar>
							<Avatar :entity="{ avatarUrl: group.avatarUrl, name: group.label }" />
						</q-item-section>

						<q-item-section>
							{{ group.label }}
						</q-item-section>
					</template>

					<!-- Loop through the children (projects) and show them all -->
					<q-item v-for="project of group.children" :key="'project' + project.id">
						<!-- Checkbox -->
						<q-item-section side>
							<q-checkbox v-model="project.checked" v-on:click.native="toggleFilter('projects', project.id)" />
						</q-item-section>

						<q-item-section avatar>
							<Avatar :entity="{ avatarUrl: project.avatarUrl, name: project.label }" />
						</q-item-section>

						<q-item-section>
							{{ project.label }}
						</q-item-section>
					</q-item>
				</q-expansion-item>
			</q-list>
		</q-scroll-area>
	</q-drawer>
</template>

<script>
import Avatar from 'components/shared/Avatar/index';

export default {
	props: {
		drawerOpen: {
			type: Boolean,
			default: false
		},
		drawerFilters: {
			type: Array,
			default: () => []
		},
		toggleDrawer: {
			type: Function,
			default: () => {
				/* Nothing, I guess */
			}
		},
		toggleFilter: {
			type: Function,
			default: () => {
				/* Nothing, I guess */
			}
		},
		clearFilters: {
			type: Function,
			default: () => {
				/* Nothing, I guess */
			}
		},
		showArchived: {
			type: Boolean,
			default: false
		},
		toggleArchives: {
			type: Function,
			default: () => {
				/* Nothing, I guess */
			}
		}
	},
	computed: {
		someSelected() {
			return this.drawerFilters.some((group) => {
				if (group.checked) {
					return true;
				} else if (group.children) {
					return group.children.some((project) => {
						return project.checked;
					});
				} else {
					return false;
				}
			});
		}
	},
	methods: {
		drawerClick(e) {
			e.preventDefault();
			e.stopPropagation();

			if (e.target && e.target.className && e.target.className.indexOf('q-drawer__backdrop') > -1) {
				// If they clicked on the backdrop, please just close it. Don't force the person to click the "close" button.
				this.toggleDrawer();
			}
		}
	},
	components: {
		Avatar
	}
};
</script>

<style lang="scss">
.q-drawer__backdrop {
	@media (min-width: $breakpoint-md-min) {
		display: none !important;
	}
}
</style>
