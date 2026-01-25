<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { Table, ArrowRightLeft, Sparkles, FileJson, Database } from 'lucide-vue-next';

const route = useRoute();

const tools = [
  { id: 'csv-viewer', name: 'CSV Viewer', path: '/tools/csv-viewer', icon: Table },
  { id: 'csv-converter', name: 'CSV ↔ Excel', path: '/tools/csv-converter', icon: ArrowRightLeft },
  { id: 'csv-cleaner', name: 'CSV Cleaner', path: '/tools/csv-cleaner', icon: Sparkles },
  { id: 'json-converter', name: 'CSV → JSON', path: '/tools/json-converter', icon: FileJson },
  { id: 'sql-generator', name: 'CSV → SQL', path: '/tools/sql-generator', icon: Database },
];

const props = defineProps<{
  collapsed?: boolean
}>();

const currentPath = computed(() => route.path);
</script>

<template>
  <aside 
    class="border-r border-border bg-card/60 backdrop-blur-xl h-[calc(100vh-3.5rem)] overflow-y-auto flex flex-col transition-all duration-300 z-10"
    :class="[collapsed ? 'w-20' : 'w-64']"
  >
    <div class="flex-1 py-6 px-3">
      <div v-if="!collapsed" class="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 px-3 opacity-70">
        Tools Collection
      </div>
      <div v-else class="h-6 mb-4"></div>

      <nav class="space-y-2">
        <router-link 
          v-for="tool in tools" 
          :key="tool.id" 
          :to="tool.path"
          class="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden"
          :class="[
            currentPath === tool.path 
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
              : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
          ]"
          :title="collapsed ? tool.name : ''"
        >
          <div class="flex items-center justify-center w-6 h-6 shrink-0">
            <component :is="tool.icon" :size="20" class="transition-transform duration-300" :class="[collapsed ? '' : 'group-hover:scale-110']" />
          </div>
          
          <span 
            class="whitespace-nowrap transition-all duration-300 origin-left"
            :class="[collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto']"
          >
            {{ tool.name }}
          </span>
          
          <div v-if="currentPath === tool.path && !collapsed" class="absolute right-3 w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse"></div>
        </router-link>
      </nav>
    </div>
    
    <div class="p-4 border-t border-border/50 bg-card/30">
        <div class="flex items-center justify-center text-xs text-muted-foreground">
            <span v-if="!collapsed">v1.0.0</span>
            <span v-else class="w-1.5 h-1.5 rounded-full bg-muted-foreground/30"></span>
        </div>
    </div>
  </aside>
</template>
