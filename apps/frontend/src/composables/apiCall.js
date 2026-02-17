import axios from 'axios';
import {
    toastController
} from '@ionic/vue';
import { closeCircleOutline } from 'ionicons/icons';

export default async function apiCall(endpoint, options, token) {
    const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...options?.headers
    };

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

        const msg = error.message || 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.';
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
