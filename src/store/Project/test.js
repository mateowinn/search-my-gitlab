// Mock our env vars
process.env.ASSET_URL = 'https://google.com/';

// Don't mock Vue so that we can actually test this module
jest.dontMock('vue');

// Auto-mock our logger
jest.mock('client-logger');
const logger = require('client-logger');

// Mock our queries and mutations - just mock them with strings
jest.setMock('queries/getPaginatedAssets.gql', 'getPaginatedAssets');
jest.setMock('mutations/deleteAsset.gql', 'deleteAsset');
jest.setMock('mutations/uploadAsset.gql', 'uploadAsset');

const GET_PAGINATED_ASSETS = require('queries/getPaginatedAssets.gql');
const DELETE_ASSET = require('mutations/deleteAsset.gql');
const UPLOAD_ASSET = require('mutations/uploadAsset.gql');

// Mock our Apollo module
jest.setMock('boot/apollo', require('boot/apollo/mock'));
const { apolloProvider } = require('boot/apollo');
const apollo = apolloProvider.defaultClient;

// Our event bus
const EventBus = require('core-commons/utilities/client/eventBus');
EventBus.$on = jest.spyOn(EventBus, '$on');
EventBus.$emit = jest.spyOn(EventBus, '$emit');

// Mock Quasar notify
jest.setMock('quasar', {
	Notify: {
		create: jest.fn()
	}
});
const { Notify } = require('quasar');

// Mock the getUserByUsername and currentUser functionality on the window object
global.window = Object.create(window);
Object.defineProperty(window, 'getUserByUsername', {
	value: jest.fn(async () => {
		return {
			fullName: 'Cranjis McBasketball'
		};
	})
});
Object.defineProperty(window, 'currentUser', {
	value: {
		username: 'ssurfer',
		fullName: 'Silver Surfer'
	}
});

// A utility for testing asynchronously
const immediatePromise = require('core-commons/utilities/immediatePromise');

describe('store MediaAsset', () => {
	const MediaAsset = require('./index').default;

	// Spy on Vue methods
	MediaAsset.$set = jest.spyOn(MediaAsset, '$set');
	MediaAsset.$delete = jest.spyOn(MediaAsset, '$delete');

	// Clean up our working env for every test
	beforeEach(() => {
		MediaAsset.clearAll();
	});

	// Each "it" represents a test of some individual piece of the module's functionality
	it('should have registered for real-time updates using our EventBus', async (done) => {
		try {
			expect(EventBus.$on).lastCalledWith('media-asset', MediaAsset.subscriptionHandler);

			done();
		} catch (e) {
			done(e);
		}
	});

	describe('computed assets', () => {
		it('should fetch an array of assets (plus metadata) for an indicated page from Apollo and populate our assets list if we do not already have the entry', async (done) => {
			// Prepare our mock params
			const page = 0;

			try {
				const result = MediaAsset.assets(page);

				// See that everything was done according to plan
				expect(result).toBeUndefined(); // This first time around, we'll return nothing fetched, but it will reactively update afterwards
				expect(apollo.query).lastCalledWith({
					query: GET_PAGINATED_ASSETS,
					variables: {
						page
					}
				});

				// Wait for it to process and check that our data was updated
				await immediatePromise();

				const firstEntry = {
					id: 1,
					name: 'Mario.jpg',
					guid: 'lkjsdf-Mario.jpg',
					created_by_user_id: 1,
					readPermissions: JSON.stringify(['Anyone']),
					updatePermissions: JSON.stringify(['Sure, Go Ahead']),
					deletePermissions: JSON.stringify(['Sure, Go Ahead']),
					created_on: '2019-09-02T21:00:00.000Z',
					updated_on: '2019-09-02T21:00:00.000Z',
					deleted_on: '2019-09-09T21:00:00.000Z',
					deleted_by: 1
				};
				expect(MediaAsset.allMediaAssets[0].pageNum).toBe(0);
				expect(MediaAsset.allMediaAssets[0].totalCount).toBe(14);
				expect(MediaAsset.allMediaAssets[0].assets[0]).toEqual(firstEntry);
				expect(MediaAsset.assets(page).pageNum).toBe(0);
				expect(MediaAsset.assets(page).totalCount).toBe(14);
				expect(MediaAsset.assets(page).assets[0]).toEqual(firstEntry);

				done();
			} catch (e) {
				done(e);
			}
		});

		it('should simply return the specified page of assets if we have already fetched it', async (done) => {
			// Prepare our mock params and setting
			const page = 1;
			const asset = {
				id: 11,
				name: 'Fox.jpg',
				guid: 'dfhfhj-Fox.jpg',
				created_by_user_id: 1,
				readPermissions: JSON.stringify(['Anyone']),
				updatePermissions: JSON.stringify(['Sure, Go Ahead']),
				deletePermissions: JSON.stringify(['Sure, Go Ahead']),
				created_on: '2019-09-09T21:00:00.000Z',
				updated_on: '2019-09-09T21:00:00.000Z',
				deleted_on: null,
				deleted_by: null
			};
			MediaAsset.$set(MediaAsset.allMediaAssets, page, { pageNum: page, totalCount: 14, assets: [asset] });

			try {
				const result = MediaAsset.assets(page);

				// Did we get it?
				expect(result).toEqual({ pageNum: page, totalCount: 14, assets: [asset] });

				done();
			} catch (e) {
				done(e);
			}
		});

		it('should just return undefined if we have not fetched the requested community yet', async (done) => {
			try {
				const result = MediaAsset.assets(0);

				expect(result).toBeUndefined();

				done();
			} catch (e) {
				done(e);
			}
		});

		it('should log an error if the request goes wrong', async (done) => {
			const page = 66;

			try {
				const result = MediaAsset.assets(page);
				expect(result).toBeUndefined();

				// Wait for the whole thing to finish
				await immediatePromise();

				// And we should have logged it
				expect(logger.error).lastCalledWith(
					{ error: { message: 'What are you smoking?', code: 'NOT_FOUND', props: { msg: 'Never existed' } }, page },
					'Failed to get assets by page'
				);

				done();
			} catch (e) {
				done(e);
			}
		});
	});

	describe('method refreshLastPage', () => {
		it('should clear the cache of the last page of assets to make way for a fresh fetch', async (done) => {
			// Set up the mocked prior conditions
			MediaAsset.$set(MediaAsset, 'allMediaAssets', { 0: {}, 1: {}, 200: {} });

			try {
				MediaAsset.refreshLastPage();

				// The last entry in the assets list should be gone
				expect(MediaAsset.allMediaAssets).toEqual({ 0: {}, 1: {} });

				done();
			} catch (e) {
				done(e);
			}
		});
	});

	describe('method uploadAsset', () => {
		it('should upload the file through Apollo and refresh the last page of assets', async (done) => {
			try {
				// Mock file params
				const file = {
					name: 'kaPOW.jpg'
				};

				const result = await MediaAsset.uploadAsset(file);

				// Should get the saved asset back
				expect(result.data).toEqual({
					...file,
					id: 10
				});

				// Make sure we called Apollo correctly
				expect(apollo.mutate).lastCalledWith({
					mutation: UPLOAD_ASSET,
					variables: { asset: file }
				});

				done();
			} catch (e) {
				done(e);
			}
		});

		it('should log and return an error when the upload fails', async (done) => {
			// Prepare our mock params
			const file = {
				name: 'fail'
			};

			try {
				const result = await MediaAsset.uploadAsset(file);

				// Our expected formatted error
				const formatted = {
					error: {
						code: 'YOU_DEAD',
						message: 'Wipe yourself off',
						props: {
							msg: 'Bang'
						}
					}
				};

				// This should be the return result and the logged error
				expect(result).toEqual(formatted);
				expect(logger.error).lastCalledWith({ error: formatted.error, ...file }, 'Failed to upload asset');

				done();
			} catch (e) {
				done(e);
			}
		});
	});

	describe('method deleteAsset', () => {
		it('should delete the specified asset through Apollo purge our list in preparation for refetching', async (done) => {
			// Prepare our mock params and setup
			const assetId = 2;
			MediaAsset.$set(MediaAsset, 'allMediaAssets', { 0: { pageNum: 0, totalCount: 500, assets: [{ id: assetId, name: 'Gonzo.jpg' }] } });

			try {
				const result = await MediaAsset.deleteAsset(assetId);

				// See that everything was done according to plan
				expect(result).toEqual({
					data: {
						assetId
					}
				});

				// Apollo called correctly
				expect(apollo.mutate).lastCalledWith({
					mutation: DELETE_ASSET,
					variables: {
						assetId
					}
				});

				// Our assets list purged
				expect(MediaAsset.allMediaAssets).toEqual({});

				done();
			} catch (e) {
				done(e);
			}
		});

		it('should log and return a formatted error when the mutation fails', async (done) => {
			// Prepare our mock params
			const assetId = 'fail';

			try {
				const result = await MediaAsset.deleteAsset(assetId);

				// Our expected formatted error
				const formatted = {
					error: {
						code: 'YOU_DEAD',
						message: 'Wipe yourself off',
						props: {
							msg: 'Bang'
						}
					}
				};

				// This should be the return result and the logged error
				expect(result).toEqual(formatted);
				expect(logger.error).lastCalledWith({ error: formatted.error, assetId }, 'Failed to delete asset');

				done();
			} catch (e) {
				done(e);
			}
		});
	});

	describe('method subscriptionHandler', () => {
		it('should purge the last page of our cache and create a notification for the user if it is a create action', async (done) => {
			// Set up the mocked prior conditions
			MediaAsset.$set(MediaAsset, 'allMediaAssets', { 0: {}, 1: {}, 200: {} });

			// Create a mock payload that will be for a newly uploaded asset
			const payload = {
				action: 'create',
				guid: 'asdfghjkl',
				username: 'cmcbasketball'
			};

			try {
				await MediaAsset.subscriptionHandler({ payload });

				// The last entry in the assets list should be gone
				expect(MediaAsset.allMediaAssets).toEqual({ 0: {}, 1: {} });

				// The user should have gotten a notification
				expect(Notify.create).lastCalledWith({
					message: `A new <a target="_blank" href="${process.env.ASSET_URL}${payload.guid}" style="text-decoration:underline;">media asset</a> was uploaded by Cranjis McBasketball`,
					html: true,
					position: 'top-right',
					progress: true
				});

				done();
			} catch (e) {
				done(e);
			}
		});

		it('should simply create a notification for the user if it is a delete action', async (done) => {
			// Create a mock payload that will be for a newly uploaded asset
			const payload = {
				action: 'delete',
				guid: 'poiuytrewq',
				username: 'cmcbasketball'
			};

			try {
				await MediaAsset.subscriptionHandler({ payload });

				// The user should have gotten a notification
				expect(Notify.create).lastCalledWith({
					message: `A <a target="_blank" href="${process.env.ASSET_URL}${payload.guid}" style="text-decoration:underline;">media asset</a> was marked as deleted by Cranjis McBasketball`,
					html: true,
					position: 'top-right',
					progress: true
				});

				done();
			} catch (e) {
				done(e);
			}
		});
	});

	describe('method clearAll', () => {
		it('should reset our in-memory props', async (done) => {
			try {
				// First, set some data
				const allMediaAssets = {
					1: {
						assets: [
							{
								id: 1,
								name: 'Mario.jpg',
								guid: 'lkjsdf-Mario.jpg',
								created_by_user_id: 1,
								readPermissions: JSON.stringify(['Anyone']),
								updatePermissions: JSON.stringify(['Sure, Go Ahead']),
								deletePermissions: JSON.stringify(['Sure, Go Ahead']),
								created_on: '2019-09-02T21:00:00.000Z',
								updated_on: '2019-09-02T21:00:00.000Z',
								deleted_on: '2019-09-09T21:00:00.000Z',
								deleted_by: 1
							}
						]
					}
				};
				const rowsNum = 6000;
				MediaAsset.$set(MediaAsset, 'allMediaAssets', allMediaAssets);
				MediaAsset.$set(MediaAsset, 'rowsNumber', rowsNum);

				// Make sure we actually set the data
				expect(MediaAsset.allMediaAssets).toEqual(allMediaAssets);
				expect(MediaAsset.rowsNumber).toEqual(rowsNum);

				// Now clear it
				MediaAsset.clearAll();

				// See that everything was wiped
				expect(MediaAsset.allMediaAssets).toEqual({});
				expect(MediaAsset.rowsNumber).toEqual(0);

				done();
			} catch (e) {
				done(e);
			}
		});
	});
});
