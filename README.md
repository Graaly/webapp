# Graaly Web App

## Build Setup

``` bash
# install dependencies
$ npm install

# install quasar cli
$ npm install -g quasar-cli@0.6.5

# serve with hot reload at localhost:8081
$ quasar dev

# build for production with minification
$ quasar build

# lint code
$ quasar lint
```

## Known issues

If no data from server is shown on webapp on Chrome (desktop or mobile), try to load `https://<server-address>:3000` on a new browser tab, bypass the warning by clicking on "advanced settings", then "continue to site (dangerous)". Then, data from server should be loaded when accessing `https://<server-address>:8081`.
