<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button :text="''" default-href="/login" />
                </ion-buttons>
                <ion-title>{{ t('auth.register_title') }}</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <div class="max-w-md mx-auto pt-8">
                <form @submit.prevent="handleSubmit" class="space-y-4">
                    <ion-item class="ion-no-padding">
                        <ion-input
                            v-model="name"
                            type="text"
                            :placeholder="t('auth.register_name')"
                            :disabled="isLoading"
                            required
                            autocomplete="name"
                            class="ion-no-padding"
                        />
                    </ion-item>
                    <ion-item class="ion-no-padding">
                        <ion-input
                            v-model="email"
                            type="email"
                            :placeholder="t('auth.register_email')"
                            :disabled="isLoading"
                            required
                            autocomplete="email"
                            class="ion-no-padding"
                        />
                    </ion-item>
                    <ion-item class="ion-no-padding">
                        <ion-input
                            v-model="password"
                            type="password"
                            :placeholder="t('auth.register_password')"
                            :disabled="isLoading"
                            required
                            autocomplete="new-password"
                            minlength="6"
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
                        {{ isLoading ? t('auth.register_loading') : t('auth.register_submit') }}
                    </ion-button>
                </form>

                <div class="mt-8 text-center">
                    <p class="text-sm text-gray-600 mb-2">{{ t('auth.register_has_account') }}</p>
                    <ion-button fill="clear" size="small" @click="goToLogin">
                        {{ t('auth.login_link') }}
                    </ion-button>
                </div>
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
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { useUserStore } from '../store/userStore'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const name = ref('')
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errors = ref([])

const redirectTo = route.query.redirect || '/profil'

async function handleSubmit() {
    errors.value = []
    if (!name.value.trim() || !email.value.trim() || !password.value) {
        errors.value.push('Bitte alle Felder ausfüllen.')
        return
    }
    if (password.value.length < 6) {
        errors.value.push('Das Passwort muss mindestens 6 Zeichen haben.')
        return
    }

    isLoading.value = true
    try {
        const result = await userStore.register({
            name: name.value.trim(),
            email: email.value.trim(),
            password: password.value,
        })

        if (result.success) {
            const loginResult = await userStore.login({
                email: email.value.trim(),
                password: password.value,
            })
            if (loginResult.success) {
                router.replace(redirectTo)
            } else {
                router.push({ name: 'Login', query: { redirect: redirectTo } })
            }
        } else {
            errors.value = result.errors || ['Registrierung fehlgeschlagen.']
        }
    } catch (err) {
        errors.value = ['Ein unerwarteter Fehler ist aufgetreten.']
    } finally {
        isLoading.value = false
    }
}

function goToLogin() {
    router.push({ name: 'Login', query: { redirect: redirectTo } })
}
</script>
