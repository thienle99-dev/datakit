<script setup lang="ts">
import { ref } from 'vue';
import { Menu, Zap } from 'lucide-vue-next';

const isSidebarOpen = ref(true);
</script>

<template>
  <header class="h-14 border-b border-border bg-surface flex items-center px-4 sticky top-0 z-10">
    <button @click="$emit('toggleSidebar')" class="p-2 -ml-2 mr-2 hover:bg-background rounded-md md:hidden">
      <Menu :size="24" />
    </button>
    <div class="font-bold text-lg flex items-center gap-2">
      <span class="text-primary"><Zap :size="24" fill="currentColor" /></span>
      <span>Data Tools</span>
    </div>
    <div class="ml-auto flex items-center gap-2">
      <!-- Future Theme Toggle or Links -->
      <a href="https://github.com" target="_blank" class="text-sm text-text-muted hover:text-text">GitHub</a>
    </div>
  </header>
</template>
