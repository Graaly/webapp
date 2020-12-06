// Configuration for your app

var loadEnvVars = require('./config/index')
var path = require('path')
var fs = require('fs')

module.exports = function (ctx) {
  return {
    // app boot (/src/boot)
    boot: [
      ctx.dev ? '' : 'SentryMonitoring',
      //'FirebaseMonitoring',
      'CustomDirectives',
      'DateFormatFilter',
      'RouterAuthentication',
      'UniversalLinks', // enable to use deep links with Cordova plugin 
      'VueGoogleMaps',
      'VueI18n',
      'Vuelidate',
      ctx.mode.cordova ? 'google-analytics' : ''
    ],
    css: [
      'app.styl'
    ],
    extras: [
      'roboto-font',
      'material-icons', // optional, you are not bound to it
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

        // UGLY HACK to avoid "babel" processing src/includes/ar.js
        // (error "Module Build Failed: TypeError: Cannot read property 'code' of null")
        // mixing include & exclude do not work well => doing all necessary includes...
        // cfg.module.rules[1] represents rule for processing "*.js" files
        // => erase "include" property (default being: '/src', '/.quasar')
        cfg.module.rules[1].include = [
          path.resolve(__dirname, "src/i18n"),

          // DO NOT INCLUDE "src/includes/ar.js" BUT INCLUDE ALL OTHER FILES IN "src/includes"
          path.resolve(__dirname, "src/includes/simi.js"),
          path.resolve(__dirname, "src/includes/utils.js"),
          path.resolve(__dirname, "src/includes/motion-sensors.js"),
          path.resolve(__dirname, "src/includes/sensor.js"),

          path.resolve(__dirname, "src/boot"),
          path.resolve(__dirname, "src/components"),
          path.resolve(__dirname, "src/i18n"),
          path.resolve(__dirname, "src/layouts"),
          path.resolve(__dirname, "src/pages"),
          path.resolve(__dirname, "src/router"),
          path.resolve(__dirname, "src/services"),
          path.resolve(__dirname, "src/store"),
          path.resolve(__dirname, ".quasar"),
          //path.resolve(__dirname, "node_modules/ip-regex"), // otherwise not compatible with Android 4.4 webview
          path.resolve(__dirname, "node_modules/quasar") // otherwise src/plugins/platform.js is not transpiled and contains ES6 specific code 
        ]

        // linter
        cfg.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules|quasar)/
        })

        // MP 2019-05-03
        // remove HotModuleReplacementPlugin (triggers this error & breaks hot reload: https://github.com/webpack/webpack-dev-server/issues/87)
        // if hot reload does not works, remove this
        for (let i = 0; i < cfg.plugins.length; i++) {
          if (cfg.plugins[i].constructor.name === 'HotModuleReplacementPlugin') {
            cfg.plugins.splice(i, 1)
            break
          }
        }
      }
      //transpileDependencies: [/ip-regex/]
    },
    devServer: {
      https: true,
      /*https: {
        key: fs.readFileSync('certs/webapp-dev-key.pem'),
        cert: fs.readFileSync('certs/webapp-dev-cert.pem')
      },*/
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
        'QSpace',
        'QSpinner',
        'QSpinnerDots',
        'QSpinnerPuff',
        'QSpinnerRadio',
        'QTab',
        'QTabs',
        'QTabPanel',
        'QTabPanels',
        'QToggle',
        'QToolbar',
        'QToolbarTitle'
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
        'Notify'
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
      version: "2.1.1"
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
