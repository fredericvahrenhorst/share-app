import axios from 'axios';
import {
    toastController
} from '@ionic/vue';
import { closeCircleOutline } from 'ionicons/icons';

export default async function apiCall(endpoint, options, token) {
    const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    };

    if (token) {
        headers.Authorization = token;
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
        if (error.response) {
            const msg = (error.response.data?.msg)
                ? error.response.data.msg
                : 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.';

            const errorToast = await toastController.create({
                position: 'top',
                color: 'danger',
                duration: 3000,
                icon: closeCircleOutline,
                message: msg,
                swipeGesture: 'vertical',
            });

            await errorToast.present();
        }
        throw error;
    }
}
