<template>
    <Transition name="success-fade">
        <div
            v-if="isVisible"
            class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm"
        >
            <div class="plant-container">
                <div class="plant-pot">
                    <div class="pot-body"></div>
                </div>
                <div class="plant-stem"></div>
                <div class="plant-leaf plant-leaf-left"></div>
                <div class="plant-leaf plant-leaf-right"></div>
                <div class="plant-leaf plant-leaf-top-left"></div>
                <div class="plant-leaf plant-leaf-top-right"></div>
                <div class="plant-flower"></div>
            </div>
            <p class="mt-8 text-xl font-semibold text-green-700 animate-fade-in-up">
                {{ message }}
            </p>
        </div>
    </Transition>
</template>

<script setup>
import { watch } from 'vue'

const props = defineProps({
    isVisible: {
        type: Boolean,
        default: false,
    },
    message: {
        type: String,
        default: 'Erfolgreich!',
    },
})

const emit = defineEmits(['complete'])

watch(
    () => props.isVisible,
    (newVal) => {
        if (newVal) {
            setTimeout(() => {
                emit('complete')
            }, 3000)
        }
    },
)
</script>

<style scoped>
.plant-container {
    position: relative;
    width: 120px;
    height: 200px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
}

.plant-pot {
    position: absolute;
    bottom: 0;
    z-index: 2;
}

.pot-body {
    width: 60px;
    height: 40px;
    background: linear-gradient(135deg, #d97706, #b45309);
    border-radius: 0 0 12px 12px;
    margin: 0 auto;
    animation: pot-appear 0.4s ease-out forwards;
    transform: scale(0);
}

.plant-stem {
    position: absolute;
    bottom: 35px;
    left: 50%;
    transform: translateX(-50%) scaleY(0);
    transform-origin: bottom;
    width: 6px;
    height: 100px;
    background: linear-gradient(to top, #15803d, #22c55e);
    border-radius: 3px;
    animation: stem-grow 0.8s ease-out 0.4s forwards;
}

.plant-leaf {
    position: absolute;
    width: 30px;
    height: 16px;
    background: #22c55e;
    border-radius: 50% 50% 50% 0;
    transform: scale(0);
}

.plant-leaf-left {
    bottom: 80px;
    left: 22px;
    transform-origin: right center;
    animation: leaf-grow 0.4s ease-out 1.0s forwards;
    rotate: -30deg;
}

.plant-leaf-right {
    bottom: 90px;
    right: 22px;
    transform-origin: left center;
    border-radius: 50% 50% 0 50%;
    animation: leaf-grow 0.4s ease-out 1.2s forwards;
    rotate: 30deg;
}

.plant-leaf-top-left {
    bottom: 115px;
    left: 28px;
    width: 24px;
    height: 13px;
    transform-origin: right center;
    animation: leaf-grow 0.4s ease-out 1.4s forwards;
    rotate: -40deg;
}

.plant-leaf-top-right {
    bottom: 125px;
    right: 28px;
    width: 24px;
    height: 13px;
    transform-origin: left center;
    border-radius: 50% 50% 0 50%;
    animation: leaf-grow 0.4s ease-out 1.6s forwards;
    rotate: 40deg;
}

.plant-flower {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%) scale(0);
    width: 24px;
    height: 24px;
    background: radial-gradient(circle, #fbbf24, #f59e0b);
    border-radius: 50%;
    box-shadow: 0 0 0 8px #22c55e40;
    animation: flower-bloom 0.5s ease-out 1.8s forwards;
}

@keyframes pot-appear {
    to {
        transform: scale(1);
    }
}

@keyframes stem-grow {
    to {
        transform: translateX(-50%) scaleY(1);
    }
}

@keyframes leaf-grow {
    to {
        transform: scale(1);
    }
}

@keyframes flower-bloom {
    0% {
        transform: translateX(-50%) scale(0);
    }
    60% {
        transform: translateX(-50%) scale(1.2);
    }
    100% {
        transform: translateX(-50%) scale(1);
    }
}

.animate-fade-in-up {
    animation: fade-in-up 0.6s ease-out 1.5s both;
}

@keyframes fade-in-up {
    from {
        opacity: 0;
        transform: translateY(16px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.success-fade-enter-active {
    transition: opacity 0.3s ease;
}

.success-fade-leave-active {
    transition: opacity 0.5s ease;
}

.success-fade-enter-from,
.success-fade-leave-to {
    opacity: 0;
}
</style>
