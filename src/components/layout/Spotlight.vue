<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Table, ArrowRightLeft, Sparkles, Columns, ShieldCheck, Layers, Scissors, 
  BarChart3, GitCompare, Sigma, Repeat, Database, ListFilter, ListOrdered, 
  Shuffle, EyeOff, FileDown, Search as SearchIcon, Braces, 
  Search as SearchQuery, FileCode, Binary, Clock, Fingerprint, Regex, Command
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
const searchInput = ref<HTMLInputElement | null>(null);
const selectedIndex = ref(0);
const resultsRef = ref<HTMLElement | null>(null);

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
  { id: 'xml-converter', name: 'XML <> JSON', description: 'Convert XML and JSON', path: '/xml-converter', icon: FileCode, color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' },
  { id: 'encoder', name: 'Encoder Suite', description: 'Base64, URL, Hash', path: '/encoder', icon: Binary, color: 'text-indigo-500', bgColor: 'bg-indigo-500/10' },
  { id: 'jwt-debugger', name: 'JWT Debugger', description: 'Decode JWT Tokens', path: '/jwt-debugger', icon: ShieldCheck, color: 'text-pink-500', bgColor: 'bg-pink-500/10' },
  { id: 'epoch-converter', name: 'Epoch Time', description: 'Timestamp Converter', path: '/epoch-converter', icon: Clock, color: 'text-teal-500', bgColor: 'bg-teal-500/10' },
  { id: 'uuid-generator', name: 'UUID Gen', description: 'Generate UUIDs', path: '/uuid-generator', icon: Fingerprint, color: 'text-violet-500', bgColor: 'bg-violet-500/10' },
  { id: 'regex-tester', name: 'Regex Tester', description: 'Test RegEx patterns', path: '/regex-tester', icon: Regex, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  { id: 'templates', name: 'Templates', description: 'Download CSV/Excel templates', path: '/templates', icon: FileDown, color: 'text-slate-500', bgColor: 'bg-slate-500/10' }
];

const filteredTools = computed(() => {
  if (!searchQuery.value) return tools.slice(0, 5); // Show top 5 default suggestions
  const q = searchQuery.value.toLowerCase();
  
  // Rank results: exact matches -> starts with -> includes
  return tools
    .filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
    .sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      if (aName === q && bName !== q) return -1;
      if (bName === q && aName !== q) return 1;
      if (aName.startsWith(q) && !bName.startsWith(q)) return -1;
      if (bName.startsWith(q) && !aName.startsWith(q)) return 1;
      return 0;
    });
});

const navigateTo = (path: string) => {
  router.push(path);
  emit('close');
};

const handleKeyNavigation = (e: KeyboardEvent) => {
  if (!props.isVisible) return;
  
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedIndex.value = (selectedIndex.value + 1) % filteredTools.value.length;
    scrollSelectedIntoView();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedIndex.value = (selectedIndex.value - 1 + filteredTools.value.length) % filteredTools.value.length;
    scrollSelectedIntoView();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    const selected = filteredTools.value[selectedIndex.value];
    if (selected) navigateTo(selected.path);
  } else if (e.key === 'Escape') {
    emit('close');
  }
};

const scrollSelectedIntoView = () => {
    nextTick(() => {
        const selectedEl = resultsRef.value?.children[selectedIndex.value] as HTMLElement;
        selectedEl?.scrollIntoView({ block: 'nearest' });
    });
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyNavigation);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyNavigation);
});

// Focus input when visible
import { watch } from 'vue';
watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    searchQuery.value = '';
    selectedIndex.value = 0;
    nextTick(() => {
      searchInput.value?.focus();
    });
  }
});

watch(searchQuery, () => {
    selectedIndex.value = 0;
});
</script>

<template>
  <Transition name="spotlight">
    <div v-if="isVisible" class="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4">
      <!-- Backdrop -->
      <div 
        class="absolute inset-0 bg-background/60 backdrop-blur-sm transition-opacity" 
        @click="emit('close')"
      ></div>

      <!-- Spotlight Container -->
      <div class="w-full max-w-2xl bg-card border border-border/50 rounded-xl shadow-2xl overflow-hidden flex flex-col relative z-20 animate-in fade-in zoom-in-95 duration-200">
        
        <!-- Search Input Area -->
        <div class="flex items-center px-4 py-4 border-b border-border/40 relative">
          <SearchIcon class="text-muted-foreground/50 ml-1" :size="20" stroke-width="2.5" />
          <input 
            ref="searchInput"
            v-model="searchQuery"
            type="text" 
            placeholder="Search tools..."
            class="flex-1 bg-transparent border-none focus:ring-0 text-lg md:text-xl font-medium placeholder-muted-foreground/40 px-4 outline-none text-foreground h-full"
            autocomplete="off"
            spellcheck="false"
          />
           <div class="flex items-center text-[10px] font-bold text-muted-foreground/40 border border-border/40 rounded px-1.5 py-0.5 pointer-events-none">
            ESC
          </div>
        </div>

        <!-- Results List -->
        <div class="max-h-[60vh] overflow-y-auto custom-scrollbar p-2" v-if="filteredTools.length > 0" ref="resultsRef">
           <button 
             v-for="(tool, index) in filteredTools"
             :key="tool.id"
             @click="navigateTo(tool.path)"
             @mousemove="selectedIndex = index"
             class="w-full flex items-center gap-4 p-3 rounded-lg transition-all duration-150 group text-left relative"
             :class="{ 'bg-secondary/80': selectedIndex === index, 'hover:bg-secondary/50': selectedIndex !== index }"
           >
              <!-- Icon -->
              <div 
                class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 shadow-sm"
                :class="[tool.bgColor, tool.color, selectedIndex === index ? 'scale-110' : 'group-hover:scale-110']"
              >
                <component :is="tool.icon" :size="20" stroke-width="2.5" />
              </div>

              <!-- Text Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-0.5">
                   <span 
                     class="font-bold text-sm text-foreground"
                     :class="{ 'text-primary': selectedIndex === index }"
                   >
                     {{ tool.name }}
                   </span>
                   
                   <ArrowRightLeft v-if="selectedIndex === index" :size="14" class="text-muted-foreground/50 animate-in fade-in slide-in-from-left-2" />
                </div>
                <p class="text-xs text-muted-foreground/70 truncate">{{ tool.description }}</p>
              </div>
              
              <!-- Active Highlight Bar -->
              <div v-if="selectedIndex === index" class="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r-full"></div>
           </button>
        </div>

        <!-- Empty State -->
        <div v-else class="py-12 flex flex-col items-center justify-center text-muted-foreground/40 select-none">
          <SearchIcon :size="48" class="mb-4 opacity-20 stroke-1" />
          <p class="text-sm">No results found for "{{ searchQuery }}"</p>
        </div>

        <!-- Footer -->
        <div class="px-4 py-2 bg-muted/20 border-t border-border/30 flex items-center justify-between text-[10px] text-muted-foreground font-medium select-none">
          <div class="flex items-center gap-2">
            <span class="flex items-center gap-1"><Command :size="10" /> <span class="tracking-widest">SPOTLIGHT</span></span>
          </div>
          <div class="flex items-center gap-3">
             <span class="flex items-center gap-1">
               <span class="bg-background border border-border/50 rounded px-1 min-w-[16px] text-center">↑</span>
               <span class="bg-background border border-border/50 rounded px-1 min-w-[16px] text-center">↓</span>
               <span>to navigate</span>
             </span>
             <span class="flex items-center gap-1">
               <span class="bg-background border border-border/50 rounded px-1 min-w-[30px] text-center">↵</span>
               <span>to select</span>
             </span>
          </div>
        </div>

      </div>
    </div>
  </Transition>
</template>

<style scoped>
.spotlight-enter-active,
.spotlight-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.spotlight-enter-from,
.spotlight-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: theme('colors.border');
  border-radius: 99px;
}
</style>
