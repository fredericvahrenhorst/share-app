<template>
    <div
        v-if="isVisible"
        class="fixed top-4 left-4 z-[10000] bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 p-3"
    >
        <div class="flex items-center gap-1 mb-2">
            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Style</span>
            <button class="ml-auto text-gray-400 text-xs" @click="isVisible = false">✕</button>
        </div>
        <div class="flex gap-1.5">
            <button
                v-for="style in styles"
                :key="style.id"
                class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                :class="activeStyle === style.id
                    ? 'bg-[#275243] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                @click="setStyle(style.id)"
            >
                {{ style.label }}
            </button>
        </div>
        <p class="text-[10px] text-gray-400 mt-1.5">{{ activeFont }}</p>
    </div>
    <button
        v-if="!isVisible"
        class="fixed top-4 left-4 z-[10000] w-8 h-8 bg-[#275243] text-white rounded-full shadow-lg text-xs font-bold flex items-center justify-center"
        @click="isVisible = true"
    >
        🎨
    </button>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const styles = [
    { id: 'modern', label: 'Modern', font: 'DM Sans' },
    { id: 'bold', label: 'Bold', font: 'Space Grotesk' },
    { id: 'blur', label: 'Blur', font: 'Plus Jakarta Sans' },
]

const activeStyle = ref(localStorage.getItem('detailStyle') || 'modern')
const isVisible = ref(true)

const activeFont = ref(styles.find((s) => s.id === activeStyle.value)?.font || '')

function setStyle(styleId) {
    document.body.classList.remove('style-modern', 'style-bold', 'style-blur')
    document.body.classList.add(`style-${styleId}`)
    activeStyle.value = styleId
    activeFont.value = styles.find((s) => s.id === styleId)?.font || ''
    localStorage.setItem('detailStyle', styleId)
}

watch(activeStyle, (val) => {
    document.body.classList.remove('style-modern', 'style-bold', 'style-blur')
    document.body.classList.add(`style-${val}`)
})

onMounted(() => {
    setStyle(activeStyle.value)
})
</script>
