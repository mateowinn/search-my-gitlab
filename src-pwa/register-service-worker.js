import { register } from 'register-service-worker';
import { Notify } from 'quasar';

// The ready(), registered(), cached(), updatefound() and updated()
// events passes a ServiceWorkerRegistration instance in their arguments.
// ServiceWorkerRegistration: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration

register(process.env.SERVICE_WORKER_FILE, {
	// The registrationOptions object will be passed as the second argument
	// to ServiceWorkerContainer.register()
	// https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#Parameter

	// registrationOptions: { scope: './' },

	ready(/* registration */) {
		// console.log('Service worker is active.')
	},

	registered(/* registration */) {
		// console.log('Service worker has been registered.')
	},

	cached(/* registration */) {
		// console.log('Content has been cached for offline use.')
	},

	updatefound(/* registration */) {
		// console.log('New content is downloading.')
	},

	updated(/* registration */) {
		Notify.create({
			message: 'We just found some upgrades for you! Refresh to load them.',
			type: 'info',
			color: 'accent',
			position: 'top',
			timeout: 15000,
			// A refresh button
			actions: [
				{
					label: 'Refresh',
					color: 'white',
					handler: () => {
						// Reload the window and changes for the user
						window.location.reload();
					}
				}
			]
		});

		console.log('Updates found and downloaded');
	},

	offline() {
		// console.log('No internet connection found. App is running in offline mode.')
	},

	error(/* err */) {
		// console.error('Error during service worker registration:', err)
	}
});
