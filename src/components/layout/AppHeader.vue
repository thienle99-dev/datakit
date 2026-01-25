<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Menu, Zap, Sun, Moon, Github, PanelLeft } from 'lucide-vue-next';
import AppBreadcrumb from './AppBreadcrumb.vue';

const isDark = ref(false);

function toggleTheme() {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    isDark.value = true;
    document.documentElement.classList.add('dark');
  }
});
</script>

<template>
  <header class="h-14 glass flex items-center px-4 sticky top-0 z-20 transition-all duration-300">
    <button @click="$emit('toggleSidebar')" class="p-2 -ml-2 mr-2 hover:bg-accent hover:text-accent-foreground rounded-md md:hidden transition-colors">
      <Menu :size="20" />
    </button>
    
    <button @click="$emit('toggleSidebar')" class="hidden md:block p-2 -ml-2 mr-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors" title="Toggle Sidebar">
      <PanelLeft :size="20" />
    </button>
    
    <div class="flex items-center">
      <router-link to="/" class="font-bold text-lg flex items-center gap-2 group">
        <div class="bg-primary/10 p-1.5 rounded-lg text-primary transition-transform group-hover:scale-110 duration-300">
          <Zap :size="20" fill="currentColor" />
        </div>
        <span class="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80 group-hover:to-primary transition-all duration-300">Data Tools</span>
      </router-link>
      
      <AppBreadcrumb />
    </div>

    <div class="ml-auto flex items-center gap-3">
      <button 
        @click="toggleTheme" 
        class="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-ring"
        title="Toggle Theme"
      >
        <Moon v-if="isDark" :size="18" class="animate-fade-in" />
        <Sun v-else :size="18" class="animate-fade-in" />
      </button>

      <a 
        href="https://github.com" 
        target="_blank" 
        class="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary rounded-full border border-transparent hover:border-border transition-all duration-300"
      >
        <Github :size="16" />
        <span>GitHub</span>
      </a>
      
      <a 
        href="https://github.com" 
        target="_blank" 
        class="sm:hidden p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent"
      >
         <Github :size="20" />
      </a>
    </div>
  </header>
</template>
