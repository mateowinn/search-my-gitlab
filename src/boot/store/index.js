import Vue from 'vue';

import Connection from 'src/store/Connection';
import Group from 'src/store/Group';
import Project from 'src/store/Project';

Vue.prototype.$store = {
	Connection,
	Group,
	Project
};

// Also export a convenience function for removing all store data when we want to
export const wipeData = () => {
	Object.keys(Vue.prototype.$store).forEach((storeName) => {
		if (Vue.prototype.$store[storeName].clearAll) {
			Vue.prototype.$store[storeName].clearAll();
		}
	});
};
