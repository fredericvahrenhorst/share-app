<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button default-href="/login" />
                </ion-buttons>
                <ion-title>Passwort zurücksetzen</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <div class="max-w-md mx-auto pt-8">
                <div v-if="successMessage" class="rounded-lg bg-green-50 p-4 text-green-800 mb-6">
                    <p>{{ successMessage }}</p>
                    <ion-button expand="block" fill="outline" class="mt-4" router-link="/login">
                        Zum Login
                    </ion-button>
                </div>

                <form v-else @submit.prevent="handleSubmit" class="space-y-4">
                    <p class="text-gray-600 text-sm mb-4">
                        Bitte gib dein neues Passwort ein.
                    </p>

                    <ion-item class="ion-no-padding">
                        <ion-input
                            v-model="password"
                            type="password"
                            placeholder="Neues Passwort"
                            :disabled="isLoading"
                            required
                            autocomplete="new-password"
                            class="ion-no-padding"
                        />
                    </ion-item>
                    <ion-item class="ion-no-padding">
                        <ion-input
                            v-model="confirmPassword"
                            type="password"
                            placeholder="Passwort bestätigen"
                            :disabled="isLoading"
                            required
                            autocomplete="new-password"
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
                        {{ isLoading ? 'Speichern...' : 'Passwort ändern' }}
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
import { useRoute } from 'vue-router'
import { useUserStore } from '../store/userStore'

const userStore = useUserStore()
const route = useRoute()

const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const errors = ref([])
const successMessage = ref('')

const token = route.query.token

if (!token) {
    errors.value.push('Ungültiger Link. Bitte fordere einen neuen Link an.')
}

async function handleSubmit() {
    errors.value = []
    if (!token) {
        errors.value.push('Ungültiger Link.')
        return
    }
    if (!password.value || password.value.length < 6) {
        errors.value.push('Passwort muss mindestens 6 Zeichen lang sein.')
        return
    }
    if (password.value !== confirmPassword.value) {
        errors.value.push('Passwörter stimmen nicht überein.')
        return
    }

    isLoading.value = true
    try {
        const result = await userStore.resetPassword(token, password.value)

        if (result.success) {
            successMessage.value = 'Dein Passwort wurde erfolgreich geändert. Du kannst dich jetzt einloggen.'
        } else {
            errors.value = result.errors || ['Passwort-Reset fehlgeschlagen.']
        }
    } catch (err) {
        errors.value = ['Ein unerwarteter Fehler ist aufgetreten.']
    } finally {
        isLoading.value = false
    }
}
</script>
