<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button default-href="/login" />
                </ion-buttons>
                <ion-title>Passwort vergessen</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <div class="max-w-md mx-auto pt-8">
                <div v-if="successMessage" class="rounded-lg bg-green-50 p-4 text-green-800 mb-6">
                    <p>{{ successMessage }}</p>
                    <ion-button expand="block" fill="outline" class="mt-4" router-link="/login">
                        Zurück zum Login
                    </ion-button>
                </div>

                <form v-else @submit.prevent="handleSubmit" class="space-y-4">
                    <p class="text-gray-600 text-sm mb-4">
                        Gib deine E-Mail-Adresse ein. Wir senden dir einen Link zum Zurücksetzen deines Passworts.
                    </p>

                    <ion-item class="ion-no-padding">
                        <ion-input
                            v-model="email"
                            type="email"
                            placeholder="Deine E-Mail-Adresse"
                            :disabled="isLoading"
                            required
                            autocomplete="email"
                            class="ion-no-padding"
                        />
                    </ion-item>

                    <div v-if="errors.length" class="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                        <p v-for="(err, i) in errors" :key="i">{{ err }}</p>
                    </div>

                    <ion-button
                        expand="block"
                        type="submit"
                        :disabled="isLoading"
                        class="mt-6"
                    >
                        <ion-spinner v-if="isLoading" name="crescent" class="mr-2" />
                        {{ isLoading ? 'Senden...' : 'Link anfordern' }}
                    </ion-button>
                </form>
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
    IonButton,
    IonInput,
    IonItem,
    IonButtons,
    IonBackButton,
    IonSpinner,
} from '@ionic/vue'
import { ref } from 'vue'
import { useUserStore } from '../store/userStore'

const userStore = useUserStore()

const email = ref('')
const isLoading = ref(false)
const errors = ref([])
const successMessage = ref('')

async function handleSubmit() {
    errors.value = []
    if (!email.value.trim()) {
        errors.value.push('Bitte E-Mail-Adresse eingeben.')
        return
    }

    isLoading.value = true
    try {
        const result = await userStore.forgotPassword(email.value.trim())

        if (result.success) {
            successMessage.value = 'Falls ein Konto mit dieser E-Mail existiert, haben wir dir einen Link zum Zurücksetzen gesendet.'
        } else {
            errors.value = result.errors || ['Anfrage fehlgeschlagen.']
        }
    } catch (err) {
        errors.value = ['Ein unerwarteter Fehler ist aufgetreten.']
    } finally {
        isLoading.value = false
    }
}
</script>
