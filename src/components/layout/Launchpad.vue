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
  Search as SearchIcon
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

onMounted(() => window.addEventListener('keydown', handleEsc));
onUnmounted(() => window.removeEventListener('keydown', handleEsc));
</script>

<template>
  <Transition name="launchpad">
    <div v-if="isVisible" class="fixed inset-0 z-[9999] flex flex-col items-center justify-start pt-16 md:pt-24 px-6 md:px-12 backdrop-blur-2xl bg-black/60 overflow-hidden">
      <!-- Background Abstract Decor -->
      <div class="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] animate-pulse"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px] animate-pulse" style="animation-delay: 2s"></div>
      </div>

      <!-- Search Interface -->
      <div class="w-full max-w-xl mb-16 md:mb-24 relative group animate-in slide-in-from-top duration-700">
        <div class="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
        <div class="relative flex items-center bg-white/10 dark:bg-black/40 border border-white/20 rounded-2xl px-6 py-4 shadow-2xl">
          <SearchIcon class="text-white/40 mr-4" :size="24" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search for tools..."
            class="bg-transparent border-none focus:ring-0 text-white text-xl md:text-2xl font-medium placeholder-white/20 w-full outline-none"
            autofocus
          />
          <button @click="emit('close')" class="ml-4 p-2 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white">
            <X :size="20" />
          </button>
        </div>
      </div>

      <!-- Icon Grid -->
      <div class="w-full max-w-5xl overflow-y-auto pb-24 scrollbar-none flex-1">
        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-8 md:gap-16">
          <div 
            v-for="tool in filteredTools" 
            :key="tool.id"
            @click="navigateTo(tool.path)"
            class="flex flex-col items-center gap-4 group cursor-pointer animate-in fade-in zoom-in duration-500"
          >
            <div class="relative">
              <!-- Glow effect on hover -->
              <div class="absolute -inset-4 bg-white/10 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100"></div>
              
              <div 
                class="w-16 h-16 md:w-20 md:h-20 rounded-[1.4rem] md:rounded-[1.6rem] relative z-10 flex items-center justify-center shadow-2xl transform transition-transform duration-300 group-hover:scale-105 active:scale-95"
                :class="[tool.bgColor, tool.color]"
              >
                <component :is="tool.icon" :size="32" stroke-width="2" class="md:w-10 md:h-10" />
              </div>
            </div>
            <span class="text-white text-[11px] md:text-sm font-black tracking-tight text-center relative z-10 group-hover:text-white/100 transition-colors opacity-80 group-hover:opacity-100">
              {{ tool.name }}
            </span>
          </div>
        </div>
        
        <div v-if="filteredTools.length === 0" class="flex flex-col items-center justify-center py-24 text-white/40">
           <SearchIcon :size="64" class="mb-4 opacity-20" />
           <p class="text-xl font-bold">No results found for "{{ searchQuery }}"</p>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="absolute bottom-12 text-white/20 text-[10px] font-black uppercase tracking-[0.3em] pointer-events-none">
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
