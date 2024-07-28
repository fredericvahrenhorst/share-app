import { IonicVue } from '@ionic/vue';
import { createApp } from 'vue';
import { createPinia } from 'pinia'; // eslint-disable-line
import { createI18n } from 'vue-i18n'; // eslint-disable-line
import axios from 'axios';
import App from './App.vue';
import router from './router';
import { useUserStore } from './store/userStore';
import { useAppStore } from './store/appStore';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

import 'tailwindcss/base.css'; /* eslint-disable-line */

/* Basic CSS for apps built with Ionic */
// import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

import 'tailwindcss/components.css' /* eslint-disable-line */

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

import 'tailwindcss/utilities.css' /* eslint-disable-line */

/* Theme variables */
import './theme/variables.css';

import de from './locales/de.json';

const pinia = createPinia();
const i18n = createI18n({
    locale: 'de',
    legacy: false,
    messages: {
        de
    },
});

// const bugsnagVue = Bugsnag.getPlugin('vue');

const app = createApp(App)
    .use(IonicVue)
    .use(router)
    .use(pinia)
    .use(i18n);

const userStore = useUserStore();
const token = localStorage.getItem('token');
const userId = localStorage.getItem('userId');

if (token && userId) {
    userStore.token = token;
    userStore.userId = parseInt(userId, 10);
    userStore.authenticated = true;
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
}

router.isReady().then(() => {
    app.mount('#app');

    const appStore = useAppStore();

    if (('theme' in localStorage && localStorage.theme === 'dark')
    || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        appStore.setTheme('dark');
    } else if ('theme' in localStorage && localStorage.theme === 'light') {
        appStore.setTheme('light');
    }
});
