<script setup lang="ts">
import { ref, shallowRef, computed } from 'vue';
import { 
  BarChart3, 
  X, 
  Search,
  ArrowLeft,
  Activity,
  Calendar,
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
  <div class="w-full h-screen-minus-header flex flex-col p-2 md:p-4">
    <!-- Premium Header Section -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 shrink-0 relative z-20">
      <div class="flex items-center gap-4">
        <router-link to="/" class="p-2.5 bg-card border border-border/50 rounded-xl text-muted-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm group">
          <ArrowLeft :size="18" class="group-hover:-translate-x-0.5 transition-transform" />
        </router-link>
        
        <div class="h-10 w-px bg-border/30 hidden lg:block"></div>

        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center ring-1 ring-emerald-500/20">
            <BarChart3 :size="20" stroke-width="2.5" />
          </div>
          <div>
            <h2 class="text-lg md:text-xl font-black tracking-tight text-foreground">
              Column <span class="text-emerald-500">Statistics</span>
            </h2>
          </div>
        </div>
      </div>

      <div v-if="file" class="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-700">
        <div class="flex items-baseline gap-2 px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
          <span class="text-xl font-black text-emerald-500">{{ fileData.length.toLocaleString() }}</span>
          <span class="text-[9px] font-black uppercase tracking-widest text-emerald-500/40">Records</span>
        </div>
        
        <button 
          @click="file = null; fileData = []" 
          class="p-3 bg-card hover:bg-muted text-foreground border border-border/50 rounded-xl transition-all duration-300 active:scale-95 group"
        >
          <X :size="18" class="group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="flex-1 min-h-0 flex flex-col relative overflow-hidden">
      
      <div v-if="!file" class="flex-1 flex flex-col items-center justify-center py-4 w-full">
         <div class="text-center space-y-2 mb-6">
            <h3 class="text-2xl font-black tracking-tight">Decode your data.</h3>
            <p class="text-muted-foreground text-xs font-medium max-w-sm mx-auto leading-relaxed opacity-60">
              Drop your file to instantly see distribution, types, and trends across every column.
            </p>
         </div>
         <FileUploader @files-selected="handleFileSelected" class="w-full max-w-2xl" />
      </div>

      <div v-else class="h-full flex flex-col gap-10 animate-in fade-in duration-700 overflow-hidden">
        
        <!-- Search & Global Metrics Bar -->
        <div class="flex flex-col lg:flex-row gap-6 items-center bg-card border border-border/50 rounded-2xl p-4 shadow-2xl relative overflow-hidden group">
          <div class="relative flex-1 w-full group/search">
             <Search :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within/search:text-emerald-500 transition-colors" />
             <input 
               v-model="searchQuery"
               type="text" 
               placeholder="Find columns..." 
               class="w-full pl-11 pr-5 py-2.5 bg-background border border-border/50 rounded-2xl text-xs font-medium focus:outline-none focus:border-emerald-500/30 transition-all shadow-inner"
             />
          </div>

          <div class="flex gap-3 w-full lg:w-auto shrink-0">
             <div class="px-5 py-2.5 bg-muted/20 border border-border/50 rounded-2xl text-center min-w-[100px] flex flex-col items-center justify-center">
                <div class="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest mb-0.5">{{ headers.length }} Cols</div>
                <div class="text-sm font-black tracking-tight text-foreground/40">Columns</div>
             </div>
             <div class="px-5 py-2.5 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-center min-w-[100px] flex flex-col items-center justify-center">
                <div class="text-[8px] font-black text-rose-500/60 uppercase tracking-widest mb-0.5">{{ totalNullCells.toLocaleString() }} Nulls</div>
                <div class="text-sm font-black tracking-tight text-rose-500/40">Empty Cells</div>
             </div>
          </div>
        </div>

        <!-- Stats Grid Area -->
        <div class="flex-1 overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-10">
            <div 
              v-for="stat in filteredStats" 
              :key="stat.header"
              class="bg-card rounded-2xl border border-border/50 overflow-hidden group hover:border-emerald-500/30 transition-all duration-300 hover:shadow-xl flex flex-col"
            >
              <div class="p-5 border-b border-border/30 bg-muted/20 flex flex-col gap-3">
                 <div class="flex items-center justify-between">
                    <div 
                      class="px-2.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ring-1"
                      :class="{
                        'bg-blue-500/10 text-blue-500 ring-blue-500/20': stat.type === 'number',
                        'bg-amber-500/10 text-amber-500 ring-amber-500/20': stat.type === 'string',
                        'bg-purple-500/10 text-purple-500 ring-purple-500/20': stat.type === 'date'
                      }"
                    >
                      {{ stat.type }}
                    </div>
                    <div class="text-[8px] font-black text-muted-foreground/30 font-mono">#{{ headers.indexOf(stat.header) }}</div>
                 </div>
                 <h3 class="font-black text-sm tracking-tight leading-tight group-hover:text-primary transition-colors pr-2 break-all">{{ stat.header }}</h3>
              </div>

              <div class="p-5 space-y-6 flex-1">
                <!-- Data Density Section -->
                <div class="space-y-3">
                   <div class="flex items-center justify-between">
                      <span class="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">Density</span>
                      <span class="text-[10px] font-black" :class="Number(stat.fillRate) < 50 ? 'text-rose-500' : 'text-emerald-500'">{{ stat.fillRate }}%</span>
                   </div>
                   <div class="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        class="h-full rounded-full transition-all duration-1000 bg-emerald-500"
                        :style="{ width: `${stat.fillRate}%` }"
                      ></div>
                   </div>
                </div>

                <!-- Type-Specific Analytics Area -->
                <div class="flex-1 p-4 bg-muted/20 rounded-2xl border border-border/10 relative overflow-hidden group/box transition-colors min-h-[120px]">
                   <div v-if="stat.type === 'number'" class="space-y-2">
                      <div class="flex items-center justify-between text-[10px]">
                        <span class="text-muted-foreground font-bold">Range</span>
                        <span class="font-black truncate max-w-[100px]">{{ stat.min }} - {{ stat.max }}</span>
                      </div>
                      <div class="flex items-center justify-between text-[10px]">
                        <span class="text-muted-foreground font-bold">Mean</span>
                        <span class="font-black text-emerald-500">{{ stat.avg.toFixed(2) }}</span>
                      </div>
                      <div class="flex items-center justify-between text-[10px]">
                        <span class="text-muted-foreground font-bold">Unique</span>
                        <span class="font-black">{{ stat.uniqueCount }}</span>
                      </div>
                   </div>

                   <div v-else-if="stat.type === 'string'" class="space-y-1.5">
                      <div v-for="[val, count] in stat.topValues" :key="val" class="flex items-center justify-between text-[9px]">
                        <span class="text-muted-foreground truncate max-w-[100px] font-medium">"{{ val || 'N/A' }}"</span>
                        <span class="font-black text-emerald-600">{{ count }}</span>
                      </div>
                   </div>

                   <div v-else-if="stat.type === 'date'" class="space-y-2">
                       <div class="flex flex-col gap-0.5">
                          <span class="text-[8px] font-black text-muted-foreground/40 uppercase">Origin</span>
                          <span class="text-[10px] font-black">{{ stat.minDate }}</span>
                       </div>
                       <div class="flex flex-col gap-0.5">
                          <span class="text-[8px] font-black text-muted-foreground/40 uppercase">Latest</span>
                          <span class="text-[10px] font-black">{{ stat.maxDate }}</span>
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
            
            <!-- Future Placeholder Card -->
            <div class="bg-muted/10 border-2 border-dashed border-border/30 rounded-2xl flex flex-col items-center justify-center p-12 text-center opacity-40 hover:opacity-100 transition-opacity">
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
           <div class="w-16 h-16 rounded-2xl bg-muted/40 flex items-center justify-center mb-6 shadow-inner ring-1 ring-border/50">
             <Search :size="24" class="opacity-20" />
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
