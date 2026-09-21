<template>
  <div class="category-page-container">
    <div class="mb-4">
      <h1 class="text-2xl font-bold text-blue-400 m-0">📂 论坛板块大厅</h1>
      <p class="text-gray-400 text-sm mt-1">
        完整映射 Godot 官方 Discourse 论坛核心板块层级，提供中英双语技术问答、游戏作品分享与开源资源检索。
      </p>
    </div>

    <!-- Centered Loading Box with 0% ... 100% Progress -->
    <div v-if="loading" class="category-loading-centered">
      <span class="text-5xl">📂</span>
      <p class="text-gray-300 text-sm font-medium m-0">正在加载官方板块架构...</p>
      <div class="progress-box my-2">
        <div class="flex items-center justify-between text-xs text-blue-400 mb-1 px-0.5">
          <span>加载进度</span>
          <span class="font-mono font-bold">{{ loadingProgress }}%</span>
        </div>
        <div class="progress-track-large">
          <div
            class="progress-fill"
            :style="{ width: `${loadingProgress}%` }"
          ></div>
        </div>
      </div>
      <span class="text-xs text-gray-500">已载入 {{ loadingProgress }}%</span>
    </div>

    <div v-else class="flex flex-col gap-6">
      <div
        v-for="group in categoryGroups"
        :key="group.parent.id"
        class="category-group-card"
      >
        <div class="group-header">
          <div class="group-title">
            <span
              class="w-3 h-3 rounded-sm inline-block"
              :style="{ backgroundColor: group.parent.color }"
            ></span>
            <span>{{ group.parent.zhName }}</span>
            <span class="text-sm font-normal text-gray-500">({{ group.parent.name }})</span>
          </div>
          <router-link
            :to="`/c/${group.parent.slug}/${group.parent.id}`"
            class="text-xs text-blue-400 hover:underline"
          >
            浏览板块全部话题 →
          </router-link>
        </div>

        <p class="text-xs text-gray-400 mb-4 -mt-2">
          {{ group.parent.zhDescription || group.parent.description }}
        </p>

        <!-- Subcategories Grid -->
        <div v-if="group.children.length > 0" class="subcategories-grid">
          <router-link
            v-for="sub in group.children"
            :key="sub.id"
            :to="`/c/${sub.slug}/${sub.id}`"
            class="subcat-item"
          >
            <div class="subcat-header">
              <span
                class="w-2.5 h-2.5 rounded-full"
                :style="{ backgroundColor: sub.color }"
              ></span>
              <span class="subcat-name">{{ sub.zhName }}</span>
              <span class="text-xs text-gray-500 font-mono">{{ sub.name }}</span>
            </div>
            <div class="subcat-desc">
              {{ sub.zhDescription || sub.description }}
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCategories } from '@/hooks/useCategories'

const { loading, loadingProgress, categoryGroups } = useCategories()
</script>

<style src="@/styles/category.css" scoped></style>
