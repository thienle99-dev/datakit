<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Table, 
  ArrowRightLeft, 
  Sparkles, 
  Columns, 
  ShieldCheck, 
  Layers, 
  Scissors, 
  BarChart3, 
  GitCompare, 
  Sigma, 
  Repeat,
  Database,
  ListFilter,
  ListOrdered,
  Shuffle,
  EyeOff,
  FileDown,
  X,
  Search as SearchIcon,
  ChevronLeft,
  ChevronRight,
  Braces,
  Search as SearchQuery
} from 'lucide-vue-next';

interface Tool {
  id: string;
  name: string;
  description: string;
  path: string;
  icon: any;
  color: string;
  bgColor: string;
}

const props = defineProps<{
  isVisible: boolean;
}>();

const emit = defineEmits(['close']);

const router = useRouter();
const searchQuery = ref('');

const tools: Tool[] = [
  { id: 'universal-converter', name: 'Converter', description: 'Transform CSV/JSON/Excel/SQL', path: '/universal-converter', icon: ArrowRightLeft, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
  { id: 'merge-data', name: 'Merge', description: 'Combine multiple files', path: '/merge-data', icon: Layers, color: 'text-indigo-500', bgColor: 'bg-indigo-500/10' },
  { id: 'split-data', name: 'Splitter', description: 'Split large datasets', path: '/split-data', icon: Scissors, color: 'text-rose-500', bgColor: 'bg-rose-500/10' },
  { id: 'data-stats', name: 'Statistics', description: 'Automated data insights', path: '/data-stats', icon: BarChart3, color: 'text-emerald-600', bgColor: 'bg-emerald-600/10' },
  { id: 'compare-data', name: 'Visual Diff', description: 'Track dataset changes', path: '/compare-data', icon: GitCompare, color: 'text-blue-600', bgColor: 'bg-blue-600/10' },
  { id: 'csv-viewer', name: 'Viewer', description: 'Instant read & sorting', path: '/csv-viewer', icon: Table, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  { id: 'csv-cleaner', name: 'Cleaner', description: 'Fix messy datasets', path: '/csv-cleaner', icon: Sparkles, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  { id: 'column-selector', name: 'Columns', description: 'Reorder & pick columns', path: '/column-selector', icon: Columns, color: 'text-pink-500', bgColor: 'bg-pink-500/10' },
  { id: 'filter-sort', name: 'Filter', description: 'Professional sorting presets', path: '/filter-sort', icon: ListFilter, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  { id: 'transpose-data', name: 'Transpose', description: 'Flip rows and columns', path: '/transpose-data', icon: ArrowRightLeft, color: 'text-violet-500', bgColor: 'bg-violet-500/10' },
  { id: 'validate-data', name: 'Validator', description: 'Audit file structure', path: '/validate-data', icon: ShieldCheck, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
  { id: 'reshape-data', name: 'Pivot', description: 'Switch data formats', path: '/reshape-data', icon: ArrowRightLeft, color: 'text-violet-500', bgColor: 'bg-violet-500/10' },
  { id: 'summarize-data', name: 'Summarizer', description: 'Aggregate and group', path: '/summarize-data', icon: Sigma, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  { id: 'find-replace', name: 'Replace', description: 'Global text rewrite', path: '/find-replace', icon: Repeat, color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' },
  { id: 'mock-generator', name: 'Mock Gen', description: 'Create fake datasets', path: '/mock-generator', icon: Database, color: 'text-indigo-600', bgColor: 'bg-indigo-500/10' },
  { id: 'skip-rows', name: 'Skip Rows', description: 'Set header and skip rows', path: '/skip-rows', icon: ListOrdered, color: 'text-sky-500', bgColor: 'bg-sky-500/10' },
  { id: 'random-sample', name: 'Sample', description: 'Take first/last/random N', path: '/random-sample', icon: Shuffle, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  { id: 'mask-data', name: 'Masking', description: 'Hide sensitive data', path: '/mask-data', icon: EyeOff, color: 'text-rose-500', bgColor: 'bg-rose-500/10' },
  { id: 'data-to-chart', name: 'Charts', description: 'Visualize data', path: '/data-to-chart', icon: BarChart3, color: 'text-purple-600', bgColor: 'bg-purple-500/10' },
  { id: 'json-formatter', name: 'JSON Beautify', description: 'Format & Minify JSON', path: '/json-formatter', icon: Braces, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  { id: 'json-diff', name: 'JSON Diff', description: 'Compare two JSONs', path: '/json-diff', icon: GitCompare, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  { id: 'json-path', name: 'JSON Query', description: 'Extract data by path', path: '/json-path', icon: SearchQuery, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  { id: 'templates', name: 'Templates', description: 'Download CSV/Excel templates', path: '/templates', icon: FileDown, color: 'text-slate-500', bgColor: 'bg-slate-500/10' }
];

const filteredTools = computed(() => {
  if (!searchQuery.value) return tools;
  const q = searchQuery.value.toLowerCase();
  return tools.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
});

const navigateTo = (path: string) => {
  router.push(path);
  emit('close');
};

const handleEsc = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isVisible) {
    emit('close');
  }
};

// Pagination Logic
const itemsPerPage = ref(18); // Default desktop
const currentPage = ref(0);
const scrollContainer = ref<HTMLElement | null>(null);

const pages = computed(() => {
  const list = filteredTools.value;
  const result = [];
  for (let i = 0; i < list.length; i += itemsPerPage.value) {
    result.push(list.slice(i, i + itemsPerPage.value));
  }
  return result;
});

const updateItemsPerPage = () => {
    // 3 rows x N columns based on width
    const w = window.innerWidth;
    if (w < 640) itemsPerPage.value = 9; // Mobile: 3x3
    else if (w < 768) itemsPerPage.value = 12; // SM: 3x4
    else if (w < 1024) itemsPerPage.value = 15; // MD: 3x5
    else itemsPerPage.value = 18; // LG: 3x6
};

const scrollToPage = (index: number) => {
    if (!scrollContainer.value) return;
    const w = scrollContainer.value.clientWidth;
    scrollContainer.value.scrollTo({ left: w * index, behavior: 'smooth' });
    currentPage.value = index;
};

const handleScroll = (e: Event) => {
    const target = e.target as HTMLElement;
    const index = Math.round(target.scrollLeft / target.clientWidth);
    currentPage.value = index;
};

onMounted(() => {
    window.addEventListener('keydown', handleEsc);
    window.addEventListener('resize', updateItemsPerPage);
    updateItemsPerPage();
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleEsc);
    window.removeEventListener('resize', updateItemsPerPage);
});
</script>

<template>
  <Transition name="launchpad">
    <div v-if="isVisible" class="fixed inset-0 z-[9999] flex flex-col items-center justify-start pt-16 md:pt-24 px-6 md:px-12 backdrop-blur-3xl bg-background/80 overflow-hidden">
      <!-- Background Abstract Decor -->
      <div class="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px] animate-pulse" style="animation-delay: 2s"></div>
      </div>

      <!-- Search Interface -->
      <div class="w-full max-w-lg mb-12 relative group animate-in slide-in-from-top duration-700 z-30">
        <div class="relative flex items-center bg-card/50 border border-border/50 rounded-full px-5 py-3 shadow-2xl backdrop-blur-md transition-all group-hover:bg-card/80 group-focus-within:bg-card group-focus-within:border-primary/50 group-focus-within:ring-1 group-focus-within:ring-primary/50">
          <SearchIcon class="text-muted-foreground mr-3" :size="18" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search for tools..."
            class="bg-transparent border-none focus:ring-0 text-foreground text-md font-medium placeholder-muted-foreground w-full outline-none h-full p-0"
            autofocus
          />
          <button v-if="searchQuery" @click="searchQuery = ''" class="ml-2 text-muted-foreground hover:text-foreground transition-colors">
            <X :size="14" />
          </button>
          <button @click="emit('close')" class="ml-2 text-muted-foreground hover:text-foreground transition-colors md:hidden">
            <span class="text-[10px] font-bold uppercase tracking-wider">Close</span>
          </button>
        </div>
      </div>

      <!-- Icon Grid Slider -->
      <div class="w-full flex-1 flex flex-col justify-center relative min-h-0">
         <div 
            ref="scrollContainer"
            @scroll="handleScroll"
            class="w-full h-full overflow-x-auto scrollbar-none flex snap-x snap-mandatory items-center"
         >
            <div 
              v-for="(page, pageIndex) in pages" 
              :key="pageIndex"
              class="w-full flex-shrink-0 h-full flex flex-col justify-center snap-center px-4 md:px-12"
            >
              <div class="grid grid-cols-4 md:grid-cols-6 gap-x-6 gap-y-10 mx-auto max-w-5xl">
                <div 
                  v-for="tool in page" 
                  :key="tool.id"
                  @click="navigateTo(tool.path)"
                  class="flex flex-col items-center gap-3 group cursor-pointer animate-in fade-in zoom-in duration-500"
                >
                  <div class="relative">
                    <div class="absolute inset-0 bg-card rounded-[1.2rem] group-hover:bg-accent transition-colors duration-300 shadow-sm"></div>
                    <div class="absolute -inset-2 bg-primary/20 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-all duration-500 blur-md"></div>
                    
                    <div 
                      class="w-20 h-20 md:w-24 md:h-24 rounded-[1.6rem] relative z-10 flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-105 active:scale-95 border border-border/50 overflow-hidden bg-card"
                    >
                      <!-- Tint background based on tool color -->
                      <div class="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity bg-current" :class="tool.color"></div>
                      
                      <component :is="tool.icon" :size="32" stroke-width="2" class="md:w-10 md:h-10 relative z-10 opacity-90 group-hover:opacity-100 transition-opacity" :class="tool.color" />
                    </div>
                  </div>
                  <span class="text-muted-foreground text-[10px] md:text-xs font-bold tracking-wide text-center relative z-10 group-hover:text-foreground transition-colors opacity-80 group-hover:opacity-100 max-w-[80px] leading-tight select-none">
                    {{ tool.name }}
                  </span>
                </div>
              </div>
            </div>
         </div>
         
         <!-- Empty State -->
         <div v-if="filteredTools.length === 0" class="flex flex-col items-center justify-center text-muted-foreground absolute inset-0 pointer-events-none">
             <SearchIcon :size="48" class="mb-4 opacity-20" />
             <p class="text-sm font-bold opacity-50">No tools found</p>
         </div>

         <!-- Scroll Indicators (Arrows) -->
         <button 
            v-if="currentPage > 0"
            @click="scrollToPage(currentPage - 1)"
            class="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-card/50 hover:bg-card border border-border/50 text-muted-foreground hover:text-foreground transition-all backdrop-blur-sm z-20 hidden md:flex"
         >
            <ChevronLeft :size="24" />
         </button>
         <button 
            v-if="currentPage < pages.length - 1"
            @click="scrollToPage(currentPage + 1)"
            class="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-card/50 hover:bg-card border border-border/50 text-muted-foreground hover:text-foreground transition-all backdrop-blur-sm z-20 hidden md:flex"
         >
            <ChevronRight :size="24" />
         </button>
         
         <!-- Pagination Dots -->
         <div v-if="pages.length > 1" class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            <button 
              v-for="(_, idx) in pages" 
              :key="idx"
              @click="scrollToPage(idx)"
              class="w-2 h-2 rounded-full transition-all duration-300"
              :class="currentPage === idx ? 'bg-primary w-6' : 'bg-muted-foreground/30 hover:bg-muted-foreground'"
            ></button>
         </div>
      </div>

      <!-- Footer Info -->
      <div class="absolute bottom-12 text-muted-foreground/40 text-[10px] font-black uppercase tracking-[0.3em] pointer-events-none">
        Press ESC to exit
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.launchpad-enter-active,
.launchpad-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.launchpad-enter-from,
.launchpad-leave-to {
  opacity: 0;
  transform: scale(1.1);
  filter: blur(20px);
}

.scrollbar-none::-webkit-scrollbar {
  display: none;
}
</style>
