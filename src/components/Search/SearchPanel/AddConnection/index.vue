<template>
	<div style="max-width: 600px;">
		<div class="text-center q-px-md">
			<!-- Site logo -->
			<q-icon size="100px">
				<SearchMyGitlabLogo />
			</q-icon>

			<!-- We like to show this intro only in the case that this appears to be the first time the user has used the site. -->
			<template v-if="hasNone">
				<h1 class="text-h4">
					Welcome to Search My Gitlab!
				</h1>

				<p>
					Here, you can search all repos in your Gitlab instance simultaneously for free! No more need to mindlessly open and search every
					repo one at a time, nor spend a ton of money upgrading to a higher Gitlab tier
					<i>just</i> so you can use ElasticSearch.
				</p>

				<p>
					Just enter your Gitlab URL and an access token and you'll be well on your way to code-search heaven. We don't save this
					information anywhere but on your browser - don't believe us? Go ahead and check your network tab in the dev tools. Happy searches!
				</p>
			</template>

			<!-- Otherwise, we just get out of the way, for the most part. -->
			<template v-else>
				<h1 class="text-h5">
					...yeah. You know what to do.
				</h1>
			</template>

			<div class="doc-note doc-note--warning q-mt-xl">
				<span
					><strong>Note:</strong> We do not record tokens; all validation and searching is done between the client and your own Gitlab host.
					<a href="#" @click.prevent.stop="explainModalOpen = true">Why can't I just sign in with Gitlab?</a></span
				>
			</div>
		</div>

		<!-- First pop-up is just for further explaining why users can't sign in with Gitlab -->
		<q-dialog v-model="explainModalOpen">
			<q-card>
				<q-card-section>
					Unfortunately, there are two major problems right now with Gitlab application OAuth:
					<ul>
						<li>
							Being <i>relatively</i> new, OAuth application integration still has a whole host of
							<a
								href="https://gitlab.com/gitlab-org/gitlab/-/issues?page=3&scope=all&search=oauth+application&state=opened"
								target="_blank"
								>bugs to work out</a
							>, including
							<a href="https://gitlab.com/gitlab-org/gitlab/-/issues/343102" target="_blank">user access permission issues</a> and an
							<a href="https://gitlab.com/gitlab-org/gitlab/-/issues/336598" target="_blank">inability to revoke access immediately</a>.
						</li>
						<li>
							All OAuth application integrations are done on a user, group, or instance-wide level. What does this mean for you?
							<strong class="text-secondary">Search My Gitlab</strong> can't be configured once as an acceptable OAuth-integrated client
							with Gitlab and suddenly work for everyone. It actually has to be setup for every user's account, and still necessitates
							the exchanging of secrets/tokens to work anyways. Going the route of personal access tokens is faster and just as safe at
							this time. Perhaps someday we'll do the extra work of allowing account administrators to setup OAuth applications with
							<strong class="text-secondary">Search My Gitlab</strong> so that all users of a Gitlab instance can just sign in with
							their Gitlab credentials, but today is not that day! (see
							<a href="https://docs.gitlab.com/ee/integration/oauth_provider.html" target="_blank"
								>Configure GitLab as an OAuth 2.0 authentication identity provider</a
							>)
						</li>
					</ul>
				</q-card-section>
			</q-card>
		</q-dialog>

		<!-- A pop-up dialog we can use for telling the user what happened in event of error -->
		<ErrorDialog :error="error" :hide="() => (error = '')" :action-label="'Let me retry'" />

		<!-- Conversely, a pop-up to tell the user success if that happened -->
		<q-dialog :value="newIndex !== null" persistent>
			<q-card>
				<q-card-section align="center">
					<div class="text-h6">Success!</div>
				</q-card-section>

				<q-card-section class="q-pt-none">
					Looks like you're set to go.
				</q-card-section>

				<q-card-actions align="center">
					<q-btn label="Start Searching" color="primary" @click="migrate" />
				</q-card-actions>
			</q-card>
		</q-dialog>

		<!-- Our actual form for accepting URL and token -->
		<q-form @submit="onSubmit" :autofocus="!hasNone" class="q-gutter-md q-pa-md text-center">
			<!-- Gitlab URL input -->
			<q-input
				filled
				type="text"
				v-model="domain"
				label="Your Gitlab URL"
				hint="E.g. https://gitlab.com"
				lazy-rules
				:rules="[
					(val) => (val && val.length > 0) || 'Please provide a URL string to your Gitlab host',
					(val) => val.includes('http') || 'It must be a fully-qualified URL, e.g. https://gitlab.com'
				]"
			/>

			<!-- Token input -->
			<q-input
				filled
				type="password"
				v-model="token"
				label="Your Gitlab Access Token"
				lazy-rules="ondemand"
				:rules="[(val) => (val && val.length > 0) || 'Please provide a personal access token']"
			>
				<!-- We have to use a v-slot if we want HTML in our hint -->
				<template v-slot:hint>
					<div>
						See the
						<a href="https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html#creating-a-personal-access-token" target="_blank"
							>Gitlab docs</a
						>
						for instructions to create a token with the
						<b><code>read_api</code></b> scope
					</div>
				</template>
			</q-input>

			<!-- My protection against lawsuits. Phew! -->
			<div style="line-height: 0.6;">
				<q-toggle v-model="accept" />
				<span style="vertical-align: middle;"
					>I accept the the <a href="/terms" target="_blank">terms and conditions</a> and authorize
					<strong class="text-secondary">Search My Gitlab</strong> to search Gitlab on my behalf.</span
				>
			</div>

			<!-- Uh, the submit button. Yep. That's it. -->
			<div>
				<q-btn label="Submit" type="submit" color="primary" :disable="!canSubmit" />
			</div>

			<!-- Our loading icon while we validate credentials -->
			<q-inner-loading :showing="loading">
				<q-spinner-gears size="50px" color="primary" />
			</q-inner-loading>
		</q-form>
	</div>
</template>

<script>
import SearchMyGitlabLogo from 'src/components/shared/SearchMyGitlabLogo/index';

export default {
	name: 'AddConnection',
	props: {
		hasNone: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			accept: false,
			domain: '',
			token: '',
			loading: false,
			newIndex: null,
			error: '',
			explainModalOpen: false
		};
	},
	computed: {
		/**
		 * Simple calculates whether the form has been filled out properly
		 */
		canSubmit() {
			return this.accept && this.domain && this.domain.includes('http') && this.token;
		}
	},
	methods: {
		/**
		 * Grabs the form inputs and passes them to the store to validate and save them
		 */
		async onSubmit() {
			this.loading = true;

			// Make sure that we don't have any other slashes that we shouldn't
			if ((this.domain.match(/\//g) || []).length > 2) {
				this.domain = new URL(this.domain).origin;
			}

			// Pass them onto our store
			const response = await this.$store.Connection.createConn(this.domain, this.token);

			if (response.error) {
				switch (response.error) {
					case 'UNAUTHORIZED':
						this.error =
							'The access token provided does not have the proper permissions. Please make sure you provide a token with the "<b><code>read_api</code></b>" scope.';
						break;
					case 'UNAUTHENTICATED':
					case 'NO_DATA':
						this.error =
							'The access token provided is invalid. Check the token you\'ve entered or review the <a href="https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html#creating-a-personal-access-token" target="_blank">Gitlab docs</a> and try again.';
						break;
					case 'BAD_REQUEST':
					default:
						this.error =
							"We couldn't access the Gitlab URL you provided. Please check your network connection or the URL you entered and try again.";
						break;
				}
			} else {
				// Now to show a success dialog and prepare to switch to the other tab!
				this.newIndex = response.data.index;
			}

			this.loading = false;
		},

		/**
		 * This just updates our URL query to trigger switching to the tab that now has their info on it
		 */
		migrate() {
			const newRoute = {
				path: `/search/${this.domain.split('//')[1]}`
			};

			this.$router.replace(newRoute);
		}
	},

	components: {
		ErrorDialog: () => import(/* webpackChunkName: "ErrorDialog" */ 'components/shared/ErrorDialog'),
		SearchMyGitlabLogo
	}
};
</script>

<style lang="scss">
.doc-note {
	padding: 10px;

	&--warning {
		background-color: $yellow-2;
	}
}
</style>
