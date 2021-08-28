const routes = [
	// These are at the top because the Home page uses dynamic path parameters.
	// About page
	{
		path: '/about',
		component: () => import('layouts/MainLayout.vue'),
		children: [{ name: 'About', path: '', component: () => import('src/pages/About/index.vue') }]
	},

	// Privacy Policy page
	{
		path: '/privacy',
		component: () => import('layouts/MainLayout.vue'),
		children: [{ name: 'Privacy', path: '', component: () => import('src/pages/Privacy/index.vue') }]
	},

	// Terms & Conditions page
	{
		path: '/terms',
		component: () => import('layouts/MainLayout.vue'),
		children: [{ name: 'Terms', path: '', component: () => import('src/pages/Terms/index.vue') }]
	},

	// The main route for searching and adding connections
	{
		path: '/search',
		component: () => import('layouts/MainLayout.vue'),
		children: [
			{ path: ':domain', component: () => import('src/pages/Home/index.vue') },
			{ name: 'Search', path: '', component: () => import('src/pages/Home/index.vue') }
		]
	},

	// In case they go to root
	{
		path: '/',
		redirect: { name: 'Search' }
	},

	// Always leave this as last one!
	{
		path: '*',
		component: () => import('src/pages/404/index.vue')
	}
];

export default routes;
