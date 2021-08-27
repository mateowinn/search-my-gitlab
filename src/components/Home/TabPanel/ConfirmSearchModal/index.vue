<template>
	<q-dialog v-model="confirm" persistent>
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
</template>

<script>
export default {
	name: 'ConfirmSearchModal',
	props: {
		confirmQuery: {
			type: Boolean,
			default: false
		},
		searchQuery: {
			type: String,
			default: ''
		},
		initiateSearch: {
			type: Function,
			default: () => {
				// Nothing, I guess
			}
		}
	},
	// Allows us to use v-model in the parent and $emit in this component with no further wiring!
	model: {
		prop: 'confirmQuery',
		event: 'confirmChange'
	},
	computed: {
		confirm: {
			get() {
				return this.confirmQuery;
			},
			set(newVal) {
				this.$emit('confirmChange', newVal);
			}
		}
	}
};
</script>
