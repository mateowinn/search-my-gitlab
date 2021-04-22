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

					<q-space />

					<!-- X icon for closing the slide-out -->
					<q-btn
						@click.prevent.stop="toggleDrawer"
						class="icon-close"
						icon="close"
						flat
						round
						dense
					/>
				</q-card-section>
			</q-card>

			<q-list v-for="group of drawerFilters" :key="'group' + group.id">
				<!-- If the group link has children, we want an expansion item instead of a regular one -->
				<q-expansion-item
					v-if="group.children"
					expand-separator
					:content-inset-level="0.5"
					expand-icon-class="text-menu-side-link"
				>
					<template v-slot:header>
						<q-item-section>
							<q-checkbox
								toggle-indeterminate
								v-model="group.checked"
								:label="group.label"
								v-on:click.native="
									toggleFilter(group.type, group.id)
								"
								dark
							/>
						</q-item-section>
					</template>
					<!-- Loop through the children (projects) and show them all -->
					<q-item
						v-for="project of group.children"
						:key="'project' + project.id"
						active-class="text-menu-side-link-active bg-menu-side-link-active-background"
					>
						<!-- The label and checkbox -->
						<q-item-section>
							<q-checkbox
								v-model="project.checked"
								:label="project.label"
								v-on:click.native="
									toggleFilter(project.type, project.id)
								"
								dark
							/>
						</q-item-section>
					</q-item>
				</q-expansion-item>

				<!-- If no children, just show a top-level clickable link -->
				<q-item
					v-else
					active-class="text-menu-side-link-active bg-menu-side-link-active-background"
				>
					<!-- The label and checkbox -->
					<q-item-section>
						<q-checkbox
							v-model="group.checked"
							:label="group.label"
							v-on:click.native="
								toggleFilter(group.type, group.id)
							"
							dark
						/>
					</q-item-section>
				</q-item>
			</q-list>
		</q-scroll-area>
	</q-drawer>
</template>

<script>
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
		}
	},
	methods: {
		drawerClick(e) {
			e.preventDefault();
			e.stopPropagation();

			if (
				e.target &&
				e.target.className &&
				e.target.className.indexOf('q-drawer__backdrop') > -1
			) {
				// If they clicked on the backdrop, please just close it. Don't force the person to click the "close" button.
				this.toggleDrawer();
			}
		}
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
