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
        async forgotPassword(email) {
            try {
                await apiCall('users/forgot-password', {
                    method: 'POST',
                    data: { email },
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
                if (errors.length === 0) errors.push('Anfrage fehlgeschlagen. Bitte E-Mail prüfen.');
                return { success: false, errors };
            }
        },
        async resetPassword(token, password) {
            try {
                await apiCall('users/reset-password', {
                    method: 'POST',
                    data: { token, password },
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
                if (errors.length === 0) errors.push('Passwort-Reset fehlgeschlagen.');
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
        async validateAuth() {
            if (!this.token || !this.userId) {
                this.clearUserData()
                return false
            }
            try {
                const response = await apiCall('users/me', { method: 'GET' })
                if (response?.user) {
                    this.user = response.user
                    this.authenticated = true
                    return true
                }
                this.clearUserData()
                return false
            } catch (err) {
                this.clearUserData()
                return false
            }
        },
        async getUserData() {
            const response = await apiCall(`users/${this.userId}?depth=1`, {
                method: 'GET',
            });

            this.user = response.user || response;

            return response;
        },
        async updateUser(data) {
            if (!this.userId) return { success: false, errors: ['Nicht angemeldet'] }
            const response = await apiCall(`users/${this.userId}`, {
                method: 'PATCH',
                data,
            })
            this.user = response.user || response.doc || response
            return { success: true }
        },
        clearUserData() {
            this.authenticated = false;
            this.token = '';
            this.userId = '';
            this.user = {};

            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('locationFilters');
            localStorage.removeItem('searchHistory');
            delete axios.defaults.headers.common['Authorization'];
        },
    },
})
