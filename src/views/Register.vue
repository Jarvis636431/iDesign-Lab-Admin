<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { AxiosError } from 'axios'
import { register as registerRequest } from '../services/auth'

type RegisterFormRole = 'student' | 'temporary'

const router = useRouter()

const form = reactive({
  name: '',
  account: '',
  password: '',
  confirmPassword: '',
  phone: '',
  grade: '',
  purpose: '',
  role: 'student' as RegisterFormRole,
})

const submitting = ref(false)
const formError = ref<string | null>(null)

const validateForm = () => {
  if (!form.name.trim()) {
    formError.value = '请填写姓名'
    return false
  }
  if (!form.account.trim()) {
    formError.value = '请填写账号'
    return false
  }
  if (!form.password.trim()) {
    formError.value = '请填写密码'
    return false
  }
  if (form.password.length < 8) {
    formError.value = '密码长度需不少于 8 位'
    return false
  }
  if (!/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) {
    formError.value = '密码需包含字母和数字'
    return false
  }
  if (form.password !== form.confirmPassword) {
    formError.value = '两次输入的密码不一致'
    return false
  }
  if (!/^1\d{10}$/.test(form.phone)) {
    formError.value = '请填写正确的手机号'
    return false
  }
  return true
}

const handleSubmit = async () => {
  formError.value = null
  if (!validateForm()) return

  submitting.value = true
  try {
    await registerRequest({
      name: form.name,
      account: form.account,
      password: form.password,
      phone: form.phone,
      grade: form.grade || undefined,
      purpose: form.purpose || undefined,
      role: form.role,
    })
    ElMessage.success('注册成功，请等待管理员审核')
    router.replace({
      path: '/login',
      query: { account: form.account },
    })
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>
    formError.value = axiosError.response?.data?.message ?? '注册失败，请稍后再试'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="register-page">
    <el-card class="register-card">
      <header class="register-header">
        <h1>账号注册</h1>
        <p>提交信息后，请等待教师或管理员审核</p>
      </header>
      <el-form
        class="register-form"
        label-position="top"
        :model="form"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="姓名">
          <el-input v-model.trim="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="账号">
          <el-input v-model.trim="form.account" placeholder="请输入登录账号" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="至少 8 位，包含字母和数字"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model.trim="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.role">
            <el-option label="学生" value="student" />
            <el-option label="临时用户" value="temporary" />
          </el-select>
        </el-form-item>
        <el-form-item label="年级（可选）">
          <el-input v-model.trim="form.grade" placeholder="例：2024级" />
        </el-form-item>
        <el-form-item label="用途（可选）">
          <el-input
            v-model.trim="form.purpose"
            type="textarea"
            :rows="3"
            placeholder="请简要描述使用目的"
          />
        </el-form-item>
        <div v-if="formError" class="form-error">
          <el-alert :closable="false" show-icon type="error" :title="formError" />
        </div>
        <el-form-item>
          <el-button
            class="register-submit"
            type="primary"
            native-type="submit"
            :loading="submitting"
          >
            提交注册
          </el-button>
        </el-form-item>
      </el-form>
      <footer class="register-footer">
        <router-link class="register-link" to="/login">
          已有账号？返回登录
        </router-link>
      </footer>
    </el-card>
  </section>
</template>

<style scoped>
.register-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: radial-gradient(circle at top left, rgba(64, 158, 255, 0.15), transparent 40%),
    radial-gradient(circle at bottom right, rgba(64, 158, 255, 0.1), transparent 45%);
}

.register-card {
  width: 100%;
  max-width: 520px;
  border-radius: 18px;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.15);
}

.register-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.register-header h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
  color: #1f2937;
}

.register-header p {
  margin: 0;
  color: #6b7280;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.register-submit {
  width: 100%;
  height: 44px;
}

.form-error {
  margin-bottom: 0.5rem;
}

.register-footer {
  margin-top: 1rem;
  text-align: center;
}

.register-link {
  color: #409eff;
}
.register-link:hover {
  color: #66b1ff;
}
</style>
