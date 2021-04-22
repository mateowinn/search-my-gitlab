import Vue from 'vue';
import axios from 'axios';
// import logger from 'client-logger';
import cloneObj from 'utilities/cloneObj';

// Our Project data definitions
const projectData = {
	allProjects: {},
	fetched: {}
};

const Project = new Vue({
	data() {
		return cloneObj(projectData);
	},
	computed: {
		/**
		 * Gets a list of Projects from the specified server, key, and group
		 *
		 * @param {Connection} conn - the particular connection we should fetch projects from
		 * @param {Group} group - the particular group from under which we should fetch projects
		 * @returns {Array} - a list of projects from the specified connection and group. Undefined if those projects haven't been fetched yet.
		 */
		projects() {
			return (conn, group) => {
				if (this.allProjects[conn.index] === undefined) {
					// Make sure not to throw any errors by trying to access groups under a connection that we haven't initialized
					this.$set(this.allProjects, conn.index, {});
					this.$set(this.fetched, conn.index, {});
				}

				if (
					this.allProjects[conn.index][group.id] === undefined &&
					!this.fetched[conn.index][group.id]
				) {
					// Mark this as fetch initiated
					this.$set(this.fetched[conn.index], group.id, true);

					axios({
						method: 'get',
						headers: {
							'Private-Token': conn.token
						},
						url: `${conn.domain}/api/v4/groups/${group.id}/projects?per_page=100`
					})
						.then((response) => {
							// Update this group's projects in our running list
							this.$set(
								this.allProjects[conn.index],
								group.id,
								response.data
							);
						})
						.catch((e) => {
							console.error(
								{
									error: e,
									connection: conn.index,
									group: group.id
								},
								'Failed to get projects with specified connection and group'
							);
						});
				}

				// Return whatever we have right now
				return cloneObj(this.allProjects[conn.index][group.id]);
			};
		}
	},
	methods: {
		/**
		 * Wipes everything out that we have available directly through our props
		 */
		clearAll() {
			const dataClone = cloneObj(projectData);
			for (const prop of Object.keys(dataClone)) {
				this.$set(this, prop, dataClone[prop]);
			}
		}
	}
});

export default Project;
