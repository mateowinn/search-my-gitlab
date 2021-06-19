import Vue from 'vue';
import axios from 'axios';
import logger from 'utilities/logger';
import cloneObj from 'utilities/cloneObj';

// Our Project data definitions
const projectData = {
	allProjects: {},
	fetched: {},
	pageErrors: {}
};

const Project = new Vue({
	data() {
		return cloneObj(projectData);
	},
	computed: {
		/**
		 * Gets a specific project from the indicated server
		 *
		 * @param {Int} connIndex - the index of the particular connection we should fetch the project
		 * @param {Int} projectId - obviously, the ID of the project we want
		 * @returns {Project}
		 */
		project() {
			return (connIndex, projectId) => {
				return this.allProjects[connIndex] !== undefined && this.allProjects[connIndex].find((proj) => proj.id === +projectId);
			};
		},

		/**
		 * Gets a list of Projects from the specified server and key that the user is a member of
		 *
		 * @param {Connection} conn - the particular connection we should fetch projects from
		 * @returns {Array} - a list of projects from the specified connection. Undefined if those projects haven't been fetched yet.
		 */
		projects() {
			return (conn) => {
				if (this.allProjects[conn.index] === undefined && !this.fetched[conn.index]) {
					// Mark this as fetch initiated
					this.$set(this.fetched, conn.index, true);
					this.$set(this.allProjects, conn.index, []);
					this.$set(this.pageErrors, conn.index, {});

					// Recursively fetch all projects
					this.fetchProjectsByPage(conn, 1);
				}

				// Return whatever we have right now
				return cloneObj(this.allProjects[conn.index]);
			};
		}
	},
	methods: {
		/**
		 * A recursive function that gets all projects that the user is a member of in sets of 100
		 *
		 * @param {Connection} conn - the particular connection we should fetch projects from
		 * @param {Int} page - the page (of 100s) that we should be fetching this time around
		 */
		fetchProjectsByPage(conn, page) {
			axios({
				method: 'get',
				headers: {
					'Private-Token': conn.token
				},
				url: `${conn.domain}/api/v4/projects?membership=true&per_page=100&page=${page}`
			})
				.then((response) => {
					// Update our running list with these projects, but filter them first
					for (const project of response.data) {
						this.allProjects[conn.index].push({
							id: project.id,
							name: project.name,
							defaultBranch: project.default_branch,
							webUrl: project.web_url,
							avatarUrl: this.getFullAvatarUrl(project.avatar_url, conn),
							archived: project.archived,
							group: {
								id: project.namespace.id,
								name: project.namespace.name,
								webUrl: project.namespace.web_url,
								avatarUrl: this.getFullAvatarUrl(project.namespace.avatar_url, conn)
							}
						});
					}

					this.$set(this.allProjects, conn.index, this.allProjects[conn.index]);

					// Run this again and again if we detect that there may be more projects
					if (response.data.length === 100) {
						this.fetchProjectsByPage(conn, page + 1);
					}
				})
				.catch((e) => {
					// Mark in our list as a sign that there was an error
					let code = 'SERVER_ERROR';
					if (!e.response) {
						// Perhaps they need to be on a specific network?
						code = 'BAD_REQUEST';
					}
					this.$set(this.pageErrors[conn.index], page, code);

					logger.error(
						{
							error: e,
							connection: conn.index,
							page,
							code
						},
						'Failed to get projects with specified connection and page'
					);
				});
		},

		/**
		 * Sometimes Avatar URLs are absolute and sometimes they are relative. This is to make sure we equalize that.
		 *
		 * @param {String} avatarUrl - the URL string received from Gitlab for the entity Avatar
		 * @param {Object} conn - the object with details of the chosen connection
		 * @returns {String} - domain-prepended or original Avatar string
		 */
		getFullAvatarUrl(avatarUrl, conn) {
			if (avatarUrl && avatarUrl.startsWith('http')) {
				return avatarUrl;
			} else if (avatarUrl && avatarUrl.startsWith('/')) {
				return conn.domain + avatarUrl;
			} else {
				return avatarUrl;
			}
		},

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
