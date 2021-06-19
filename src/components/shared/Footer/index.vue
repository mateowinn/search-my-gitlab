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

		<!-- A modal to show spunky messages -->
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
						<a href="https://gitlab.com/mateowinn/search-my-gitlab" target="_blank">Contribute</a>
					</q-item-section>
				</q-item>

				<q-item>
					<q-item-section>
						<a href="#" @click.prevent.stop="updateModal('blog')">Blog</a>
					</q-item-section>
				</q-item>

				<q-item>
					<q-item-section>
						<router-link :to="{ path: '/terms' }">Terms & Conditions</router-link>
					</q-item-section>
				</q-item>

				<q-item>
					<q-item-section>
						<router-link :to="{ path: '/privacy' }">Privacy Policy</router-link>
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
						<a href="https://gitlab.com/mateowinn" target="_blank">Contact</a>
					</q-item-section>
				</q-item>

				<q-item>
					<q-item-section>
						<a href="https://owalalife.com/" target="_blank">Hydrate</a>
					</q-item-section>
				</q-item>

				<q-item>
					<q-item-section>
						<a href="https://www.betterbits.io" target="_blank">Better Bits</a>
					</q-item-section>
				</q-item>
			</q-list>
		</div>

		<div class="footer__copyright">
			<span>GitLab and its logo are trademarks of GitLab, Inc</span>
			<br />

			<span>Copyright © {{ new Date().getFullYear() }} Matthew Winn</span> |
			<a href="https://gitlab.com/mateowinn/search-my-gitlab/-/blob/master/LICENSE.md" target="_blank" style="color: white;">License</a>
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
		/**
		 * Takes in a specified scenario and sets the modal text accordingly. Then opens the modal.
		 * @param {String} scenario - the name of the scenario that we want to display in the modal
		 */
		updateModal(scenario) {
			switch (scenario) {
				case 'blog':
					this.modalHeader = 'Huh.';
					this.modalText = "It appears that whoever put this link here didn't bother to actually make a blog.";
					this.modalButton = 'Okay...';
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

	&__copyright {
		margin: auto;
		text-align: center;
		padding: 10px;
	}
}
</style>
