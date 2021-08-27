import { uid } from 'quasar';

export default {
	logEvent(category, action, label, value) {
		window.dataLayer.push({
			event: 'customEvent',
			category: category,
			action: action,
			label: label,
			value: value,
			cid: this.getCid()
		});
	},

	logPage(path, name) {
		// Here you can preprocess the path, if needed
		window.dataLayer.push({
			event: 'customPageView',
			path: path,
			name: name,
			cid: this.getCid()
		});
	},

	getCid() {
		// We need an unique identifier for this session
		// We store it in a localStorage, but you may use cookies, too
		if (!window.localStorage.getItem('cid')) {
			window.localStorage.setItem('cid', uid());
		}
		return window.localStorage.getItem('cid');
	}
};
