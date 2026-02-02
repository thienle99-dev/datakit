<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { 
  ArrowRightLeft, Search as SearchIcon, Command
} from 'lucide-vue-next';
import { tools } from '../../config/tools';

const props = defineProps<{
  isVisible: boolean;
}>();

const emit = defineEmits(['close']);

const router = useRouter();
const searchQuery = ref('');
const searchInput = ref<HTMLInputElement | null>(null);
const selectedIndex = ref(0);
const resultsRef = ref<HTMLElement | null>(null);

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
            aria-label="Search tools input"
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
