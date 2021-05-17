<template>
	<div class="text-center bg-grey-3 text-black q-pb-md">
		<h3 class="text-h5 text-primary q-pt-md q-mt-none text-bold">Testimonials</h3>

		<!-- The meat. Awesome testimonials from *real* people. -->
		<q-carousel
			v-model="slide"
			swipeable
			animated
			transition-prev="slide-right"
			transition-next="slide-left"
			infinite
			autoplay
			padding
			arrows
			navigation
			control-color="black"
			height="350px"
			class="bg-grey-3 text-black"
		>
			<q-carousel-slide name="manager" class="column no-wrap flex-center testimonial">
				<div class="testimonial__quote">
					"Ever since I heard about <strong class="text-secondary">Search My Gitlab</strong>, my devs have been 40% more productive!"
				</div>
				<div class="testimonial__author">
					<q-avatar>
						<img src="/img/manager.jpg" />
					</q-avatar>
					<span class="text-secondary testimonial__author__name">- A Software Manager</span>
				</div>
			</q-carousel-slide>

			<q-carousel-slide name="owner" class="column no-wrap flex-center testimonial">
				<div class="testimonial__quote">
					"<strong class="text-secondary">Search My Gitlab</strong> has strengthened our company culture and vastly boosted our margins."
				</div>
				<div class="testimonial__author">
					<q-avatar>
						<img src="/img/owner.jpg" />
					</q-avatar>
					<span class="text-secondary testimonial__author__name">- Owner, Fictitious Enterprises</span>
				</div>
			</q-carousel-slide>

			<q-carousel-slide name="dev" class="column no-wrap flex-center testimonial">
				<div class="testimonial__quote">
					"I don't know what <a href="https://about.gitlab.com" target="_blank">Gitlab</a> is, but using
					<strong class="text-secondary">Search My Gitlab</strong> has put me way ahead of my peers!"
				</div>
				<div class="testimonial__author">
					<q-avatar>
						<img src="/img/dev.jpg" />
					</q-avatar>
					<span class="text-secondary testimonial__author__name">- Dev Across the Street</span>
				</div>
			</q-carousel-slide>
		</q-carousel>
	</div>
</template>

<script>
export default {
	name: 'Testimonials',
	data() {
		return {
			slide: 'manager'
		};
	}
};
</script>

<style lang="scss">
.testimonial {
	&__quote {
		font-size: 20px;
		font-weight: bold;
		padding-bottom: 30px;

		@media (min-width: $breakpoint-sm-min) {
			font-size: 30px;
			font-weight: bold;
			max-width: 70vw;
			padding-bottom: 40px;
		}
	}

	&__author {
		display: flex;
		justify-content: center;
		padding-bottom: 20px;

		& .q-avatar {
			width: 60px;
			height: 60px;

			@media (min-width: $breakpoint-sm-min) {
				width: 80px;
				height: 80px;
			}
		}

		&__name {
			padding-left: 12px;
			font-size: 18px;
			font-weight: bold;
			align-self: flex-end;

			@media (min-width: $breakpoint-sm-min) {
				padding-left: 24px;
				font-size: 24px;
			}
		}
	}
}
</style>
