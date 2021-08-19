/**
 * A function to return a logger instance that controls which logs actually get output to console depending on what environment we're in.
 * @returns Logger
 */
function createLogger() {
	return {
		debug(...args) {
			// We don't really want to print debug logs in production
			if (!window.location.origin.includes('searchmygitlab.com')) {
				console.debug(...args);
			}
		},
		info(...args) {
			console.log(...args);
		},
		warn(...args) {
			console.warn(...args);
		},
		error(...args) {
			console.error(...args);
		}
	};
}

export default createLogger();
