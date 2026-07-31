<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>{{ t('tabs.categories') }}</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content :fullscreen="true">
            <ion-header collapse="condense">
                <ion-toolbar>
                    <ion-title size="large">{{ t('tabs.categories') }}</ion-title>
                </ion-toolbar>
            </ion-header>

            <div class="p-4" style="padding-bottom: var(--tab-bar-height)">
                <div v-if="isLoading" class="flex flex-col items-center justify-center py-16 text-center text-primary-400">
                    <ion-spinner name="crescent"></ion-spinner>
                    <p class="mt-4">{{ t('categories.loading') }}</p>
                </div>

                <div
                    v-else-if="categories.length === 0"
                    class="flex flex-col items-center justify-center py-16 text-center"
                >
                    <ion-icon :icon="gridOutline" class="w-16 h-16 mb-4 text-neutral-300"></ion-icon>
                    <h2 class="text-xl font-semibold mb-2 text-primary-600">{{ t('categories.empty_title') }}</h2>
                    <p class="text-sm text-primary-400">{{ t('categories.empty_description') }}</p>
                </div>

                <div v-else class="grid grid-cols-2 gap-4 mb-6">
                    <div
                        v-for="category in categories"
                        :key="category.id"
                        role="button"
                        tabindex="0"
                        :aria-label="category.name"
                        class="bg-white rounded-xl p-5 text-center shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-300"
                        @click="selectCategory(category)"
                        @keydown.enter.prevent="selectCategory(category)"
                        @keydown.space.prevent="selectCategory(category)"
                    >
                        <div
                            class="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 text-white"
                            :style="{ background: category.color || '#275243' }"
                            aria-hidden="true"
                        >
                            <CategoryIcon :icon="category.icon" size-class="w-7 h-7 text-2xl text-white" />
                        </div>
                        <h3 class="text-base font-semibold text-primary-600 mb-2">{{ category.name }}</h3>
                        <p class="text-xs text-primary-400 leading-relaxed">{{ category.description }}</p>
                    </div>
                </div>

                <ion-button
                    v-if="categories.length > 0"
                    expand="block"
                    class="mt-4 rounded-xl py-4"
                    @click="showAllCategories"
                >
                    {{ t('categories.show_all') }}
                </ion-button>
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
    IonIcon,
    IonSpinner,
} from '@ionic/vue'
import { gridOutline } from 'ionicons/icons'
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLocationsStore } from '../store/locationsStore'
import CategoryIcon from '../components/CategoryIcon.vue'

const { t } = useI18n()
const router = useRouter()
const locationsStore = useLocationsStore()

const categories = computed(() => locationsStore.categories)
const isLoading = computed(() => locationsStore.isLoading)

function selectCategory(category) {
    locationsStore.applyFilters({ categories: [category.id] })
    router.push('/home')
}

function showAllCategories() {
    locationsStore.clearFilters()
    router.push('/home')
}

onMounted(async () => {
    if (!categories.value.length) {
        await locationsStore.fetchCategories()
    }
})
</script>
