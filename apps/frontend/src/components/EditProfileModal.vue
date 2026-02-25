<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="dismiss">{{ t('common.cancel') }}</ion-button>
                </ion-buttons>
                <ion-title>{{ t('profile.edit_title') }}</ion-title>
                <ion-buttons slot="end">
                    <ion-button :disabled="isSaving" @click="save">
                        <ion-spinner v-if="isSaving" name="crescent" class="mr-1" />
                        {{ t('common.save') }}
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <form class="space-y-4" @submit.prevent="save">
                <!-- Avatar -->
                <div class="flex flex-col items-center py-4">
                    <div class="relative">
                        <ion-avatar class="w-24 h-24 mb-2">
                            <ion-img
                                v-if="avatarPreview"
                                :src="avatarPreview"
                                class="object-cover w-full h-full rounded-full"
                            />
                            <div
                                v-else-if="currentAvatarUrl"
                                class="w-full h-full rounded-full bg-cover bg-center"
                                :style="{ backgroundImage: `url(${currentAvatarUrl})` }"
                            />
                            <div
                                v-else
                                class="w-full h-full flex items-center justify-center bg-gray-200 rounded-full"
                            >
                                <ion-icon :icon="personCircleOutline" class="text-5xl text-gray-500" />
                            </div>
                        </ion-avatar>
                        <label
                            class="absolute bottom-0 right-0 flex items-center justify-center w-8 h-8 bg-primary rounded-full text-white cursor-pointer shadow"
                        >
                            <ion-icon :icon="camera" class="text-lg" />
                            <input
                                type="file"
                                accept="image/*"
                                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                @change="onFileSelect"
                            />
                        </label>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">{{ t('profile.edit_avatar_hint') }}</p>
                </div>

                <ion-item class="rounded-lg border border-gray-200" lines="none">
                    <ion-label position="stacked">{{ t('profile.edit_name') }} *</ion-label>
                    <ion-input v-model="form.name" type="text" required />
                </ion-item>

                <ion-item class="rounded-lg border border-gray-200" lines="none">
                    <ion-label position="stacked">{{ t('profile.edit_bio') }}</ion-label>
                    <ion-textarea v-model="form.bio" rows="3" :placeholder="t('profile.edit_bio_placeholder')" />
                </ion-item>

                <p v-if="saveError" class="text-sm text-red-600">{{ saveError }}</p>
            </form>
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
    IonButtons,
    IonAvatar,
    IonImg,
    IonIcon,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSpinner,
    modalController,
} from '@ionic/vue'
import { personCircleOutline, camera } from 'ionicons/icons'
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { toastController } from '@ionic/vue'

import { useUserStore } from '../store/userStore'
import useAvatarUrl from '../composables/useAvatarUrl'
import apiCall from '../composables/apiCall'

const { t } = useI18n()
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const form = ref({ name: '', bio: '' })
const selectedFile = ref(null)
const avatarPreview = ref(null)
const isSaving = ref(false)
const saveError = ref('')

const currentAvatarUrl = computed(() => useAvatarUrl(user.value?.avatar))

function onFileSelect(event) {
    const file = event.target?.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    selectedFile.value = file
    avatarPreview.value = null
    const reader = new FileReader()
    reader.onload = (e) => {
        avatarPreview.value = e.target?.result ?? null
    }
    reader.readAsDataURL(file)
}

function dismiss() {
    modalController.dismiss()
}

async function save() {
    if (!form.value.name?.trim()) {
        saveError.value = t('profile.edit_name_required')
        return
    }
    saveError.value = ''
    isSaving.value = true
    try {
        let avatarId = user.value?.avatar?.id ?? (typeof user.value?.avatar === 'number' ? user.value.avatar : null)

        if (selectedFile.value) {
            const uploadData = new FormData()
            uploadData.append('file', selectedFile.value)
            uploadData.append('_payload', JSON.stringify({ alt: form.value.name.trim() }))
            const mediaResponse = await apiCall('media', {
                method: 'POST',
                data: uploadData,
            })
            avatarId = mediaResponse.doc?.id ?? mediaResponse.id
        }

        await userStore.updateUser({
            name: form.value.name.trim(),
            bio: form.value.bio?.trim() || undefined,
            ...(avatarId != null ? { avatar: avatarId } : {}),
        })

        const toast = await toastController.create({
            message: t('profile.edit_success'),
            duration: 2000,
            position: 'bottom',
        })
        await toast.present()
        modalController.dismiss(true)
    } catch (err) {
        saveError.value = err.response?.data?.message || t('profile.edit_error')
    } finally {
        isSaving.value = false
    }
}

onMounted(() => {
    form.value = {
        name: user.value?.name ?? '',
        bio: user.value?.bio ?? '',
    }
})
</script>
