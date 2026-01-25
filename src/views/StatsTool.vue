<script setup lang="ts">
import { ref, shallowRef, computed } from 'vue';
import { 
  BarChart3, 
  X, 
  PieChart,
  Infinity,
  Search
} from 'lucide-vue-next';
import FileUploader from '../components/shared/FileUploader.vue';
import { parseFile } from '../utils/fileParser';

const file = shallowRef<File | null>(null);
const fileData = ref<any[]>([]);
const headers = ref<string[]>([]);
const processing = ref(false);
const error = ref<string | null>(null);
const searchQuery = ref('');

const handleFileSelected = async (selectedFile: File) => {
  file.value = selectedFile;
  error.value = null;
  processing.value = true;
  
  try {
    const result = await parseFile(selectedFile);
    fileData.value = result.data;
    headers.value = result.headers;
  } catch (err: any) {
    error.value = err.message;
    file.value = null;
  } finally {
    processing.value = false;
  }
};

const columnStats = computed(() => {
  if (fileData.value.length === 0) return [];

  return headers.value.map(header => {
    const values = fileData.value.map(row => row[header]).filter(v => v !== undefined && v !== null && v !== '');
    const nullCount = fileData.value.length - values.length;
    const uniqueValues = new Set(values);
    
    // Infer Type
    let type: 'number' | 'string' | 'date' = 'string';
    const sample = values.slice(0, 10);
    const isNumber = sample.every(v => !isNaN(Number(v)) && v !== '');
    const isDate = !isNumber && sample.every(v => !isNaN(Date.parse(v)));

    if (isNumber) type = 'number';
    else if (isDate) type = 'date';

    let stats: any = {
      header,
      type,
      total: fileData.value.length,
      count: values.length,
      nullCount,
      uniqueCount: uniqueValues.size,
      fillRate: ((values.length / fileData.value.length) * 100).toFixed(1)
    };

    if (type === 'number') {
      const nums = values.map(v => Number(v));
      stats.min = Math.min(...nums);
      stats.max = Math.max(...nums);
      stats.avg = nums.reduce((a, b) => a + b, 0) / nums.length;
      stats.sum = nums.reduce((a, b) => a + b, 0);
    } else if (type === 'string') {
      const lengths = values.map(v => String(v).length);
      stats.minLength = Math.min(...lengths);
      stats.maxLength = Math.max(...lengths);
      
      // Frequency map for top values
      const freqMap: Record<string, number> = {};
      values.forEach(v => {
        const s = String(v);
        freqMap[s] = (freqMap[s] || 0) + 1;
      });
      stats.topValues = Object.entries(freqMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    } else if (type === 'date') {
      const dates = values.map(v => Date.parse(v));
      stats.minDate = new Date(Math.min(...dates)).toLocaleDateString();
      stats.maxDate = new Date(Math.max(...dates)).toLocaleDateString();
    }

    return stats;
  });
});

const filteredStats = computed(() => {
  if (!searchQuery.value) return columnStats.value;
  const q = searchQuery.value.toLowerCase();
  return columnStats.value.filter(s => s.header.toLowerCase().includes(q));
});
</script>

<template>
  <div class="max-w-7xl mx-auto py-12 px-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
      <div class="space-y-1">
        <router-link to="/" class="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider hover:gap-3 transition-all mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          All Tools
        </router-link>
        <h1 class="text-4xl font-black tracking-tight flex items-center gap-3">
          <BarChart3 class="text-emerald-500" :size="36" />
          Column Statistics
        </h1>
        <p class="text-muted-foreground">Detailed data profiling and automated insights for your datasets.</p>
      </div>

      <div v-if="file" class="flex items-center gap-4 bg-card p-3 rounded-2xl border border-border/50 shadow-sm animate-in fade-in duration-500">
         <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <PieChart :size="20" />
         </div>
         <div class="pr-4">
            <div class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Selected File</div>
            <div class="text-sm font-bold truncate max-w-[200px]">{{ file.name }}</div>
         </div>
         <button @click="file = null; fileData = []" class="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors">
            <X :size="18" />
         </button>
      </div>
    </div>

    <!-- Error/No File -->
    <div v-if="!file" class="max-w-xl mx-auto py-10 animate-in zoom-in-95 duration-700">
       <FileUploader @files-selected="handleFileSelected" />
    </div>

    <div v-else class="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
      <!-- Search & Quick Stats Bar -->
      <div class="flex flex-col md:flex-row gap-6 items-center">
        <div class="relative flex-1 w-full">
           <Search :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
           <input 
             v-model="searchQuery"
             type="text" 
             placeholder="Search columns..." 
             class="w-full pl-12 pr-4 py-4 bg-card border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
           />
        </div>
        <div class="flex gap-4 w-full md:w-auto">
           <div class="px-6 py-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-center flex-1 md:flex-none">
              <div class="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest">Columns</div>
              <div class="text-xl font-black text-emerald-600">{{ headers.length }}</div>
           </div>
           <div class="px-6 py-3 bg-blue-500/5 border border-blue-500/10 rounded-2xl text-center flex-1 md:flex-none">
              <div class="text-[9px] font-black text-blue-600/60 uppercase tracking-widest">Total Rows</div>
              <div class="text-xl font-black text-blue-600">{{ fileData.length.toLocaleString() }}</div>
           </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div 
          v-for="stat in filteredStats" 
          :key="stat.header"
          class="glass-card rounded-[2rem] border border-border/50 overflow-hidden group hover:border-emerald-500/30 transition-all hover:-translate-y-1 duration-300"
        >
          <div class="p-6 border-b border-border/50 bg-muted/20 flex items-center justify-between">
            <h3 class="font-bold text-sm truncate pr-2">{{ stat.header }}</h3>
            <div 
              class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter"
              :class="{
                'bg-blue-500/10 text-blue-500': stat.type === 'number',
                'bg-amber-500/10 text-amber-500': stat.type === 'string',
                'bg-purple-500/10 text-purple-500': stat.type === 'date'
              }"
            >
              {{ stat.type }}
            </div>
          </div>

          <div class="p-6 space-y-4">
            <!-- Common Stats -->
            <div class="grid grid-cols-2 gap-3 text-center">
               <div class="p-2 bg-muted/30 rounded-xl">
                 <div class="text-[9px] uppercase font-bold text-muted-foreground/60 mb-0.5">Fill Rate</div>
                 <div class="text-xs font-black">{{ stat.fillRate }}%</div>
               </div>
               <div class="p-2 bg-muted/30 rounded-xl">
                 <div class="text-[9px] uppercase font-bold text-muted-foreground/60 mb-0.5">Unique</div>
                 <div class="text-xs font-black">{{ stat.uniqueCount.toLocaleString() }}</div>
               </div>
            </div>

            <!-- Type Specific Stats -->
            <div v-if="stat.type === 'number'" class="space-y-2 pt-2">
               <div class="flex items-center justify-between text-xs">
                 <span class="text-muted-foreground">Min / Max</span>
                 <span class="font-bold">{{ stat.min }} - {{ stat.max }}</span>
               </div>
               <div class="flex items-center justify-between text-xs">
                 <span class="text-muted-foreground">Average</span>
                 <span class="font-bold">{{ stat.avg.toFixed(2) }}</span>
               </div>
               <div class="flex items-center justify-between text-xs">
                 <span class="text-muted-foreground">Sum</span>
                 <span class="font-bold text-emerald-600 truncate max-w-[100px]">{{ stat.sum.toLocaleString() }}</span>
               </div>
            </div>

            <div v-else-if="stat.type === 'string'" class="space-y-3 pt-2">
               <div class="text-[10px] uppercase font-black text-muted-foreground tracking-widest border-l-2 border-amber-500 pl-2">Top Values</div>
               <div class="space-y-1.5">
                  <div v-for="[val, count] in stat.topValues" :key="val" class="flex items-center justify-between text-[11px]">
                    <span class="text-muted-foreground truncate max-w-[100px] italic">"{{ val || 'empty' }}"</span>
                    <span class="font-bold text-amber-600">{{ count.toLocaleString() }}</span>
                  </div>
               </div>
            </div>

            <div v-else-if="stat.type === 'date'" class="space-y-2 pt-2">
               <div class="flex flex-col gap-1 p-2 bg-purple-500/5 rounded-xl border border-purple-500/10">
                 <span class="text-[9px] uppercase font-bold text-purple-600/60">Range</span>
                 <span class="text-[11px] font-black truncate">{{ stat.minDate }} - {{ stat.maxDate }}</span>
               </div>
            </div>

            <div class="text-[10px] text-muted-foreground/50 text-right pt-2 italic">
               {{ stat.nullCount }} empty rows
            </div>
          </div>
        </div>
      </div>

      <!-- Empty Result -->
      <div v-if="filteredStats.length === 0" class="py-20 text-center">
         <Infinity :size="48" class="text-muted-foreground/20 mx-auto mb-4" />
         <h3 class="text-xl font-bold">Column not found</h3>
         <p class="text-muted-foreground">Try a different search term.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
