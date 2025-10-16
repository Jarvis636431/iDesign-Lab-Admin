<script setup lang="ts">
import { reactive } from 'vue'

const form = reactive({
  username: '',
  password: '',
})

const handleSubmit = () => {
  // TODO: 替换为真实登录逻辑
  console.log('login form submit', form)
}
</script>

<template>
  <section class="login">
    <h1>后台登录</h1>
    <form class="login-form" @submit.prevent="handleSubmit">
      <label>
        <span>账号</span>
        <input v-model="form.username" placeholder="请输入账号" />
      </label>
      <label>
        <span>密码</span>
        <input v-model="form.password" type="password" placeholder="请输入密码" />
      </label>
      <button type="submit">登录</button>
    </form>
  </section>
</template>

<style scoped>
.login {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 320px;
  margin: 4rem auto;
}
.login-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-weight: 500;
}
input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
}
button {
  margin-top: 1rem;
}
</style>
