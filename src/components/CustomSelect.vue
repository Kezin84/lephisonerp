<template>
  <div class="custom-select-wrapper" ref="selectRef">
    <div 
      class="custom-select-trigger" 
      :class="{ 'is-open': isOpen }"
      @click="toggleOpen"
    >
      <span class="selected-label">{{ selectedLabel }}</span>
      <svg class="chevron" :class="{ 'rotate': isOpen }" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
    </div>
    
    <transition name="dropdown">
      <div v-if="isOpen" class="custom-select-dropdown">
        <div class="custom-select-options">
          <div 
            v-for="option in options" 
            :key="option.value" 
            class="custom-select-option"
            :class="{ 'is-selected': option.value === modelValue }"
            @click="selectOption(option)"
          >
            {{ option.label }}
            <svg v-if="option.value === modelValue" class="check-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)
const selectRef = ref(null)

const selectedLabel = computed(() => {
  const selected = props.options.find(opt => opt.value === props.modelValue)
  return selected ? selected.label : (props.options.length > 0 ? props.options[0].label : '')
})

const toggleOpen = () => {
  isOpen.value = !isOpen.value
}

const selectOption = (option) => {
  emit('update:modelValue', option.value)
  emit('change', option.value)
  isOpen.value = false
}

const handleClickOutside = (event) => {
  if (selectRef.value && !selectRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.custom-select-wrapper {
  position: relative;
  width: 100%;
}

.custom-select-trigger {
  width: 100%;
  padding: 0.6rem 1.2rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 9999px;
  font-family: inherit;
  font-size: 0.875rem;
  color: #1e293b;
  background: rgba(248, 250, 252, 0.8);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.25s ease;
  box-sizing: border-box;
  font-weight: 500;
  min-height: 42px;
}

.custom-select-trigger:hover {
  background: white;
}

.custom-select-trigger.is-open {
  border-color: #34d399;
  background-color: white;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.08), 0 2px 8px -2px rgba(16, 185, 129, 0.12);
}

.chevron {
  transition: transform 0.3s ease;
}

.chevron.rotate {
  transform: rotate(180deg);
}

.custom-select-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 100%;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(16, 185, 129, 0.1);
  z-index: 9999;
  overflow: hidden;
}

.custom-select-options {
  max-height: 250px;
  overflow-y: auto;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* Custom scrollbar for options */
.custom-select-options::-webkit-scrollbar {
  width: 6px;
}
.custom-select-options::-webkit-scrollbar-track {
  background: transparent;
}
.custom-select-options::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.custom-select-options::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.custom-select-option {
  padding: 0.6rem 1rem;
  font-size: 0.875rem;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.custom-select-option:hover {
  background: #ecfdf5;
  color: #059669;
}

.custom-select-option.is-selected {
  background: #10b981;
  color: white;
  font-weight: 700;
}

.check-icon {
  opacity: 0.9;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
