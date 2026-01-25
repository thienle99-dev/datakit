<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Sun, Moon, Github, ChevronDown, Table, ArrowRightLeft, Sparkles, FileJson, Database, Command, Search, ExternalLink } from 'lucide-vue-next';
import AppBreadcrumb from './AppBreadcrumb.vue';

const isDark = ref(false);
const showMegaMenu = ref(false);

const tools = [
  { 
    id: 'csv-viewer', 
    name: 'CSV Viewer', 
    description: 'Instant read & analyze', 
    path: '/tools/csv-viewer', 
    icon: Table, 
    fromColor: 'from-blue-500', 
    toColor: 'to-cyan-400',
    iconColor: 'group-hover:text-blue-500' 
  },
  { 
    id: 'csv-converter', 
    name: 'CSV Converter', 
    description: 'XLSX <-> CSV transform', 
    path: '/tools/csv-converter', 
    icon: ArrowRightLeft, 
    fromColor: 'from-green-500', 
    toColor: 'to-emerald-400',
    iconColor: 'group-hover:text-green-500'
  },
  { 
    id: 'csv-cleaner', 
    name: 'Data Cleaner', 
    description: 'Fix messy datasets', 
    path: '/tools/csv-cleaner', 
    icon: Sparkles, 
    fromColor: 'from-amber-500', 
    toColor: 'to-orange-400',
    iconColor: 'group-hover:text-amber-500'
  },
  { 
    id: 'json-converter', 
    name: 'JSON Transform', 
    description: 'Tabular to Object', 
    path: '/tools/json-converter', 
    icon: FileJson, 
    fromColor: 'from-indigo-500', 
    toColor: 'to-purple-400',
    iconColor: 'group-hover:text-indigo-500'
  },
  { 
    id: 'sql-generator', 
    name: 'SQL Generator', 
    description: 'Generate INSERTs', 
    path: '/tools/sql-generator', 
    icon: Database, 
    fromColor: 'from-rose-500', 
    toColor: 'to-pink-400',
    iconColor: 'group-hover:text-rose-500'
  },
];

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
  <header class="h-20 flex items-center px-4 md:px-8 sticky top-0 z-[9999] transition-all duration-300">
    <!-- Floating Glass Container -->
    <div class="absolute inset-x-4 md:inset-x-8 top-2 bottom-2 rounded-2xl bg-background/60 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)] flex items-center px-4 justify-between transition-all duration-300 hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.15)] hover:border-white/30">
      
      <!-- Left: Logo & Nav -->
      <div class="flex items-center gap-6">
        <router-link to="/" class="flex items-center gap-3 group">
          <div class="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-300 ring-1 ring-white/20 dark:ring-white/10">
             <img src="/logo.svg?v=2" alt="Logo" class="w-6 h-6 object-contain z-10" />
             <div class="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <span class="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 group-hover:to-primary transition-all duration-300 tracking-tight hidden sm:block">
            Data Tools
          </span>
        </router-link>
        
        <div class="h-6 w-px bg-border/40 hidden md:block"></div>

        <!-- Mega Menu Trigger -->
        <div 
          class="relative group h-full flex items-center"
          @mouseenter="showMegaMenu = true"
          @mouseleave="showMegaMenu = false"
        >
          <button 
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-secondary/50 text-sm font-medium transition-all duration-200 group-hover:text-primary"
            :class="{'text-primary bg-secondary/50': showMegaMenu}"
          >
            <Command :size="14" class="opacity-50" />
            <span>Tools</span>
            <ChevronDown :size="14" class="opacity-50 transition-transform duration-200" :class="{'rotate-180': showMegaMenu}" />
          </button>

          <!-- The Pro Mega Menu -->
          <Transition name="menu-slide">
            <div 
              v-if="showMegaMenu" 
              class="absolute top-14 left-0 w-[800px] bg-white/95 backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] z-[100] overflow-hidden"
            >
              <div class="flex">
                <!-- Main Tools Section -->
                <div class="flex-1 p-6">
                  <div class="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 pl-2 opacity-70">
                    Core Utilities
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                     <router-link 
                      v-for="tool in tools" 
                      :key="tool.id" 
                      :to="tool.path"
                      class="group/card relative flex items-start gap-4 p-3 rounded-xl hover:bg-secondary/40 border border-transparent hover:border-white/10 transition-all duration-300"
                    >
                      <div class="relative w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden shadow-sm group-hover/card:shadow-md transition-all duration-300">
                        <div class="absolute inset-0 bg-gradient-to-br opacity-10 group-hover/card:opacity-20 transition-opacity duration-300" :class="[tool.fromColor, tool.toColor]"></div>
                        <component :is="tool.icon" :size="20" class="relative z-10 transition-colors duration-300" :class="tool.iconColor" />
                      </div>

                      <div class="flex-1 min-w-0">
                        <div class="font-medium text-sm text-foreground group-hover/card:text-primary transition-colors">
                          {{ tool.name }}
                        </div>
                        <div class="text-[11px] text-muted-foreground mt-0.5 line-clamp-1 leading-tight opacity-80">
                          {{ tool.description }}
                        </div>
                      </div>
                    </router-link>
                  </div>
                </div>

                <!-- Right Sidebar / Featured -->
                <div class="w-64 bg-muted/30 border-l border-white/10 p-6 flex flex-col">
                  <div class="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 opacity-70">
                    Featured
                  </div>
                  
                  <div class="relative group/promo rounded-xl overflow-hidden aspect-video mb-4 cursor-pointer">
                    <div class="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-80 group-hover/promo:opacity-100 transition-opacity duration-300"></div>
                    <div class="relative z-10 p-4 h-full flex flex-col justify-end text-white">
                      <div class="font-bold text-sm">New SQL Gen</div>
                      <div class="text-[10px] opacity-90">Convert CSV to SQL instantly.</div>
                    </div>
                  </div>

                  <!-- <div class="mt-auto">
                     <div class="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 opacity-70">
                        Quick Links
                     </div>
                     <nav class="space-y-2">
                        <a href="#" class="block text-sm text-muted-foreground hover:text-foreground transition-colors">Documentation</a>
                        <a href="#" class="block text-sm text-muted-foreground hover:text-foreground transition-colors">API Access</a>
                        <router-link to="/tools" class="flex items-center gap-2 text-sm text-primary font-medium hover:underline mt-2">
                           All Tools <ExternalLink :size="12" />
                        </router-link>
                     </nav>
                  </div> -->
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <AppBreadcrumb class="hidden lg:flex" />
      </div>

      <!-- Right: Actions -->
      <div class="flex items-center gap-3">
        <!-- Search Trigger (Visual Only for now) -->
        <button class="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary/50 transition-colors md:hidden">
          <Search :size="18" />
        </button>

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
          href="https://github.com" 
          target="_blank" 
          class="hidden sm:flex items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-foreground bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 rounded-full border border-border/50 shadow-sm hover:shadow-md transition-all duration-300"
        >
          <Github :size="14" />
          <span>Star</span>
        </a>
      </div>
    </div>
  </header>
</template>

<style scoped>
.menu-slide-enter-active,
.menu-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.menu-slide-enter-from,
.menu-slide-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.96);
  filter: blur(8px);
}
</style>
