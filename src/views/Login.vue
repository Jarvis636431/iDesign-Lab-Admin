<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { AxiosError } from 'axios'
import { useAuthStore } from '../stores/auth'
import { storeToRefs } from 'pinia'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { loading } = storeToRefs(authStore)

const form = reactive({
  account: '',
  password: '',
})

const formError = ref<string | null>(null)

const validateForm = () => {
  if (!form.account.trim()) {
    formError.value = '请填写账号'
    return false
  }
  if (!form.password.trim()) {
    formError.value = '请填写密码'
    return false
  }
  return true
}

const handleSubmit = async () => {
  formError.value = null
  if (!validateForm()) return

  try {
    await authStore.login({
      account: form.account,
      password: form.password,
    })
    ElMessage.success('登录成功')
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    router.replace(redirect)
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>
    formError.value =
      axiosError.response?.data?.message ?? '登录失败，请检查账号与密码'
  }
}
</script>

<template>
  <section class="login-page">
    <el-card class="login-card">
      <header class="login-header">
        <h1>后台登录</h1>
        <p>请输入账号密码登录系统</p>
      </header>
      <el-form
        class="login-form"
        label-position="top"
        :model="form"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="账号">
          <el-input
            v-model.trim="form.account"
            placeholder="请输入账号"
            autocomplete="username"
          />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model.trim="form.password"
            type="password"
            placeholder="请输入密码"
            autocomplete="current-password"
            show-password
          />
        </el-form-item>
        <div v-if="formError" class="form-error">
          <el-alert :closable="false" show-icon type="error" :title="formError" />
        </div>
        <el-form-item>
          <el-button
            class="login-submit"
            type="primary"
            native-type="submit"
            :loading="loading"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </section>
</template>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: radial-gradient(circle at top left, rgba(64, 158, 255, 0.15), transparent 40%),
    radial-gradient(circle at bottom right, rgba(64, 158, 255, 0.1), transparent 45%);
}

.login-card {
  width: 100%;
  max-width: 420px;
  border-radius: 16px;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.15);
}

.login-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.login-header h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
  color: #1f2937;
}

.login-header p {
  margin: 0;
  color: #6b7280;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.login-submit {
  height: 40px;
  width: 100%;
}

.form-error {
  margin-bottom: 0.5rem;
}
</style>
