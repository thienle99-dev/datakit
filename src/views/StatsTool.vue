<script setup lang="ts">
import { ref, shallowRef, computed } from 'vue';
import { 
  BarChart3, 
  X, 
  Search,
  ArrowLeft,
  Activity,
  Maximize2,
  Calendar,
  Layers,
  Sparkles
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

const totalNullCells = computed(() => {
  return columnStats.value.reduce((acc, curr) => acc + curr.nullCount, 0);
});
</script>

<template>
  <div class="max-w-[1600px] mx-auto h-[calc(100vh-8rem)] flex flex-col p-4 md:p-6 lg:p-10">
    <!-- Premium Header Section -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
      <div class="space-y-4 max-w-2xl">
        <router-link to="/" class="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-primary/80 transition-all mb-2">
          <ArrowLeft :size="14" class="group-hover:-translate-x-1 transition-transform" />
          Back to Toolkit
        </router-link>
        
        <div class="flex items-center gap-6">
          <div class="p-4 bg-emerald-500/10 text-emerald-500 rounded-[2rem] shadow-inner ring-1 ring-emerald-500/20">
            <BarChart3 :size="40" stroke-width="2.5" />
          </div>
          <div>
            <h2 class="text-4xl md:text-5xl font-black tracking-tighter text-foreground mb-2">
              Column <span class="text-emerald-500">Statistics</span>
            </h2>
            <p class="text-muted-foreground text-lg font-medium leading-relaxed">
              Automated data profiling. Insights at the speed of thought.
            </p>
          </div>
        </div>
      </div>

      <div v-if="file" class="flex items-center gap-4 animate-in fade-in slide-in-from-right-8 duration-700">
        <div class="flex items-center gap-4 px-6 py-3 bg-card border border-border/50 rounded-2xl shadow-sm">
           <div class="flex flex-col items-end border-r border-border/50 pr-4 mr-2">
              <span class="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Active Context</span>
              <span class="text-sm font-bold truncate max-w-[180px]">{{ file.name }}</span>
           </div>
           <button @click="file = null; fileData = []" class="p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all active:scale-95 group">
              <X :size="18" class="group-hover:rotate-90 transition-transform" />
           </button>
        </div>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="flex-1 min-h-0 flex flex-col relative overflow-hidden">
      
      <div v-if="!file" class="flex-1 flex flex-col justify-center max-w-[1000px] mx-auto w-full">
         <div class="text-center space-y-4 mb-12">
            <div class="inline-flex px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              Real-time Profiler
            </div>
            <h3 class="text-5xl font-black tracking-tighter">Decode your data.</h3>
            <p class="text-muted-foreground text-xl font-medium max-w-lg mx-auto leading-relaxed">
              Drop your CSV to instantly see distribution, types, fill rates, and semantic trends across every column.
            </p>
         </div>
         <FileUploader @files-selected="handleFileSelected" class="min-h-[400px]" />
      </div>

      <div v-else class="h-full flex flex-col gap-10 animate-in fade-in duration-700 overflow-hidden">
        
        <!-- Search & Global Metrics Bar -->
        <div class="flex flex-col lg:flex-row gap-8 items-center bg-card border border-border/50 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden group">
          <!-- Ambient Glow -->
          <div class="absolute -right-20 -bottom-20 w-40 h-40 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-700"></div>

          <div class="relative flex-1 w-full group/search">
             <Search :size="20" class="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within/search:text-emerald-500 transition-colors" />
             <input 
               v-model="searchQuery"
               type="text" 
               placeholder="Find columns by ID or label..." 
               class="w-full pl-14 pr-6 py-4 bg-background border border-border/50 rounded-3xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 transition-all shadow-inner placeholder:text-muted-foreground/30"
             />
          </div>

          <div class="flex gap-4 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 shrink-0">
             <div class="px-8 py-4 bg-muted/20 border border-border/50 rounded-3xl text-center min-w-[120px] transition-all hover:bg-muted/40">
                <div class="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mb-1 flex items-center justify-center gap-2">
                  <Layers :size="10" /> Columns
                </div>
                <div class="text-2xl font-black">{{ headers.length }}</div>
             </div>
             <div class="px-8 py-4 bg-muted/20 border border-border/50 rounded-3xl text-center min-w-[120px] transition-all hover:bg-muted/40">
                <div class="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mb-1 flex items-center justify-center gap-2">
                  <Maximize2 :size="10" /> Rows
                </div>
                <div class="text-2xl font-black tracking-tight">{{ fileData.length.toLocaleString() }}</div>
             </div>
             <div class="px-8 py-4 bg-rose-500/5 border border-rose-500/10 rounded-3xl text-center min-w-[120px] transition-all hover:bg-rose-500/10">
                <div class="text-[10px] font-black text-rose-500/60 uppercase tracking-widest mb-1 flex items-center justify-center gap-2">
                  <X :size="10" /> Null Cells
                </div>
                <div class="text-2xl font-black text-rose-500">{{ totalNullCells.toLocaleString() }}</div>
             </div>
          </div>
        </div>

        <!-- Stats Grid Area -->
        <div class="flex-1 overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-10">
            <div 
              v-for="stat in filteredStats" 
              :key="stat.header"
              class="bg-card rounded-[2.5rem] border border-border/50 overflow-hidden group hover:border-emerald-500/30 transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] flex flex-col"
            >
              <div class="p-8 border-b border-border/30 bg-muted/20 flex flex-col gap-4">
                 <div class="flex items-center justify-between">
                    <div 
                      class="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ring-1"
                      :class="{
                        'bg-blue-500/10 text-blue-500 ring-blue-500/20': stat.type === 'number',
                        'bg-amber-500/10 text-amber-500 ring-amber-500/20': stat.type === 'string',
                        'bg-purple-500/10 text-purple-500 ring-purple-500/20': stat.type === 'date'
                      }"
                    >
                      {{ stat.type }}
                    </div>
                    <div class="text-[10px] font-black text-muted-foreground/30 font-mono">ID: {{ headers.indexOf(stat.header) }}</div>
                 </div>
                 <h3 class="font-black text-lg tracking-tight leading-tight group-hover:text-primary transition-colors pr-2 break-all">{{ stat.header }}</h3>
              </div>

              <div class="p-8 space-y-8 flex-1">
                <!-- Data Density Section -->
                <div class="space-y-4">
                   <div class="flex items-center justify-between">
                      <span class="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Data Density</span>
                      <span class="text-xs font-black" :class="Number(stat.fillRate) < 50 ? 'text-rose-500' : 'text-emerald-500'">{{ stat.fillRate }}%</span>
                   </div>
                   <div class="h-2 w-full bg-muted rounded-full overflow-hidden shadow-inner">
                      <div 
                        class="h-full rounded-full transition-all duration-1000 bg-gradient-to-r"
                        :class="[
                          Number(stat.fillRate) < 50 ? 'from-rose-500 to-rose-400' : 'from-emerald-600 to-emerald-400',
                          'animate-in slide-in-from-left duration-1000'
                        ]"
                        :style="{ width: `${stat.fillRate}%` }"
                      ></div>
                   </div>
                   <div class="flex items-center justify-between pt-1">
                      <div class="flex flex-col">
                         <span class="text-[9px] font-black text-muted-foreground/40 uppercase">Unique</span>
                         <span class="text-xs font-bold">{{ stat.uniqueCount.toLocaleString() }}</span>
                      </div>
                      <div class="flex flex-col items-end">
                         <span class="text-[9px] font-black text-muted-foreground/40 uppercase">Empty</span>
                         <span class="text-xs font-bold text-rose-500/60">{{ stat.nullCount.toLocaleString() }}</span>
                      </div>
                   </div>
                </div>

                <!-- Type-Specific Analytics Area -->
                <div class="flex-1 min-h-[140px] p-6 bg-muted/20 rounded-3xl border border-border/30 relative overflow-hidden group/box hover:bg-muted/40 transition-colors">
                   <div v-if="stat.type === 'number'" class="space-y-4">
                      <div class="flex items-center gap-2 mb-2">
                         <Activity :size="14" class="text-blue-500" />
                         <span class="text-[10px] font-black uppercase tracking-widest text-blue-500/60">Distribution</span>
                      </div>
                      <div class="space-y-3">
                         <div class="flex items-center justify-between">
                           <span class="text-[11px] font-bold text-muted-foreground">Range</span>
                           <span class="text-[11px] font-black truncate max-w-[120px]">{{ stat.min }} ➝ {{ stat.max }}</span>
                         </div>
                         <div class="h-px bg-border/40"></div>
                         <div class="flex items-center justify-between">
                           <span class="text-[11px] font-bold text-muted-foreground">Mean</span>
                           <span class="text-[11px] font-black text-blue-500">{{ stat.avg.toFixed(2) }}</span>
                         </div>
                         <div class="flex items-center justify-between">
                           <span class="text-[11px] font-bold text-muted-foreground">Summation</span>
                           <span class="text-[11px] font-black opacity-60 truncate max-w-[120px]">{{ stat.sum.toLocaleString() }}</span>
                         </div>
                      </div>
                   </div>

                   <div v-else-if="stat.type === 'string'" class="space-y-4">
                      <div class="flex items-center gap-2 mb-2">
                         <Sparkles :size="14" class="text-amber-500" />
                         <span class="text-[10px] font-black uppercase tracking-widest text-amber-500/60">Frequencies</span>
                      </div>
                      <div class="space-y-2">
                         <div v-for="[val, count] in stat.topValues" :key="val" class="flex items-center justify-between text-[11px]">
                           <span class="text-muted-foreground truncate max-w-[120px] font-medium">"{{ val || 'N/A' }}"</span>
                           <span class="font-black text-amber-600">{{ count.toLocaleString() }}</span>
                         </div>
                      </div>
                   </div>

                   <div v-else-if="stat.type === 'date'" class="space-y-4">
                      <div class="flex items-center gap-2 mb-2">
                         <Calendar :size="14" class="text-purple-500" />
                         <span class="text-[10px] font-black uppercase tracking-widest text-purple-500/60">Timeline</span>
                      </div>
                      <div class="space-y-4">
                         <div class="flex flex-col gap-1">
                            <span class="text-[9px] font-black text-purple-500/40 uppercase">Origin</span>
                            <span class="text-xs font-black">{{ stat.minDate }}</span>
                         </div>
                         <div class="flex flex-col gap-1">
                            <span class="text-[9px] font-black text-purple-500/40 uppercase">Latest</span>
                            <span class="text-xs font-black">{{ stat.maxDate }}</span>
                         </div>
                      </div>
                   </div>

                   <!-- Background Visual Element -->
                   <div 
                    class="absolute -right-4 -bottom-4 opacity-[0.03] group-hover/box:opacity-[0.06] transition-opacity rotate-12 group-hover/box:scale-110 pointer-events-none transition-all duration-700"
                    :class="{ 'text-blue-500': stat.type === 'number', 'text-amber-500': stat.type === 'string', 'text-purple-500': stat.type === 'date' }"
                   >
                     <component :is="stat.type === 'number' ? Activity : (stat.type === 'string' ? Sparkles : Calendar)" :size="80" />
                   </div>
                </div>
              </div>
            </div>
            
            <!-- Future Placeholder Card -->
            <div class="bg-muted/10 border-2 border-dashed border-border/30 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center opacity-40 hover:opacity-100 transition-opacity">
               <div class="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
                 <Sparkles :size="24" />
               </div>
               <h4 class="font-black uppercase tracking-widest text-xs">Custom View</h4>
               <p class="text-[10px] font-bold mt-2 leading-relaxed px-4">AI driven custom column projections coming soon.</p>
            </div>
          </div>
        </div>

        <!-- Empty Result -->
        <div v-if="filteredStats.length === 0" class="flex-1 flex flex-col items-center justify-center">
           <div class="w-24 h-24 rounded-[3rem] bg-muted/40 flex items-center justify-center mb-8 shadow-inner ring-1 ring-border/50">
             <Search :size="32" class="opacity-20" />
           </div>
           <h3 class="text-2xl font-black tracking-tight">Column not found</h3>
           <p class="text-muted-foreground font-medium mt-2">We couldn't find a column named "{{ searchQuery }}".</p>
           <button @click="searchQuery = ''" class="mt-8 px-6 py-3 bg-primary/10 text-primary border border-primary/20 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">Clear Search</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scrollbar polish */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: hsl(var(--border) / 0.5);
  border-radius: 10px;
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
