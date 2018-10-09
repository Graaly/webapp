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

# Build native app

## Android app

Open console / terminal in the *webapp* folder

Build the unsigned apk file

`$ quasar build -m cordova -T android`

Sign the apk
```
$ cd src-cordova\platforms\android\app\build\outputs\apk\release
$ keytool -genkey -v -keystore graaly-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-alias
$ jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore graaly-key.jks app-release-unsigned.apk my-alias
$ E:\logiciels\Android\sdk\build-tools\26.0.2\zipalign -v 4 app-release-unsigned.apk graaly001.apk
```

# Debug web app

## With Chrome Desktop & Chrome Android

On the Android smartphone:

* [Enable USB debugging](https://developer.android.com/studio/debug/dev-options)
* Open Chrome browser & load Graaly
* Connect your smartphone to your computer (desktop, laptop...)

On your computer:

* Open Chrome browser
* Press F12 to load developer tools
* In the top right corner of the developer tools window/pane, click on the three vertically aligned dots > More tools > Remote devices
* A new tab **Remote devices** should appear
* In this tab, your smartphone should be listed in the left column list, click on it
* In the right column, Graaly URL should appear. Click on the button "Inspect" next to the URL.

Now you should be able to view what is displayed on your smartphone in Chrome Desktop.
Visible console output is related to the activity on the Android Chrome browser of the smartphone.


# Technical specs

`step.answers` types, depending on `step.type` value:

* for *choose*, array of objects `{ text: <String>, isRightAnswer: <bool> }` (for text)
                             or `{ imagePath: <String>, isRightAnswer: <bool> }` (for images)
* for *code*, a `Number`
* for *image-recognition*, a `String` (path of the image to recognize)
* for *geolocation*, a position object `{ lat: Number, lng: Number }`
* for *write-text*, a `String`
* for *new-item*, a `String` (item code)
* for *find-item* and *use-item*, an object `{ coordinates: { top: <Number 0-100>, left: <Number 0-100> }, item: <String> }`
