import Vue from 'vue';
import cloneObj from 'utilities/cloneObj';
import ApolloClient from 'apollo-boost';

// Our Group data definitions
const clientData = {
	allClients: {}
};

const Client = new Vue({
	data() {
		return cloneObj(clientData);
	},
	computed: {
		/**
		 * Gets a list of Groups from the specified server and key
		 *
		 * @returns {Array} - a list of groups from the specified connection. Undefined if that connection's groups haven't been fetched yet.
		 */
		client() {
			return (conn) => {
				if (!this.allClients[conn.index]) {
					const client = new ApolloClient({
						uri: `${conn.domain}/api/graphql`,
						headers: {
							Authorization: `Bearer ${conn.token}`
						}
					});

					this.$set(this.allClients, conn.index, client);
				}

				// Return whatever we have right now
				return this.allClients[conn.index];
			};
		}
	},
	methods: {
		/**
		 * Simply removes the indicated Apollo client from our running list
		 *
		 * @param {String|Int} index
		 */
		deleteClient(index) {
			this.$delete(this.allClients, index);
		},

		/**
		 * Wipes everything out that we have available directly through our props
		 */
		clearAll() {
			const dataClone = cloneObj(clientData);
			for (const prop of Object.keys(dataClone)) {
				this.$set(this, prop, dataClone[prop]);
			}
		}
	}
});

export default Client;
