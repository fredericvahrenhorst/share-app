<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button default-href="/profil" />
                </ion-buttons>
                <ion-title>{{ pageTitle }}</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content :fullscreen="true">
            <div class="p-6 max-w-2xl mx-auto">
                <!-- Impressum -->
                <template v-if="type === 'imprint'">
                    <h1 class="text-2xl font-bold mb-4">{{ t('legal.imprint_title') }}</h1>

                    <section class="mb-6">
                        <h2 class="text-lg font-semibold mb-2">{{ t('legal.imprint_responsible') }}</h2>
                        <p class="text-gray-700 leading-relaxed">
                            ShareApp<br>
                            Musterstraße 1<br>
                            12345 Musterstadt<br>
                            Deutschland
                        </p>
                    </section>

                    <section class="mb-6">
                        <h2 class="text-lg font-semibold mb-2">{{ t('legal.imprint_contact') }}</h2>
                        <p class="text-gray-700 leading-relaxed">
                            E-Mail: info@shareapp.local<br>
                        </p>
                    </section>

                    <section class="mb-6">
                        <h2 class="text-lg font-semibold mb-2">{{ t('legal.imprint_disclaimer') }}</h2>
                        <p class="text-sm text-gray-600 leading-relaxed">
                            {{ t('legal.imprint_disclaimer_text') }}
                        </p>
                    </section>
                </template>

                <!-- Datenschutzerklärung -->
                <template v-if="type === 'privacy'">
                    <h1 class="text-2xl font-bold mb-4">{{ t('legal.privacy_title') }}</h1>

                    <section class="mb-6">
                        <h2 class="text-lg font-semibold mb-2">{{ t('legal.privacy_overview') }}</h2>
                        <p class="text-sm text-gray-600 leading-relaxed">
                            {{ t('legal.privacy_overview_text') }}
                        </p>
                    </section>

                    <section class="mb-6">
                        <h2 class="text-lg font-semibold mb-2">{{ t('legal.privacy_data_collected') }}</h2>
                        <ul class="text-sm text-gray-600 space-y-1 list-disc pl-5">
                            <li>{{ t('legal.privacy_data_email') }}</li>
                            <li>{{ t('legal.privacy_data_name') }}</li>
                            <li>{{ t('legal.privacy_data_location') }}</li>
                            <li>{{ t('legal.privacy_data_content') }}</li>
                        </ul>
                    </section>

                    <section class="mb-6">
                        <h2 class="text-lg font-semibold mb-2">{{ t('legal.privacy_purpose') }}</h2>
                        <p class="text-sm text-gray-600 leading-relaxed">
                            {{ t('legal.privacy_purpose_text') }}
                        </p>
                    </section>

                    <section class="mb-6">
                        <h2 class="text-lg font-semibold mb-2">{{ t('legal.privacy_rights') }}</h2>
                        <p class="text-sm text-gray-600 leading-relaxed">
                            {{ t('legal.privacy_rights_text') }}
                        </p>
                    </section>

                    <section class="mb-6">
                        <h2 class="text-lg font-semibold mb-2">{{ t('legal.privacy_mapbox') }}</h2>
                        <p class="text-sm text-gray-600 leading-relaxed">
                            {{ t('legal.privacy_mapbox_text') }}
                        </p>
                    </section>
                </template>
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
    IonButtons,
    IonBackButton,
} from '@ionic/vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const { t } = useI18n()
const route = useRoute()

const type = computed(() => route.query.type || 'imprint')
const pageTitle = computed(() =>
    type.value === 'privacy' ? t('legal.privacy_title') : t('legal.imprint_title')
)
</script>
