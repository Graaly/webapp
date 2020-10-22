// i18n (internationalization) boot file
// adapted from https://medium.com/quasar-framework/adding-full-i18n-to-quasar-150da2d5bba4

import VueI18n from "vue-i18n";
import messages from "../i18n/main.js";

let i18n;

export default ({ app, Vue }) => {
  Vue.use(VueI18n);

  app.i18n = new VueI18n({
    locale: "fr",
    messages
  });

  i18n = app.i18n;
};

export { i18n };
