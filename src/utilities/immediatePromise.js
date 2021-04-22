/* istanbul ignore file */

/**
 * Just a wrapper that makes it easy to treat `setImmediate` like a regular Promise or async function. Useful for when you want to use `setImmediate` without callbacks - essentially just pause execution of your function temporarily.
 *
 * @param {Int} millis - the number of milliseconds you want to pause for
 */
function timeoutPromise(millis) {
	return new Promise((resolve) => setTimeout(resolve, millis));
}

module.exports = timeoutPromise;
