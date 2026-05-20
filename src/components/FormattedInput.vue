<template>
  <input
    type="text"
    :value="displayValue"
    @input="onInput"
    @blur="onBlur"
    @focus="onFocus"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    autocomplete="off"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: 0
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);

const isFocused = ref(false);
const displayValue = ref('');

// Format a number with vi-VN style (dots for thousands)
function formatNumber(num: number | string | null | undefined): string {
  if (num === null || num === undefined || num === '') return '';
  const n = Number(num);
  if (isNaN(n)) return '';
  return new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 2
  }).format(n);
}

// Parse a formatted string back to a number
function parseNumber(str: string): number {
  if (!str) return 0;
  
  str = String(str).trim();
  
  // In vi-VN format, '.' is the thousand separator and ',' is the decimal separator.
  // We strictly remove all '.' and convert ',' to '.' for JavaScript Number parsing.
  str = str.replace(/\./g, '').replace(',', '.');
  
  // Remove any remaining invalid characters (keep digits, dot, minus)
  const cleanStr = str.replace(/[^\d.-]/g, '');
  const parsed = Number(cleanStr);
  return isNaN(parsed) ? 0 : parsed;
}

watch(
  () => props.modelValue,
  (newVal) => {
    if (!isFocused.value) {
      displayValue.value = formatNumber(newVal);
    }
  },
  { immediate: true }
);

function onInput(event: Event) {
  const target = event.target as HTMLInputElement;
  const rawValue = target.value;
  
  // Save cursor position
  const cursorPosition = target.selectionStart || 0;
  const beforeCursor = rawValue.substring(0, cursorPosition);
  const digitsBeforeCursor = beforeCursor.replace(/[^\d]/g, '').length;
  
  const parsed = parseNumber(rawValue);
  emit('update:modelValue', parsed);

  if (rawValue === '' || rawValue === '-') {
    displayValue.value = rawValue;
    return;
  }

  // Format the number on the fly
  let formattedString = formatNumber(parsed);
  
  // Keep trailing decimal commas or trailing decimal zeros so the user can type them
  const cleanRaw = rawValue.replace(/[^\d.,-]/g, '');
  if (cleanRaw.endsWith(',')) {
    formattedString += ',';
  } else if (cleanRaw.includes(',')) {
    const parts = cleanRaw.split(',');
    const intPart = formattedString.split(',')[0] || '0';
    const decPart = parts.slice(1).join('');
    formattedString = intPart + ',' + decPart;
  }

  displayValue.value = formattedString;
  
  // Restore cursor position
  requestAnimationFrame(() => {
    let newCursorPos = 0;
    let digitsCount = 0;
    
    for (let i = 0; i < formattedString.length; i++) {
      if (/\d/.test(formattedString[i])) {
        digitsCount++;
      }
      if (digitsCount === digitsBeforeCursor) {
        newCursorPos = i + 1;
        break;
      }
    }
    
    // Adjust if cursor was just after a separator or negative sign
    if (beforeCursor.endsWith(',') || beforeCursor.endsWith('-')) {
      newCursorPos++;
    }
    
    if (newCursorPos === 0 && digitsBeforeCursor > 0) {
      newCursorPos = formattedString.length;
    } else if (digitsBeforeCursor === 0 && rawValue.startsWith('-')) {
      newCursorPos = 1;
    }
    
    target.setSelectionRange(newCursorPos, newCursorPos);
  });
}

function onBlur(event: Event) {
  isFocused.value = false;
  // Format the display value when focus is lost
  const parsed = parseNumber((event.target as HTMLInputElement).value);
  displayValue.value = formatNumber(parsed);
  emit('update:modelValue', parsed);
}

function onFocus() {
  isFocused.value = true;
}
</script>
