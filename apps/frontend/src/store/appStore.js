/* eslint-disable */
import { defineStore } from 'pinia';

export const useAppStore = defineStore('app', {
    state: () => ({
        walkthroughVisited: JSON.parse(localStorage.getItem('walkthroughVisited')),
        theme: localStorage.getItem('theme'),
        geo: JSON.parse(localStorage.getItem('geo')),
        shelterFavs: JSON.parse(localStorage.getItem('shelterFavs')),
    }),
    actions: {
        saveWalkthroughVisitedToStorage () {
            localStorage.setItem('walkthroughVisited', true);
            return true;
        },

        setTheme (theme) {
            localStorage.setItem('theme', theme);

            if (theme === 'dark') {
                document.body.classList.toggle('dark', true);
                document.body.classList.toggle('light', false);
            } else {
                document.body.classList.toggle('light', true);
                document.body.classList.toggle('dark', false);
            }

            return true;
        },

        setGeoLatLong(geoData) {
            this.geo = {
                lat: geoData.coords.latitude,
                long: geoData.coords.longitude,
                ts: geoData.timestamp
            };

            localStorage.setItem('geo', JSON.stringify(this.geo));
        },
    },
})
