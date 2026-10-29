<template>
  <input
    ref="inputEl"
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

const inputEl = ref<HTMLInputElement | null>(null);
const isFocused = ref(false);
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
    } else {
      const targetNum =
        newVal === '' || newVal === null || newVal === undefined
          ? 0
          : Number(newVal);
      const currentParsed = parseViFormattedNumber(
        displayValue.value,
        props.decimals,
        true
      );
      if (
        Number.isFinite(targetNum) &&
        Math.abs(currentParsed - targetNum) > 1e-9
      ) {
        const nextDisplay =
          targetNum === 0 ? '' : formatViNumber(targetNum, props.decimals);
        displayValue.value = nextDisplay;
        if (inputEl.value) {
          inputEl.value.value = nextDisplay;
          requestAnimationFrame(() => {
            if (inputEl.value && inputEl.value.value === nextDisplay) {
              const len = nextDisplay.length;
              inputEl.value.setSelectionRange(len, len);
            }
          });
        }
      }
    }
  },
  { immediate: true }
);

function onFocus(event: FocusEvent) {
  isFocused.value = true;
  if (props.readonly || props.disabled) return;

  const target = event.target as HTMLInputElement | null;
  const currentNum = Number(props.modelValue);
  const isZeroVal =
    props.modelValue === 0 ||
    props.modelValue === '0' ||
    (props.modelValue !== '' &&
      props.modelValue !== null &&
      props.modelValue !== undefined &&
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

  const expectedPasteDisplay = resolved.displayValue;
  displayValue.value = expectedPasteDisplay;
  target.value = expectedPasteDisplay;
  emit('update:modelValue', resolved.numericValue);

  requestAnimationFrame(() => {
    if (target.value === expectedPasteDisplay) {
      target.setSelectionRange(resolved.cursorPosition, resolved.cursorPosition);
    }
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

  const expectedInputDisplay = result.displayValue;
  displayValue.value = expectedInputDisplay;
  target.value = expectedInputDisplay;
  emit('update:modelValue', result.numericValue);

  requestAnimationFrame(() => {
    if (target.value === expectedInputDisplay) {
      target.setSelectionRange(result.cursorPosition, result.cursorPosition);
    }
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
    const zeroFormatted = formatViNumber(0, props.decimals);
    displayValue.value = zeroFormatted;
    if (target) target.value = zeroFormatted;
    emit('update:modelValue', 0);
    return;
  }

  const parsed = parseViFormattedNumber(raw, props.decimals, true);
  const formatted = formatViNumber(parsed, props.decimals);
  displayValue.value = formatted;
  if (target) target.value = formatted;
  emit('update:modelValue', parsed);
}
</script>
