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
  Braces,
  Search as SearchQuery,
  FileCode,
  Binary,
  Clock,
  Fingerprint,
  Regex
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
  { id: 'xml-converter', name: 'XML <> JSON', description: 'Convert XML and JSON', path: '/xml-converter', icon: FileCode, color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' },
  { id: 'encoder', name: 'Encoder Suite', description: 'Base64, URL, Hash', path: '/encoder', icon: Binary, color: 'text-indigo-500', bgColor: 'bg-indigo-500/10' },
  { id: 'jwt-debugger', name: 'JWT Debugger', description: 'Decode JWT Tokens', path: '/jwt-debugger', icon: ShieldCheck, color: 'text-pink-500', bgColor: 'bg-pink-500/10' },
  { id: 'epoch-converter', name: 'Epoch Time', description: 'Timestamp Converter', path: '/epoch-converter', icon: Clock, color: 'text-teal-500', bgColor: 'bg-teal-500/10' },
  { id: 'uuid-generator', name: 'UUID Gen', description: 'Generate UUIDs', path: '/uuid-generator', icon: Fingerprint, color: 'text-violet-500', bgColor: 'bg-violet-500/10' },
  { id: 'regex-tester', name: 'Regex Tester', description: 'Test RegEx patterns', path: '/regex-tester', icon: Regex, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
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

const categories = computed(() => {
    // Basic grouping logic (could be metadata based)
    const groups: Record<string, Tool[]> = {
        'Core': [],
        'Data & CSV': [],
        'JSON & Text': [],
        'Encoder & Dev': [],
        'Charts': []
    };
    
    // Helper to safely push
    const addToGroup = (name: string, tool: Tool) => {
        if (groups[name]) groups[name].push(tool);
    };
    
    filteredTools.value.forEach(t => {
        if (['json-formatter','json-diff','json-path','xml-converter'].includes(t.id)) addToGroup('JSON & Text', t);
        else if (['encoder','jwt-debugger','epoch-converter','uuid-generator','regex-tester'].includes(t.id)) addToGroup('Encoder & Dev', t);
        else if (t.id === 'data-to-chart') addToGroup('Charts', t);
        else if (['csv-viewer','csv-cleaner','universal-converter'].includes(t.id)) addToGroup('Core', t);
        else addToGroup('Data & CSV', t);
    });
    
    return Object.keys(groups)
        .filter((k): k is string => (groups[k] ?? []).length > 0)
        .map(k => ({ name: k, tools: groups[k] ?? [] }));
});

onMounted(() => {
    window.addEventListener('keydown', handleEsc);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleEsc);
});
</script>

<template>
  <Transition name="launchpad">
    <div v-if="isVisible" class="fixed inset-0 z-[9999] flex flex-col items-center justify-start pt-12 md:pt-16 px-6 md:px-12 backdrop-blur-3xl bg-background/80 overflow-hidden">
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

      <div class="flex-1 overflow-y-auto custom-scrollbar p-2 md:p-4">
        <div class="max-w-7xl mx-auto">
          <div v-for="category in categories" :key="category.name" class="mb-6 animate-in slide-in-from-bottom-2 duration-500">
            <h3 class="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 px-1">{{ category.name }}</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              <button 
                v-for="tool in category.tools" 
                :key="tool.id"
                @click="navigateTo(tool.path)"
                class="group flex flex-col items-start p-2.5 bg-card hover:bg-muted/50 border border-border/50 hover:border-primary/50 rounded-lg transition-all duration-300 hover:shadow-sm text-left relative overflow-hidden active:scale-[0.98]"
              >
                <div class="flex items-center gap-2.5 w-full mb-1.5">
                  <div :class="`w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${tool.bgColor} ${tool.color}`">
                    <component :is="tool.icon" :size="16" stroke-width="2.5" />
                  </div>
                  <div class="min-w-0">
                    <div class="font-bold text-[11px] text-foreground truncate leading-tight group-hover:text-primary transition-colors">{{ tool.name }}</div>
                  </div>
                </div>
                <div class="text-[9px] text-muted-foreground line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100">{{ tool.description }}</div>
                
                <!-- Hover Effect -->
                <div class="absolute inset-0 bg-gradient-to-tr from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </button>
            </div>
          </div>
          
          <!-- Empty State -->
          <div v-if="filteredTools.length === 0" class="flex flex-col items-center justify-center py-20 text-muted-foreground animate-in fade-in zoom-in duration-500">
             <SearchIcon :size="48" class="mb-4 opacity-20" />
             <p class="text-sm font-bold opacity-50">No tools found</p>
          </div>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="absolute bottom-6 text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] pointer-events-none">
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
