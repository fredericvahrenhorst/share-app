<template>
    <div v-if="type === 'card'" class="flex gap-3 p-3 rounded-lg">
        <ion-skeleton-text
            animated
            class="w-16 h-16 rounded-lg shrink-0"
        />
        <div class="flex flex-col gap-2 flex-1">
            <ion-skeleton-text animated class="w-3/4 h-4 rounded" />
            <ion-skeleton-text animated class="w-1/2 h-3 rounded" />
        </div>
    </div>

    <div v-else-if="type === 'list-item'" class="flex items-center gap-3 p-2 rounded-lg">
        <ion-skeleton-text
            animated
            class="w-10 h-10 rounded-full shrink-0"
        />
        <ion-skeleton-text animated class="w-2/3 h-4 rounded flex-1" />
    </div>

    <div v-else-if="type === 'detail'" class="flex flex-col gap-3 p-4 rounded-lg">
        <ion-skeleton-text
            animated
            class="w-full h-48 rounded-lg"
        />
        <ion-skeleton-text animated class="w-2/3 h-6 rounded" />
        <ion-skeleton-text animated class="w-full h-3 rounded" />
        <ion-skeleton-text animated class="w-full h-3 rounded" />
        <ion-skeleton-text animated class="w-4/5 h-3 rounded" />
    </div>
</template>

<script setup>
import { IonSkeletonText } from '@ionic/vue'

defineProps({
    type: {
        type: String,
        default: 'card',
        validator: (value) => ['card', 'list-item', 'detail'].includes(value),
    },
})
</script>
