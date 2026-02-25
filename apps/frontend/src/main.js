import { IonicVue } from '@ionic/vue';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n'; // eslint-disable-line
import App from './App.vue';
import router from './router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
// import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

import 'tailwindcss/utilities.css' /* eslint-disable-line */

import './css/main.css';

import de from './locales/de.json';

const pinia = createPinia();
const i18n = createI18n({
    locale: 'de',
    legacy: false,
    messages: {
        de
    },
});


const app = createApp(App)
    .use(IonicVue)
    .use(router)
    .use(pinia)
    .use(i18n);

router.isReady().then(() => {
    app.mount('#app');
});
