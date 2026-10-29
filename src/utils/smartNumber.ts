/**
 * Smart Numeric & Price Input Engine (vi-VN display: '.' thousands, ',' decimal)
 *
 * Solves two common user pain points:
 * 1. Default '0' sticking when focusing/pasting into an unedited numeric field.
 * 2. Interchangeable '.' and ',' separators when typing or pasting from Excel,
 *    Google Sheets, web pages, PDFs, calculators, or iOS/Android numeric keypads.
 */

const formatterCache = new Map<number, Intl.NumberFormat>();

function getViFormatter(decimals: number): Intl.NumberFormat {
  const d = Math.max(0, Math.floor(decimals));
  let fmt = formatterCache.get(d);
  if (!fmt) {
    fmt = new Intl.NumberFormat('vi-VN', {
      maximumFractionDigits: d
    });
    formatterCache.set(d, fmt);
  }
  return fmt;
}

export function roundToDecimals(val: number, decimals: number = 2): number {
  if (!Number.isFinite(val) || val === 0) return 0;
  const d = Math.max(0, Math.floor(decimals));
  if (d === 0) {
    const r = Math.round(val);
    return Object.is(r, -0) ? 0 : r;
  }
  const factor = Math.pow(10, d);
  const r = (Math.sign(val) * Math.round((Math.abs(val) + Number.EPSILON) * factor)) / factor;
  return Object.is(r, -0) ? 0 : r;
}

export function formatViNumber(
  num: number | string | null | undefined,
  decimals: number = 2
): string {
  if (num === null || num === undefined || num === '') return '';
  const n = Number(num);
  if (!Number.isFinite(n)) return '';
  const rounded = roundToDecimals(n, decimals);
  return getViFormatter(decimals).format(rounded);
}

/**
 * Parses a normalized vi-VN display string ('.' thousands, ',' decimal) on blur.
 */
export function parseViFormattedNumber(
  str: string | null | undefined,
  decimals: number = 2,
  allowNegative: boolean = true
): number {
  if (!str) return 0;
  const trimmed = String(str).trim().replace(/[\u2212\u2013\u2014]/g, '-');
  if (!trimmed || trimmed === '-') return 0;
  const isNeg = allowNegative && trimmed.startsWith('-');
  const unsigned = trimmed.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
  if (!unsigned) return 0;
  const parsed = Number(unsigned);
  if (!Number.isFinite(parsed)) return 0;
  return roundToDecimals(isNeg && parsed !== 0 ? -parsed : parsed, decimals);
}

/**
 * Smart parser for pasted / external strings in any common VN or US/Excel format:
 * - "3040000", "3.040.000", "3,040,000", "3 040 000" -> 3040000
 * - "3,040,000.00", "3.040.000,00", "720000.00" -> 3040000 / 720000
 * - "720,000", "720.000" -> 720000
 * - "$1,250.50", "1.250,50", "655,50 USD", "12.5%", "12,5%" -> 1250.5 / 655.5 / 12.5
 */
export function parsePastedNumber(
  rawText: string | number | null | undefined,
  decimals: number = 2,
  allowNegative: boolean = true
): number {
  if (rawText === null || rawText === undefined) return 0;
  if (typeof rawText === 'number') {
    if (!Number.isFinite(rawText)) return 0;
    const signed = !allowNegative && rawText < 0 ? Math.abs(rawText) : rawText;
    return roundToDecimals(signed, decimals);
  }

  const original = String(rawText).trim();
  if (!original) return 0;

  const hasPercentSign = original.includes('%');

  // Normalize Unicode minus signs and strip common currency symbols/codes so "-$1,250.50" -> "-1,250.50"
  const strippedCurrency = original
    .replace(/[\u2212\u2013\u2014]/g, '-')
    .replace(/[$₫đ€£¥]/gi, '')
    .replace(/\b(?:VND|VNĐ|USD|EUR)\b/gi, '')
    .trim();

  // Match space-grouped thousands when the clipboard value itself is a space-grouped number ("3 040 000" / "3 040 000,50")
  const spaceGroupedMatch = strippedCurrency.match(
    /^\s*(?:-\s*)?\d{1,3}(?:[\u00A0\u202F ]\d{3})+(?:[.,]\d+)?(?=\s*%?\s*$)/
  );
  const standardMatch = strippedCurrency.match(
    /(?:^\s*-\s*|-(?=\d|[.,]\d))?(?:\d+(?:[.,]\d+)*|[.,]\d+)/
  );

  let token = '';
  if (spaceGroupedMatch && spaceGroupedMatch[0]) {
    token = spaceGroupedMatch[0];
  } else if (standardMatch && standardMatch[0]) {
    token = standardMatch[0];
  } else {
    return 0;
  }

  const trimmedToken = token.trim();
  const isNegative = allowNegative && trimmedToken.startsWith('-');

  const s = trimmedToken.replace(/[^\d.,]/g, '').replace(/[.,]+$/, '');
  if (!s) return 0;

  const dotCount = (s.match(/\./g) || []).length;
  const commaCount = (s.match(/,/g) || []).length;
  const d = Math.max(0, Math.floor(decimals));

  let num = 0;

  if (dotCount === 0 && commaCount === 0) {
    num = Number(s);
  } else if (dotCount > 0 && commaCount > 0) {
    // Both '.' and ',' exist -> whichever appears LAST is the decimal separator
    const lastDot = s.lastIndexOf('.');
    const lastComma = s.lastIndexOf(',');
    const decPos = Math.max(lastDot, lastComma);
    const intStr = s.slice(0, decPos).replace(/[.,]/g, '');
    const decStr = s.slice(decPos + 1).replace(/[.,]/g, '');
    num = Number((intStr || '0') + '.' + (decStr || '0'));
  } else if (dotCount >= 2 || commaCount >= 2) {
    // Multiple identical separators ("3,040,000" or "3.040.000") -> all are thousands separators
    num = Number(s.replace(/[.,]/g, ''));
  } else {
    // Exactly ONE separator ('.' or ',')
    const sep = dotCount === 1 ? '.' : ',';
    const [intPart = '', fracPart = ''] = s.split(sep);

    if (intPart === '' || /^0+$/.test(intPart)) {
      // ".5", ",5", "0.5", "0,125" -> always decimal
      num = Number('0.' + fracPart);
    } else if (d === 0) {
      // Integer / VND / Quantity field:
      // Single thousands group looks like 1..999 followed by 3 digits ("720,000", "720.000", "1,500")
      if (/^[1-9]\d{0,2}$/.test(intPart) && fracPart.length === 3) {
        num = Number(intPart + fracPart);
      } else {
        // e.g. "720000.00", "720000,50", "720000.000" -> decimal float rounded to integer
        num = Number(intPart + '.' + fracPart);
      }
    } else {
      // Decimal field (e.g. decimals = 2 for % Off, VAT, USD):
      if (/^[1-9]\d{0,2}$/.test(intPart) && fracPart.length === 3) {
        if (hasPercentSign && Number(intPart) <= 100) {
          // e.g. "12.500%" from 3-decimal Excel percentage cell -> 12.5
          num = Number(intPart + '.' + fracPart);
        } else if (d <= 2) {
          // e.g. "720,000", "720.000", "25,450", "1,250", "1.250" -> thousands
          num = Number(intPart + fracPart);
        } else {
          // d >= 3: in vi-VN '.' is thousands and ',' is decimal
          num = sep === '.' ? Number(intPart + fracPart) : Number(intPart + '.' + fracPart);
        }
      } else {
        // 1, 2, or 4+ fraction digits, or 4+ ungrouped integer digits ("12.5", "12,5", "655.50", "1250.500") -> decimal
        num = Number(intPart + '.' + fracPart);
      }
    }
  }

  if (!Number.isFinite(num)) return 0;
  if (isNegative && num !== 0) num = -num;
  return roundToDecimals(num, d);
}

export interface PasteResolutionParams {
  pastedText: string;
  currentDisplay: string;
  currentModelValue: number | string | null | undefined;
  selectionStart: number;
  selectionEnd: number;
  decimals: number;
  allowNegative: boolean;
}

export interface PasteResolutionResult {
  displayValue: string;
  numericValue: number;
  cursorPosition: number;
}

/**
 * Resolves a paste operation into an input element, avoiding '0' concatenation
 * and intelligently handling full replacement vs digit splicing.
 */
export function resolveSmartPaste(params: PasteResolutionParams): PasteResolutionResult {
  const {
    pastedText,
    currentDisplay,
    currentModelValue,
    selectionStart,
    selectionEnd,
    decimals,
    allowNegative
  } = params;

  const d = Math.max(0, Math.floor(decimals));
  const trimmedPaste = String(pastedText ?? '').trim();
  const currentNum = Number(currentModelValue);
  const isCurrentZeroOrEmpty =
    currentDisplay.trim() === '' ||
    currentDisplay.trim() === '0' ||
    currentDisplay.trim() === '-' ||
    (currentModelValue !== '' && Number.isFinite(currentNum) && currentNum === 0);
  const isFullSelection =
    currentDisplay.length > 0 &&
    selectionStart === 0 &&
    selectionEnd >= currentDisplay.length;

  // Replace entire value when field is 0/empty, fully selected, or clipboard holds a formatted number/currency
  if (isCurrentZeroOrEmpty || isFullSelection) {
    const num = parsePastedNumber(trimmedPaste, d, allowNegative);
    const disp = formatViNumber(num, d);
    return {
      displayValue: disp,
      numericValue: num,
      cursorPosition: disp.length
    };
  }

  // Current field has a non-zero number and partial/collapsed selection:
  // Only splice if pasted text is plain digits ("850", "0") or a decimal tail (".5", ",5")
  const isPlainDigits = /^\d+$/.test(trimmedPaste);
  const isDecimalTail = d > 0 && !currentDisplay.includes(',') && /^[.,]\d+$/.test(trimmedPaste);

  if (isPlainDigits || isDecimalTail) {
    const insertPart = isDecimalTail ? ',' + trimmedPaste.slice(1) : trimmedPaste;
    const spliced =
      currentDisplay.slice(0, selectionStart) +
      insertPart +
      currentDisplay.slice(selectionEnd);
    const live = processLiveNumericInput({
      rawValue: spliced,
      prevDisplay: currentDisplay,
      cursorPosition: selectionStart + insertPart.length,
      inputType: 'insertText',
      inputData: insertPart,
      decimals: d,
      allowNegative
    });
    return {
      displayValue: live.displayValue,
      numericValue: live.numericValue,
      cursorPosition: live.cursorPosition
    };
  }

  // Otherwise pasted text is a full formatted number ("3,040,000", "3.040.000 đ", "$655.50") -> replace cleanly
  const num = parsePastedNumber(trimmedPaste, d, allowNegative);
  const disp = formatViNumber(num, d);
  return {
    displayValue: disp,
    numericValue: num,
    cursorPosition: disp.length
  };
}

export interface LiveInputParams {
  rawValue: string;
  prevDisplay: string;
  cursorPosition: number;
  inputType?: string;
  inputData?: string | null;
  decimals: number;
  allowNegative: boolean;
}

export interface LiveInputResult {
  displayValue: string;
  numericValue: number;
  cursorPosition: number;
  isIntermediateEmpty: boolean;
}

function mapDigitCountToCursor(
  formattedStr: string,
  targetDigits: number,
  hasLeadingMinus: boolean
): number {
  if (targetDigits <= 0) {
    return hasLeadingMinus && formattedStr.startsWith('-') ? 1 : 0;
  }
  let count = 0;
  for (let i = 0; i < formattedStr.length; i++) {
    if (/\d/.test(formattedStr[i])) {
      count++;
      if (count === targetDigits) {
        return i + 1;
      }
    }
  }
  return formattedStr.length;
}

/**
 * Processes live keystroke / backspace / mobile keypad input on the fly.
 * - decimals === 0: both '.' and ',' act as thousands grouping (auto-formatted as '.').
 * - decimals > 0: pressing either '.' or ',' acts as the decimal separator ','
 *   while preserving existing thousands '.' separators.
 * - Backspacing right after an auto-inserted thousands '.' deletes the preceding digit
 *   instead of trapping the cursor.
 */
export function processLiveNumericInput(params: LiveInputParams): LiveInputResult {
  const {
    rawValue,
    prevDisplay,
    cursorPosition,
    inputType,
    inputData,
    decimals,
    allowNegative
  } = params;

  const d = Math.max(0, Math.floor(decimals));

  // Fallback if paste/drop bypassed @paste.prevent
  if (inputType === 'insertFromPaste' || inputType === 'insertFromDrop') {
    const num = parsePastedNumber(rawValue, d, allowNegative);
    const disp = formatViNumber(num, d);
    return {
      displayValue: disp,
      numericValue: num,
      cursorPosition: disp.length,
      isIntermediateEmpty: false
    };
  }

  const normalized = String(rawValue ?? '').replace(/[\u2212\u2013\u2014]/g, '-');
  const hasLeadingMinus = allowNegative && normalized.trimStart().startsWith('-');
  const onlyNumericChars = normalized.replace(/[^\d.,]/g, '');

  if (onlyNumericChars === '') {
    if (hasLeadingMinus) {
      return {
        displayValue: '-',
        numericValue: 0,
        cursorPosition: 1,
        isIntermediateEmpty: true
      };
    }
    return {
      displayValue: '',
      numericValue: 0,
      cursorPosition: 0,
      isIntermediateEmpty: true
    };
  }

  // ---------------- INTEGER MODE (decimals === 0) ----------------
  if (d === 0) {
    let currDigits = onlyNumericChars.replace(/[^\d]/g, '');
    let digitsBeforeCursor = normalized
      .slice(0, cursorPosition)
      .replace(/[^\d]/g, '').length;

    // Smart Backspace across thousands dot '.'
    if (inputType === 'deleteContentBackward' && prevDisplay.includes('.')) {
      const prevDigits = prevDisplay.replace(/[^\d]/g, '');
      if (prevDigits.length > 0 && prevDigits === currDigits && digitsBeforeCursor > 0) {
        currDigits =
          currDigits.slice(0, digitsBeforeCursor - 1) +
          currDigits.slice(digitsBeforeCursor);
        digitsBeforeCursor--;
      }
    }

    if (currDigits === '') {
      return hasLeadingMinus
        ? { displayValue: '-', numericValue: 0, cursorPosition: 1, isIntermediateEmpty: true }
        : { displayValue: '', numericValue: 0, cursorPosition: 0, isIntermediateEmpty: true };
    }

    let num = Number(currDigits);
    if (!Number.isFinite(num)) num = 0;
    if (hasLeadingMinus && num !== 0) num = -num;

    const formatted =
      hasLeadingMinus && num === 0
        ? '-0'
        : getViFormatter(0).format(num);

    const newCursor = mapDigitCountToCursor(formatted, digitsBeforeCursor, hasLeadingMinus);
    return {
      displayValue: formatted,
      numericValue: Object.is(num, -0) ? 0 : num,
      cursorPosition: newCursor,
      isIntermediateEmpty: false
    };
  }

  // ---------------- DECIMAL MODE (decimals > 0) ----------------
  let working = normalized;
  let effectiveCursor = Math.max(0, Math.min(cursorPosition, working.length));

  const prevHasComma = prevDisplay.includes(',');
  const rawHasComma = working.includes(',');

  if (!rawHasComma) {
    // Check if the user just typed '.' (desktop keyboard or iPhone US-region decimal keypad)
    const justTypedDotAtCursor =
      effectiveCursor > 0 &&
      working[effectiveCursor - 1] === '.' &&
      (inputData === '.' ||
        (typeof inputData === 'string' && inputData.endsWith('.')) ||
        (!prevDisplay.includes('.') && (working.match(/\./g) || []).length === 1));

    if (justTypedDotAtCursor) {
      working =
        working.slice(0, effectiveCursor - 1) +
        ',' +
        working.slice(effectiveCursor);
    } else if (
      typeof inputData === 'string' &&
      inputData.length > 1 &&
      inputData.includes('.') &&
      !prevDisplay.includes('.') &&
      (working.match(/\./g) || []).length === 1 &&
      !/^[1-9]\d{0,2}\.\d{3}$/.test(working.trim())
    ) {
      // Mobile IME / predictive text inserted e.g. "12.5" in one event
      working = working.replace('.', ',');
    }
  } else if (prevHasComma && (working.match(/,/g) || []).length > 1) {
    // Already had a decimal comma and user typed a second ',': keep the original comma
    // If the newly typed ',' is at effectiveCursor - 1, remove that extra ','
    if (effectiveCursor > 0 && working[effectiveCursor - 1] === ',') {
      working =
        working.slice(0, effectiveCursor - 1) + working.slice(effectiveCursor);
      effectiveCursor--;
    } else {
      const firstComma = working.indexOf(',');
      working =
        working.slice(0, firstComma + 1) +
        working.slice(firstComma + 1).replace(/,/g, '');
    }
  }

  const decIdx = working.indexOf(',');

  // No decimal separator active -> integer typing within a decimal-capable field
  if (decIdx === -1) {
    let currDigits = working.replace(/[^\d]/g, '');
    let digitsBeforeCursor = working
      .slice(0, effectiveCursor)
      .replace(/[^\d]/g, '').length;

    // Smart Backspace across thousands dot '.' (only if ',' was NOT what was just deleted)
    if (
      inputType === 'deleteContentBackward' &&
      !prevHasComma &&
      prevDisplay.includes('.')
    ) {
      const prevDigits = prevDisplay.replace(/[^\d]/g, '');
      if (prevDigits.length > 0 && prevDigits === currDigits && digitsBeforeCursor > 0) {
        currDigits =
          currDigits.slice(0, digitsBeforeCursor - 1) +
          currDigits.slice(digitsBeforeCursor);
        digitsBeforeCursor--;
      }
    }

    if (currDigits === '') {
      return hasLeadingMinus
        ? { displayValue: '-', numericValue: 0, cursorPosition: 1, isIntermediateEmpty: true }
        : { displayValue: '', numericValue: 0, cursorPosition: 0, isIntermediateEmpty: true };
    }

    let num = Number(currDigits);
    if (!Number.isFinite(num)) num = 0;
    if (hasLeadingMinus && num !== 0) num = -num;

    const formatted =
      hasLeadingMinus && num === 0
        ? '-0'
        : getViFormatter(0).format(num);

    const newCursor = mapDigitCountToCursor(formatted, digitsBeforeCursor, hasLeadingMinus);
    return {
      displayValue: formatted,
      numericValue: Object.is(num, -0) ? 0 : num,
      cursorPosition: newCursor,
      isIntermediateEmpty: false
    };
  }

  // Has active decimal comma at decIdx
  let rawIntDigits = working.slice(0, decIdx).replace(/[^\d]/g, '');
  const rawDecDigits = working
    .slice(decIdx + 1)
    .replace(/[^\d]/g, '')
    .slice(0, d);

  let intDigitsBeforeCursor = working
    .slice(0, Math.min(effectiveCursor, decIdx))
    .replace(/[^\d]/g, '').length;

  // Smart Backspace across thousands dot '.' inside the integer portion before ','
  if (
    inputType === 'deleteContentBackward' &&
    prevHasComma &&
    effectiveCursor <= decIdx
  ) {
    const prevIntPart = prevDisplay.split(',')[0] || '';
    if (prevIntPart.includes('.')) {
      const prevIntDigits = prevIntPart.replace(/[^\d]/g, '');
      if (
        prevIntDigits.length > 0 &&
        prevIntDigits === rawIntDigits &&
        intDigitsBeforeCursor > 0
      ) {
        rawIntDigits =
          rawIntDigits.slice(0, intDigitsBeforeCursor - 1) +
          rawIntDigits.slice(intDigitsBeforeCursor);
        intDigitsBeforeCursor--;
      }
    }
  }

  const intNum = rawIntDigits ? Number(rawIntDigits) : 0;
  const formattedAbsInt = getViFormatter(0).format(
    Number.isFinite(intNum) ? intNum : 0
  );
  const formattedInt = (hasLeadingMinus ? '-' : '') + formattedAbsInt;
  const formatted = formattedInt + ',' + rawDecDigits;

  const parsedAbs = Number((rawIntDigits || '0') + '.' + (rawDecDigits || '0'));
  const signedNum = hasLeadingMinus && parsedAbs !== 0 ? -parsedAbs : parsedAbs;
  const numericValue = roundToDecimals(signedNum, d);

  const newCommaPos = formatted.indexOf(',');
  let newCursor = formatted.length;

  if (effectiveCursor <= decIdx) {
    newCursor = mapDigitCountToCursor(
      formattedInt,
      intDigitsBeforeCursor,
      hasLeadingMinus
    );
  } else {
    const decDigitsBeforeCursor = Math.min(
      d,
      working
        .slice(decIdx + 1, effectiveCursor)
        .replace(/[^\d]/g, '').length
    );
    newCursor = newCommaPos + 1 + decDigitsBeforeCursor;
  }

  return {
    displayValue: formatted,
    numericValue,
    cursorPosition: newCursor,
    isIntermediateEmpty: false
  };
}
