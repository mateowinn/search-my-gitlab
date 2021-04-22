<template>
	<q-layout view="lHh Lpr lFf">
		<q-header elevated>
			<q-toolbar>
				<q-btn flat>
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

		<q-page-container>
			<router-view />
		</q-page-container>
	</q-layout>
</template>

<script>
import SearchMyGitlabLogo from 'components/shared/SearchMyGitlabLogo.vue';

export default {
	name: 'MainLayout',
	components: { SearchMyGitlabLogo }
};
</script>
