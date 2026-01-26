<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Sun, Moon, Github, ChevronDown, Table, ArrowRightLeft, Sparkles, Command, Search, Columns, Layers, Scissors, BarChart3, GitCompare, ShieldCheck, Sigma, Repeat } from 'lucide-vue-next';
import AppBreadcrumb from './AppBreadcrumb.vue';

const isDark = ref(false);
const showMegaMenu = ref(false);

const tools = [
  { 
    id: 'universal-converter', 
    name: 'Universal Converter', 
    description: 'Transform CSV/JSON/Excel/SQL', 
    path: '/universal-converter', 
    icon: ArrowRightLeft, 
    fromColor: 'from-emerald-500', 
    toColor: 'to-teal-400',
    iconColor: 'group-hover:text-emerald-500' 
  },
  { 
    id: 'merge-data', 
    name: 'Merge Data', 
    description: 'Combine multiple files', 
    path: '/merge-data', 
    icon: Layers, 
    fromColor: 'from-indigo-500', 
    toColor: 'to-purple-400',
    iconColor: 'group-hover:text-indigo-500' 
  },
  { 
    id: 'split-data', 
    name: 'Data Splitter', 
    description: 'Split large datasets', 
    path: '/split-data', 
    icon: Scissors, 
    fromColor: 'from-rose-500', 
    toColor: 'to-orange-400',
    iconColor: 'group-hover:text-rose-500' 
  },
  { 
    id: 'data-stats', 
    name: 'Column Statistics', 
    description: 'Automated data insights', 
    path: '/data-stats', 
    icon: BarChart3, 
    fromColor: 'from-emerald-600', 
    toColor: 'to-teal-500',
    iconColor: 'group-hover:text-emerald-600' 
  },
  { 
    id: 'compare-data', 
    name: 'Visual Diff', 
    description: 'Track dataset changes', 
    path: '/compare-data', 
    icon: GitCompare, 
    fromColor: 'from-blue-600', 
    toColor: 'to-indigo-500',
    iconColor: 'group-hover:text-blue-600' 
  },
  { 
    id: 'csv-viewer', 
    name: 'Data Viewer', 
    description: 'Instant read & sorting', 
    path: '/csv-viewer', 
    icon: Table, 
    fromColor: 'from-blue-500', 
    toColor: 'to-cyan-400',
    iconColor: 'group-hover:text-blue-500' 
  },
  { 
    id: 'csv-cleaner', 
    name: 'Data Cleaner', 
    description: 'Fix messy datasets', 
    path: '/csv-cleaner', 
    icon: Sparkles, 
    fromColor: 'from-amber-500', 
    toColor: 'to-orange-400',
    iconColor: 'group-hover:text-amber-500'
  },
  { 
    id: 'column-selector', 
    name: 'Column Manager', 
    description: 'Reorder & pick columns', 
    path: '/column-selector', 
    icon: Columns, 
    fromColor: 'from-pink-500', 
    toColor: 'to-rose-400',
    iconColor: 'group-hover:text-pink-500'
  },
  { 
    id: 'validate-data', 
    name: 'Data Validator', 
    description: 'Audit file structure', 
    path: '/validate-data', 
    icon: ShieldCheck, 
    fromColor: 'from-emerald-500', 
    toColor: 'to-teal-400',
    iconColor: 'group-hover:text-emerald-500' 
  },
  { 
    id: 'reshape-data', 
    name: 'Pivot / Unpivot', 
    description: 'Switch data formats', 
    path: '/reshape-data', 
    icon: ArrowRightLeft, 
    fromColor: 'from-violet-500', 
    toColor: 'to-purple-400',
    iconColor: 'group-hover:text-violet-500' 
  },
  { 
    id: 'summarize-data', 
    name: 'Summarizer', 
    description: 'Aggregate and group', 
    path: '/summarize-data', 
    icon: Sigma, 
    fromColor: 'from-blue-500', 
    toColor: 'to-indigo-400',
    iconColor: 'group-hover:text-blue-500' 
  },
  { 
    id: 'find-replace', 
    name: 'Find & Replace', 
    description: 'Global text rewrite', 
    path: '/find-replace', 
    icon: Repeat, 
    fromColor: 'from-cyan-500', 
    toColor: 'to-teal-400',
    iconColor: 'group-hover:text-cyan-500' 
  }
];

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

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    isDark.value = true;
    document.documentElement.classList.add('dark');
  }

  window.addEventListener('scroll', () => {
    isScrolled.value = window.scrollY > 20;
  });
});
</script>

<template>
  <header 
    class="h-20 flex items-center px-4 md:px-8 sticky top-0 z-[9999] transition-all duration-500"
    :class="{ 'h-16': isScrolled }"
  >
    <!-- Backdrop Overlay -->
    <Transition name="fade">
      <div 
        v-if="showMegaMenu" 
        class="fixed inset-0 bg-background/80 backdrop-blur-sm z-[9998]"
        @mouseenter="showMegaMenu = false"
      ></div>
    </Transition>

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
        
        <div class="h-6 w-px bg-border/40 hidden xl:block"></div>

        <!-- Mega Menu Trigger -->
        <div 
          class="relative group h-full flex items-center"
          @mouseenter="showMegaMenu = true"
          @mouseleave="showMegaMenu = false"
        >
          <button 
            class="group/btn flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-card hover:bg-primary/5 text-primary transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.15)] active:scale-95 border border-primary/10"
            :class="{'bg-primary/5 ring-2 ring-primary/20': showMegaMenu}"
          >
            <Command :size="16" class="transition-transform duration-500 group-hover/btn:rotate-12" />
            <span class="text-sm font-bold tracking-tight">Tools</span>
            <ChevronDown :size="16" class="transition-transform duration-300" :class="{'rotate-180': showMegaMenu}" />
          </button>

          <!-- The Pro Mega Menu -->
          <Transition name="menu-slide">
            <div 
              v-if="showMegaMenu" 
              class="absolute top-[calc(100%+8px)] left-0 w-[840px] bg-card border border-border/80 rounded-[2.5rem] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.25)] z-[10000] overflow-hidden"
            >
              <div class="flex">
                <!-- Main Tools Section -->
                <div class="flex-1 p-8">
                  <div class="flex items-center justify-between mb-6 px-2">
                    <div class="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">
                      Core Utilities
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                     <router-link 
                      v-for="tool in tools" 
                      :key="tool.id" 
                      :to="tool.path"
                      class="group/item relative flex items-center gap-5 p-4 rounded-3xl hover:bg-muted/50 border border-transparent hover:border-border/50 transition-all duration-300"
                    >
                      <div class="relative w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden shadow-sm group-hover/item:shadow-lg group-hover/item:scale-110 transition-all duration-500">
                        <div class="absolute inset-0 bg-gradient-to-br opacity-10 group-hover/item:opacity-20 transition-opacity duration-300" :class="[tool.fromColor, tool.toColor]"></div>
                        <component :is="tool.icon" :size="24" class="relative z-10 transition-colors duration-300" :class="tool.iconColor" />
                      </div>

                      <div class="flex-1 min-w-0">
                        <div class="font-black text-sm tracking-tight text-foreground group-hover/item:text-primary transition-colors">
                          {{ tool.name }}
                        </div>
                        <div class="text-[11px] text-muted-foreground mt-1 line-clamp-1 opacity-70">
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
