// Configuration for your app

var loadEnvVars = require('./config/index')
var path = require('path')
var fs = require('fs')

module.exports = function (ctx) {
  return {
    // app boot (/src/boot)
    boot: [
      //ctx.dev ? '' : 'SentryMonitoring',
      //'FirebaseMonitoring',
      //'CustomDirectives',
      'DateFormatFilter',
      'RouterAuthentication',
      'UniversalLinks', // enable to use deep links with Cordova plugin
      'VueGoogleMaps',
      'VueI18n',
      'Vuelidate',
      'CustomerConfiguration',
      ctx.mode.cordova ? 'google-analytics' : ''
    ],
    css: [
      'app.styl'
    ],
    extras: [
      'roboto-font',
      'material-icons', // optional, you are not bound to it
      'material-icons-outlined',
      // 'ionicons-v4',
      // 'mdi-v3',
      'fontawesome-v5'
    ],
    supportIE: false,
    build: {
      scopeHoisting: true,
      vueRouterMode: 'hash',
      env: loadEnvVars(ctx.dev ? 'dev' : 'prod'),
      publicPath: '',
      // vueCompiler: true,
      // gzip: true,
      // analyze: true,
      // extractCSS: false,
      extendWebpack(cfg) {
        // custom directory aliases:
        // see https://quasar-framework.org/guide/app-quasar.conf.js.html#Adding-your-own-alias-to-Webpack
        cfg.resolve.alias = {
          ...cfg.resolve.alias,
          //quasar: path.resolve(__dirname, './node_modules/quasar-framework/'),
          //vue: 'vue/dist/vue.js',
          // custom (WARN: if you change this, please update as well jest.config.js 'moduleNameMapper' section)
          data: path.resolve(__dirname, './data'),
          services: path.resolve(__dirname, './src/services')
        }
      }
    },
    devServer: {
      https: {
        key: fs.readFileSync('certs/webapp-dev-key.pem'),
        cert: fs.readFileSync('certs/webapp-dev-cert.pem')
      },
      // port: 8080,
      open: true // opens browser window automatically
    },
    // framework: 'all' --- includes everything; for dev only!
    framework: {
      components: [
        //'QAutocomplete',
        'QAvatar',
        'QBanner',
        'QBadge',
        'QBtn',
        'QBtnDropdown',
        'QBtnGroup',
        'QCard',
        'QCardActions',
        'QCardSection',
        'QCarousel',
        'QCarouselControl',
        'QCarouselSlide',
        'QCheckbox',
        'QChip',
        'QColor',
        //'QChipsInput',
        'QDate',
        'QDialog',
        'QDrawer',
        'QExpansionItem',
        'QField',
        'QIcon',
        'QImg',
        'QInfiniteScroll',
        'QInput',
        'QItem',
        'QItemLabel',
        'QItemSection',
        'QLayout',
        'QList',
        'QOptionGroup',
        'QPageContainer',
        'QPage',
        'QPageSticky',
        'QParallax',
        'QPopupProxy',
        'QLinearProgress',
        'QRadio',
        'QRange',
        'QRating',
        'QScrollObserver',
        'QSelect',
        'QSeparator',
        'QSlider',
        'QSkeleton',
        'QSpace',
        'QSpinner',
        'QSpinnerDots',
        'QSpinnerPuff',
        'QSpinnerRadio',
        'QSpinnerOrbit',
        'QStepper',
        'QStep',
        'QStepperNavigation',
        'QTable',
        'QTr', 'QTd', 'QTh',
        'QTab',
        'QTabs',
        'QTabPanel',
        'QTabPanels',
        'QToggle',
        'QToolbar',
        'QToolbarTitle',
        'QTooltip'
      ],
      directives: [
        'ClosePopup',
        'Ripple',
        'Scroll',
        'TouchPan',
        'TouchSwipe'
      ],
      // Quasar plugins
      plugins: [
        'Dialog',
        'Loading',
        'Notify',
        'BottomSheet'
      ],
      iconSet: 'fontawesome-v5',
      // lang: 'de' // Quasar language
      config: {
        cordova: {
          backButtonExit: false // prevent user to exit if back button on home page
        },
        loading: {
          delay: 500
        }
      }
    },
    // animations: 'all' --- includes all animations
    animations: [
      'fadeIn',
      'fadeOut',
      'slideInLeft',
      'slideOutLeft',
      'slideInRight',
      'slideOutRight',
      'slideInUp',
      'slideOutDown'
    ],
    pwa: {
      // workboxPluginMode: 'InjectManifest',
      // workboxOptions: {},
      manifest: {
        name: 'Graaly',
        short_name: 'Graaly',
        // description: 'Best PWA App in town!',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#323232',
        icons: [
          {
            "src": "/statics/icons/app-logo/icon-48x48.png",
            "type": "image/png",
            "sizes": "48x48"
          },
          {
            "src": "/statics/icons/app-logo/icon-96x96.png",
            "type": "image/png",
            "sizes": "96x96"
          },
          {
            "src": "/statics/icons/app-logo/icon-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
          },
          {
            "src": "/statics/icons/app-logo/icon-512x512.png",
            "sizes": "512x512",
            "type": "image/png"
          }
        ]
      }
    },
    cordova: {
      version: "2.3.12"
      // id: 'org.cordova.quasar.app'
    },
    electron: {
      // bundler: 'builder', // or 'packager'
      extendWebpack(cfg) {
        // do something with Electron process Webpack cfg
      },
      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options

        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',

        // Window only
        // win32metadata: { ... }
      },
      builder: {
        // https://www.electron.build/configuration/configuration

        // appId: 'quasar-app'
      }
    }
  }
}
