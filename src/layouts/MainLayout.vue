<template>
	<q-layout view="lHh Lpr lFf">
		<!-- Header bar with logo and name -->
		<q-header elevated>
			<q-toolbar>
				<q-btn flat :to="{ path: '/' }">
					<q-avatar square>
						<q-icon>
							<SearchMyGitlabLogo />
						</q-icon>
					</q-avatar>
				</q-btn>
				<q-toolbar-title>
					Search My Gitlab
				</q-toolbar-title>

				<q-space />

				<!-- Allows the user to select what color theme they'd like to view the code snippets in -->
				<q-select
					borderless
					label-color="white"
					v-model="chosenStyle"
					:options="styleOptions"
					label="Code Theme"
					class="code-theme-select"
					map-options
					emit-value
				/>
			</q-toolbar>
		</q-header>

		<!-- The actual page content -->
		<q-page-container style="padding-bottom: 0;" :class="`code-theme-${chosenStyle}`">
			<router-view />
		</q-page-container>

		<!-- Our footer! -->
		<Footer />
	</q-layout>
</template>

<script>
import SearchMyGitlabLogo from 'src/components/shared/SearchMyGitlabLogo';
import Footer from 'src/components/shared/Footer';

export default {
	name: 'MainLayout',
	data() {
		return {
			chosenStyle: window.localStorage.getItem('selectedCodeTheme') || null,
			styleOptions: [
				{
					label: 'Monokai',
					value: 'monokai'
				},
				{
					label: 'Okaidia',
					value: 'okaidia'
				},
				{
					label: 'Darkula',
					value: 'darkula'
				},
				{
					label: 'Prism',
					value: 'prism'
				},
				{
					label: 'Coy',
					value: 'coy'
				}
			]
		};
	},
	watch: {
		chosenStyle: {
			immediate: true,
			handler(newVal, oldVal) {
				if (!newVal && !oldVal) {
					// The user has done nothing to select or unselect a theme; default to the best one!
					this.chosenStyle = 'monokai';
				}

				// Remember the user's theme preference
				window.localStorage.setItem('selectedCodeTheme', newVal);
			}
		}
	},
	components: {
		SearchMyGitlabLogo,
		Footer
	}
};
</script>

<style lang="scss">
.code-theme-select {
	width: 80pt;

	.q-field__native {
		color: white !important;
	}

	.q-field__marginal {
		color: white !important;
		opacity: 0.7;
	}
}
</style>
