<template>
  <input type="text" :value="displayValue" @input="onInput" @blur="onBlur" />
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const format = (val) => {
  if (val == null || val === '') return ''
  const parts = val.toString().replace(/,/g, '').split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  return parts.join('.')
}

const displayValue = ref('')

onMounted(() => {
  displayValue.value = format(props.modelValue)
})

watch(() => props.modelValue, (newVal) => {
  const cleanDisplay = displayValue.value.replace(/,/g, '')
  // Only update displayValue if the numeric value changed 
  // (to prevent cursor jump when just adding a comma)
  if (String(newVal) !== cleanDisplay && String(newVal) + '.' !== cleanDisplay) {
    displayValue.value = format(newVal)
  }
})

const onInput = (e) => {
  let val = e.target.value
  
  // allow only digits, comma, dot, and minus sign
  val = val.replace(/[^0-9.,-]/g, '')
  
  const raw = val.replace(/,/g, '')
  
  // store raw text so cursor doesn't jump
  displayValue.value = val
  e.target.value = val

  if (raw === '' || raw === '-') {
    emit('update:modelValue', '')
    return
  }
  
  if (!isNaN(raw)) {
    emit('update:modelValue', Number(raw))
  }
}

const onBlur = () => {
  displayValue.value = format(props.modelValue)
}
</script>
