<template>
    <span
        v-if="resolved.type === 'emoji'"
        class="inline-flex items-center justify-center leading-none"
        :class="sizeClass"
        aria-hidden="true"
    >
        {{ resolved.emoji }}
    </span>
    <ion-icon
        v-else
        :icon="resolved.icon"
        :class="sizeClass"
        aria-hidden="true"
    />
</template>

<script setup>
import { computed } from 'vue'
import { IonIcon } from '@ionic/vue'
import { resolveCategoryIcon } from '../composables/useCategoryIcon'

const props = defineProps({
    icon: {
        type: String,
        default: '',
    },
    /** Tailwind size classes, e.g. "w-6 h-6 text-xl" */
    sizeClass: {
        type: String,
        default: 'w-6 h-6',
    },
})

const resolved = computed(() => resolveCategoryIcon(props.icon))
</script>
