<template>
	<!-- A pop-up dialog we can use for telling the user what happened in event of error -->
	<q-dialog :value="!!error" @hide="hide">
		<q-card>
			<q-card-section>
				<div class="text-h6">Well, this is awkward.</div>
			</q-card-section>

			<q-card-section v-html="error" class="q-py-none"></q-card-section>

			<q-card-actions align="right">
				<q-btn v-if="action" flat :label="actionLabel" color="primary" @click="action" />
				<q-btn v-else flat :label="actionLabel" color="primary" v-close-popup />
			</q-card-actions>
		</q-card>
	</q-dialog>
</template>

<script>
export default {
	name: 'ErrorDialog',
	props: {
		error: {
			type: String,
			default: ''
		},
		hide: {
			type: Function,
			default: () => {
				/* Nothing, I guess */
			}
		},
		action: {
			type: Function,
			default: undefined
		},
		actionLabel: {
			type: String,
			default: 'Retry'
		}
	}
};
</script>
