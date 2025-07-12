<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Favoriten</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content :fullscreen="true">
            <ion-header collapse="condense">
                <ion-toolbar>
                    <ion-title size="large">Favoriten</ion-title>
                </ion-toolbar>
            </ion-header>

            <div class="container">
                <div v-if="favorites.length === 0" class="empty-state">
                    <ion-icon :icon="heartOutline" size="large"></ion-icon>
                    <h2>Keine Favoriten</h2>
                    <p>Sie haben noch keine Orte zu Ihren Favoriten hinzugefügt.</p>
                </div>

                <ion-list v-else>
                    <ion-item v-for="favorite in favorites" :key="favorite.id" button @click="openFavorite(favorite)">
                        <ion-thumbnail slot="start">
                            <img :src="favorite.image" :alt="favorite.name" />
                        </ion-thumbnail>
                        <ion-label>
                            <h2>{{ favorite.name }}</h2>
                            <p>{{ favorite.address }}</p>
                            <p>{{ favorite.category }}</p>
                        </ion-label>
                        <ion-button slot="end" fill="clear" @click.stop="removeFavorite(favorite.id)">
                            <ion-icon :icon="heart" color="danger"></ion-icon>
                        </ion-button>
                    </ion-item>
                </ion-list>
            </div>
        </ion-content>
    </ion-page>
</template>

<script>
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonThumbnail, IonLabel, IonButton, IonIcon } from '@ionic/vue';
import { heart, heartOutline } from 'ionicons/icons';

export default {
    name: 'FavoritesPage',
    components: { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonThumbnail, IonLabel, IonButton, IonIcon },
    data() {
        return {
            favorites: [
                {
                    id: 1,
                    name: 'Café Central',
                    address: 'Hauptstraße 123, 12345 Stadt',
                    category: 'Café',
                    image: 'https://via.placeholder.com/80x80'
                },
                {
                    id: 2,
                    name: 'Restaurant Zum Goldenen Löwen',
                    address: 'Marktplatz 5, 12345 Stadt',
                    category: 'Restaurant',
                    image: 'https://via.placeholder.com/80x80'
                },
                {
                    id: 3,
                    name: 'Apotheke am Markt',
                    address: 'Kirchstraße 8, 12345 Stadt',
                    category: 'Apotheke',
                    image: 'https://via.placeholder.com/80x80'
                }
            ]
        };
    },
    methods: {
        openFavorite(favorite) {
            console.log('Favorite opened:', favorite.name);
            // Hier können Sie die Navigation zur Detailansicht implementieren
        },
        removeFavorite(id) {
            this.favorites = this.favorites.filter(f => f.id !== id);
            console.log('Favorite removed:', id);
        }
    }
};
</script>

<style scoped>
.container {
    padding: 16px;
}

.empty-state {
    text-align: center;
    padding: 60px 20px;
    color: var(--ion-color-medium);
}

.empty-state ion-icon {
    font-size: 64px;
    margin-bottom: 16px;
}

.empty-state h2 {
    margin: 16px 0 8px 0;
    font-size: 20px;
    font-weight: 600;
}

.empty-state p {
    margin: 0;
    font-size: 14px;
    line-height: 1.4;
}

ion-item {
    margin-bottom: 8px;
    border-radius: 8px;
}

ion-thumbnail {
    --size: 60px;
    border-radius: 8px;
    overflow: hidden;
}

ion-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
</style>
