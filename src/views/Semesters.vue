<script setup lang="ts">
</script>

<template>
  <section class="page semesters-page">
    <header>
      <h1>学期管理</h1>
      <p>管理学期列表与当前激活学期。</p>
    </header>
    <main class="page-body">
      <el-empty description="学期模块开发中" />
    </main>
  </section>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-body {
  min-height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #dcdfe6;
  border-radius: 12px;
  background: #fff;
}
</style>
