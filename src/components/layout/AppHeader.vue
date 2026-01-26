<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Sun, Moon, Github, Search } from 'lucide-vue-next';
import AppBreadcrumb from './AppBreadcrumb.vue';
import Launchpad from './Launchpad.vue';

const isDark = ref(false);
const showLaunchpad = ref(false);
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
    showLaunchpad.value = !showLaunchpad.value;
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
    class="h-20 flex items-center px-4 md:px-8 sticky top-0 z-[9999] transition-all duration-500"
    :class="{ 'h-16': isScrolled }"
  >
    <!-- Floating Glass Container -->
    <div 
      class="absolute inset-x-2 md:inset-x-4 rounded-2xl bg-background border border-white/20 dark:border-white/10 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)] flex items-center px-4 justify-between transition-all duration-500 z-[9999] hover:border-white/30"
      :class="isScrolled ? 'top-1 bottom-1 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.2)]' : 'top-2 bottom-2'"
    >
      
      <!-- Left: Logo & Nav -->
      <div class="flex items-center gap-4 md:gap-8">
        <router-link to="/" class="flex items-center gap-3 group shrink-0">
          <div class="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-xl overflow-hidden group-hover:scale-105 transition-all duration-300 ring-1 ring-white/20 dark:ring-white/10">
             <img src="/logo.svg?v=2" alt="Logo" class="w-6 h-6 object-contain z-10" />
             <div class="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <span class="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 group-hover:to-primary transition-all duration-300 tracking-tight hidden lg:block">
            Data Kit
          </span>
        </router-link>

        <button 
          @click="showLaunchpad = true" 
          class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all duration-300 group ring-1 ring-white/5"
        >
          <Search :size="14" class="group-hover:scale-110 transition-transform" />
          <span class="text-2xs font-bold uppercase tracking-wider hidden md:block">Launchpad</span>
          <div class="hidden md:flex items-center gap-1 ml-2 px-1.5 py-0.5 rounded-md bg-background/50 border border-border/50 text-2xs font-bold opacity-40">
            <span>⌘</span>
            <span>K</span>
          </div>
        </button>
        
        <div class="h-6 w-px bg-border/40 hidden xl:block"></div>
        <AppBreadcrumb class="hidden lg:flex" />
      </div>

      <!-- Right: Actions -->
      <div class="flex items-center gap-3">
        <button 
          @click="toggleTheme" 
          class="relative p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary/50 transition-all duration-300 group"
          title="Toggle Theme"
        >
          <div class="absolute inset-0 bg-primary/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
          <Moon v-if="isDark" :size="18" class="relative z-10 animate-fade-in" />
          <Sun v-else :size="18" class="relative z-10 animate-fade-in" />
        </button>

        <a 
          href="https://github.com/thienle99-dev/datakit" 
          target="_blank" 
          class="hidden sm:flex items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-foreground bg-secondary hover:bg-secondary/80 rounded-full border border-border/50 shadow-sm hover:shadow-md transition-all duration-300"
        >
          <Github :size="14" />
          <span>Star</span>
        </a>
      </div>
    </div>
  </header>
  
  <Launchpad 
    :is-visible="showLaunchpad" 
    @close="showLaunchpad = false" 
  />
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
