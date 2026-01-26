<script setup lang="ts">
import { ref, computed, shallowRef } from 'vue';
import { 
  ArrowRightLeft, 
  ArrowLeft, 
  X, 
  Download, 
  Loader2
} from 'lucide-vue-next';
import FileUploader from '../components/shared/FileUploader.vue';
import DataTable from '../components/shared/DataTable.vue';
import { parseFile } from '../utils/fileParser';
import Papa from 'papaparse';

const file = shallowRef<File | null>(null);
const rawData = ref<any[]>([]);
const headers = ref<string[]>([]);
const loading = ref(false);
const processing = ref(false);

const mode = ref<'pivot' | 'unpivot'>('unpivot');

// Unpivot state (Wide to Long)
const unpivotFixedCols = ref<string[]>([]);
const unpivotValueName = ref('Value');
const unpivotKeyName = ref('Attribute');

// Pivot state (Long to Wide)
const pivotGroupCol = ref('');
const pivotHeaderCol = ref('');
const pivotValueCol = ref('');

const handleFile = async (selectedFile: File) => {
  file.value = selectedFile;
  loading.value = true;
  try {
    const res = await parseFile(selectedFile);
    rawData.value = res.data;
    headers.value = res.headers;
    if (res.headers.length > 0) {
      unpivotFixedCols.value = [res.headers[0] || ''];
      pivotGroupCol.value = res.headers[0] || '';
      if (res.headers.length > 2) {
        pivotHeaderCol.value = res.headers[1] || '';
        pivotValueCol.value = res.headers[2] || '';
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const transformedData = computed(() => {
  if (rawData.value.length === 0) return [];

  if (mode.value === 'unpivot') {
    const result: any[] = [];
    const attributeCols = headers.value.filter(h => !unpivotFixedCols.value.includes(h));
    
    rawData.value.forEach(row => {
      attributeCols.forEach(col => {
        const newRow: any = {};
        unpivotFixedCols.value.forEach(f => newRow[f] = row[f]);
        newRow[unpivotKeyName.value] = col;
        newRow[unpivotValueName.value] = row[col];
        result.push(newRow);
      });
    });
    return result;
  } else {
    // Pivot: Group by pivotGroupCol, use pivotHeaderCol values as new headers
    const groups: Record<string, any> = {};
    const newHeaders = new Set<string>();

    rawData.value.forEach(row => {
      const gKey = row[pivotGroupCol.value];
      const hKey = row[pivotHeaderCol.value];
      const val = row[pivotValueCol.value];

      if (!groups[gKey]) {
        groups[gKey] = { [pivotGroupCol.value]: gKey };
      }
      groups[gKey][hKey] = val;
      newHeaders.add(hKey);
    });

    return Object.values(groups);
  }
});

const transformedHeaders = computed(() => {
  if (transformedData.value.length === 0) return [];
  return Object.keys(transformedData.value[0]);
});

const download = () => {
  processing.value = true;
  setTimeout(() => {
    const csv = Papa.unparse(transformedData.value);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reshaped_data_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    processing.value = false;
  }, 100);
};

const reset = () => {
  file.value = null;
  rawData.value = [];
  headers.value = [];
};
</script>

<template>
  <div class="w-full h-screen-minus-header flex flex-col p-2 md:p-4">
    <!-- Header Section -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 shrink-0 relative z-20">
      <div class="flex items-center gap-4">
        <router-link to="/" class="p-2.5 bg-card border border-border/50 rounded-xl text-muted-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm group">
          <ArrowLeft :size="18" class="group-hover:-translate-x-0.5 transition-transform" />
        </router-link>
        
        <div class="h-10 w-px bg-border/30 hidden lg:block"></div>

        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-violet-500/10 text-violet-500 rounded-xl flex items-center justify-center ring-1 ring-violet-500/20">
            <ArrowRightLeft :size="20" stroke-width="2.5" />
          </div>
          <div>
            <h2 class="text-xl md:text-2xl font-black tracking-tight text-foreground">
              Reshape <span class="text-violet-500">Workspace</span>
            </h2>
          </div>
        </div>
      </div>

      <div v-if="file" class="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-700">
        <button 
          @click="download" 
          :disabled="processing"
          class="flex items-center gap-2.5 px-6 py-3 bg-violet-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:shadow-lg transition-all active:scale-95 group"
        >
          <Loader2 v-if="processing" class="animate-spin" :size="16" />
          <Download v-else :size="16" class="group-hover:translate-y-0.5 transition-transform" />
          <span>Export Result</span>
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
               <h3 class="text-3xl font-black tracking-tight">Pivot & Unpivot.</h3>
               <p class="text-muted-foreground text-xs font-medium max-w-sm mx-auto leading-relaxed opacity-60">
                 Switch between wide and long formats instantly. Perfect for normalization.
               </p>
            </div>
            <FileUploader @files-selected="(fs) => handleFile(fs[0])" class="w-full max-w-2xl" />
        </div>

        <div v-else class="h-full flex flex-col lg:flex-row gap-6 animate-in fade-in duration-700 overflow-hidden">
           <!-- Config Sidebar -->
           <div class="w-full lg:w-80 flex flex-col gap-5 shrink-0 h-full overflow-hidden">
              <div class="flex-1 bg-card border border-border/50 rounded-[2rem] p-7 shadow-2xl flex flex-col overflow-hidden">
                 <div class="flex items-center gap-3 p-1 bg-muted/50 rounded-2xl border border-border/10 mb-6">
                    <button 
                      @click="mode = 'unpivot'"
                      class="flex-1 text-[9px] font-black uppercase tracking-widest py-2 rounded-xl transition-all"
                      :class="mode === 'unpivot' ? 'bg-violet-600 text-white shadow-md' : 'text-muted-foreground hover:bg-muted'"
                    >Unpivot</button>
                    <button 
                      @click="mode = 'pivot'"
                      class="flex-1 text-[9px] font-black uppercase tracking-widest py-2 rounded-xl transition-all"
                      :class="mode === 'pivot' ? 'bg-violet-600 text-white shadow-md' : 'text-muted-foreground hover:bg-muted'"
                    >Pivot</button>
                 </div>

                 <div class="space-y-6 flex-1 overflow-y-auto scrollbar-none">
                    <div v-if="mode === 'unpivot'" class="space-y-4">
                       <h4 class="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Fixed Columns</h4>
                       <div class="space-y-2 max-h-[160px] overflow-auto border border-border/50 rounded-xl p-2 bg-muted/10">
                          <label v-for="h in headers" :key="h" class="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg cursor-pointer group transition-all">
                             <input type="checkbox" v-model="unpivotFixedCols" :value="h" class="rounded border-border text-violet-600 focus:ring-violet-500" />
                             <span class="text-xs font-bold truncate">{{ h }}</span>
                          </label>
                       </div>
                       
                       <div class="space-y-4 pt-4 border-t border-border/50">
                          <div class="space-y-1.5">
                             <label class="text-[9px] font-black uppercase text-muted-foreground/40">Key Column Name</label>
                             <input v-model="unpivotKeyName" type="text" class="w-full bg-muted/20 border border-border/50 rounded-xl px-4 py-2 text-xs font-bold" />
                          </div>
                          <div class="space-y-1.5">
                             <label class="text-[9px] font-black uppercase text-muted-foreground/40">Value Column Name</label>
                             <input v-model="unpivotValueName" type="text" class="w-full bg-muted/20 border border-border/50 rounded-xl px-4 py-2 text-xs font-bold" />
                          </div>
                       </div>
                    </div>

                    <div v-else class="space-y-6">
                        <div class="space-y-2">
                           <label class="text-[9px] font-black uppercase text-muted-foreground/40 tracking-widest">Group By</label>
                           <select v-model="pivotGroupCol" class="w-full bg-muted/20 border border-border/50 rounded-xl px-4 py-2.5 text-xs font-bold outline-none">
                              <option v-for="h in headers" :key="h" :value="h">{{ h }}</option>
                           </select>
                        </div>
                        <div class="space-y-2">
                           <label class="text-[9px] font-black uppercase text-muted-foreground/40 tracking-widest">New Headers From</label>
                           <select v-model="pivotHeaderCol" class="w-full bg-muted/20 border border-border/50 rounded-xl px-4 py-2.5 text-xs font-bold outline-none">
                              <option v-for="h in headers" :key="h" :value="h">{{ h }}</option>
                           </select>
                        </div>
                        <div class="space-y-2">
                           <label class="text-[9px] font-black uppercase text-muted-foreground/40 tracking-widest">Values From</label>
                           <select v-model="pivotValueCol" class="w-full bg-muted/20 border border-border/50 rounded-xl px-4 py-2.5 text-xs font-bold outline-none">
                              <option v-for="h in headers" :key="h" :value="h">{{ h }}</option>
                           </select>
                        </div>
                    </div>
                 </div>

                 <div class="mt-auto pt-6 border-t border-border/50">
                    <div class="flex items-center justify-between text-[10px] font-bold text-muted-foreground/60">
                       <span>Result Density</span>
                       <span>{{ transformedData.length.toLocaleString() }} Rows</span>
                    </div>
                 </div>
              </div>
           </div>

           <!-- Preview Area -->
           <div class="flex-1 min-w-0 bg-card border border-border/50 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col p-1.5">
              <DataTable 
                :headers="transformedHeaders"
                :data="transformedData"
              />
           </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
</style>
