<template>
	<div class="search-stats">
		<div>
			<!-- Actual stats -->
			<span class="text-grey-6"
				>{{ resultsCount }}{{ someHaveMore ? '+' : '' }} result{{ resultsCount === 1 ? '' : 's' }} found in
				{{ projectsWithResults }} project{{ projectsWithResults === 1 ? '' : 's' }}</span
			>

			<!-- Invitation to copy this search for sharing -->
			<a id="search-copy-link" href="#" @click.prevent.stop="linkModalOpen = true">
				<span>Share This Search</span>
				<q-icon name="content_copy" class="q-pl-xs" />
			</a>

			<!-- The modal where you can actually copy the link to your clipboard -->
			<q-dialog v-model="linkModalOpen">
				<q-card class="search-copy-card">
					<q-card-section>
						<q-input
							filled
							readonly
							:value="searchLink"
							type="text"
							hint="Note that, obviously, this link will not work if the person you share it with does not have access to the same repositories as you do"
						>
							<template v-slot:append>
								<q-btn id="search-copy-btn" flat icon="assignment" :data-clipboard-text="searchLink" @click="copy" />
							</template>
						</q-input>
					</q-card-section>
				</q-card>
			</q-dialog>
		</div>

		<!-- Global function to collapse or expand all results -->
		<a href="#" @click.prevent.stop="expandAllLocal = !expandAllLocal">{{ expandAllLocal ? 'Collapse All' : 'Expand All' }}</a>
	</div>
</template>

<script>
export default {
	name: 'SearchStats',
	props: {
		resultsCount: {
			type: Number,
			default: 0
		},
		someHaveMore: {
			type: Boolean,
			default: false
		},
		projectsWithResults: {
			type: Number,
			default: 0
		},
		expandAll: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			linkModalOpen: false,
			searchLink: ''
		};
	},
	// Allows us to use v-model in the parent and $emit in this component with no further wiring!
	model: {
		prop: 'expandAll',
		event: 'changeExpandAll'
	},
	computed: {
		expandAllLocal: {
			get() {
				return this.expandAll;
			},
			set(newVal) {
				this.$emit('changeExpandAll', newVal);
			}
		}
	},
	methods: {
		copy() {
			// Interestingly, with the "data-clipboard-text" attribute, we don't need to do anything directly with the API

			// Create a success notification
			this.$q.notify({
				color: 'positive',
				message: 'Link has been copied to your clipboard',
				position: 'top-right',
				actions: [
					{
						label: 'Dismiss',
						color: 'white'
					}
				]
			});
		}
	},
	watch: {
		linkModalOpen(newVal) {
			if (newVal === true) {
				// Every time the user opens the dialog to copy the link, we want to refresh the link to make sure it's up-to-date
				this.searchLink = window.location.href;

				// We also initialize clipboardjs onto the element that has the text to copy and it handles the rest!
				this.clipboard = new window.ClipboardJS('#search-copy-btn');
			} else if (this.clipboard) {
				// Don't want this ref hanging around in memory if the component is gone!
				this.clipboard.destroy();
			}
		}
	}
};
</script>

<style lang="scss">
.search-stats {
	padding: 0px 5px;
	display: flex;
	justify-content: space-between;

	#search-copy-link {
		display: block;
		padding-left: 0;
		text-decoration: none;

		@media (min-width: $breakpoint-sm-min) {
			display: inline;
			padding-left: 16px;
		}
	}
}

.search-copy-card {
	width: 600px !important;
	max-width: 95vw;
	padding-bottom: 16px;
}
</style>
