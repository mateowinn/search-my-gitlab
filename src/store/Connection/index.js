import Vue from 'vue';
import logger from 'utilities/logger';
import axios from 'axios';
import rateLimit from 'axios-rate-limit';
import cloneObj from 'utilities/cloneObj';

// Constants
const STORED_CONNECTIONS = 'storedConnections';
const DEFAULT_RATE_LIMITS = { maxRequests: 15, perMilliseconds: 1000 };

// Our Group data definitions
const connectionData = {
	allConnections: []
};

const Connection = new Vue({
	data() {
		return cloneObj(connectionData);
	},
	computed: {
		/**
		 * Gets a list of Groups from the specified server and key
		 *
		 * @returns {Array} - a list of groups from the specified connection. Undefined if that connection's groups haven't been fetched yet.
		 */
		conns() {
			// Return whatever we have right now
			return cloneObj(this.allConnections);
		}
	},
	methods: {
		/**
		 * Inserts/Updates a connection in our list
		 *
		 * @param {Object} connection
		 * @returns {Object} - connection object with index
		 */
		setConnection(connection) {
			const existing = this.allConnections[connection.index];

			if (existing) {
				Object.assign(existing, connection);
			} else {
				// Its index is essentially its ID
				const index = this.allConnections.length;
				connection.index = index;

				// Also, tie to it a rate-limited axios instance so that we can use that throughout
				// By default we set it to max 15 requests per second
				connection.axios = rateLimit(axios.create(), cloneObj(DEFAULT_RATE_LIMITS));

				// Push it into our list
				this.allConnections.push(connection);
				this.$set(this.allConnections, index, connection); // To set reactive getters
			}

			// Whether new or updated, refresh our local storage copy!
			window.localStorage.setItem(STORED_CONNECTIONS, JSON.stringify(this.allConnections));

			return connection;
		},

		/**
		 * Remove the connection details from our list
		 *
		 * @param {Int} index - the index of the connection entry we want to remove
		 * @returns {Object|Undefined} - the connection if we find and remove it or undefined if not
		 */
		removeConnection(index) {
			if (this.allConnections[index]) {
				const connection = this.allConnections.splice(index, 1);

				this.$set(this, 'allConnections', this.allConnections);
				return connection; // Just in case the requester wants to do something with the info
			}

			// Don't forget to update our local storage! Imagine if they reloaded the page and saw their "deleted" connection. Awkward...
			window.localStorage.setItem(STORED_CONNECTIONS, JSON.stringify(this.allConnections));

			// "Returning" undefined will notify the requester that we couldn't find it
		},

		/**
		 * Validates that the provided domain and token are valid, and store them in our array if so
		 *
		 * @param {String} domain - the website domain we're connecting to
		 * @param {String} token - the API token provided by the user
		 * @returns {Object} - the added and validated connection object
		 */
		async createConn(domain, token) {
			try {
				// Make a call with the specified credentials to validate that they're legit
				const response = await axios({
					method: 'get',
					headers: {
						'Private-Token': token
					},
					url: `${domain}/api/v4/projects?membership=true`
				});

				if (response.data && response.data.length > 0) {
					// Add to our running list
					const connection = this.setConnection({ domain, token });

					return {
						data: cloneObj(connection)
					};
				} else {
					return {
						error: 'NO_DATA'
					};
				}
			} catch (e) {
				// Whip up a specific code to tell the user what went wrong
				let code = 'UNAUTHORIZED';

				if (e.response) {
					// This means it's a valid Gitlab URL
					logger.error(
						{
							error: e.response.data,
							domain,
							status: e.response.status
						},
						'Failed to validate domain and token'
					);

					if (e.response.status === 401) {
						code = 'UNAUTHENTICATED';
					}
				} else {
					// We didn't get a valid Gitlab URL; or perhaps their network doesn't work
					logger.error(
						{
							error: e.message,
							domain,
							status: 400
						},
						'Failed to validate domain and token'
					);

					code = 'BAD_REQUEST';
				}

				return {
					error: code
				};
			}
		},

		/**
		 * Updates the indicated connection's axios instance to allow for a different rate limit
		 *
		 * @param {Int} index - the index of the connection we want to update
		 * @param {Object} opts - an object containing the rate limit options we want to set, per https://www.npmjs.com/package/axios-rate-limit#usage
		 */
		updateAxiosOptions(index, opts) {
			const conn = this.allConnections[index];

			if (conn && conn.axios) {
				conn.axios.setRateLimitOptions(opts);
			} else if (conn && !conn.axios) {
				// ...what?
				conn.axios = rateLimit(axios.create(), cloneObj(DEFAULT_RATE_LIMITS));
			}
		},

		/**
		 * Attempts to load all previously defined connections from local storage
		 */
		loadStoredConns() {
			const connStr = window.localStorage.getItem(STORED_CONNECTIONS);

			if (connStr) {
				const storedConns = JSON.parse(connStr);

				// Initialize these stored connections correctly on an individual basis
				for (const conn of storedConns) {
					this.setConnection(conn);
				}
			}
		},

		/**
		 * Wipes everything out that we have available directly through our props
		 */
		clearAll() {
			const dataClone = cloneObj(connectionData);
			for (const prop of Object.keys(dataClone)) {
				this.$set(this, prop, dataClone[prop]);
			}
		}
	},
	created() {
		// Load stored connections
		this.loadStoredConns();
	}
});

export default Connection;
