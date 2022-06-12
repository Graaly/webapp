# Graaly Web App

![Graaly Build Test & Build](https://github.com/Graaly/webapp/workflows/Graaly%20Build%20Test%20&%20Build/badge.svg)

## Build Setup

``` bash
# install dependencies
$ npm install

# install quasar cli
$ npm install -g quasar-cli

# serve with hot reload at localhost:8081, as progressive web app
$ quasar dev -m pwa

# build for production with minification
$ quasar build -m pwa  (!!! build also europequest and other customers)

# lint code
$ quasar lint
```
## Table of Contents
- [Graaly Web App](#graaly-web-app)
  - [Build Setup](#build-setup)
  - [Table of Contents](#table-of-contents)
  - [Known issues](#known-issues)
  - [Build hybrid app](#build-hybrid-app)
    - [Android app](#android-app)
    - [iPhone app](#iphone-app)
  - [Debug the app](#debug-the-app)
    - [Android app](#android-app-1)
    - [iPhone app](#iphone-app-1)
  - [Publish the app](#publish-the-app)
    - [Android app](#android-app-2)
    - [iPhone app](#iphone-app-2)
  - [Debug web app](#debug-web-app)
    - [With Chrome Desktop & Chrome Android](#with-chrome-desktop--chrome-android)
    - [With Chrome Desktop & Hybrid App](#with-chrome-desktop--hybrid-app)
    - [Enable HTTPS on dev environment](#enable-https-on-dev-environment)
  - [Testing](#testing)
    - [Installing](#installing)
    - [Running](#running)
    - [Readings](#readings)
  - [Technical specs](#technical-specs)
  - [COMMON ISSUES](#common-issues)
    - [Cordova Android Build unsuccessful](#cordova-android-build-unsuccessful)
      - [Error message `Failed to execute aapt`](#error-message-failed-to-execute-aapt)
      - [Error "Element ... at  AndroidManifest.xml:... duplicated with element declared at  AndroidManifest.xml:..."](#error-element--at-androidmanifestxml-duplicated-with-element-declared-at-androidmanifestxml)
      - [Error `Unable to merge dex`](#error-unable-to-merge-dex)
      - [Error message `No target specified and no devices found`](#error-message-no-target-specified-and-no-devices-found)
      - [Error message `Failed to execute tools\android.bat`](#error-message-failed-to-execute-toolsandroidbat)
      - [Error "Can not find symbol"](#error-can-not-find-symbol)

## Known issues

If no data from server is shown on webapp on Chrome (desktop or mobile), try to load `https://<server-address>:3000` on a new browser tab, bypass the warning by clicking on "advanced settings", then "continue to site (dangerous)". Then, data from server should be loaded when accessing `https://<server-address>:8081`.

## Build hybrid app

### Android app

Open console / terminal in the *webapp* folder

:warning: There can be conflicts between permissions & features requests of plugins **cordova-plugin-qrscanner**, **phonegap-plugin-media-stream** and **cordova-plugin-camera-preview** *(example error: Element uses-permission#android.permission.CAMERA at AndroidManifest.xml:21:3-87 duplicated with element declared at AndroidManifest.xml)*. To resolve:

* Open files **src-cordova/plugins/{plugin name}/plugin.xml**
* Remove or comment lines `<uses-feature android:name="android.hardware.camera" android:required="true"/>` and `<uses-permission android:name="android.permission.CAMERA" />` to avoid conflicts (leave only one plugin asking for permission/feature)
* Once **plugin.xml** files are updated, run `cd src-cordova`, `cordova platform remove android`, `cordova platform add android` (see [here](https://stackoverflow.com/a/51854054/488666))

* Open **\src-cordova\platforms\android\app\src\main\java\org\apache\cordova\facebook\ConnectPlugin.java**
* Comment `AppEventsLogger.augmentWebView((WebView) this.webView.getView(), appContext);` (see [Ionic doc](https://enappd-apps.gitbook.io/apps/ionic-4-full-app/troubleshoot#5-error-cannot-find-symbol-appeventslogger-augmentwebview-webview-this-webview-getview-appcontext))

### iPhone app

Warnings

* Enable XCode command line: XCode > Preferences > Locations > select XCode cli in the dropdown list, [see here](https://github.com/nodejs/node-gyp/issues/569#issuecomment-486049757)
* Try this one too: `npm explore npm -g -- npm install node-gyp@latest` (same github issue)
* Follow [this procedure](https://stackoverflow.com/a/39591319/488666)
* **Keep any device disconnected during build** to avoid unexpected "Code Signing" build errors, see [here](https://stackoverflow.com/a/48683840/488666) and [here](https://stackoverflow.com/a/50457679/488666)

## Debug the app

### Android app

* Enable developer options on your Android device
* Connect your build computer your Android device through USB, allow remote debug from your device
* On your build computer, run `quasar dev -m cordova -T android`

### iPhone app

* From Graaly webapp root directory, run `quasar mode add cordova`
* Run `cd src-cordova`
* Run `cordova platform add ios`
* Run `cd ..`
* Open **Graaly.xcworkspace** file, this should open XCode
* In XCode, go to **File** > **Workspace settings...** and select **Legacy build system** in the first dropdown field, click **Done**
* On the left pane, click **Graaly** project. On the tab **Signing & capabilities**, choose team **Graaly**
* Plug in the iPhone, ensure it is unlocked and run `quasar dev -m cordova -T ios`

Side note: [another procedure](http://maxprog.net.pl/best-practice/quasar-framework-how-deploy-and-debug-mobile-application-on-physical-device-ios-e-g-iphone/) to debug on physical device.
See also [this Quasar doc page about setting up Cordova environment for iOS](https://quasar.dev/quasar-cli/developing-cordova-apps/preparation).

## Publish the app

### Android app

:warning: Change the version in the **config/prod.env.js** and **quasar.conf.js** files
  If needed change the client required version in **/server/routes/main.js** & **webapp/src/plugins/RouterAuthentication.js**

`$ quasar build -m cordova -T android --packageType=bundle`

Sign the apk
```
$ cd src-cordova\platforms\android\app\build\outputs\apk\release
This only needs to be launched if a key has not been generated : $ keytool -genkey -v -keystore graaly-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-alias
$ C:\Users\ericm\AppData\Local\Android\Sdk\build-tools\30.0.3\zipalign -v 4 app-release-unsigned.apk graaly.apk
$ C:\Users\ericm\AppData\Local\Android\Sdk\build-tools\30.0.3\apksigner sign --ks graaly-key.jks --v1-signing-enabled true --v2-signing-enabled true graaly.apk


```
Attention:
* The keystore (jks file) needs to be saved in a secure location. It can not be built again.
* In the last command, `E:\logiciels\Android\sdk` is the Android SDK base bath and may be different on your build environment.

Open https://play.google.com/apps/publish/?account=5104428642488176820#ManageReleaseTrackPlace:p=com.graaly.app&appid=4972151247150188990&releaseTrackId=4700787750850651322

Create a new version by uploading the apk signed file

OLD PROCESS :
quasar build -m cordova -T android --packageType=bundle
Sign the apk :
cd src-cordova\platforms\android\app\build\outputs\apk\release
This only needs to be launched if a key has not been generated : $ keytool -genkey -v -keystore graaly-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-alias
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore graaly-key.jks app-release-unsigned.apk my-alias
rm graaly.apk
C:\Users\ericm\AppData\Local\Android\Sdk\build-tools\30.0.3\zipalign -v 4 app-release-unsigned.apk graaly.apk


### iPhone app

Open console / terminal in the *webapp* folder

Pull last modification (! in /src-cordova/config.xml, replace graaly.app by com.graaly.app)

quasar build -m cordova -T ios

Open the xproj file

Build and Archive the app (select Generic iOS Device to archive), then deploy it

Open https://appstoreconnect.apple.com/WebObjects/iTunesConnect.woa/ra/ng/app/1448284225/testflight?section=iosbuilds and activate the testfight build

If any issue with certificate, or provisioning profile, generate a new certificate, or provisioning profile on https://developer.apple.com/account/ios/profile/production/edit/44CLFUHY8J
(⚠️ the current provisioning profile works with 3/11/2018 certificate)

Account to test the app : eric.mathieu@graaly.com / Gr44ly!2k19

## Debug web app

### With Chrome Desktop & Chrome Android

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

### With Chrome Desktop & Hybrid App

On the Android smartphone:

* [Enable USB debugging](https://developer.android.com/studio/debug/dev-options)
* Connect your smartphone to your computer (desktop, laptop...)
* CONNECT PC that build the app AND THE MOBILE ON THE SAME WIFI NETWORK (PC will start a server to run the webapp that will be opened by the mobile, so PC must be reacheable by mobile)
* If something does not work, disable antivirus & windows defender

On your computer:

* change the SERVER_URL in webapp/config/dev.env.js (get server URL with ipconfig on the PC)
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

### Enable HTTPS on dev environment

Remove the cache of your browser (if you renew the certificate)

Use utility [**mkcert**](https://github.com/FiloSottile/mkcert). It allows to easily create a custom Certification Authority, generate certificates for any IP/domain, and make all your dev devices trust them :

```bash
$ mkcert -install
$ mkcert "dev.graaly.com" localhost 127.0.0.1 ::1
```
Move the 2 files created in the /webapp/certs folder, and rename as webapp-dev-cert.pem and webapp-dev-key.pem

Optional: For Chrome Desktop, follow [this procedure](https://stackoverflow.com/a/15076602/488666) to install certificate in "trusted root certification authorities" store.

⚠️ **iOS**: to install & trust mkcert certification authority on iOS store, follow [this procedure](https://www.thesslstore.com/blog/trust-manually-installed-root-certificates-in-ios/) (iOS 10.3), in particular the last section.

## Testing

### Installing

After running `npm install` in project folder, you can install latest version of Cypress:

    npm install -D cypress@3.2.0

⚠️ You must fix manually [this bug](https://github.com/cypress-io/cypress/issues/1935) for versions 3.2 or below (**fixed in 3.3+ & 4.x**) otherwise "creation quest" E2E tests will trigger an error.

* For a Windows installation, open file **C:\Users\<username>\AppData\Local\Cypress\Cache\<cypress-version>\Cypress\resources\app\packages\runner\dist\cypress_runner.js** (warning, heavy file 6MB, use a suitable editor like [Sublime Text 3](https://www.sublimetext.com/3))
* Find the line containing exactly: `testId: state("runnable").id` and change it to `testId: state("runnable") ? state("runnable").id : null`
* Save & close the file

### Running

* Run **main test script** for Graaly (runs [**unit tests**](https://fr.wikipedia.org/wiki/Test_unitaire) on API/webapp & [**E2E tests**](https://blog.testingdigital.com/quest-test-de-bout-bout-end-to-end-1288) on webapp):

    `npm run test` or `yarn test`

    If you want to run only **unit tests** or **e2e tests**, open file `test/index.mjs` and modify **config** object to your convenience.

### Readings

* [Quasar's own testing framework](https://github.com/quasarframework/quasar-testing) promotes

  * Jest (unit tests)
  * Cypress & WebDriver.io (UI tests for webapp & hybrid)
  * Lighthouse (PWA audit: perfs, SEO, standards...)

* [Ways to economically test your apps on a range of devices](https://www.androidauthority.com/test-your-apps-607217/)

* [Android devices distribution dashboard](https://developer.android.com/about/dashboards/)

* [Top devices for testing Android apps](https://bugfender.com/blog/top-devices-testing-android-apps/)

* Graaly currently supports devices with Android version >= 4.4

* Online services for testing on real devices:

  * [Google Firebase Test Lab](https://firebase.google.com/docs/test-lab/) (maybe for native Android apps only)
  * [Saucelabs mobile app testing](https://saucelabs.com/products/mobile-app-testing) (paid service)

## Technical specs

`step.answers` types, depending on `step.type` value:

* for *choose*, array of objects `{ text: <String>, isRightAnswer: <bool> }` (for text)
                             or `{ imagePath: <String>, isRightAnswer: <bool> }` (for images)
* for *code*, a `Number`
* for *geolocation*, a position object `{ lat: Number, lng: Number }`
* for *write-text*, a `String`
* for *new-item*, a `String` (item code)
* for *find-item* and *use-item*, an object `{ coordinates: { top: <Number 0-100>, left: <Number 0-100> }, item: <String> }`

## COMMON ISSUES

### Cordova Android Build unsuccessful

#### Error message `Failed to execute aapt`

Add in the `allprojects` section of the `/src-cordova/platforms/android/build.gradle` file :

    configurations.all {
        resolutionStrategy {
            force 'com.android.support:support-v4:27.1.0'
        }
    }

#### Error "Element ... at  AndroidManifest.xml:... duplicated with element declared at  AndroidManifest.xml:..."
`Element uses-feature#android.hardware.camera at AndroidManifest.xml:39:5-60 duplicated with element declared at AndroidManifest.xml:36:5-84`
`C:\...\webapp\src-cordova\platforms\android\app\src\main\AndroidManifest.xml Error: Validation failed, exiting`

See https://stackoverflow.com/a/51788464/488666

#### Error `Unable to merge dex`
`Execution failed for task ':app:transformDexArchiveWithExternalLibsDexMergerForDebug'.`
`> java.lang.RuntimeException: java.lang.RuntimeException: com.android.builder.dexing.DexArchiveMergerException: Unable to merge dex`

Check this [solution](https://stackoverflow.com/a/55120122/488666)

#### Error message `No target specified and no devices found`

Open the platform tools folder of your android SDK (e.g. : cd C:\Users\ericm\AppData\Local\Android\Sdk\platform-tools)

`adb devices` (unplug the device, run "adb kill-server" if device is offline)

#### Error message `Failed to execute tools\android.bat`

Check the solutions [here](https://stackoverflow.com/questions/19015587/failed-to-execute-tools-android-bat-solution), and particularly [this one](https://stackoverflow.com/a/56633566/488666)

#### Error "Can not find symbol"

Replace in the file **webapp\src-cordova\platforms\android\app\src\main\java\com\smartmobilesoftware\util\IabHelper.java**:

`buyIntentBundle = mService.getBuyIntentToReplaceSkus(5, mContext.getPackageName(), oldPurchasedSkus, sku, itemType, extraData)`

by

`buyIntentBundle = mService.getBuyIntent(3, mContext.getPackageName(), sku, itemType, extraData)`

#### Error "Can not find symbol" with AppEventsLogger.augmentWebView

Open : platforms/android/app/src/main/java/org/apache/cordova/facebook/ConnectPlugin.java
Comment line : AppEventsLogger.augmentWebView((WebView) this.webView.getView(), appContext);

#### Error "Votre application cible actuellement le niveau d'API 29"

https://kdjguru.com/how-to-fix-change-the-default-target-sdk-to-api-level-30-cordova-quasar/

### Cordova iPhone Build unsuccessful

#### Error message `Swift 4.2`
Open : src-cordova/config.xml
add into  `<platform name="ios">`
`<preference name="UseSwiftLanguageVersion" value="4" />`
`<preference name="SwiftVersion" value="4.2" />`

one last fix is inside the iOS 'QRScanner.swift' search 'QRScanner.swift'

change "string: UIApplication.openSettingsURLString" to "string: UIApplicationOpenSettingsURLString" in openSettings function. line 470

#### Require(...).rm is not a function

reinstall cordova with a recent version
cordova platform remove ios
cordova platform add ios@6.2.0
