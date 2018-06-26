// Configuration for your app

var loadEnvVars = require('./config/index')
var path = require('path')

module.exports = function (ctx) {
  return {
    // app plugins (/src/plugins)
    plugins: [
      'DateFormatFilter',
      'RouterAuthentication',
      'VueGoogleMaps',
      'VueI18n',
      'Vuelidate'
    ],
    css: [
      'app.styl'
    ],
    extras: [
      ctx.theme.mat ? 'roboto-font' : null,
      'material-icons', // optional, you are not bound to it
      // 'ionicons',
      // 'mdi',
      'fontawesome'
    ],
    supportIE: false,
    build: {
      scopeHoisting: true,
      vueRouterMode: 'hash',
      env: loadEnvVars(ctx.dev),
      publicPath: 'http://localhost:8080/',
      // vueCompiler: true,
      // gzip: true,
      // analyze: true,
      // extractCSS: false,
      extendWebpack (cfg) {
        // custom directory aliases:
        // see https://quasar-framework.org/guide/app-quasar.conf.js.html#Adding-your-own-alias-to-Webpack
        cfg.resolve.alias = {
          ...cfg.resolve.alias,
          //quasar: path.resolve(__dirname, './node_modules/quasar-framework/'),
          //vue: 'vue/dist/vue.js',
          // custom
          data: path.resolve(__dirname, './data'),
          services: path.resolve(__dirname, './src/services')
        }
        // linter
        cfg.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules|quasar)/
        })
      }
    },
    devServer: {
      https: true,
      // port: 8080,
      open: true // opens browser window automatically
    },
    // framework: 'all' --- includes everything; for dev only!
    framework: {
      components: [
        'QBtn',
        'QCheckbox',
        'QField', 
        'QIcon',
        'QInfiniteScroll',
        'QInput', 
        'QItem',
        'QItemMain',
        'QItemSide',
        'QItemSeparator',
        'QItemTile',
        'QLayout',
        'QLayoutHeader',
        'QLayoutDrawer',
        'QList',
        'QListHeader',
        'QPageContainer',
        'QPage',
        'QParallax',
        'QPopover',
        'QRadio',
        'QRating',
        'QRouteTab',
        'QSearch',
        'QSelect',
        'QSpinnerDots',
        'QTabs',
        'QTab',
        'QTabPane',
        'QToolbar',
        'QToolbarTitle',
        'QUploader',
      ],
      directives: [
        'Ripple'
      ],
      // Quasar plugins
      plugins: [
        'Dialog',
        'Loading',
        'Notify'
      ]
      // iconSet: ctx.theme.mat ? 'material-icons' : 'ionicons'
      // i18n: 'de' // Quasar language
    },
    // animations: 'all' --- includes all animations
    animations: [
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
        theme_color: '#e82a34',
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
      // id: 'org.cordova.quasar.app'
    },
    electron: {
      // bundler: 'builder', // or 'packager'
      extendWebpack (cfg) {
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
