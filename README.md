# Search My Gitlab (search-my-gitlab)

An interface for searching all of your Gitlab repositories at once, since this is a feature not available in standard Gitlab.

## Install the dependencies

```bash
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```

### Lint the files

```bash
npm run lint
```

### Build the app for production

```bash
quasar build
```

### Customize the configuration

See [Configuring quasar.conf.js](https://v1.quasar.dev/quasar-cli/quasar-conf-js).

## TODOs

### Priorities

-   Tie show archived projects to URL parameter
-   Break down components to be even more modular
-   Add search history feature
-   Add "advanced search" options for specifying file extension or path (including filename)
-   Build in rate limiting (default: 300 requests per minute/10 requests per second)
-   Flesh out README
-   Finish tests, of course
-   Sync credentials between clients through login?

### Nice-to-Haves

-   Add a help icon that loads tips about how best to utilize the tool?
-   Upgrade 404 page with gifs
-   Allow domain tabs to be configurable in their order
-   Add feature to search out differences between branches in repositories
