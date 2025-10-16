<script setup lang="ts">
</script>

<template>
  <section class="page courses-page">
    <header>
      <h1>课程管理</h1>
      <p>维护实验室课程安排，支持创建、查询与冲突校验。</p>
    </header>
    <main class="page-body">
      <el-empty description="课程模块开发中" />
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
