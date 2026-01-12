<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { AxiosError } from 'axios';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';

const logo = new URL('../assets/logo.png', import.meta.url).href;

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { loading } = storeToRefs(authStore);

const form = reactive({
  account: '',
  password: '',
});

const formError = ref<string | null>(null);

onMounted(() => {
  if (typeof route.query.account === 'string') {
    form.account = route.query.account;
  }
});

const validateForm = () => {
  if (!form.account.trim()) {
    formError.value = '请填写账号';
    return false;
  }
  if (!form.password.trim()) {
    formError.value = '请填写密码';
    return false;
  }
  return true;
};

const handleSubmit = async () => {
  formError.value = null;
  if (!validateForm()) return;

  try {
    await authStore.login({
      account: form.account,
      password: form.password,
    });
    ElMessage.success('登录成功');
    const redirect =
      typeof route.query.redirect === 'string' ? route.query.redirect : '/';
    router.replace(redirect);
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    formError.value =
      axiosError.response?.data?.message ?? '登录失败，请检查账号与密码';
  }
};
</script>

<template>
  <section class="login-layout">
    <div class="login-hero">
      <img :src="logo" alt="iDesign Lab 标志" class="hero-logo" />
      <h1>iDesign Lab 实验室管理系统</h1>
    </div>

    <el-card class="login-card" shadow="always">
      <header class="card-header">
        <h2>账户登录</h2>
        <p>请输入您的账号和密码以继续</p>
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
          <el-alert
            :closable="false"
            show-icon
            type="error"
            :title="formError"
          />
        </div>
        <el-button
          class="login-submit"
          type="primary"
          native-type="submit"
          :loading="loading"
        >
          登录
        </el-button>
      </el-form>
    </el-card>
  </section>
</template>

<style scoped>
.login-layout {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) minmax(320px, 420px);
  align-items: center;
  gap: 4rem;
  min-height: 100vh;
  padding: 4rem clamp(2rem, 6vw, 6rem);
  background:
    radial-gradient(
      circle at 20% 20%,
      rgba(64, 158, 255, 0.18),
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 80%,
      rgba(64, 158, 255, 0.12),
      transparent 55%
    ),
    #f5f7fb;
}

.login-hero {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  color: #1f2937;
}

.hero-logo {
  width: 72px;
  height: 72px;
  border-radius: 16px;
  object-fit: contain;
  background: rgba(255, 255, 255, 0.75);
  padding: 0.75rem;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
}

.login-hero h1 {
  margin: 0;
  font-size: clamp(1.75rem, 2.5vw, 2.4rem);
  font-weight: 700;
}

.login-hero p {
  margin: 0;
  max-width: 360px;
  color: #4b5563;
  line-height: 1.6;
}

.login-card {
  border-radius: 20px;
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.16);
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.card-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.card-header p {
  margin: 0;
  color: #6b7280;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.login-submit {
  width: 100%;
  height: 44px;
}

.form-error {
  margin-bottom: 0.5rem;
}

@media (max-width: 960px) {
  .login-layout {
    grid-template-columns: 1fr;
    padding: 3rem 2rem;
    gap: 2rem;
  }

  .login-hero {
    align-items: center;
    text-align: center;
  }

  .login-hero p {
    max-width: 100%;
  }
}
</style>
