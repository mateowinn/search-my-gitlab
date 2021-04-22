// Mock all of the imported stores
jest.setMock('src/store/Connection', require('src/store/Connection/mock'));
const Connection = require('src/store/Connection').default;
jest.setMock('src/store/Group', require('src/store/Group/mock'));
const Group = require('src/store/Group').default;
jest.setMock('src/store/Project', require('src/store/Project/mock'));
const Project = require('src/store/Project').default;

// A current list of all store modules we have
const allStores = {
	Connection,
	Group,
	Project
};

// Mock the Vue module
jest.mock('vue');
const Vue = require('vue');

// Group the tests of this module into a single "describe" function
describe('boot store', () => {
	const { wipeData } = require('./index');

	it('should register all store modules onto the Vue prototype under $store', (done) => {
		try {
			// Test that the modules were installed as expected
			expect(Vue.prototype.$store).toEqual(allStores);

			done();
		} catch (e) {
			done(e);
		}
	});

	it('should provide a convenience function for wiping the data of all local stores', (done) => {
		try {
			// Invoke the wipeData method
			wipeData();

			// Now check that we actually called clearAll in all of the stores
			Object.keys(allStores).forEach((storeName) => {
				if (allStores[storeName].clearAll) {
					expect(allStores[storeName].clearAll).toHaveBeenCalled();
				}
			});

			done();
		} catch (e) {
			done(e);
		}
	});
});
