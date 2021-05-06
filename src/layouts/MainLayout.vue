<template>
	<q-layout view="lHh Lpr lFf">
		<!-- Header bar with logo and name -->
		<q-header elevated>
			<q-toolbar>
				<q-btn flat :to="{ path: '/0' }">
					<q-avatar square>
						<q-icon>
							<SearchMyGitlabLogo />
						</q-icon>
					</q-avatar>
				</q-btn>
				<q-toolbar-title>
					Search My Gitlab
				</q-toolbar-title>
			</q-toolbar>
		</q-header>

		<!-- The actual page content -->
		<q-page-container style="padding-bottom: 0;">
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
	components: {
		SearchMyGitlabLogo,
		Footer
	}
};
</script>
