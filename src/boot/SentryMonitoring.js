import Vue from 'vue'
import * as Sentry from '@sentry/browser'
import * as Integrations from '@sentry/integrations'

Sentry.init({
    dsn: 'https://1817b5e5250c40949ba1b2a25e0f2296@o426546.ingest.sentry.io/5368714',
    integrations: [new Integrations.Vue({ Vue, attachProps: true })]//,
   // blacklistUrls : ['localhost','127.0.0.1']
});
