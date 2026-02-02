<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Sun, Moon, Github, Search, Layers } from 'lucide-vue-next';
import AppBreadcrumb from './AppBreadcrumb.vue';
import { useSpotlight } from '../../composables/useSpotlight';

const { toggleSpotlight } = useSpotlight();

const isDark = ref(false);
const isScrolled = ref(false);

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

const handleGlobalKeys = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    toggleSpotlight();
  }
};

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    isDark.value = true;
    document.documentElement.classList.add('dark');
  }

  window.addEventListener('keydown', handleGlobalKeys);

  window.addEventListener('scroll', () => {
    isScrolled.value = window.scrollY > 20;
  });
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeys);
});
</script>

<template>
  <header 
    class="sticky top-0 w-full z-[50] transition-all duration-500 ease-in-out px-4 md:px-6"
    :class="isScrolled ? 'py-3' : 'py-5'"
  >
    <div 
      class="max-w-screen-2xl mx-auto rounded-2xl transition-all duration-500 border border-transparent"
      :class="[
        isScrolled 
          ? 'bg-background/80 backdrop-blur-xl border-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] px-4 py-2.5' 
          : 'bg-transparent px-0 py-0'
      ]"
    >
      <div class="flex items-center justify-between gap-4">
        
        <!-- Left: Logo & Breadcrumbs -->
        <div class="flex items-center gap-4 md:gap-6">
          <router-link to="/" class="flex items-center gap-3 group shrink-0 select-none">
            <div class="relative w-10 h-10 flex items-center justify-center bg-gradient-to-tr from-blue-600 to-violet-600 rounded-xl shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
               <Layers class="text-white w-6 h-6" stroke-width="2.5" />
               <div class="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div class="flex flex-col leading-none">
              <span class="font-bold text-lg tracking-tight group-hover:text-primary transition-colors">DataKit</span>
              <span class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Universal</span>
            </div>
          </router-link>

          <div class="hidden md:block w-px h-5 bg-border/60"></div>
          
          <AppBreadcrumb class="hidden lg:flex" />
        </div>



        <!-- Right: Actions -->
        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Search Icon -->
          <button 
            @click="toggleSpotlight"
            class="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors"
            aria-label="Search Tools"
          >
            <Search :size="20" />
          </button>

          <button 
            @click="toggleTheme" 
            class="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-all duration-300 relative overflow-hidden group"
            aria-label="Toggle Theme"
          >
            <Sun v-if="!isDark" :size="20" class="transition-transform duration-500 group-hover:rotate-45" />
            <Moon v-else :size="20" class="transition-transform duration-500 group-hover:-rotate-12" />
          </button>

          <div class="hidden sm:block w-px h-5 bg-border/60"></div>

          <a 
            href="https://github.com/thienle99-dev/datakit" 
            target="_blank" 
            class="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/15 text-primary text-xs font-bold rounded-full transition-all duration-300 group"
          >
            <Github :size="16" class="transition-transform group-hover:scale-110" />
            <span class="hidden sm:inline">Star on GitHub</span>
          </a>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* Ensure the header text doesn't clash with content when transparent */
header {
  -webkit-backdrop-filter: blur(0);
  backdrop-filter: blur(0);
}
</style>
