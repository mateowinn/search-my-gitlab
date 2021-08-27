<template>
	<q-card flat class="search-container text-right q-pa-none">
		<!-- Opens the search drawer -->
		<a href="#" @click.prevent.stop="toggleDrawer">Adjust Search Scope</a>

		<div class="row q-gutter-md wrap">
			<!-- The actual search term input -->
			<q-input
				filled
				v-model="query"
				label="Search"
				hint="E.g. 'foo bar baz'"
				@keyup.enter="updateSearch('searchQuery', query, true)"
				clearable
				style="flex-grow: 4;"
			>
				<template v-slot:append>
					<q-icon name="search" @click="updateSearch('searchQuery', query, true)" />
				</template>
			</q-input>

			<!-- Optional filtering by branch name -->
			<q-input
				filled
				v-model="branch"
				label="Branch to Search"
				placeholder="E.g. master"
				hint="Searches project default if empty"
				@keyup.enter="updateSearch('searchBranch', branch, true)"
				clearable
				@clear="updateSearch('searchBranch', branch, true)"
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
		updateSearch: {
			type: Function,
			default: () => {
				// Nothing, I guess
			}
		}
	},
	data() {
		return {
			query: '',
			branch: ''
		};
	},
	watch: {
		searchQuery: {
			immediate: true,
			handler(newVal) {
				this.query = newVal;
			}
		},
		searchBranch: {
			immediate: true,
			handler(newVal) {
				this.branch = newVal;
			}
		},
		query(newVal) {
			// We do want to keep searchQuery up to date always, even when they haven't explicitly hit enter and initiated a search
			this.updateSearch('searchQuery', newVal);
		},
		branch(newVal) {
			// We do want to keep searchBranch up to date always, even when they haven't explicitly hit enter and initiated a search
			this.updateSearch('searchBranch', newVal);
		}
	}
};
</script>
