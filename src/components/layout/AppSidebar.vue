<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { Table, ArrowRightLeft, Sparkles, FileJson, Database, Wrench } from 'lucide-vue-next';

const route = useRoute();

const tools = [
  { id: 'csv-viewer', name: 'CSV Viewer', path: '/tools/csv-viewer', icon: Table },
  { id: 'csv-converter', name: 'CSV ↔ Excel', path: '/tools/csv-converter', icon: ArrowRightLeft },
  { id: 'csv-cleaner', name: 'CSV Cleaner', path: '/tools/csv-cleaner', icon: Sparkles },
  { id: 'json-converter', name: 'CSV → JSON', path: '/tools/json-converter', icon: FileJson },
  { id: 'sql-generator', name: 'CSV → SQL', path: '/tools/sql-generator', icon: Database },
];

const currentPath = computed(() => route.path);
</script>

<template>
  <aside class="w-64 border-r border-border bg-surface h-[calc(100vh-3.5rem)] overflow-y-auto flex flex-col">
    <div class="p-4">
      <div class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Tools</div>
      <nav class="space-y-1">
        <router-link 
          v-for="tool in tools" 
          :key="tool.id" 
          :to="tool.path"
          class="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          :class="[
            currentPath === tool.path 
              ? 'bg-primary/10 text-primary' 
              : 'text-text hover:bg-background'
          ]"
        >
          <component :is="tool.icon" :size="20" class="opacity-70" />
          {{ tool.name }}
        </router-link>
      </nav>
    </div>
  </aside>
</template>
