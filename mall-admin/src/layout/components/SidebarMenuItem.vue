<template>
  <!-- 有子菜单的情况 -->
  <el-sub-menu 
    v-if="hasChildren && !item.meta?.alwaysShow"
    :index="item.path"
    :popper-append-to-body="true"
  >
    <template #title>
      <el-icon v-if="item.meta?.icon">
        <component :is="item.meta.icon" />
      </el-icon>
      <span>{{ item.meta?.title }}</span>
    </template>

    <SidebarMenuItem
      v-for="child in item.children"
      :key="child.path"
      :item="child"
      :base-path="resolvePath(child.path)"
    />
  </el-sub-menu>

  <!-- 单个菜单项或者alwaysShow的情况 -->
  <template v-else>
    <!-- 如果有子菜单但标记为alwaysShow，渲染第一个可见的子菜单 -->
    <el-menu-item
      v-if="onlyOneChild"
      :index="onlyOneChild.path"
    >
      <el-icon v-if="onlyOneChild.meta?.icon || item.meta?.icon">
        <component :is="onlyOneChild.meta?.icon || item.meta?.icon" />
      </el-icon>
      <template #title>
        <span>{{ onlyOneChild.meta?.title || item.meta?.title }}</span>
      </template>
    </el-menu-item>
  </template>
</template>

<script setup lang="ts">
/**
 * 侧边栏菜单项组件
 * 支持多级菜单展示
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { computed } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

interface Props {
  item: RouteRecordRaw;
  basePath: string;
}

const props = defineProps<Props>();

// 是否有子菜单
const hasChildren = computed(() => {
  return props.item.children && props.item.children.length > 0;
});

// 可见的子菜单
const visibleChildren = computed(() => {
  if (!props.item.children) return [];
  
  return props.item.children.filter(child => {
    return !child.meta?.hidden;
  });
});

// 如果只有一个子菜单或者标记为alwaysShow，返回该子菜单
const onlyOneChild = computed(() => {
  const children = visibleChildren.value;
  
  if (children.length === 1) {
    return children[0];
  }
  
  if (children.length === 0) {
    return props.item;
  }
  
  if (props.item.meta?.alwaysShow) {
    return children[0];
  }
  
  return null;
});

// 解析路径
const resolvePath = (routePath: string) => {
  if (routePath.startsWith('/')) {
    return routePath;
  }
  return props.basePath + '/' + routePath;
};
</script>

<style lang="scss" scoped>
// 这里可以添加特定的菜单项样式
</style> 