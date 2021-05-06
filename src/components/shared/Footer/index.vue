<template>
	<q-footer class="footer bg-primary">
		<!-- Our border-floating logo -->
		<q-btn flat fab class="footer__fab">
			<q-avatar square>
				<q-icon>
					<SearchMyGitlabLogo />
				</q-icon>
			</q-avatar>
		</q-btn>

		<q-dialog v-model="showModal">
			<q-card>
				<q-card-section v-if="modalHeader">
					<div v-html="modalHeader" class="text-h6"></div>
				</q-card-section>

				<q-card-section v-html="modalText" class="q-py-none"></q-card-section>

				<q-card-actions v-if="modalButton" align="right">
					<q-btn flat v-html="modalButton" color="primary" class="q-pr-sm" v-close-popup />
				</q-card-actions>
			</q-card>
		</q-dialog>

		<!-- Our links -->
		<div class="footer__links">
			<q-list dense padding>
				<q-item-label header>Resources</q-item-label>

				<q-item>
					<q-item-section>
						<a href="https://github.com/mateowinn/search-my-gitlab" target="_blank">Contribute</a>
					</q-item-section>
				</q-item>

				<q-item>
					<q-item-section>
						<a href="#" @click.prevent.stop="updateModal('blog')">Blog</a>
					</q-item-section>
				</q-item>

				<q-item>
					<q-item-section>
						<a href="#" @click.prevent.stop="updateModal('jobs')">Jobs</a>
					</q-item-section>
				</q-item>
			</q-list>

			<q-list dense padding>
				<q-item-label header>Support</q-item-label>

				<q-item>
					<q-item-section>
						<router-link :to="{ path: '/about' }">About</router-link>
					</q-item-section>
				</q-item>

				<q-item>
					<q-item-section>
						<a href="https://github.com/mateowinn" target="_blank">Contact</a>
					</q-item-section>
				</q-item>

				<q-item>
					<q-item-section>
						<a href="https://www.betterbits.io" target="_blank">Better Bits</a>
					</q-item-section>
				</q-item>
			</q-list>
		</div>
	</q-footer>
</template>

<script>
import SearchMyGitlabLogo from 'src/components/shared/SearchMyGitlabLogo';

export default {
	name: 'Footer',
	data() {
		return {
			showModal: false,
			modalHeader: '',
			modalText: '',
			modalButton: ''
		};
	},
	methods: {
		updateModal(scenario) {
			switch (scenario) {
				case 'blog':
					this.modalHeader = 'Huh.';
					this.modalText = "It appears that whoever put this link here didn't bother to actually make a blog.";
					this.modalButton = 'Okay...';
					break;
				case 'jobs':
					this.modalHeader = 'For real?';
					this.modalText = "I suppose that if you <i>really</i> wanna work, you're welcome to contribute to the website. For free.";
					this.modalButton = `<a href="https://github.com/mateowinn/search-my-gitlab" target="_blank">Yes, Contribute!</a>`;
					break;
			}

			this.showModal = true;
		}
	},
	components: {
		SearchMyGitlabLogo
	}
};
</script>

<style lang="scss">
.footer {
	position: relative;

	&__fab {
		position: absolute;
		top: 0;
		width: 80px;
		height: 80px;
		right: calc(50% - 45px); // Centered by element size with a slight offset to make it *look* more centered
		transform: translateY(-50%);

		& .q-icon {
			height: 50px;
			width: 50px;
		}
	}

	&__links {
		position: relative;
		padding: 15px;
		display: flex;
		justify-content: center;

		& .q-list {
			padding: 10px;
		}

		& .q-item__label {
			color: white;
			font-size: 1.5rem;
			padding-bottom: 8px;
		}

		& a {
			color: white;
			text-decoration: none;
		}
	}
}
</style>