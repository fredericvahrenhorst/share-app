/* eslint-disable */
import { defineStore } from 'pinia';
import { Geolocation } from '@capacitor/geolocation'; // eslint-disable-line

export const useAppStore = defineStore('app', {
    state: () => ({
        walkthroughVisited: JSON.parse(localStorage.getItem('walkthroughVisited')),
        theme: localStorage.getItem('theme'),
        geo: JSON.parse(localStorage.getItem('geo')),
        mapGeo: JSON.parse(localStorage.getItem('mapGeo')),
        mapZoom: parseInt(localStorage.getItem('mapZoom')) || 11,
        radius: parseInt(localStorage.getItem('radius')) || 5,
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
            this.setMapGeoLatLong(geoData);
        },

        async getGeoLocation(force = false) {
            const cached = this.geo || JSON.parse(localStorage.getItem('geo') || 'null')
            const isFresh = cached?.ts && Date.now() - cached.ts < 900000

            if (!force && cached && isFresh) {
                this.geo = cached
                return this.geo
            }

            try {
                const geoData = await Geolocation.getCurrentPosition({
                    enableHighAccuracy: true,
                    timeout: 12000,
                })
                this.setGeoLatLong(geoData)
                return this.geo
            } catch (capacitorError) {
                // Browser-Fallback, falls Capacitor Geolocation fehlschlägt
                if (typeof navigator === 'undefined' || !navigator.geolocation) {
                    throw capacitorError
                }

                const browserPosition = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 12000,
                        maximumAge: force ? 0 : 60000,
                    })
                })

                this.setGeoLatLong(browserPosition)
                return this.geo
            }
        },

        setMapGeoLatLong(geoData) {
            this.mapGeo = {
                lat: geoData.coords.latitude,
                long: geoData.coords.longitude,
                ts: geoData.timestamp
            };
            localStorage.setItem('mapGeo', JSON.stringify(this.mapGeo));
        },

        setMapZoom(zoom) {
            this.mapZoom = zoom;
            localStorage.setItem('mapZoom', zoom.toString());
        },

        async getMapGeoLocation(force = false) {
            if (localStorage.getItem('mapGeo') && !force) {
                this.mapGeo = JSON.parse(localStorage.getItem('mapGeo'));
            } else {
                const geoData = await Geolocation.getCurrentPosition();
                this.setMapGeo(geoData);
            }
        },

    },
})
