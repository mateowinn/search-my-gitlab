// Import our module to test without mocking it
jest.dontMock('./index');
const cloneObj = require('./index').default;

// Group the tests of this module into a single "describe" function
describe('utilities cloneObj', () => {
	// Each "it" represents a test of some individual piece of the module's functionality
	it('should accept a source object and return a copy of that object', async (done) => {
		// Mock the parameters to pass to the test function
		const testObj = {
			id: 1,
			role: 'admin',
			firstName: 'Cranjis',
			lastName: 'McBasketball',
			email: 'da-man@blenderbottle.com',
			password: '1234',
			ssn: '4321'
		};

		try {
			const clone = cloneObj(testObj);

			expect(clone).toEqual({
				id: 1,
				role: 'admin',
				firstName: 'Cranjis',
				lastName: 'McBasketball',
				email: 'da-man@blenderbottle.com',
				password: '1234',
				ssn: '4321'
			});

			// If I change something about the original object, the clone should not have those changes
			testObj.role = 'peon';
			expect(clone.role).toBe('admin');

			done();
		} catch (e) {
			done(e);
		}
	});

	it('should deep clone the object, meaning that mutating the source object should never affect the cloned object', async (done) => {
		// Mock the parameters to pass to the test function
		const testObj = {
			id: 1,
			contact: {
				address: {
					street: '250 E 850 S'
				}
			}
		};

		try {
			const clone = cloneObj(testObj);

			expect(clone).toEqual({
				id: 1,
				contact: {
					address: {
						street: '250 E 850 S'
					}
				}
			});

			// If I change something about the original object, the clone should not have those changes
			testObj.contact.address.street = '123 Main Street';
			expect(clone.contact.address.street).toBe('250 E 850 S');

			done();
		} catch (e) {
			done(e);
		}
	});

	it('should work with nested arrays, as well', async (done) => {
		// Mock the parameters to pass to the test function
		const testObj = {
			id: 1,
			relationships: {
				storeRoles: [
					{
						storeId: 44,
						role: 'manager'
					},
					{
						storeId: 55,
						role: 'agent'
					}
				]
			}
		};

		try {
			const clone = cloneObj(testObj);

			expect(clone).toEqual({
				id: 1,
				relationships: {
					storeRoles: [
						{
							storeId: 44,
							role: 'manager'
						},
						{
							storeId: 55,
							role: 'agent'
						}
					]
				}
			});

			// If I change something about the original object, the clone should not have those changes
			testObj.relationships.storeRoles[0].role = 'owner';
			expect(clone.relationships.storeRoles[0].role).toBe('manager');

			done();
		} catch (e) {
			done(e);
		}
	});
});
