<template>
	<q-card flat class="search-container text-right q-pa-none">
		<!-- Opens the search drawer -->
		<a href="#" @click.prevent.stop="toggleDrawer">Adjust Search Scope</a>

		<div class="row q-gutter-md wrap">
			<!-- The actual search term input -->
			<q-input filled v-model="query" label="Search" hint="E.g. 'foo bar baz'" @keyup.enter="initiateSearch" clearable style="flex-grow: 4;">
				<template v-slot:append>
					<q-icon name="search" @click="initiateSearch" />
				</template>
			</q-input>

			<!-- Optional filtering by branch name -->
			<q-input
				filled
				v-model="branch"
				label="Branch to Search"
				placeholder="E.g. master"
				hint="Searches project default if empty"
				@keyup.enter="initiateSearch"
				clearable
				@clear="initiateSearch"
				style="flex-grow: 1;"
			>
			</q-input>
		</div>
	</q-card>
</template>

<script>
export default {
	name: 'SearchBar',
	props: {
		toggleDrawer: {
			type: Function,
			default: () => {
				// Nothing, I guess
			}
		},
		searchQuery: {
			type: String,
			default: ''
		},
		searchBranch: {
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
	computed: {
		query: {
			get() {
				return this.searchQuery;
			},
			set(newVal) {
				this.$emit('queryChange', newVal);
			}
		},
		branch: {
			get() {
				return this.searchBranch;
			},
			set(newVal) {
				this.$emit('branchChange', newVal);
			}
		}
	}
};
</script>

<style lang="scss">
.search-container {
	& > a {
		text-decoration: underline;
	}
}
</style>
