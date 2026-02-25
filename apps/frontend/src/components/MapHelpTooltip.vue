<template>
    <transition name="fade-slide">
        <div
            v-if="isVisible"
            class="fixed z-[100] bottom-36 left-4 right-4 mx-auto max-w-sm"
        >
            <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 relative">
                <button
                    class="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 text-xs"
                    @click="dismiss"
                >
                    ✕
                </button>
                <div class="flex items-start gap-3">
                    <div class="text-2xl shrink-0 mt-0.5">💡</div>
                    <div>
                        <h4 class="font-semibold text-sm text-gray-900 mb-1">{{ t('mapHelp.title') }}</h4>
                        <ul class="text-xs text-gray-600 space-y-1.5">
                            <li class="flex items-start gap-1.5">
                                <span class="shrink-0">📍</span>
                                <span>{{ t('mapHelp.tip_markers') }}</span>
                            </li>
                            <li class="flex items-start gap-1.5">
                                <span class="shrink-0">🔍</span>
                                <span>{{ t('mapHelp.tip_search') }}</span>
                            </li>
                            <li class="flex items-start gap-1.5">
                                <span class="shrink-0">➕</span>
                                <span>{{ t('mapHelp.tip_add') }}</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <ion-button
                    fill="clear"
                    size="small"
                    class="w-full mt-2"
                    @click="dismiss"
                >
                    {{ t('mapHelp.got_it') }}
                </ion-button>
            </div>
        </div>
    </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { IonButton } from '@ionic/vue'
import { useI18n } from 'vue-i18n'

const STORAGE_KEY = 'mapHelpDismissed'
const { t } = useI18n()
const isVisible = ref(false)

onMounted(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
        setTimeout(() => {
            isVisible.value = true
        }, 1500)
    }
})

function dismiss() {
    isVisible.value = false
    localStorage.setItem(STORAGE_KEY, 'true')
}
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.4s ease;
}
.fade-slide-enter-from {
    opacity: 0;
    transform: translateY(20px);
}
.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(20px);
}
</style>
