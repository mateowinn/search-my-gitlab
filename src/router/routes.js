const routes = [
	// About page. It's at the top because the Home page uses dynamic path parameters.
	{
		path: '/about',
		component: () => import('layouts/MainLayout.vue'),
		children: [{ path: '', component: () => import('src/pages/About/index.vue') }]
	},

	// The main route for searching and adding connections
	{
		path: '/',
		component: () => import('layouts/MainLayout.vue'),
		children: [
			{ path: ':domain', component: () => import('src/pages/Home/index.vue') },
			{ path: '', component: () => import('src/pages/Home/index.vue') }
		]
	},

	// Always leave this as last one!
	{
		path: '*',
		component: () => import('src/pages/404/index.vue')
	}
];

export default routes;
