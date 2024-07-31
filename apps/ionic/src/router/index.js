import { createRouter, createWebHistory } from '@ionic/vue-router';
import pageLayout from '../layouts/PageLayout.vue';

const routes = [
    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/',
        component: pageLayout,
        children: [
            {
                path: '',
                redirect: '/home'
            },
            {
                path: 'home',
                name: 'Home',
                component: () => import('@/views/pages/StartPage.vue') /* eslint-disable-line */
            },
            {
                path: 'page2',
                name: 'Page2',
                component: () => import('@/views/pages/EmptyPage.vue') /* eslint-disable-line */
            },
            {
                path: 'page3',
                name: 'Page3',
                component: () => import('@/views/pages/EmptyPage.vue') /* eslint-disable-line */
            },
        ]
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

export default router;
