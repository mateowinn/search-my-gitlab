import Vue from 'vue';
import logger from 'utilities/logger';
import cloneObj from 'utilities/cloneObj';

// Constants
const ALL_PROJECTS = 'allProjects';

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
				if (!this.fetched[conn.index]) {
					// Mark this fetch as initiated
					this.$set(this.fetched, conn.index, true);
					this.$set(this.pageErrors, conn.index, {});

					if (this.allProjects[conn.index] === undefined) {
						this.$set(this.allProjects, conn.index, []);
					}

					// Recursively fetch all projects
					this.fetchProjectsByPage(conn);
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
		 * @param {Array<Project>} results - an array of the aggregated results we've received. We keep track of this so that we can load all of our projects at once in the end.
		 * @param {Int} page - the page (of 100s) that we should be fetching this time around
		 */
		fetchProjectsByPage(conn, results = [], page = 1) {
			conn.axios({
				method: 'get',
				headers: {
					'Private-Token': conn.token
				},
				exposedHeaders: ['ratelimit-limit'],
				url: `${conn.domain}/api/v4/projects?membership=true&per_page=100&page=${page}`
			})
				.then((response) => {
					// Update our running list with these projects, but filter them first
					for (const project of response.data) {
						results.push({
							id: project.id,
							name: project.name,
							defaultBranch: project.default_branch || '',
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

					// Run this again and again if we detect that there may be more projects
					if (response.data.length === 100) {
						this.fetchProjectsByPage(conn, results, page + 1);
					} else {
						this.$set(this.allProjects, conn.index, results);

						// We also want to set this into localStorage for faster retrieval next time
						window.localStorage.setItem(ALL_PROJECTS, JSON.stringify(this.allProjects));
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
		 * Attempts to load all previously fetched projects from local storage
		 */
		loadProjectsFromStorage() {
			const projectsStr = window.localStorage.getItem(ALL_PROJECTS);

			if (projectsStr) {
				this.$set(this, 'allProjects', JSON.parse(projectsStr));

				// In order to avoid throwing a bunch of exceptions because we have projects but didn't actually do any fetching, we need to setup the other objects, too
				for (const idx of Object.keys(this.allProjects)) {
					this.$set(this.fetched, idx, false);
					this.$set(this.pageErrors, idx, {});
				}
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
	},
	created() {
		// On initialization, let's try to pre-load projects so there isn't a huge delay for users with lots of projects
		this.loadProjectsFromStorage();
	}
});

export default Project;
