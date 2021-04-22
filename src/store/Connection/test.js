// Don't mock Vue so that we can actually test this module
jest.dontMock('vue');

// Auto-mock our logger
// jest.mock('client-logger');
// const logger = require('client-logger');

// Mock our Axios connection
jest.mock('axios');

// A utility for testing asynchronously
const immediatePromise = require('utilities/immediatePromise');

describe('store Group', () => {
	const Group = require('./index').default;

	// Spy on Vue methods
	Group.$set = jest.spyOn(Group, '$set');
	Group.$delete = jest.spyOn(Group, '$delete');

	// Clean up our working env for every test
	beforeEach(() => {
		Group.clearAll();
	});

	it('should write tests', (done) => {
		done();
	});

	// Each "it" represents a test of some individual piece of the module's functionality
	// describe('computed groups', () => {
	// 	it('should fetch an array of assets (plus metadata) for an indicated page from Apollo and populate our assets list if we do not already have the entry', async (done) => {
	// 		// Prepare our mock params
	// 		const page = 0;

	// 		try {
	// 			const result = Group.assets(page);

	// 			// See that everything was done according to plan
	// 			expect(result).toBeUndefined(); // This first time around, we'll return nothing fetched, but it will reactively update afterwards
	// 			expect(apollo.query).lastCalledWith({
	// 				query: GET_PAGINATED_ASSETS,
	// 				variables: {
	// 					page
	// 				}
	// 			});

	// 			// Wait for it to process and check that our data was updated
	// 			await immediatePromise();

	// 			const firstEntry = {
	// 				id: 1,
	// 				name: 'Mario.jpg',
	// 				guid: 'lkjsdf-Mario.jpg',
	// 				created_by_user_id: 1,
	// 				readPermissions: JSON.stringify(['Anyone']),
	// 				updatePermissions: JSON.stringify(['Sure, Go Ahead']),
	// 				deletePermissions: JSON.stringify(['Sure, Go Ahead']),
	// 				created_on: '2019-09-02T21:00:00.000Z',
	// 				updated_on: '2019-09-02T21:00:00.000Z',
	// 				deleted_on: '2019-09-09T21:00:00.000Z',
	// 				deleted_by: 1
	// 			};
	// 			expect(Group.allMediaAssets[0].pageNum).toBe(0);
	// 			expect(Group.allMediaAssets[0].totalCount).toBe(14);
	// 			expect(Group.allMediaAssets[0].assets[0]).toEqual(firstEntry);
	// 			expect(Group.assets(page).pageNum).toBe(0);
	// 			expect(Group.assets(page).totalCount).toBe(14);
	// 			expect(Group.assets(page).assets[0]).toEqual(firstEntry);

	// 			done();
	// 		} catch (e) {
	// 			done(e);
	// 		}
	// 	});

	// 	it('should simply return the specified page of assets if we have already fetched it', async (done) => {
	// 		// Prepare our mock params and setting
	// 		const page = 1;
	// 		const asset = {
	// 			id: 11,
	// 			name: 'Fox.jpg',
	// 			guid: 'dfhfhj-Fox.jpg',
	// 			created_by_user_id: 1,
	// 			readPermissions: JSON.stringify(['Anyone']),
	// 			updatePermissions: JSON.stringify(['Sure, Go Ahead']),
	// 			deletePermissions: JSON.stringify(['Sure, Go Ahead']),
	// 			created_on: '2019-09-09T21:00:00.000Z',
	// 			updated_on: '2019-09-09T21:00:00.000Z',
	// 			deleted_on: null,
	// 			deleted_by: null
	// 		};
	// 		Group.$set(Group.allMediaAssets, page, {
	// 			pageNum: page,
	// 			totalCount: 14,
	// 			assets: [asset]
	// 		});

	// 		try {
	// 			const result = Group.assets(page);

	// 			// Did we get it?
	// 			expect(result).toEqual({
	// 				pageNum: page,
	// 				totalCount: 14,
	// 				assets: [asset]
	// 			});

	// 			done();
	// 		} catch (e) {
	// 			done(e);
	// 		}
	// 	});

	// 	it('should just return undefined if we have not fetched the requested community yet', async (done) => {
	// 		try {
	// 			const result = Group.assets(0);

	// 			expect(result).toBeUndefined();

	// 			done();
	// 		} catch (e) {
	// 			done(e);
	// 		}
	// 	});

	// 	it('should log an error if the request goes wrong', async (done) => {
	// 		const page = 66;

	// 		try {
	// 			const result = Group.assets(page);
	// 			expect(result).toBeUndefined();

	// 			// Wait for the whole thing to finish
	// 			await immediatePromise();

	// 			// And we should have logged it
	// 			expect(logger.error).lastCalledWith(
	// 				{
	// 					error: {
	// 						message: 'What are you smoking?',
	// 						code: 'NOT_FOUND',
	// 						props: { msg: 'Never existed' }
	// 					},
	// 					page
	// 				},
	// 				'Failed to get assets by page'
	// 			);

	// 			done();
	// 		} catch (e) {
	// 			done(e);
	// 		}
	// 	});
	// });

	// describe('method clearAll', () => {
	// 	it('should reset our in-memory props', async (done) => {
	// 		try {
	// 			// First, set some data
	// 			const allMediaAssets = {
	// 				1: {
	// 					assets: [
	// 						{
	// 							id: 1,
	// 							name: 'Mario.jpg',
	// 							guid: 'lkjsdf-Mario.jpg',
	// 							created_by_user_id: 1,
	// 							readPermissions: JSON.stringify(['Anyone']),
	// 							updatePermissions: JSON.stringify([
	// 								'Sure, Go Ahead'
	// 							]),
	// 							deletePermissions: JSON.stringify([
	// 								'Sure, Go Ahead'
	// 							]),
	// 							created_on: '2019-09-02T21:00:00.000Z',
	// 							updated_on: '2019-09-02T21:00:00.000Z',
	// 							deleted_on: '2019-09-09T21:00:00.000Z',
	// 							deleted_by: 1
	// 						}
	// 					]
	// 				}
	// 			};
	// 			const rowsNum = 6000;
	// 			Group.$set(Group, 'allMediaAssets', allMediaAssets);
	// 			Group.$set(Group, 'rowsNumber', rowsNum);

	// 			// Make sure we actually set the data
	// 			expect(Group.allMediaAssets).toEqual(allMediaAssets);
	// 			expect(Group.rowsNumber).toEqual(rowsNum);

	// 			// Now clear it
	// 			Group.clearAll();

	// 			// See that everything was wiped
	// 			expect(Group.allMediaAssets).toEqual({});
	// 			expect(Group.rowsNumber).toEqual(0);

	// 			done();
	// 		} catch (e) {
	// 			done(e);
	// 		}
	// 	});
	// });
});
