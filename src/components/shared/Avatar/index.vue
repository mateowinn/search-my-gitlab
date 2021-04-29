<template>
	<q-avatar rounded :style="{ 'background-color': entity.avatarUrl ? 'white' : `#${strToColorHex(entity.name)}` }">
		<q-img v-if="entity.avatarUrl" :src="entity.avatarUrl" contain spinner-color="secondary">
			<template v-slot:error>
				<!-- If, for some reason, we couldn't load the actual Avatar, pass in a sad face -->
				<q-img src="/img/sad-face.png" contain class="absolute-full flex flex-center bg-white">
					<q-tooltip>
						Sorry, we couldn't load this image
					</q-tooltip>
				</q-img>
			</template>
		</q-img>

		<!-- Just the entity's name or initial -->
		<template v-else>{{ displayName }}</template>
	</q-avatar>
</template>

<script>
import strToColorHex from 'utilities/strToColorHex';

export default {
	name: 'Avatar',
	props: {
		// A Group or Project
		entity: {
			type: Object,
			default: () => ({})
		},
		useFullName: {
			type: Boolean,
			default: false
		}
	},
	computed: {
		/**
		 * Returns the full entity name if indicated. Otherwise, finds the first *letter* in the name and capitalizes it.
		 *
		 * @returns {String} Initial or full name
		 */
		displayName() {
			if (this.entity.avatarUrl || this.useFullName) {
				return this.entity.name;
			} else {
				return (this.entity.name.match(/\b[a-zA-Z]/) || [this.entity.name.charAt(0)])[0].toUpperCase();
			}
		}
	},
	methods: {
		strToColorHex
	}
};
</script>

<style lang="scss" scoped>
.q-avatar {
	border: 1px solid #f5f5f5;
	filter: saturate(1.5);
	color: white;
	width: 40px;
	height: 40px;

	& .q-img {
		min-width: 40px;
		height: 100%;
		max-height: 40px;
	}
}
</style>
