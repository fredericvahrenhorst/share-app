<template>
    <div
        class="relative w-full h-full transition-opacity"
        style="width: 100%; height: 100%"
        :class="{ 'opacity-0': !ready }"
    >
        <!-- Suchfeld in der Top-Bar -->
        <div
            id="search-bar"
            class="fixed top-[calc(var(--ion-statusbar-padding)+2rem)] left-2 right-2 w-auto z-50"
        >
            <ion-item
                class="flex gap-2 blur-bg-light text-light-gray-96"
                lines="none"
                color="transparent"
            >
                <ion-icon
                    :icon="searchOutline"
                    size="small"
                    slot="start"
                    class="text-current mr-2"
                />
                <ion-input
                    :placeholder="t('search.placeholder')"
                    readonly
                    @click="openSearchModal"
                    class="cursor-pointer border-none"
                    style="--border-width: 0px"
                />
            </ion-item>
        </div>

        <mapbox-map
            :accessToken="mapboxToken"
            :zoom="zoom"
            :mapStyle="'mapbox://styles/mapbox/standard'"
            :center="center"
            :auto-resize="true"
            :auto-resize-delay="300"
            :scrollZoom="true"
            :flyToOptions="{ maxDuration: 500, speed: 0.5 }"
            @loaded="onMapLoaded"
            @update:center="mapUpdated({ center: $event })"
            @update:zoom="mapUpdated({ zoom: $event })"
        >
            <!-- Location Markers -->
            <mapbox-marker
                v-for="location in filteredAllLocations"
                :key="`marker-${location.id}`"
                :lngLat="location.coordinates"
                @click="handleLocationSelect(location)"
            >
                <template v-slot:icon>
                    <div
                        class="rounded-full flex items-center justify-center shadow-lg backdrop-blur-md transition-all duration-300"
                        :class="[
                            currentMapData.zoom > 10 ? 'w-9 h-9' : 'w-4 h-4',
                        ]"
                        :style="{
                            background:
                                location.category && location.category.color
                                    ? `${location.category.color}80` // 50% opacity
                                    : 'rgba(99,102,241,0.5)', // fallback: Indigo-500
                        }"
                    >
                        <ion-icon
                            v-if="currentMapData.zoom > 10"
                            aria-hidden="true"
                            :icon="heartOutline"
                            class="rounded-full p-2 h-4.5 w-4.5 text-light"
                        />
                    </div>
                </template>
            </mapbox-marker>

            <!-- User Location Marker -->
            <mapbox-marker :lngLat="userLocation">
                <template v-slot:icon>
                    <div
                        class="w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-lg"
                    ></div>
                </template>
            </mapbox-marker>

            <!-- Radius Circle -->
            <mapbox-geogeometry-circle
                v-if="userLocation && radius && currentMapData.zoom >= 9"
                :center="[mapGeo.long, mapGeo.lat]"
                :radius="radius"
                fillColor="#2b7fff"
                outlineColor="#155dfc"
                :opacity="dynamicCircleOpacity"
                :edges="64"
            />
        </mapbox-map>

        <!-- Button Bar -->
        <div class="fixed z-50 bottom-28 left-2 right-2 flex items-center justify-between">
            <!-- Radius Info -->
            <div
                v-if="geo"
                class="px-3 py-1 rounded-full blur-bg-light text-xs text-gray-600
                       flex items-center justify-center gap-2"
            >
                <span>
                    {{ radius }}{{ t('radius.unit') }} {{ t('radius.label') }}
                </span>
                –
                <span
                    class="text-blue-500 cursor-pointer"
                    @click="setGeoLatLong({
                        coords: {
                            latitude: currentMapData.center[1],
                            longitude: currentMapData.center[0]
                        },
                        timestamp: Date.now()
                    })"
                >
                    {{ t('radius.searchHere') }}
                </span>
            </div>

            <div
                class="w-10 h-10 rounded-full flex items-center justify-center blur-bg-light text-blue-500"
                @click="getGeoLocation(true)"
            >
                <ion-icon
                    aria-hidden="true"
                    size="small"
                    color="current"
                    :icon="navigate"
                />
            </div>
        </div>

        <!-- Location Detail Modal -->
        <LocationDetail />

        <!-- Search Modal -->
        <SearchModal
            :is-open="isSearchModalOpen"
            @close="closeSearchModal"
            @select-location="handleLocationSelect"
        />
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { MapboxMap, MapboxMarker, MapboxGeogeometryCircle } from 'vue-mapbox-ts';
import { IonItem, IonInput, IonIcon } from '@ionic/vue';
import { navigate, heartOutline, searchOutline } from 'ionicons/icons';
import SearchModal from './SearchModal.vue';
import LocationDetail from './LocationDetail.vue';
import { useAppStore } from '../store/appStore';
import { useLocationsStore } from '../store/locationsStore';

const props = defineProps({
    locations: {
        type: Array,
        required: true,
    },
    allLocations: {
        type: Array,
        required: true,
    },
});

// i18n
const { t } = useI18n();

// Store
const appStore = useAppStore();
const { geo, mapGeo, radius } = storeToRefs(appStore);

const locationsStore = useLocationsStore();

const defaultCenter = [13.354336, 52.477697];
const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;

const ready = ref(false);
const isSearchModalOpen = ref(false);
const zoom = ref(mapGeo.value ? (radius.value > 10 ? 9 : 11) : 5);
const center = ref([
    mapGeo.value?.long || defaultCenter[0],
    mapGeo.value?.lat || defaultCenter[1],
]);
const currentMapData = ref({
    center: center.value,
    zoom: zoom.value,
});
const userLocation = ref([
    geo.value?.long || defaultCenter[0],
    geo.value?.lat || defaultCenter[1],
]);
const mapInstance = ref(null);

// Array für unclustered Pins (Einzelpunkte)
const unclusteredFeatures = ref([]);
const filteredAllLocations = computed(
    () => props.allLocations.filter((loc) => unclusteredFeatures.value.includes(loc.id))
);


const dynamicCircleOpacity = computed(() => {
    // Dynamische Berechnung der Opazität zwischen 0.2 (Zoom 10) und 0 (Zoom 16+)
    const minZoom = 8;
    const maxZoom = 13;
    const minOpacity = 0;
    const maxOpacity = 0.2;

    const zoomLevel = currentMapData.value.zoom;
    if (zoomLevel <= minZoom) {
        return maxOpacity;
    }
    if (zoomLevel >= maxZoom) {
        return minOpacity;
    }
    // Linear interpolieren zwischen maxOpacity und minOpacity
    const opacity = maxOpacity - ((zoomLevel - minZoom) / (maxZoom - minZoom)) * (maxOpacity - minOpacity);

    console.log('opacity: ', opacity);
    console.log('zoomLevel: ', zoomLevel);
    return opacity;
});

const baseZoom = 11;
const baseRadius = 5; // in km

// Search Modal Methods
const openSearchModal = () => {
    isSearchModalOpen.value = true;
};

const closeSearchModal = () => {
    isSearchModalOpen.value = false;
};

const handleLocationSelect = (location) => {
    console.log('location: ', location);
    if (!location.isExternal) {
        locationsStore.setPopupLocation(location);
    }

    center.value = location.coordinates;
};

// ###################################
// ######## Mapbox-Map-Events ########
// ###################################
const onMapLoaded = (map) => {
    ready.value = true;
    mapInstance.value = map;
    setRadiusDynamically();

    // Double-Click/Doppeltippen nur bei Ein-Finger-Interaktion für Geo-Setzen – auskommentier weil nicht nötig
    // setupDoubleClickHandlers(map);

    addClusterSourceAndLayers(map);
};

const mapUpdated = (event) => {
    const updateZoom = event.zoom || currentMapData.value.zoom;
    const updateCenter = event.center || currentMapData.value.center;

    setRadiusDynamically();

    currentMapData.value = {
        center: updateCenter,
        zoom: updateZoom,
    };

    appStore.setMapGeoLatLong({
        coords: {
            latitude: updateCenter[1],
            longitude: updateCenter[0]
        },
        timestamp: Date.now()
    });

    console.log('currentMapData: ', currentMapData.value);
};

const setupDoubleClickHandlers = (map) => {
    let lastTap = 0;
    let touchMoved = false;
    let touchEndTimeout = null;

    map.on('dblclick', handleDoubleClick);
    map.on('touchmove', handleTouchMove);
    map.on('touchend', handleTouchEnd);

    function handleDoubleClick(e) {
        // Nur bei Maus (nicht Touch) Geo setzen
        if (!e.originalEvent || e.originalEvent.pointerType === 'mouse') {
            setGeoLatLong({
                coords: {
                    latitude: e.lngLat.lat,
                    longitude: e.lngLat.lng
                },
                timestamp: Date.now()
            });
        }
    }

    function handleTouchMove() {
        // Sobald sich der Finger bewegt, merken wir uns das
        touchMoved = true;
        // Falls ein Timeout läuft, abbrechen
        if (touchEndTimeout) {
            clearTimeout(touchEndTimeout);
            touchEndTimeout = null;
        }
    }

    function handleTouchEnd(e) {
        // Prüfe, ob nur ein Finger verwendet wurde
        if (e.originalEvent && e.originalEvent.touches && e.originalEvent.touches.length > 0) {
            // Noch Finger auf dem Screen, kein Tap-Ende
            return;
        }
        if (e.originalEvent && e.originalEvent.changedTouches && e.originalEvent.changedTouches.length > 1) {
            // Mehr als ein Finger: kein Doppeltap
            return;
        }

        // Wenn sich der Finger bewegt hat, nicht sofort ausführen
        if (touchMoved) {
            // Warte kurz ab, ob der Finger still steht (z.B. 200ms)
            touchEndTimeout = setTimeout(() => {
                touchMoved = false;
                touchEndTimeout = null;
            }, 200);
            lastTap = Date.now();
            return;
        }

        const currentTime = Date.now();
        if (currentTime - lastTap < 400) {
            // Doppeltippen erkannt, nur bei Ein-Finger-Touch und ohne Bewegung
            setGeoLatLong({
                coords: {
                    latitude: e.lngLat.lat,
                    longitude: e.lngLat.lng
                },
                timestamp: currentTime
            });
        }
        lastTap = currentTime;
    }
};

const getGeoLocation = async(force = false) => {
    await appStore.getGeoLocation(force);
};

const setGeoLatLong = (geoData) => {
    radius.value = baseRadius;
    zoom.value = baseZoom;
    appStore.setGeoLatLong(geoData);
};

const setRadiusDynamically = (growOnly = false) => {
    // Dynamischer Radius basierend auf Zoom-Level berechnen
    // Bei Zoom-Level 11 entspricht der Radius 5km
    // Erklärung der Formel:
    // Der Radius (in km) wird dynamisch anhand des aktuellen Zoom-Levels der Karte berechnet.
    // Bei Zoom-Level 11 beträgt der Radius 5 km (das ist unser Basiswert).
    // Für jede Änderung des Zoom-Levels um 1 verdoppelt oder halbiert sich der Radius:
    // - Wenn man herauszoomt (Zoom-Level kleiner), wird der Radius größer (sichtbarer Bereich wächst).
    // - Wenn man hineinzoomt (Zoom-Level größer), wird der Radius kleiner (sichtbarer Bereich schrumpft).
    // Die Formel lautet: radius = 5 * 2^(11 - zoom)
    // Beispiel:
    //   - zoom = 11: radius = 5 * 2^(11-11) = 5 * 1 = 5 km
    //   - zoom = 10: radius = 5 * 2^(11-10) = 5 * 2 = 10 km
    //   - zoom = 12: radius = 5 * 2^(11-12) = 5 * 0.5 = 2.5 km
    // (Jede Zoomstufe halbiert/verdoppelt die sichtbare Fläche)

    let dynamicRadius = baseRadius * 2 ** (baseZoom - currentMapData.value.zoom);
    if (dynamicRadius < baseRadius) {
        dynamicRadius = baseRadius;
    }

    if (growOnly) {
        if (dynamicRadius > radius.value) {
            radius.value = Math.round(dynamicRadius);
        }
    } else {
        radius.value = Math.round(dynamicRadius);
    }
};

// Mapbox-Cluster-Integration für Locations
// Annahme: mapInstance ist die Mapbox-Instanz (ref), locations ist ein Array mit { lat, lng, ... }

const clusterSourceId = 'locations';
const clusterLayerId = 'clusters';
const unclusteredLayerId = 'unclustered-point';

const clusterMaxZoom = 10; // Bis Zoom 8 clustern, ab 9 keine Cluster mehr
const clusterRadius = 50; // Pixel

const geoJsonFromLocations = () => {
    if (!props.allLocations) return { type: 'FeatureCollection', features: [] };

    return {
        type: 'FeatureCollection',
        features: props.allLocations.map((loc) => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [loc.coordinates[0], loc.coordinates[1]]
            },
            properties: {
                // Weitere Properties für Popup etc.
                ...loc
            }
        }))
    };
};

const addClusterSourceAndLayers = (map) => {
    // Quelle entfernen, falls schon vorhanden
    if (map.getSource(clusterSourceId)) {
        if (map.getLayer(clusterLayerId)) map.removeLayer(clusterLayerId);
        if (map.getLayer('cluster-count')) map.removeLayer('cluster-count');
        if (map.getLayer(unclusteredLayerId)) map.removeLayer(unclusteredLayerId);
        map.removeSource(clusterSourceId);
    }

    map.addSource(clusterSourceId, {
        type: 'geojson',
        data: geoJsonFromLocations(),
        cluster: true,
        clusterMaxZoom,
        clusterRadius
    });

    // Cluster-Layer
    map.addLayer({
        id: clusterLayerId,
        type: 'circle',
        source: clusterSourceId,
        filter: ['has', 'point_count'],
        paint: {
            'circle-color': '#51bbd6',
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                20, 10,
                30, 30,
                40
            ],
            'circle-opacity': 0.7
        }
    });

    // Cluster-Zähler
    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: clusterSourceId,
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 14
        }
    });

    // // Einzelpunkt-Layer
    // map.addLayer({
    //     id: unclusteredLayerId,
    //     type: 'circle',
    //     source: clusterSourceId,
    //     filter: ['!', ['has', 'point_count']],
    //     paint: {
    //         'circle-color': '#f28cb1',
    //         'circle-radius': 8,
    //         'circle-stroke-width': 1,
    //         'circle-stroke-color': '#fff'
    //     }
    // });

    // Nach jedem Layer-Update die unclustered Features aktualisieren
    map.on('render', () => {
        updateUnclusteredFeatures(map);
    });

    // Auch initial nach dem Hinzufügen der Layer
    updateUnclusteredFeatures(map);

    // Optional: Wenn sich die Locations ändern, erneut aktualisieren
    // (z.B. falls du ein watch auf locations hast)
    // watch(locations, () => {
    //     if (map) updateUnclusteredFeatures(map);
    // });

    // Cluster-Klick: auf Cluster zoomen
    map.on('click', clusterLayerId, (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: [clusterLayerId]
        });
        const clusterId = features[0].properties.cluster_id;
        map.getSource(clusterSourceId).getClusterExpansionZoom(
            clusterId,
            (err, nextZoom) => {
                if (err) return;
                map.easeTo({
                    center: features[0].geometry.coordinates,
                    zoom: nextZoom
                });
            }
        );
    });

    // Einzelpunkt-Klick: z.B. Popup öffnen (hier nur Konsolenausgabe)
    map.on('click', unclusteredLayerId, (e) => {
        const feature = e.features[0];
        console.log('Einzelpunkt geklickt:', feature.properties);
        // Hier könnte ein Popup geöffnet werden
    });

    // Cursor-Style
    map.on('mouseenter', clusterLayerId, () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', clusterLayerId, () => {
        map.getCanvas().style.cursor = '';
    });
};

// Hilfsfunktion, um unclustered Features aus der Map zu holen
function updateUnclusteredFeatures(map) {
    if (!map || !map.isStyleLoaded()) return;
    // Features ohne 'point_count' sind Einzelpunkte
    const features = map.querySourceFeatures(clusterSourceId, {
        sourceLayer: undefined,
        filter: ['!', ['has', 'point_count']]
    });
    // Nur die properties.id speichern
    unclusteredFeatures.value = features
        .map((feature) => feature.properties && feature.properties.id)
        .filter((id) => id !== undefined && id !== null);
}

// Beispiel für Verwendung im onMounted-Hook:
/*
onMounted(() => {
    mapInstance.value.on('load', () => {
        addClusterSourceAndLayers(mapInstance.value, locations.value);
    });
});
*/

// Wenn sich locations ändern, kann man die Quelle aktualisieren:
/*
watch(locations, newLocs => {
    if (mapInstance.value && mapInstance.value.getSource(clusterSourceId)) {
        mapInstance.value.getSource(clusterSourceId).setData(getGeoJsonFromLocations(newLocs));
    }
});
*/

watch([center, zoom, userLocation, geo], () => {
    console.log('center: ', center.value);
    console.log('zoom: ', zoom.value);
    console.log('userLocation: ', userLocation.value);
    console.log('geo: ', geo.value);
});

watch(geo, () => {
    if (geo.value) {
        center.value = [geo.value.long, geo.value.lat];
        userLocation.value = [geo.value.long, geo.value.lat];
        // updateRadiusCircle();
    }
});
</script>

<style>
.map-container {
    width: 100%;
    height: 100lvh !important;
}
</style>
