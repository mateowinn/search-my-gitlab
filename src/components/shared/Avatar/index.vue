<template>
	<q-avatar rounded :style="{ 'background-color': entity.avatarUrl ? 'white' : `#${strToColorHex(entity.name)}` }">
		<q-img v-if="entity.avatarUrl" :src="entity.avatarUrl" contain spinner-color="secondary">
			<template v-slot:error>
				<!-- If, for some reason, we couldn't load the actual Avatar, pass in a sad face -->
				<q-img src="/img/sad-face.png" contain class="absolute-full flex flex-center bg-white" />
			</template>
		</q-img>
		<!-- Finds the first *letter* in the name and capitalizes it -->
		<template v-else>{{ (entity.name.match(/\b[a-zA-Z]/) || [entity.name.charAt(0)])[0].toUpperCase() }}</template>
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
