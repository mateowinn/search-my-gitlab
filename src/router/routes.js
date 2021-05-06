const routes = [
	// About page. It's at the top because the Home page uses dynamic path parameters.
	{
		path: '/about',
		component: () => import('layouts/MainLayout.vue'),
		children: [{ path: '', component: () => import('src/pages/About/Index.vue') }]
	},

	// The main route for searching and adding connections
	{
		path: '/',
		component: () => import('layouts/MainLayout.vue'),
		children: [
			{ path: ':domain', component: () => import('src/pages/Home/Index.vue') },
			{ path: '', component: () => import('src/pages/Home/Index.vue') }
		]
	},

	// Always leave this as last one!
	{
		path: '*',
		component: () => import('src/pages/404/Index.vue')
	}
];

export default routes;
