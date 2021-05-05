<template>
	<div style="max-width: 600px;">
		<!-- We like to show this intro only in the case that this appears to be the first time the user has used the site. -->
		<div v-if="hasNone" class="text-center">
			<!-- <q-avatar square size="100px"> -->
			<q-icon size="100px">
				<SearchMyGitlabLogo />
			</q-icon>
			<!-- </q-avatar> -->

			<h1 class="text-h4">
				Welcome to Search My Gitlab!
			</h1>

			<p>
				Here, you can search all repos in your Gitlab instance simultaneously for free! No more need to mindlessly open and search every repo
				one at a time, nor spend a ton of money upgrading to a higher Gitlab tier
				<i>just</i> so you can use ElasticSearch.
			</p>

			<p>
				Just enter your Gitlab URL and an access token and you'll be well on your way to code-search heaven. We don't save this information
				anywhere but on your browser - don't believe us? Go ahead and check your network tab in the dev tools. Happy searches!
			</p>
		</div>

		<!-- A pop-up dialog we can use for telling the user what happened in event of error -->
		<q-dialog :value="!!error" @hide="error = ''">
			<q-card>
				<q-card-section>
					<div class="text-h6">Well, this is awkward.</div>
				</q-card-section>

				<q-card-section v-html="error" class="q-py-none"></q-card-section>

				<q-card-actions align="right">
					<q-btn flat label="Retry" color="primary" v-close-popup />
				</q-card-actions>
			</q-card>
		</q-dialog>

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
		<q-form @submit="onSubmit" :autofocus="!hasNone" class="q-gutter-md q-pt-md text-center">
			<!-- Gitlab URL input -->
			<q-input
				filled
				v-model="domain"
				label="Your Gitlab URL"
				hint="E.g. https://gitlab.com"
				lazy-rules
				:rules="[
					(val) => (val && val.length > 0) || 'Please provide a URL string to your Gitlab instance',
					(val) => val.includes('http') || 'It must be a fully-qualified URL'
				]"
			/>

			<!-- Token input -->
			<q-input
				filled
				v-model="token"
				label="Your Gitlab Access Token"
				lazy-rules
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
						<code>read_api</code> scope
					</div>
				</template>
			</q-input>

			<!-- My protection against lawsuits. Phew! -->
			<q-toggle v-model="accept" label="I accept the license and terms" />

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
			error: ''
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

			// Pass them onto our store
			const response = await this.$store.Connection.createConn(this.domain, this.token);

			if (response.error) {
				switch (response.error) {
					case 'UNAUTHORIZED':
						this.error =
							'The access token provided does not have the proper permissions. Please make sure you provide a token with the "read_api" scope.';
						break;
					case 'UNAUTHENTICATED':
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
				...this.$route,
				path: `/${this.newIndex}`
			};

			this.$router.replace(newRoute);
		}
	},

	components: {
		SearchMyGitlabLogo
	}
};
</script>
