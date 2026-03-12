import axios from 'axios';
import {
    toastController
} from '@ionic/vue';
import { closeCircleOutline } from 'ionicons/icons';

export default async function apiCall(endpoint, options, token) {
    const isFormData = options?.data instanceof FormData
    const headers = {
        Accept: 'application/json',
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...options?.headers,
    }
    // Bei FormData kein Content-Type setzen – axios setzt automatisch multipart/form-data inkl. boundary
    if (isFormData) {
        delete headers['Content-Type']
    }

    const authToken = token || (typeof localStorage !== 'undefined' && localStorage.getItem('token'));
    if (authToken) {
        headers.Authorization = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
    }

    const opts = {
        url: process.env.API_URL + endpoint,
        headers,
        ...options
    };

    try {
        const response = await axios(opts);
        return response.data;
    } catch (error) {
        console.error('API call error:', error);

        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('userId')
            throw error
        }

        const lang = typeof localStorage !== 'undefined'
            ? localStorage.getItem('appLanguage') || 'de'
            : 'de'
        const fallback = lang === 'en'
            ? 'An error occurred. Please try again later.'
            : 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.'
        const msg = error.message || fallback;
        const errorToast = await toastController.create({
            position: 'top',
            color: 'danger',
            duration: 3000,
            icon: closeCircleOutline,
            message: msg,
            swipeGesture: 'vertical',
        });
        await errorToast.present();

        throw error;
    }
}
