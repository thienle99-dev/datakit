<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { Home } from 'lucide-vue-next';

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
  <nav v-if="breadcrumbs.length > 0" aria-label="Breadcrumb" class="hidden md:flex items-center">
    <div class="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
      <router-link 
        to="/" 
        class="flex items-center text-muted-foreground hover:text-primary transition-colors p-1 rounded-md hover:bg-primary/10"
        title="Home"
      >
        <Home :size="12" />
      </router-link>
      
      <template v-for="crumb in breadcrumbs" :key="crumb.to">
        <span class="text-muted-foreground">/</span>
        
        <span v-if="crumb.current" class="text-foreground px-1.5 py-0.5 bg-background shadow-sm rounded-md border border-black/5 dark:border-white/5 cursor-default select-none animate-in fade-in slide-in-from-left-1 duration-300">
          {{ crumb.name }}
        </span>
        
        <router-link 
          v-else 
          :to="crumb.to" 
          class="text-muted-foreground hover:text-primary transition-colors px-1.5 py-0.5 rounded-md hover:bg-primary/5"
        >
          {{ crumb.name }}
        </router-link>
      </template>
    </div>
  </nav>
</template>
