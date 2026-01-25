<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { ChevronRight, Home } from 'lucide-vue-next';

const route = useRoute();

const breadcrumbs = computed(() => {
  const path = route.path;
  if (path === '/') return [];

  const parts = path.split('/').filter(Boolean);
  
  return parts.map((part, index) => {
    const to = '/' + parts.slice(0, index + 1).join('/');
    // Beautify the name: "csv-viewer" -> "Csv Viewer"
    const name = part.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    
    return {
      name,
      to,
      current: index === parts.length - 1
    };
  });
});
</script>

<template>
  <nav v-if="breadcrumbs.length > 0" aria-label="Breadcrumb" class="hidden md:flex items-center text-sm text-muted-foreground ml-4 pl-4 border-l border-border/40 h-6">
    <router-link 
      to="/" 
      class="flex items-center hover:text-foreground transition-colors"
      title="Home"
    >
      <Home :size="14" />
    </router-link>
    
    <template v-for="crumb in breadcrumbs" :key="crumb.to">
      <ChevronRight :size="14" class="mx-2 opacity-50" />
      
      <span v-if="crumb.current" class="font-medium text-foreground">
        {{ crumb.name }}
      </span>
      
      <router-link 
        v-else 
        :to="crumb.to" 
        class="hover:text-foreground transition-colors"
      >
        {{ crumb.name }}
      </router-link>
    </template>
  </nav>
</template>
