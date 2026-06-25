<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <div class="logo-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        </div>
        <h2>Đăng Nhập Hệ Thống</h2>
        <p>Vui lòng xác thực để truy cập ERP</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form" autocomplete="off">
        <div class="form-group">
          <label>Tài khoản</label>
          <div class="input-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <input type="text" v-model="username" placeholder="Nhập tài khoản..." required />
          </div>
        </div>

        <div class="form-group">
          <label>Mật khẩu</label>
          <div class="input-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            <input type="password" v-model="password" placeholder="Nhập mật khẩu..." required autocomplete="new-password" />
          </div>
        </div>

        <div class="form-group checkbox-group">
          <label class="custom-checkbox">
            <input type="checkbox" v-model="isKeepLogin" />
            <span class="checkmark"></span>
            Duy trì đăng nhập
          </label>
        </div>

        <div v-if="errorMessage" class="error-message">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          {{ errorMessage }}
        </div>

        <button type="submit" class="login-btn" :disabled="isLoading">
          <span v-if="isLoading" class="spinner"></span>
          <span v-else>Đăng Nhập</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')
const isKeepLogin = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

// TODO: Replace with your actual script URL
const API_URL = 'https://script.google.com/macros/s/AKfycbx1yDOQLxYgJb5w30KmxQHF8AYUZln_5q58HCKP4zlUmtJye6aJBiSt3oyT0j_3QaigdQ/exec'

const handleLogin = async () => {
  if (!username.value || !password.value) return
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'login',
        username: username.value,
        password: password.value
      })
    })
    
    const result = await response.json()
    
    if (result.status === 'success') {
      const sessionData = {
        user: username.value,
        loggedInAt: new Date().toISOString()
      }

      if (isKeepLogin.value) {
        localStorage.setItem('auth_token', JSON.stringify(sessionData))
      } else {
        sessionStorage.setItem('auth_token', JSON.stringify(sessionData))
      }
      
      // Chuyển hướng vào trang chính
      router.push('/dashboard')
    } else {
      errorMessage.value = result.message || 'Tài khoản hoặc mật khẩu không đúng.'
    }
  } catch (error) {
    errorMessage.value = 'Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.'
    console.error(error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100vw;
  background: radial-gradient(circle at 50% 0%, #1e293b, #0f172a);
  font-family: 'Inter', sans-serif;
  margin: 0;
  padding: 0;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 99999;
}

.login-box {
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1);
}

.login-header {
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

.login-header h2 {
  color: #f8fafc;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.login-header p {
  color: #94a3b8;
  font-size: 14px;
  margin: 0;
}

.login-form {
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

.input-wrapper input:focus + svg,
.input-wrapper input:not(:placeholder-shown) ~ svg {
  color: #10b981;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.login-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
  filter: brightness(1.1);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.checkbox-group {
  margin-top: -5px;
  margin-bottom: 5px;
}

.custom-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #94a3b8;
  font-size: 13px;
  user-select: none;
}

.custom-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  height: 18px;
  width: 18px;
  background-color: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.custom-checkbox input:checked ~ .checkmark {
  background-color: #10b981;
  border-color: #10b981;
}

.checkmark:after {
  content: "";
  display: none;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  margin-bottom: 2px;
}

.custom-checkbox input:checked ~ .checkmark:after {
  display: block;
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
  .login-box {
    padding: 30px 20px;
    border-radius: 0;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border: none;
    background: transparent;
    box-shadow: none;
  }
}
</style>
