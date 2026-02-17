/* eslint-disable */
import { defineStore } from 'pinia';
import axios from 'axios';
import apiCall from '../composables/apiCall';

export const useUserStore = defineStore('user', {
    state: () => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        return {
            authenticated: !!(token && userId),
            token,
            unreadNotificationsCount: null,
            notifications: [],
            userId,
            user: {},
        };
    },
    actions: {
        async login(credentials) {
            try {
                const response = await apiCall('users/login', {
                    method: 'POST',
                    data: {
                        email: credentials.email,
                        password: credentials.password,
                    },
                });

                const token = response.token || response.access_token;
                if (token && response.user) {
                    this.token = token;
                    this.userId = response.user.id;
                    this.authenticated = true;

                    const authToken = `Bearer ${this.token}`;
                    localStorage.setItem('token', this.token);
                    localStorage.setItem('userId', response.user.id);
                    axios.defaults.headers.common['Authorization'] = authToken;

                    return { success: true };
                }
                return { success: false, errors: ['Ungültige Antwort vom Server'] };
            } catch (error) {
                const data = error.response?.data;
                const errors = [];
                if (data?.errors) {
                    data.errors.forEach((e) => {
                        if (e.message) errors.push(e.message);
                    });
                }
                if (data?.message) errors.push(data.message);
                if (errors.length === 0) errors.push('Anmeldung fehlgeschlagen. Bitte E-Mail und Passwort prüfen.');
                return { success: false, errors };
            }
        },
        async register(userData) {
            try {
                await apiCall('users', {
                    method: 'POST',
                    data: {
                        email: userData.email,
                        password: userData.password,
                        name: userData.name,
                    },
                });
                return { success: true };
            } catch (error) {
                const data = error.response?.data;
                const errors = [];
                if (data?.errors) {
                    data.errors.forEach((e) => {
                        if (e.message) errors.push(e.message);
                    });
                }
                if (data?.message) errors.push(data.message);
                if (errors.length === 0) errors.push('Registrierung fehlgeschlagen. Bitte Eingaben prüfen.');
                return { success: false, errors };
            }
        },
        async logout() {
            try {
                await apiCall('users/logout', {
                    method: 'POST',
                });
            } catch (err) {
                // Lokale Daten trotzdem löschen
            } finally {
                this.clearUserData();
            }
        },
        async getUserData() {
            const response = await apiCall(`users/${this.userId}`, {
                method: 'GET',
            });

            this.user = response.user || response;

            return response;
        },
        clearUserData() {
            this.authenticated = false;
            this.token = '';
            this.userId = '';
            this.user = {};

            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            delete axios.defaults.headers.common['Authorization'];
        },
    },
})
