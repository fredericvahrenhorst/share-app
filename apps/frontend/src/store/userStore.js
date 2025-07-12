/* eslint-disable */
import { defineStore } from 'pinia';
import axios from 'axios';
import apiCall from '../composables/apiCall';

export const useUserStore = defineStore('user', {
    state: () => ({
        authenticated: false,
        token: localStorage.getItem('token'),
        unreadNotificationsCount: null,
        notifications: [],
        userId: localStorage.getItem('userId'),
        user: {},
    }),
    actions: {
        async login(user) {
            try {
                const response = await apiCall(`login?email=${encodeURIComponent(user.email)}&password=${encodeURIComponent(user.password)}`, {
                    method: 'POST',
                });

                if (response.access_token && response.user) {
                    this.token = response.access_token;
                    this.userId = response.user.id;
                    this.authenticated = true;

                    const authToken = `Bearer ${this.token}`;
                    localStorage.setItem('token', this.token);
                    localStorage.setItem('userId', response.user.id);
                    axios.defaults.headers.common['Authorization'] = authToken;

                    return true;
                }
            } catch(error) {
                let errorMessages = [];
                for (let field in error.response.data.errors) {
                    errorMessages.push(error.response.data.errors[field]);
                }
                return errorMessages;
            }
        },
        async logout() {

            const response = await apiCall('logout', {
                method: 'POST',
            });

            this.clearUserData();

            return response;
        },
        async getUserData() {
            const response = await apiCall(`user/${this.userId}`, {
                method: 'GET',
            });

            this.user = response.user;

            return response;

        },
        clearUserData() {
            this.authenticated = false;
            this.token = '';
            this.userId = '';
            this.user = {};

            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            if (token && userId) {
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
            }
        },
    },
})
