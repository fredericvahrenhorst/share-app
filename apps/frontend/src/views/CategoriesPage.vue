<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Kategorien</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Kategorien</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="container">
        <ion-list>
          <ion-item v-for="category in categories" :key="category.id" button @click="selectCategory(category)">
            <ion-icon :icon="category.icon" slot="start"></ion-icon>
            <ion-label>
              <h2>{{ category.name }}</h2>
              <p>{{ category.description }}</p>
            </ion-label>
          </ion-item>
        </ion-list>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonIcon,
    IonLabel,
} from '@ionic/vue';
import {
    restaurantOutline,
    carOutline,
    homeOutline,
    storefrontOutline,
    schoolOutline,
    medkitOutline,
    cartOutline,
    cafeOutline,
} from 'ionicons/icons';
import { ref } from 'vue';

const categories = ref([
    {
        id: 1,
        name: 'Restaurants',
        description: 'Restaurants und Gastronomie',
        icon: restaurantOutline,
    },
    {
        id: 2,
        name: 'Transport',
        description: 'Öffentlicher Verkehr und Taxis',
        icon: carOutline,
    },
    {
        id: 3,
        name: 'Unterkünfte',
        description: 'Hotels und Pensionen',
        icon: homeOutline,
    },
    {
        id: 4,
        name: 'Geschäfte',
        description: 'Einkaufsmöglichkeiten',
        icon: storefrontOutline,
    },
    {
        id: 5,
        name: 'Bildung',
        description: 'Schulen und Universitäten',
        icon: schoolOutline,
    },
    {
        id: 6,
        name: 'Gesundheit',
        description: 'Ärzte und Apotheken',
        icon: medkitOutline,
    },
    {
        id: 7,
        name: 'Einkaufen',
        description: 'Shopping und Einzelhandel',
        icon: cartOutline,
    },
    {
        id: 8,
        name: 'Cafés',
        description: 'Cafés und Bars',
        icon: cafeOutline,
    },
]);

function selectCategory(category) {
    console.log('Category selected:', category.name);
  // Hier können Sie die Navigation zur Karte mit Filter implementieren
}
</script>

<style scoped>
.container {
  padding: 16px;
}

ion-item {
  margin-bottom: 8px;
  border-radius: 8px;
}

ion-icon {
  font-size: 24px;
  color: var(--ion-color-primary);
}
</style>
