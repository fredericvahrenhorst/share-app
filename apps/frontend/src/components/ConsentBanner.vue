<template>
    <Transition name="consent-slide">
        <div
            v-if="isVisible"
            class="fixed bottom-0 inset-x-0 z-[9998] backdrop-blur-md bg-white/95 rounded-t-2xl shadow-2xl p-5 pb-8"
        >
            <h3 class="font-semibold text-lg mb-2">{{ t('consent.title') }}</h3>
            <p class="text-sm text-primary-400 mb-4 leading-relaxed">
                {{ t('consent.text') }}
            </p>
            <div class="flex gap-3">
                <ion-button expand="block" class="flex-1" @click="acceptConsent">
                    {{ t('consent.accept') }}
                </ion-button>
                <ion-button
                    expand="block"
                    fill="outline"
                    class="flex-1"
                    router-link="/legal?type=privacy"
                    @click="isVisible = false"
                >
                    {{ t('consent.learn_more') }}
                </ion-button>
            </div>
        </div>
    </Transition>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { IonButton } from '@ionic/vue'

const { t } = useI18n()

const CONSENT_KEY = 'cookieConsent'

const isVisible = ref(localStorage.getItem(CONSENT_KEY) !== 'accepted')

function acceptConsent() {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    isVisible.value = false
}

defineExpose({ isVisible })
</script>

<style scoped>
.consent-slide-enter-active {
    transition: transform 0.4s ease-out, opacity 0.3s ease-out;
}

.consent-slide-leave-active {
    transition: transform 0.3s ease-in, opacity 0.2s ease-in;
}

.consent-slide-enter-from,
.consent-slide-leave-to {
    transform: translateY(100%);
    opacity: 0;
}
</style>
