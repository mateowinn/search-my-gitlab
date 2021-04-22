/**
 * A recursive function that accepts an object (or even array) and returns a deep clone of it. Very helpful for making sure that all values are independent, with no memory pointers.
 *
 * @param {Object} obj - the JS object (or potentially, array) that you want deep cloned
 * @returns {Object} - your deep clone, sir
 */
export default function cloneObj(obj) {
	// If this isn't something we can iterate on, obviously we're not going to deal with it
	if (!obj) {
		return obj;
	}

	// Iterate over every value in the object/array
	const clone = Array.isArray(obj) ? [] : {};
	for (const i in obj) {
		const val = obj[i];

		// If this property value is a primitive, then we can copy it without worry
		// If it's an array or object itself, however, copying it over directly will just copy pointers; we must get down to the primitives
		clone[i] = typeof val === 'object' ? cloneObj(val) : val;
	}

	return clone;
}
