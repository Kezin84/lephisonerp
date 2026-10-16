<template>
  <Teleport to="body">
    <Transition name="async-modal">
    <div v-if="show" class="async-overlay" @click.self="type !== 'loading' && handleClose()">
      
      <!-- CONFIRM MODAL (Taste-Skill Precision & Double-Bezel Design) -->
      <div v-if="type === 'confirm'" class="taste-modal-shell taste-variant-confirm" style="width: min(440px, 92vw);">
        <div class="taste-modal-glow" aria-hidden="true" style="background: #38bdf8;"></div>
        <div class="taste-modal-core">
          <button type="button" class="taste-modal-close" @click="handleCancel" title="Đóng (Esc)">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <div class="taste-modal-body">
            <div class="taste-jewel-wrap">
              <div class="taste-jewel-box" style="background: radial-gradient(circle, rgba(56, 189, 248, 0.22) 0%, rgba(56, 189, 248, 0.05) 100%); border: 1px solid rgba(56, 189, 248, 0.4); box-shadow: 0 0 24px rgba(56, 189, 248, 0.25);">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
            </div>
            <div class="taste-modal-text">
              <div class="taste-eyebrow" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3);">
                <span class="taste-eyebrow-dot" style="background: #38bdf8;"></span>
                <span>XÁC NHẬN HÀNH ĐỘNG</span>
              </div>
              <h3 class="taste-title">{{ title || 'Xác nhận' }}</h3>
              <div class="taste-message">{{ msg || 'Bạn có chắc chắn muốn thực hiện hành động này?' }}</div>
            </div>
          </div>
          <div class="taste-modal-actions">
            <button class="taste-btn taste-btn-secondary" @click="handleCancel">{{ cancelText || 'Hủy' }}</button>
            <button class="taste-btn taste-btn-primary taste-btn-confirm" @click="handleConfirm">
              <span>{{ confirmText || 'Đồng ý' }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- ASYNC MODAL -->
      <div v-else class="async-card" :class="'async-' + type">
        <!-- LOADING -->
        <template v-if="type === 'loading'">
          <div class="async-spinner-wrap">
            <svg class="async-spinner" viewBox="0 0 50 50">
              <defs>
                <linearGradient id="async-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#38bdf8"/>
                  <stop offset="50%" stop-color="#a78bfa"/>
                  <stop offset="100%" stop-color="#38bdf8"/>
                </linearGradient>
              </defs>
              <circle cx="25" cy="25" r="20" fill="none" stroke-width="4" stroke-linecap="round" stroke="url(#async-gradient)"/>
            </svg>
          </div>
          <div class="async-title">{{ title || 'Đang xử lý...' }}</div>
          <div class="async-subtitle">{{ msg || 'Vui lòng đợi trong giây lát...' }}</div>
        </template>
        <!-- SUCCESS -->
        <template v-else-if="type === 'success'">
          <div class="async-icon-wrap async-icon-success">
            <svg viewBox="0 0 52 52" class="async-checkmark">
              <circle cx="26" cy="26" r="25" fill="none"/>
              <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
          <div class="async-title">{{ title || 'Thành công!' }}</div>
          <div v-if="msg" class="async-subtitle">{{ msg }}</div>
        </template>
        <!-- ERROR -->
        <template v-else-if="type === 'error'">
          <div class="async-icon-wrap async-icon-error">
            <svg viewBox="0 0 52 52" class="async-xmark">
              <circle cx="26" cy="26" r="25" fill="none"/>
              <path fill="none" d="M16 16 36 36 M36 16 16 36"/>
            </svg>
          </div>
          <div class="async-title">{{ title || 'Lỗi!' }}</div>
          <div v-if="msg" class="async-subtitle">{{ msg }}</div>
          <button class="async-close-btn" @click="handleClose">Đóng</button>
        </template>
      </div>
    </div>
  </Transition>
  </Teleport>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  type: { type: String, default: 'confirm' }, // 'confirm', 'loading', 'success', 'error'
  title: { type: String, default: '' },
  msg: { type: String, default: '' },
  confirmText: { type: String, default: 'Đồng ý' },
  cancelText: { type: String, default: 'Hủy' }
})

const emit = defineEmits(['close', 'confirm', 'cancel'])

const handleClose = () => {
  emit('close')
}

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
  emit('close')
}
</script>

<style scoped>
.async-overlay {
  position: fixed;
  inset: 0;
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(12px) saturate(1.2);
}
.async-card {
  background: linear-gradient(160deg, rgba(30,41,59,0.95), rgba(15,23,42,0.98));
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 24px;
  padding: 48px 56px 40px;
  text-align: center;
  min-width: 340px;
  max-width: 440px;
  box-shadow:
    0 32px 100px rgba(0,0,0,0.6),
    0 0 0 1px rgba(255,255,255,0.04),
    inset 0 1px 0 rgba(255,255,255,0.06);
  position: relative;
  overflow: hidden;
}
.async-card::before {
  content: '';
  position: absolute;
  top: -2px; left: -2px; right: -2px; bottom: -2px;
  border-radius: 26px;
  background: conic-gradient(from 0deg, transparent 0%, rgba(56,189,248,0.3) 25%, transparent 50%, rgba(16,185,129,0.3) 75%, transparent 100%);
  z-index: -1;
  animation: async-border-spin 4s linear infinite;
  opacity: 0.5;
}
.async-loading .async-card::before { opacity: 1; }
@keyframes async-border-spin {
  to { transform: rotate(360deg); }
}
.async-title {
  font-size: 20px;
  font-weight: 800;
  color: #f8fafc;
  margin-top: 20px;
  letter-spacing: 0.4px;
  line-height: 1.4;
}
.async-subtitle {
  font-size: 13.5px;
  color: #94a3b8;
  margin-top: 10px;
  line-height: 1.6;
  white-space: pre-line;
}

/* ═══ PREMIUM SPINNER ═══ */
.async-spinner-wrap {
  display: flex;
  justify-content: center;
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto;
}
.async-spinner {
  width: 80px;
  height: 80px;
  animation: async-spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  filter: drop-shadow(0 0 8px rgba(56,189,248,0.4));
}
.async-spinner circle {
  stroke: url(#async-gradient);
  stroke-dasharray: 80, 200;
  stroke-dashoffset: 0;
  animation: async-dash 1.5s ease-in-out infinite;
}
@keyframes async-spin {
  to { transform: rotate(360deg); }
}
@keyframes async-dash {
  0% { stroke-dasharray: 1, 200; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 80, 200; stroke-dashoffset: -30; }
  100% { stroke-dasharray: 80, 200; stroke-dashoffset: -120; }
}
/* Orbiting dots */
.async-spinner-wrap::before,
.async-spinner-wrap::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  top: 50%; left: 50%;
  margin: -4px 0 0 -4px;
}
.async-spinner-wrap::before {
  background: #38bdf8;
  box-shadow: 0 0 12px rgba(56,189,248,0.6);
  animation: async-orbit 2s linear infinite;
}
.async-spinner-wrap::after {
  background: #a78bfa;
  box-shadow: 0 0 12px rgba(167,139,250,0.6);
  animation: async-orbit 2s linear infinite reverse;
  animation-delay: -1s;
}
@keyframes async-orbit {
  0% { transform: rotate(0deg) translateX(44px) rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) translateX(44px) rotate(-180deg) scale(0.6); }
  100% { transform: rotate(360deg) translateX(44px) rotate(-360deg) scale(1); }
}

/* Pulse ring under spinner */
.async-spinner-wrap .async-spinner {
  position: relative;
  z-index: 2;
}

/* ═══ SUCCESS CHECKMARK — PREMIUM ═══ */
.async-icon-wrap {
  display: flex;
  justify-content: center;
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto;
}
.async-checkmark {
  width: 80px;
  height: 80px;
  position: relative;
  z-index: 2;
}
.async-checkmark circle {
  stroke: #10b981;
  stroke-width: 2.5;
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  animation: async-circle-draw 0.7s cubic-bezier(0.65, 0, 0.45, 1) forwards;
  filter: drop-shadow(0 0 6px rgba(16,185,129,0.5));
}
.async-checkmark path {
  stroke: #34d399;
  stroke-width: 3.5;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: async-check-draw 0.5s 0.5s cubic-bezier(0.65, 0, 0.45, 1) forwards;
  filter: drop-shadow(0 0 4px rgba(52,211,153,0.6));
}
@keyframes async-circle-draw {
  to { stroke-dashoffset: 0; }
}
@keyframes async-check-draw {
  to { stroke-dashoffset: 0; }
}
/* Success glow ring burst */
.async-icon-success {
  animation: async-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.async-icon-success::before {
  content: '';
  position: absolute;
  inset: -12px;
  border-radius: 50%;
  border: 2px solid rgba(16,185,129,0.3);
  animation: async-ring-burst 0.8s 0.3s ease-out forwards;
  opacity: 0;
}
.async-icon-success::after {
  content: '';
  position: absolute;
  inset: -24px;
  border-radius: 50%;
  border: 1px solid rgba(16,185,129,0.15);
  animation: async-ring-burst 1s 0.5s ease-out forwards;
  opacity: 0;
}
@keyframes async-ring-burst {
  0% { transform: scale(0.5); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}

/* ═══ ERROR X-MARK — PREMIUM ═══ */
.async-xmark {
  width: 80px;
  height: 80px;
  position: relative;
  z-index: 2;
}
.async-xmark circle {
  stroke: #ef4444;
  stroke-width: 2.5;
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  animation: async-circle-draw 0.7s cubic-bezier(0.65, 0, 0.45, 1) forwards;
  filter: drop-shadow(0 0 6px rgba(239,68,68,0.5));
}
.async-xmark path {
  stroke: #f87171;
  stroke-width: 3.5;
  stroke-dasharray: 56;
  stroke-dashoffset: 56;
  animation: async-check-draw 0.4s 0.5s cubic-bezier(0.65, 0, 0.45, 1) forwards;
  filter: drop-shadow(0 0 4px rgba(248,113,113,0.6));
}
.async-icon-error {
  animation: async-shake-vip 0.6s 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}
.async-icon-error::before {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%);
  animation: async-error-pulse 1.5s 0.5s ease-in-out infinite;
}
@keyframes async-shake-vip {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  15% { transform: translateX(-10px) rotate(-2deg); }
  30% { transform: translateX(10px) rotate(2deg); }
  45% { transform: translateX(-7px) rotate(-1deg); }
  60% { transform: translateX(7px) rotate(1deg); }
  75% { transform: translateX(-3px); }
  90% { transform: translateX(3px); }
}
@keyframes async-error-pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.15); }
}
@keyframes async-pop {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.15); }
  70% { transform: scale(0.95); }
  100% { transform: scale(1); opacity: 1; }
}

/* ═══ CLOSE BUTTON — PREMIUM ═══ */
.async-close-btn {
  margin-top: 24px;
  padding: 12px 36px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.08));
  border: 1px solid rgba(239,68,68,0.25);
  color: #f87171;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.3px;
}
.async-close-btn:hover {
  background: linear-gradient(135deg, rgba(239,68,68,0.25), rgba(239,68,68,0.15));
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(239,68,68,0.2);
}

/* ═══ TRANSITION — PREMIUM ═══ */
.async-modal-enter-active {
  animation: async-modal-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.async-modal-leave-active {
  animation: async-modal-out 0.25s cubic-bezier(0.4, 0, 1, 1);
}
@keyframes async-modal-in {
  0% { opacity: 0; transform: scale(0.7) translateY(20px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes async-modal-out {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.85) translateY(10px); }
}

/* ═══ TASTE SKILL LUXURY MODAL DESIGN SYSTEM ═══ */
.taste-modal-shell {
  position: relative;
  border-radius: 22px;
  padding: 1.5px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.03) 50%, rgba(255, 255, 255, 0.08) 100%);
  box-shadow: 
    0 32px 80px -16px rgba(0, 0, 0, 0.85),
    0 12px 32px -8px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.06);
  overflow: hidden;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  text-align: left;
}

.taste-modal-glow {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  width: 240px;
  height: 120px;
  border-radius: 50%;
  filter: blur(48px);
  pointer-events: none;
  opacity: 0.35;
}

.taste-modal-core {
  position: relative;
  border-radius: 20px;
  background: linear-gradient(165deg, #0d1527 0%, #080d19 100%);
  padding: 24px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.taste-modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 10;
}
.taste-modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f8fafc;
  transform: scale(1.05);
}

.taste-modal-body {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.taste-jewel-wrap {
  flex-shrink: 0;
}
.taste-jewel-box {
  width: 52px;
  height: 52px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.taste-modal-text {
  flex: 1;
  min-width: 0;
}

.taste-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2.5px 9px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.taste-eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation: tastePulse 2s ease-in-out infinite;
}

@keyframes tastePulse {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.3); opacity: 1; }
}

.taste-title {
  margin: 0 0 8px 0;
  font-size: 17px;
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: -0.02em;
  line-height: 1.35;
}

.taste-message {
  font-size: 13.5px;
  font-weight: 400;
  color: #94a3b8;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.taste-modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 22px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}

.taste-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 10px 20px;
  border-radius: 11px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  text-decoration: none;
  line-height: 1;
}
.taste-btn:active {
  transform: scale(0.97);
}

.taste-btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.taste-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f8fafc;
  border-color: rgba(255, 255, 255, 0.18);
  transform: translateY(-1px);
}

.taste-btn-primary {
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.18);
  font-weight: 700;
}
.taste-btn-primary:hover {
  filter: brightness(1.12);
  transform: translateY(-1.5px);
}

.taste-btn-confirm {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.25);
}
</style>
