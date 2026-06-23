<template>
  <div class="change-password-container">
    <div class="change-password-box">
      <div class="header">
        <div class="logo-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        </div>
        <h2>Đổi Mật Khẩu</h2>
        <p>Bảo mật tài khoản của bạn</p>
      </div>

      <form @submit.prevent="handleChangePassword" class="password-form" autocomplete="off">
        <div class="form-group">
          <label>Tài khoản hiện tại</label>
          <div class="input-wrapper disabled-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <input type="text" :value="username" disabled autocomplete="off" />
          </div>
        </div>

        <div class="form-group">
          <label>Mật khẩu cũ</label>
          <div class="input-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
            <input type="password" v-model="oldPassword" placeholder="Nhập mật khẩu hiện tại..." required autocomplete="new-password" />
          </div>
        </div>

        <div class="form-group">
          <label>Mật khẩu mới</label>
          <div class="input-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            <input type="password" v-model="newPassword" placeholder="Nhập mật khẩu mới..." required minlength="6" autocomplete="new-password" />
          </div>
        </div>

        <div class="form-group">
          <label>Xác nhận mật khẩu mới</label>
          <div class="input-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <input type="password" v-model="confirmPassword" placeholder="Nhập lại mật khẩu mới..." required autocomplete="new-password" />
          </div>
        </div>

        <div v-if="errorMessage" class="message error-message">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="message success-message">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          {{ successMessage }}
        </div>

        <div class="action-buttons">
          <button type="button" class="btn-cancel" @click="goBack" :disabled="isLoading">Hủy</button>
          <button type="submit" class="btn-submit" :disabled="isLoading">
            <span v-if="isLoading" class="spinner"></span>
            <span v-else>Cập Nhật</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// TODO: Thay bằng URL thực tế
const API_URL = 'https://script.google.com/macros/s/AKfycbx1yDOQLxYgJb5w30KmxQHF8AYUZln_5q58HCKP4zlUmtJye6aJBiSt3oyT0j_3QaigdQ/exec'

onMounted(() => {
  const tokenLocal = localStorage.getItem('auth_token')
  const tokenSession = sessionStorage.getItem('auth_token')
  
  if (tokenLocal) {
    try { username.value = JSON.parse(tokenLocal).user } catch(e) {}
  } else if (tokenSession) {
    try { username.value = JSON.parse(tokenSession).user } catch(e) {}
  }
})

const goBack = () => {
  router.back()
}

const handleChangePassword = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Mật khẩu xác nhận không khớp.'
    return
  }
  
  if (newPassword.value.length < 6) {
    errorMessage.value = 'Mật khẩu mới phải có ít nhất 6 ký tự.'
    return
  }
  
  isLoading.value = true
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'change_password',
        username: username.value,
        old_password: oldPassword.value,
        new_password: newPassword.value
      })
    })
    
    const result = await response.json()
    
    if (result.status === 'success') {
      successMessage.value = 'Đổi mật khẩu thành công! Hãy dùng mật khẩu mới trong lần đăng nhập sau.'
      oldPassword.value = ''
      newPassword.value = ''
      confirmPassword.value = ''
      
      // Auto redirect sau 2s
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } else {
      errorMessage.value = result.message || 'Lỗi: Không thể đổi mật khẩu.'
    }
  } catch (error) {
    errorMessage.value = 'Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.change-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 60px);
  padding: 20px;
  background: transparent;
  font-family: 'Inter', sans-serif;
}

.change-password-box {
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1);
}

.header {
  text-align: center;
  margin-bottom: 35px;
}

.logo-wrapper {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 20px;
  color: white;
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4);
}

.header h2 {
  color: #f8fafc;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.header p {
  color: #94a3b8;
  font-size: 14px;
  margin: 0;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #cbd5e1;
  font-size: 13px;
  font-weight: 600;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper svg {
  position: absolute;
  left: 14px;
  color: #64748b;
  transition: color 0.3s ease;
}

.input-wrapper input {
  width: 100%;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 14px 14px 14px 42px;
  color: #f8fafc;
  font-size: 15px;
  transition: all 0.3s ease;
  outline: none;
}

.input-wrapper input:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
  background: rgba(15, 23, 42, 0.8);
}

.input-wrapper input:focus + svg {
  color: #10b981;
}

.disabled-wrapper input {
  background: rgba(255, 255, 255, 0.03);
  color: #64748b;
  cursor: not-allowed;
}

.message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.success-message {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 10px;
}

.btn-cancel {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 14px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.btn-submit {
  flex: 2;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
  filter: brightness(1.1);
}

.btn-cancel:disabled, .btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 480px) {
  .change-password-box {
    padding: 30px 20px;
  }
}
</style>
