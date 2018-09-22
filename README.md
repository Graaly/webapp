# Graaly Web App

## Build Setup

``` bash
# install dependencies
$ npm install

# install quasar cli
$ npm install -g quasar-cli

# serve with hot reload at localhost:8081, as progressive web app
$ quasar dev -m pwa

# build for production with minification
$ quasar build -m pwa

# lint code
$ quasar lint
```

## Known issues

If no data from server is shown on webapp on Chrome (desktop or mobile), try to load `https://<server-address>:3000` on a new browser tab, bypass the warning by clicking on "advanced settings", then "continue to site (dangerous)". Then, data from server should be loaded when accessing `https://<server-address>:8081`.

## Build native app

# Android app

Open console / terminal in the *webapp* folder

Build the unsigned apk file
$ quasar build -m cordova -T android

Sign the apk
$ cd src-cordova\platforms\android\app\build\outputs\apk\release
$ keytool -genkey -v -keystore graaly-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-alias
$ jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore graaly-key.jks app-release-unsigned.apk my-alias
$ E:\logiciels\Android\sdk\build-tools\26.0.2\zipalign -v 4 app-release-unsigned.apk graaly001.apk