import { createRouter, createWebHistory } from '@ionic/vue-router';
import pageLayout from '../layouts/PageLayout.vue';

const routes = [
    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/LoginPage.vue') /* eslint-disable-line */
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('@/views/RegisterPage.vue') /* eslint-disable-line */
    },
    {
        path: '/forgot-password',
        name: 'ForgotPassword',
        component: () => import('@/views/ForgotPasswordPage.vue') /* eslint-disable-line */
    },
    {
        path: '/reset-password',
        name: 'ResetPassword',
        component: () => import('@/views/ResetPasswordPage.vue') /* eslint-disable-line */
    },
    {
        path: '/add-location',
        name: 'AddLocation',
        component: () => import('@/views/AddLocationPage.vue') /* eslint-disable-line */
    },
    {
        path: '/activity',
        name: 'Activity',
        component: () => import('@/views/ActivityFeedPage.vue') /* eslint-disable-line */
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
                component: () => import('@/views/StartPage.vue') /* eslint-disable-line */
            },
            {
                path: 'kategorien',
                name: 'Kategorien',
                component: () => import('@/views/CategoriesPage.vue') /* eslint-disable-line */
            },
            {
                path: 'favoriten',
                name: 'Favoriten',
                component: () => import('@/views/FavoritesPage.vue') /* eslint-disable-line */
            },
            {
                path: 'profil',
                name: 'Profil',
                component: () => import('@/views/ProfilPage.vue') /* eslint-disable-line */
            },
        ]
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

export default router;
