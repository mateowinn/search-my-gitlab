<template>
	<q-page>
		<div class="intros q-pa-md text-subtitle1">
			<h1 class="text-h4 text-primary text-bold">
				Terms and Conditions
			</h1>
			<p><strong class="text-secondary">Search My Gitlab</strong> is created for free use by all Gitlab users.</p>

			<h2 class="text-h5 text-primary text-bold">
				Disclaimer of Warranties
			</h2>
			<p>
				<strong class="text-secondary">Search My Gitlab</strong> has been provided as a free service "as is" and does not claim to make any
				warranties, express or implied, about the serviceability, merchantability, fitness for a particular purpose, or content of the site.
			</p>

			<h2 class="text-h5 text-primary text-bold">
				Limitation of Liability
			</h2>
			<p>
				The owner of this website shall not be liable for any claims arising from any use or inability to use
				<strong class="text-secondary">Search My Gitlab</strong>.
			</p>

			<h2 class="text-h5 text-primary text-bold">
				Privacy Policy
			</h2>
			<p>
				Usage of <strong class="text-secondary">Search My Gitlab</strong> is subject to our
				<router-link :to="{ path: '/privacy' }">privacy policy</router-link>.
			</p>

			<h2 class="text-h5 text-primary text-bold">
				Changes and/or Termination
			</h2>
			<p>
				We hope it would never happen, but we reserve the right to terminate, suspend or discontinue any aspect of
				<strong class="text-secondary">Search My Gitlab</strong>'s services at any time. We also reserve the right to make changes to the
				services or materials on <strong class="text-secondary">Search My Gitlab</strong> at any time without notice.
			</p>

			<h2 class="text-h5 text-primary text-bold">
				Site Terms of Use Modifications
			</h2>
			<p>
				We may change the Terms and Conditions from time to time, at any time without notice to you, by posting such changes on the
				<strong class="text-secondary">Search My Gitlab</strong> website. By using this website you are agreeing to be bound by the then
				current version of these Terms and Conditions.
			</p>

			<h2 class="text-h5 text-primary text-bold">
				Contact Us
			</h2>
			<p>
				For any questions or concerns regarding <strong class="text-secondary">Search My Gitlab</strong> and/or its terms of service please
				submit an issue at
				<a target="_blank" href="https://gitlab.com/mateowinn/search-my-gitlab">https://gitlab.com/mateowinn/search-my-gitlab</a> or send us
				an email at <a href="mailto:matt.winn@betterbits.io" rel="nofollow noopener noreferrer">matt.winn@betterbits.io</a>
			</p>
		</div>
	</q-page>
</template>

<script>
export default {
	name: 'Terms'
};
</script>

<style lang="scss">
.intros {
	text-align: left;
	line-height: 24px;
}
</style>
