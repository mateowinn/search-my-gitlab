const routes = [
	{
		path: '/',
		component: () => import('layouts/MainLayout.vue'),
		children: [
			{ path: ':domain', component: () => import('src/pages/Home/Index.vue') },
			{ path: '', component: () => import('src/pages/Home/Index.vue') }
		]
	},

	// Always leave this as last one,
	// but you can also remove it
	{
		path: '*',
		component: () => import('src/pages/404/Index.vue')
	}
];

export default routes;
