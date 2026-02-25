<template>
    <div
        v-if="isVisible"
        class="fixed inset-0 z-[9999] bg-white flex flex-col"
    >
        <!-- Screens -->
        <div class="flex-1 overflow-hidden relative">
            <transition :name="slideDirection" mode="out-in">
                <div :key="currentStep" class="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
                    <!-- Screen 1: Willkommen -->
                    <template v-if="currentStep === 0">
                        <div class="text-6xl mb-6 animate-bounce-slow">🌱</div>
                        <h1 class="text-2xl font-bold text-gray-900 mb-3">{{ t('onboarding.screen1_title') }}</h1>
                        <p class="text-base text-gray-600 leading-relaxed max-w-sm">
                            {{ t('onboarding.screen1_description') }}
                        </p>
                    </template>

                    <!-- Screen 2: Karte -->
                    <template v-if="currentStep === 1">
                        <div class="text-6xl mb-6">🗺️</div>
                        <h1 class="text-2xl font-bold text-gray-900 mb-3">{{ t('onboarding.screen2_title') }}</h1>
                        <p class="text-base text-gray-600 leading-relaxed max-w-sm">
                            {{ t('onboarding.screen2_description') }}
                        </p>
                    </template>

                    <!-- Screen 3: Datenschutz -->
                    <template v-if="currentStep === 2">
                        <div class="text-6xl mb-6">🔒</div>
                        <h1 class="text-2xl font-bold text-gray-900 mb-3">{{ t('onboarding.screen3_title') }}</h1>
                        <p class="text-base text-gray-600 leading-relaxed max-w-sm">
                            {{ t('onboarding.screen3_description') }}
                        </p>
                    </template>
                </div>
            </transition>
        </div>

        <!-- Dots + Buttons -->
        <div class="px-8 pb-12 pt-4">
            <!-- Dot Indicators -->
            <div class="flex justify-center gap-2 mb-8">
                <div
                    v-for="i in 3"
                    :key="i"
                    class="w-2.5 h-2.5 rounded-full transition-all duration-300"
                    :class="currentStep === i - 1 ? 'bg-green-500 w-6' : 'bg-gray-300'"
                />
            </div>

            <!-- Buttons -->
            <div class="flex gap-3">
                <ion-button
                    v-if="currentStep < 2"
                    fill="clear"
                    class="flex-1"
                    @click="skip"
                >
                    {{ t('onboarding.skip') }}
                </ion-button>
                <ion-button
                    v-if="currentStep < 2"
                    expand="block"
                    class="flex-1"
                    @click="next"
                >
                    {{ t('common.next') }}
                </ion-button>
                <ion-button
                    v-if="currentStep === 2"
                    expand="block"
                    class="flex-1"
                    color="primary"
                    @click="finish"
                >
                    {{ t('onboarding.start') }}
                </ion-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { IonButton } from '@ionic/vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '../store/appStore'

const { t } = useI18n()
const appStore = useAppStore()

const isVisible = ref(false)
const currentStep = ref(0)
const slideDirection = ref('slide-left')

onMounted(() => {
    if (!appStore.walkthroughVisited) {
        isVisible.value = true
    }
})

function next() {
    if (currentStep.value < 2) {
        slideDirection.value = 'slide-left'
        currentStep.value++
    }
}

function skip() {
    completeOnboarding()
}

function finish() {
    completeOnboarding()
}

function completeOnboarding() {
    appStore.saveWalkthroughVisitedToStorage()
    appStore.walkthroughVisited = true
    isVisible.value = false
}
</script>

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active {
    transition: all 0.3s ease;
}
.slide-left-enter-from {
    opacity: 0;
    transform: translateX(40px);
}
.slide-left-leave-to {
    opacity: 0;
    transform: translateX(-40px);
}

.animate-bounce-slow {
    animation: bounce-slow 2s ease-in-out infinite;
}
@keyframes bounce-slow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}
</style>
