<template>
	<div id="q-app">
		<router-view />
	</div>
</template>

<script>
import logger from 'utilities/logger';

export default {
	name: 'App',
	created() {
		logger.info('Running app version', process.env.PACKAGE_VERSION);
	}
};
</script>
