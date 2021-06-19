<template>
	<q-page>
		<div class="intros q-pa-md text-subtitle1">
			<h2 class="text-h4 text-primary text-bold">
				What's Going on Here?
			</h2>
			<p>
				Saving time and money, of course. Gitlab's freakin' awesome, but it sucks that I either have to (1) pay through the nose or (2) waste
				an insane amount of time <i>just</i> to be able to search through all of my repos.
				<a href="https://www.youtube.com/watch?v=waEC-8GFTP4" target="_blank" rel="nofollow noopener noreferrer"
					>Ain't nobody got time for that.</a
				>
			</p>

			<h2 class="text-h4 text-primary text-bold">
				Yeah? So?
			</h2>
			<p>
				In the off-chance that you <i>didn't</i> already read the home page description,
				<strong class="text-secondary">Search My Gitlab</strong> is a tool I built to allow you (if you're nice!) to search <i>all</i> of your
				Gitlab repositories at the same time - for <strong>free</strong>. No more paying extra for subscriptions and AWS services. No more
				devoting hours to scouring <i>every</i> single repo in <i>every</i> single group <span style="font-size:20px;">&#128553;</span>.
			</p>

			<p>Don't believe me? Just check out these totally legit testimonials for <strong class="text-secondary">Search My Gitlab</strong>:</p>
		</div>

		<Testimonials />
	</q-page>
</template>

<script>
import Testimonials from 'components/About/Testimonials';

export default {
	name: 'About',
	components: {
		Testimonials
	}
};
</script>

<style lang="scss">
.intros {
	text-align: left;
	line-height: 24px;
}
</style>
