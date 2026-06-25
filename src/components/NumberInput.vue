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
  const target = e.target
  let val = target.value
  
  // Save cursor position
  const cursorPosition = target.selectionStart || 0
  const beforeCursor = val.substring(0, cursorPosition)
  const digitsBeforeCursor = beforeCursor.replace(/[^\d]/g, '').length
  
  // allow only digits, comma, dot, and minus sign
  val = val.replace(/[^0-9.,-]/g, '')
  const raw = val.replace(/,/g, '')

  if (raw === '' || raw === '-') {
    displayValue.value = val
    target.value = val
    emit('update:modelValue', '')
    return
  }

  const numericValue = Number(raw)
  if (!isNaN(numericValue)) {
    emit('update:modelValue', numericValue)
  }

  // Format the number on the fly
  let formattedString = format(raw)
  
  // Preserve trailing decimal dots or zeros typed by the user
  if (val.endsWith('.')) {
    formattedString += '.'
  } else if (val.includes('.')) {
    const parts = val.split('.')
    const intPart = formattedString.split('.')[0] || '0'
    const decPart = parts.slice(1).join('').replace(/[^\d]/g, '')
    formattedString = intPart + '.' + decPart
  }

  displayValue.value = formattedString
  target.value = formattedString
  
  // Restore cursor position
  requestAnimationFrame(() => {
    let newCursorPos = 0
    let digitsCount = 0
    
    for (let i = 0; i < formattedString.length; i++) {
      if (/\d/.test(formattedString[i])) {
        digitsCount++
      }
      if (digitsCount === digitsBeforeCursor) {
        newCursorPos = i + 1
        break
      }
    }
    
    // Adjust if cursor was just after a separator or negative sign
    if (beforeCursor.endsWith(',') || beforeCursor.endsWith('-')) {
      newCursorPos++
    }
    
    if (newCursorPos === 0 && digitsBeforeCursor > 0) {
      newCursorPos = formattedString.length
    } else if (digitsBeforeCursor === 0 && val.startsWith('-')) {
      newCursorPos = 1
    }
    
    target.setSelectionRange(newCursorPos, newCursorPos)
  })
}

const onBlur = () => {
  displayValue.value = format(props.modelValue)
}
</script>
