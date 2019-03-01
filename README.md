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

⚠️ Change the version in the quasar.conf.js file

`$ quasar build -m cordova -T android`

Sign the apk
```
$ cd src-cordova\platforms\android\app\build\outputs\apk\release
  $ keytool -genkey -v -keystore graaly-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-alias
$ jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore graaly-key.jks app-release-unsigned.apk my-alias
$ rm graaly.apk
$ E:\logiciels\Android\sdk\build-tools\26.0.2\zipalign -v 4 app-release-unsigned.apk graaly.apk
```

# Publish the app

## Android app

Open https://play.google.com/apps/publish/?account=5104428642488176820#ManageReleaseTrackPlace:p=com.graaly.app&appid=4972151247150188990&releaseTrackId=4700787750850651322

Create a new version by uploading the apk signed file

## iPhone app

Open console / terminal in the *webapp* folder

quasar build -m cordova -T ios

Open the xproj file

Build and Archive the app (select Generic iOS Device to archive), then deploy it

If any issue with certificate, or provisioning profile, generate a new certificate, or provisioning profile on https://developer.apple.com/account/ios/profile/production/edit/44CLFUHY8J
(⚠️ the current provisioning profile works with 3/11/2018 certificate)

Account to test the app : graaly / Gr44lY43v3r

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

## With Chrome Desktop & Hybrid App

On the Android smartphone:

* [Enable USB debugging](https://developer.android.com/studio/debug/dev-options)
* Connect your smartphone to your computer (desktop, laptop...)
* CONNECT PC that build the app AND THE MOBILE ON THE SAME WIFI NETWORK (PC will start a server to run the webapp that will be opened by the mobile, so PC must be reacheable by mobile)
* If something does not work, disable antivirus & windows defender

On your computer:

* change the SERVER_URL in webapp/config/dev.env.js
* Launch in windows console : quasar dev -m cordova -T android
* Open Chrome browser
* Press F12 to load developer tools
* In the top right corner of the developer tools window/pane, click on the three vertically aligned dots > More tools > Remote devices
* A new tab **Remote devices** should appear
* In this tab, your smartphone should be listed in the left column list, click on it
* In the right column, Graaly URL should appear. Click on the button "Inspect" next to the URL.

If the app run as HTTP rather than HTTPS, follow this fix :  https://forum.quasar-framework.org/topic/2279/https-dev-server-with-cordova/5

Now you should be able to view what is displayed on your smartphone in Chrome Desktop.
Visible console output is related to the activity on the Android Chrome browser of the smartphone.

## Enable HTTPS on dev environment

Use utility [**mkcert**](https://github.com/FiloSottile/mkcert). It allows to easily create a custom Certification Authority, generate certificates for any IP/domain, and make all your dev devices trust them.

# Testing

* [Ways to economically test your apps on a range of devices](https://www.androidauthority.com/test-your-apps-607217/)

* [Android devices distribution dashboard](https://developer.android.com/about/dashboards/)

* [Top devices for testing Android apps](https://bugfender.com/blog/top-devices-testing-android-apps/)

* Graaly currently supports devices with Android version >= 4.4

* Online services for testing on real devices:
** [Google Firebase Test Lab](https://firebase.google.com/docs/test-lab/) (maybe for native Android apps only)
** [Saucelabs mobile app testing](https://saucelabs.com/products/mobile-app-testing) (paid service)

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

# COMMON ISSUES

## Build unsuccessfull . Error message `Failed to execute aapt` 

Add in the `allprojects` section of the `/src-cordova/platforms/android/build.gradle` file : 

    configurations.all {
        resolutionStrategy {
            force 'com.android.support:support-v4:27.1.0'
        }
    }
