<template>
    <ion-page>
        <ion-content class="ion-padding">
            <div v-if="isLoading" class="flex flex-col items-center justify-center h-full">
                <ion-spinner name="crescent" class="text-4xl" />
                <p class="mt-4 text-gray-500">{{ t('misc.is_loading') }}</p>
            </div>

            <div v-else-if="hasError" class="flex flex-col items-center justify-center h-full text-center">
                <ion-icon :icon="alertCircleOutline" class="w-16 h-16 text-error mb-4" />
                <h2 class="text-lg font-semibold text-primary-600 mb-2">
                    {{ t('errors.generic') }}
                </h2>
                <ion-button fill="outline" router-link="/home">
                    {{ t('auth.back_to_home') }}
                </ion-button>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { IonPage, IonContent, IonSpinner, IonButton, IonIcon } from '@ionic/vue'
import { alertCircleOutline } from 'ionicons/icons'
import { useLocationsStore } from '../store/locationsStore'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const locationsStore = useLocationsStore()

const isLoading = ref(true)
const hasError = ref(false)

onMounted(async () => {
    const id = route.params.id
    if (!id) {
        hasError.value = true
        isLoading.value = false
        return
    }

    try {
        const location = await locationsStore.fetchLocationById(id)
        if (location) {
            router.replace('/home')
        } else {
            hasError.value = true
        }
    } catch {
        hasError.value = true
    } finally {
        isLoading.value = false
    }
})
</script>
