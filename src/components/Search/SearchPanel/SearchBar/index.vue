<template>
	<q-card flat class="search-container text-right q-pa-none">
		<!-- Opens the search drawer -->
		<a href="#" @click.prevent.stop="toggleDrawer">Adjust Search Scope</a>

		<div class="row q-gutter-md wrap">
			<!-- The actual search term input -->
			<q-input filled v-model="query" label="Search" hint="E.g. 'foo bar baz'" @keyup.enter="confirmSearch" clearable style="flex-grow: 4;">
				<template v-slot:append>
					<q-icon name="search" @click="confirmSearch" />
				</template>
			</q-input>

			<!-- Optional filtering by branch name -->
			<q-input
				filled
				v-model="branch"
				label="Branch to Search"
				placeholder="E.g. master"
				hint="Searches project default if empty"
				@keyup.enter="confirmSearch"
				clearable
				@clear="confirmSearch"
				style="flex-grow: 1;"
			>
			</q-input>
		</div>

		<!-- A modal for confirming the user's intentions if they try doing a search with less than 4 letters -->
		<ConfirmSearchModal v-model="confirmQuery" :search-query="searchQuery" :confirm-search="confirmSearch" />
	</q-card>
</template>

<script>
import ConfirmSearchModal from './ConfirmSearchModal';

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
	data() {
		return {
			confirmQuery: false
		};
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
	},
	methods: {
		/**
		 * Shows a confirmation dialog if the query is short. Otherwise, initiates the search process.
		 *
		 * @param {Boolean} confirmed - whether or not we've already warned this user about their small search query
		 */
		confirmSearch(confirmed) {
			if (this.query.length < 4 && !confirmed) {
				// If the user is attempting a really small query, then I'd really rather warn them of the consequences
				this.confirmQuery = true;
			} else {
				this.initiateSearch();
			}
		}
	},
	components: {
		ConfirmSearchModal
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
