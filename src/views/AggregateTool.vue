<script setup lang="ts">
import { ref, computed, shallowRef } from 'vue';
import { 
  Sigma, 
  ArrowLeft, 
  X, 
  Download, 
  Loader2, 
  Calculator,
  Plus,
  Table as TableIcon
} from 'lucide-vue-next';
import FileUploader from '../components/shared/FileUploader.vue';
import DataTable from '../components/shared/DataTable.vue';
import { parseFile } from '../utils/fileParser';
import Papa from 'papaparse';

interface AggregateRule {
  id: string;
  column: string;
  method: 'sum' | 'count' | 'avg' | 'min' | 'max';
}

const file = shallowRef<File | null>(null);
const rawData = ref<any[]>([]);
const headers = ref<string[]>([]);
const loading = ref(false);
const processing = ref(false);

const groupByCols = ref<string[]>([]);
const aggregateRules = ref<AggregateRule[]>([]);

const handleFile = async (selectedFile: File) => {
  file.value = selectedFile;
  loading.value = true;
  try {
    const res = await parseFile(selectedFile);
    rawData.value = res.data;
    headers.value = res.headers;
    if (res.headers.length > 0) {
      groupByCols.value = [res.headers[0] || ''];
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const addRule = () => {
  if (headers.value.length === 0) return;
  aggregateRules.value.push({
    id: Math.random().toString(36).substr(2, 9),
    column: headers.value[0] || '',
    method: 'count'
  });
};

const removeRule = (id: string) => {
  aggregateRules.value = aggregateRules.value.filter(r => r.id !== id);
};

const processedData = computed(() => {
  if (rawData.value.length === 0 || groupByCols.value.length === 0) return [];

  const groups: Record<string, any[]> = {};
  
  rawData.value.forEach(row => {
    const key = groupByCols.value.map(c => String(row[c] || '')).join(':::');
    if (!groups[key]) groups[key] = [];
    groups[key].push(row);
  });

  return Object.entries(groups).map(([key, rows]) => {
    const result: any = {};
    const keys = key.split(':::');
    groupByCols.value.forEach((col, idx) => {
      result[col] = keys[idx];
    });

    aggregateRules.value.forEach(rule => {
      const col = rule.column;
      const vals = rows.map(r => parseFloat(r[col])).filter(v => !isNaN(v));
      
      const label = `${rule.method}(${col})`;
      
      switch (rule.method) {
        case 'count':
          result[label] = rows.length;
          break;
        case 'sum':
          result[label] = vals.reduce((a, b) => a + b, 0);
          break;
        case 'avg':
          result[label] = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
          break;
        case 'min':
          result[label] = vals.length > 0 ? Math.min(...vals) : 0;
          break;
        case 'max':
          result[label] = vals.length > 0 ? Math.max(...vals) : 0;
          break;
      }
    });

    return result;
  });
});

const processedHeaders = computed(() => {
  if (processedData.value.length === 0) return [];
  return Object.keys(processedData.value[0]);
});

const download = () => {
  processing.value = true;
  setTimeout(() => {
    const csv = Papa.unparse(processedData.value);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `aggregated_data_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    processing.value = false;
  }, 100);
};

const reset = () => {
  file.value = null;
  rawData.value = [];
  aggregateRules.value = [];
};
</script>

<template>
  <div class="w-full h-[calc(100vh-6rem)] flex flex-col p-2 md:p-4">
    <!-- Header Section -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 shrink-0 relative z-20">
      <div class="flex items-center gap-4">
        <router-link to="/" class="p-2.5 bg-card border border-border/50 rounded-xl text-muted-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm group">
          <ArrowLeft :size="18" class="group-hover:-translate-x-0.5 transition-transform" />
        </router-link>
        
        <div class="h-10 w-px bg-border/30 hidden lg:block"></div>

        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center ring-1 ring-blue-500/20">
            <Sigma :size="20" stroke-width="2.5" />
          </div>
          <div>
            <h2 class="text-xl md:text-2xl font-black tracking-tight text-foreground">
              Group & <span class="text-blue-500">Aggregate</span>
            </h2>
          </div>
        </div>
      </div>

      <div v-if="file" class="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-700">
        <button 
          @click="download" 
          :disabled="processing || processedData.length === 0"
          class="flex items-center gap-2.5 px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:shadow-lg transition-all active:scale-95 group"
        >
          <Loader2 v-if="processing" class="animate-spin" :size="16" />
          <Download v-else :size="16" class="group-hover:translate-y-0.5 transition-transform" />
          <span>Export Summary</span>
        </button>
        <button 
          @click="reset" 
          class="p-3 bg-card hover:bg-muted text-foreground border border-border/50 rounded-xl transition-all duration-300 active:scale-95 group"
        >
          <X :size="18" class="group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="flex-1 min-h-0 flex flex-col relative overflow-hidden">
        <div v-if="!file" class="h-full flex flex-col items-center justify-center py-4 w-full">
            <div class="text-center space-y-2 mb-6">
               <h3 class="text-3xl font-black tracking-tight">Data Summarizer.</h3>
               <p class="text-muted-foreground text-xs font-medium max-w-sm mx-auto leading-relaxed opacity-60">
                 Compute sums, averages, and counts grouped by specific dimensions.
               </p>
            </div>
            <FileUploader @files-selected="(fs) => handleFile(fs[0])" class="w-full max-w-2xl" />
        </div>

        <div v-else class="h-full flex flex-col lg:flex-row gap-6 animate-in fade-in duration-700 overflow-hidden">
           <!-- Config Sidebar -->
           <div class="w-full lg:w-80 flex flex-col gap-5 shrink-0 h-full overflow-hidden">
              <div class="flex-1 bg-card border border-border/50 rounded-[2rem] p-7 shadow-2xl flex flex-col overflow-hidden">
                 <h3 class="font-black text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2 mb-6">
                    <Calculator :size="12" class="text-blue-500" /> Grouping Logic
                 </h3>

                 <div class="space-y-6 flex-1 overflow-y-auto scrollbar-none">
                    <div class="space-y-3">
                       <label class="text-[9px] font-black uppercase text-muted-foreground/40 tracking-widest">Group By Column(s)</label>
                       <div class="max-h-[160px] overflow-auto border border-border/50 rounded-xl p-2 bg-muted/10 space-y-1">
                          <label v-for="h in headers" :key="h" class="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg cursor-pointer transition-all">
                             <input type="checkbox" v-model="groupByCols" :value="h" class="rounded border-border text-blue-600 focus:ring-blue-500" />
                             <span class="text-xs font-bold truncate">{{ h }}</span>
                          </label>
                       </div>
                    </div>

                    <div class="pt-6 border-t border-border/50 space-y-4">
                       <div class="flex items-center justify-between">
                          <label class="text-[9px] font-black uppercase text-muted-foreground/40 tracking-widest">Aggregations</label>
                          <button @click="addRule" class="p-1 px-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all active:scale-90">
                             <Plus :size="12" stroke-width="3" />
                          </button>
                       </div>

                       <TransitionGroup name="list" tag="div" class="space-y-3">
                          <div v-for="rule in aggregateRules" :key="rule.id" class="p-4 bg-muted/20 border border-border/50 rounded-2xl relative group">
                             <button @click="removeRule(rule.id)" class="absolute -right-2 -top-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                <X :size="10" stroke-width="3" />
                             </button>
                             
                             <div class="grid grid-cols-1 gap-2">
                                <select v-model="rule.column" class="w-full bg-background border border-border/50 rounded-xl px-3 py-1.5 text-xs font-bold outline-none">
                                   <option v-for="h in headers" :key="h" :value="h">{{ h }}</option>
                                </select>
                                <select v-model="rule.method" class="w-full bg-background border border-border/50 rounded-xl px-3 py-1.5 text-xs font-bold outline-none text-blue-600">
                                   <option value="count">COUNT</option>
                                   <option value="sum">SUM</option>
                                   <option value="avg">AVERAGE</option>
                                   <option value="min">MINIMUM</option>
                                   <option value="max">MAXIMUM</option>
                                </select>
                             </div>
                          </div>
                       </TransitionGroup>

                       <div v-if="aggregateRules.length === 0" class="py-12 flex flex-col items-center justify-center opacity-20 text-center">
                          <Sigma :size="32" class="mb-2" />
                          <p class="text-[10px] font-black uppercase tracking-widest leading-relaxed">Add a rule to see results</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <!-- Preview Area -->
           <div class="flex-1 min-w-0 bg-card border border-border/50 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col p-1.5 relative">
              <DataTable 
                v-if="processedData.length > 0"
                :headers="processedHeaders"
                :data="processedData"
              />
              <div v-else class="h-full flex flex-col items-center justify-center opacity-30">
                 <TableIcon :size="64" class="mb-4" />
                 <p class="font-black text-sm uppercase tracking-widest">Awaiting logic</p>
              </div>
           </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.list-enter-active, .list-leave-active { transition: all 0.4s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateX(-10px); }
</style>
