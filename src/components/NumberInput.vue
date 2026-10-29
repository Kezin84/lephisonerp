<template>
  <input
    type="text"
    :inputmode="computedInputMode"
    :value="displayValue"
    @input="onInput"
    @paste="onPaste"
    @blur="onBlur"
    @focus="onFocus"
    :placeholder="computedPlaceholder"
    :disabled="disabled"
    :readonly="readonly"
    autocomplete="off"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch, type PropType } from 'vue';
import {
  formatViNumber,
  parseViFormattedNumber,
  processLiveNumericInput,
  resolveSmartPaste
} from '../utils/smartNumber';

type InputModeAttr =
  | 'none'
  | 'text'
  | 'tel'
  | 'url'
  | 'email'
  | 'numeric'
  | 'decimal'
  | 'search';

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: ''
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
  },
  decimals: {
    type: Number,
    default: 2
  },
  allowNegative: {
    type: Boolean,
    default: false
  },
  inputmode: {
    type: String as PropType<InputModeAttr | ''>,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);

const isFocused = ref(false);
const wasEmptyStringOnFocus = ref(false);
const displayValue = ref('');

const computedPlaceholder = computed(() =>
  props.placeholder !== '' ? props.placeholder : '0'
);

const computedInputMode = computed<InputModeAttr>(() => {
  if (props.inputmode) return props.inputmode;
  if (props.allowNegative) return 'text';
  return props.decimals <= 0 ? 'numeric' : 'decimal';
});

watch(
  [() => props.modelValue, () => props.decimals],
  ([newVal]) => {
    if (!isFocused.value) {
      displayValue.value = formatViNumber(newVal, props.decimals);
    } else if (
      displayValue.value === '' &&
      newVal !== '' &&
      newVal !== null &&
      newVal !== undefined &&
      Number(newVal) !== 0
    ) {
      displayValue.value = formatViNumber(newVal, props.decimals);
    }
  },
  { immediate: true }
);

function onFocus(event: FocusEvent) {
  isFocused.value = true;
  if (props.readonly || props.disabled) return;

  wasEmptyStringOnFocus.value =
    props.modelValue === '' ||
    props.modelValue === null ||
    props.modelValue === undefined;

  const target = event.target as HTMLInputElement | null;
  const currentNum = Number(props.modelValue);
  const isZeroVal =
    props.modelValue === 0 ||
    props.modelValue === '0' ||
    (!wasEmptyStringOnFocus.value &&
      Number.isFinite(currentNum) &&
      currentNum === 0) ||
    displayValue.value.trim() === '0';

  if (isZeroVal) {
    displayValue.value = '';
    if (target) {
      target.value = '';
    }
  }
}

function onPaste(event: ClipboardEvent) {
  if (props.readonly || props.disabled) return;
  event.preventDefault();

  const target = event.target as HTMLInputElement;
  const pastedText = event.clipboardData?.getData('text') ?? '';
  if (!pastedText) return;

  wasEmptyStringOnFocus.value = false;
  const prevDisplay = displayValue.value;
  const selStart = target.selectionStart ?? prevDisplay.length;
  const selEnd = target.selectionEnd ?? prevDisplay.length;

  const resolved = resolveSmartPaste({
    pastedText,
    currentDisplay: prevDisplay,
    currentModelValue: props.modelValue,
    selectionStart: selStart,
    selectionEnd: selEnd,
    decimals: props.decimals,
    allowNegative: true
  });

  displayValue.value = resolved.displayValue;
  target.value = resolved.displayValue;
  emit('update:modelValue', resolved.numericValue);

  requestAnimationFrame(() => {
    target.setSelectionRange(resolved.cursorPosition, resolved.cursorPosition);
  });
}

function onInput(event: Event) {
  if (props.readonly || props.disabled) return;

  const target = event.target as HTMLInputElement;
  const ie = event as InputEvent;
  const prevDisplay = displayValue.value;
  const cursorPosition = target.selectionStart ?? target.value.length;

  const result = processLiveNumericInput({
    rawValue: target.value,
    prevDisplay,
    cursorPosition,
    inputType: ie.inputType,
    inputData: ie.data,
    decimals: props.decimals,
    allowNegative: true
  });

  displayValue.value = result.displayValue;
  target.value = result.displayValue;

  if (result.isIntermediateEmpty) {
    emit('update:modelValue', wasEmptyStringOnFocus.value ? '' : 0);
  } else {
    wasEmptyStringOnFocus.value = false;
    emit('update:modelValue', result.numericValue);
  }

  requestAnimationFrame(() => {
    target.setSelectionRange(result.cursorPosition, result.cursorPosition);
  });
}

function onBlur(event: FocusEvent) {
  isFocused.value = false;
  if (props.readonly || props.disabled) {
    displayValue.value = formatViNumber(props.modelValue, props.decimals);
    return;
  }

  const target = event.target as HTMLInputElement | null;
  const raw = (target?.value ?? displayValue.value).trim();

  if (raw === '' || raw === '-') {
    if (wasEmptyStringOnFocus.value) {
      displayValue.value = '';
      if (target) target.value = '';
      emit('update:modelValue', '');
    } else {
      const zeroFormatted = formatViNumber(0, props.decimals);
      displayValue.value = zeroFormatted;
      if (target) target.value = zeroFormatted;
      emit('update:modelValue', 0);
    }
    return;
  }

  const parsed = parseViFormattedNumber(raw, props.decimals, true);
  const formatted = formatViNumber(parsed, props.decimals);
  displayValue.value = formatted;
  if (target) target.value = formatted;
  emit('update:modelValue', parsed);
}
</script>
