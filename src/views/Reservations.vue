<script setup lang="ts">
</script>

<template>
  <section class="page reservations-page">
    <header>
      <h1>预约管理</h1>
      <p>这里展示预约记录、筛选条件以及审核操作。</p>
    </header>
    <main class="page-body">
      <el-empty description="预约模块开发中" />
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
