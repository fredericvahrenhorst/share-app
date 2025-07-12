<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Profil</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content :fullscreen="true">
            <ion-header collapse="condense">
                <ion-toolbar>
                    <ion-title size="large">Profil</ion-title>
                </ion-toolbar>
            </ion-header>

            <div class="container">
                <!-- Profil Header -->
                <div class="profile-header">
                    <ion-avatar class="profile-avatar">
                        <img :src="user.avatar" :alt="user.name" />
                    </ion-avatar>
                    <h2>{{ user.name }}</h2>
                    <p>{{ user.email }}</p>
                </div>

                <!-- Profil Optionen -->
                <ion-list>
                    <ion-item button @click="openSettings">
                        <ion-icon :icon="settings" slot="start"></ion-icon>
                        <ion-label>Einstellungen</ion-label>
                        <ion-icon :icon="chevronForward" slot="end"></ion-icon>
                    </ion-item>

                    <ion-item button @click="openNotifications">
                        <ion-icon :icon="notifications" slot="start"></ion-icon>
                        <ion-label>Benachrichtigungen</ion-label>
                        <ion-icon :icon="chevronForward" slot="end"></ion-icon>
                    </ion-item>

                    <ion-item button @click="openPrivacy">
                        <ion-icon :icon="shield" slot="start"></ion-icon>
                        <ion-label>Datenschutz</ion-label>
                        <ion-icon :icon="chevronForward" slot="end"></ion-icon>
                    </ion-item>

                    <ion-item button @click="openHelp">
                        <ion-icon :icon="helpCircle" slot="start"></ion-icon>
                        <ion-label>Hilfe & Support</ion-label>
                        <ion-icon :icon="chevronForward" slot="end"></ion-icon>
                    </ion-item>

                    <ion-item button @click="openAbout">
                        <ion-icon :icon="informationCircle" slot="start"></ion-icon>
                        <ion-label>Über die App</ion-label>
                        <ion-icon :icon="chevronForward" slot="end"></ion-icon>
                    </ion-item>
                </ion-list>

                <!-- Statistiken -->
                <div class="stats-section">
                    <h3>Ihre Aktivität</h3>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-number">{{ stats.favoriten }}</div>
                            <div class="stat-label">Favoriten</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">{{ stats.besucht }}</div>
                            <div class="stat-label">Besucht</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">{{ stats.bewertungen }}</div>
                            <div class="stat-label">Bewertungen</div>
                        </div>
                    </div>
                </div>

                <!-- Abmelden Button -->
                <ion-button expand="block" fill="outline" color="danger" @click="logout">
                    <ion-icon :icon="logOut" slot="start"></ion-icon>
                    Abmelden
                </ion-button>
            </div>
        </ion-content>
    </ion-page>
</template>

<script>
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
    IonIcon, IonLabel, IonAvatar, IonButton
} from '@ionic/vue';
import {
    settings, notifications, shield, helpCircle, informationCircle,
    chevronForward, logOut
} from 'ionicons/icons';

export default {
    name: 'ProfilPage',
    components: {
        IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
        IonIcon, IonLabel, IonAvatar, IonButton
    },
    data() {
        return {
            user: {
                name: 'Max Mustermann',
                email: 'max.mustermann@example.com',
                avatar: 'https://via.placeholder.com/100x100'
            },
            stats: {
                favoriten: 12,
                besucht: 45,
                bewertungen: 8
            }
        };
    },
    methods: {
        openSettings() {
            console.log('Einstellungen öffnen');
        },
        openNotifications() {
            console.log('Benachrichtigungen öffnen');
        },
        openPrivacy() {
            console.log('Datenschutz öffnen');
        },
        openHelp() {
            console.log('Hilfe öffnen');
        },
        openAbout() {
            console.log('Über die App öffnen');
        },
        logout() {
            console.log('Abmelden');
            // Hier können Sie die Abmelde-Logik implementieren
        }
    }
};
</script>

<style scoped>
.container {
    padding: 16px;
}

.profile-header {
    text-align: center;
    padding: 20px 0;
    margin-bottom: 20px;
}

.profile-avatar {
    width: 80px;
    height: 80px;
    margin: 0 auto 16px auto;
}

.profile-header h2 {
    margin: 0 0 4px 0;
    font-size: 20px;
    font-weight: 600;
}

.profile-header p {
    margin: 0;
    color: var(--ion-color-medium);
    font-size: 14px;
}

ion-item {
    margin-bottom: 8px;
    border-radius: 8px;
}

.stats-section {
    margin: 24px 0;
}

.stats-section h3 {
    margin: 0 0 16px 0;
    font-size: 18px;
    font-weight: 600;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
}

.stat-item {
    text-align: center;
    padding: 16px;
    background: var(--ion-color-light);
    border-radius: 8px;
}

.stat-number {
    font-size: 24px;
    font-weight: 700;
    color: var(--ion-color-primary);
    margin-bottom: 4px;
}

.stat-label {
    font-size: 12px;
    color: var(--ion-color-medium);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

ion-button {
    margin-top: 24px;
}
</style>
