import Vue from 'vue';
import axios from 'axios';
import logger from 'utilities/logger';
import cloneObj from 'utilities/cloneObj';

// Our Group data definitions
const groupData = {
	allGroups: {},
	fetched: {}
};

const Group = new Vue({
	data() {
		return cloneObj(groupData);
	},
	computed: {
		/**
		 * Gets a specific group from the indicated server by ID
		 *
		 * @param {Int} connIndex - the index of the particular connection we should fetch the project
		 * @param {Int} groupId - obviously, the ID of the group we want
		 * @returns {Group}
		 */
		group() {
			return (connIndex, groupId) => {
				return this.allGroups[connIndex] && this.allGroups[connIndex][groupId];
			};
		},

		/**
		 * Gets a list of Groups from the specified server and key
		 *
		 * @param {Connection} conn - the particular connection we should fetch groups from
		 * @returns {Array} - a list of groups from the specified connection. Undefined if that connection's groups haven't been fetched yet.
		 */
		groups() {
			return (conn) => {
				if (this.allGroups[conn.index] === undefined && !this.fetched[conn.index]) {
					// Mark this as being fetched
					this.$set(this.fetched, conn.index, true);

					axios({
						method: 'get',
						headers: {
							'Private-Token': conn.token
						},
						url: `${conn.domain}/api/v4/groups?per_page=100`
					})
						.then((response) => {
							// Update this connection's groups in our running list, but filter them first
							const filtered = [];
							for (const group of response.data) {
								filtered.push({
									id: group.id,
									webUrl: group.web_url,
									name: group.name,
									avatarUrl: group.avatar_url
								});
							}

							this.$set(this.allGroups, conn.index, filtered);
						})
						.catch((e) => {
							// Mark it as null as a sign that we failed to fetch them
							this.$set(this.allGroups, conn.index, null);

							logger.error(
								{
									error: e,
									connection: conn.index
								},
								'Failed to get groups with connection'
							);
						});
				}

				// Return whatever we have right now
				return cloneObj(this.allGroups[conn.index]);
			};
		}
	},
	methods: {
		/**
		 * Wipes everything out that we have available directly through our props
		 */
		clearAll() {
			const dataClone = cloneObj(groupData);
			for (const prop of Object.keys(dataClone)) {
				this.$set(this, prop, dataClone[prop]);
			}
		}
	}
});

export default Group;
