<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import { 
  ShieldCheck, 
  ArrowLeft, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  FileWarning,
  FileCheck,
  Info
} from 'lucide-vue-next';
import FileUploader from '../components/shared/FileUploader.vue';
import Papa from 'papaparse';

interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  row?: number;
  column?: string;
}

const file = shallowRef<File | null>(null);
const results = ref<ValidationIssue[]>([]);
const stats = ref({
  rows: 0,
  cols: 0,
  delimiter: '',
  encoding: 'UTF-8'
});
const loading = ref(false);

const validateFile = (f: File) => {
  file.value = f;
  loading.value = true;
  results.value = [];
  
  Papa.parse(f, {
    header: true,
    skipEmptyLines: 'greedy',
    complete: (res) => {
      stats.value.rows = res.data.length;
      stats.value.cols = res.meta.fields?.length || 0;
      stats.value.delimiter = res.meta.delimiter;

      // Check for parsing errors
      res.errors.forEach(err => {
        results.value.push({
          type: err.code === 'UndetectableDelimiter' ? 'error' : 'warning',
          message: `${err.message}`,
          row: err.row !== undefined ? err.row + 1 : undefined
        });
      });

      // Check for empty headers
      if (res.meta.fields) {
        res.meta.fields.forEach((h, i) => {
          if (!h || h.trim() === '') {
            results.value.push({
              type: 'warning',
              message: `Header at index ${i} is empty.`,
              column: `Index ${i}`
            });
          }
        });
      }

      // Check for row length consistency
      const expectedCols = res.meta.fields?.length || 0;
      let inconsistentRows = 0;
      (res.data as any[]).forEach((row, idx) => {
        const rowCols = Object.keys(row).length;
        if (rowCols !== expectedCols) {
          inconsistentRows++;
          if (inconsistentRows <= 10) { // Limit detailed logs
             results.value.push({
               type: 'error',
               message: `Inconsistent column count. Expected ${expectedCols}, found ${rowCols}.`,
               row: idx + 1
             });
          }
        }
      });

      if (inconsistentRows > 10) {
        results.value.push({
          type: 'error',
          message: `${inconsistentRows} more rows have inconsistent column counts.`
        });
      }

      loading.value = false;
    },
    error: (err) => {
      results.value.push({ type: 'error', message: `Fatal Error: ${err.message}` });
      loading.value = false;
    }
  });
};

const reset = () => {
  file.value = null;
  results.value = [];
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
          <div class="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center ring-1 ring-emerald-500/20">
            <ShieldCheck :size="20" stroke-width="2.5" />
          </div>
          <div>
            <h2 class="text-xl md:text-2xl font-black tracking-tight text-foreground">
              Data <span class="text-emerald-500">Validator</span>
            </h2>
          </div>
        </div>
      </div>

      <div v-if="file" class="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-700">
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
               <h3 class="text-3xl font-black tracking-tight">Audit your data.</h3>
               <p class="text-muted-foreground text-xs font-medium max-w-sm mx-auto leading-relaxed opacity-60">
                 Detect structural issues, inconsistent rows, and encoding errors before processing.
               </p>
            </div>
            <FileUploader @files-selected="(fs) => validateFile(fs[0])" class="w-full max-w-2xl" />
        </div>

        <div v-else class="h-full flex flex-col lg:flex-row gap-6 animate-in fade-in duration-700 overflow-hidden">
           <!-- Left Sidebar: Global Health -->
           <div class="w-full lg:w-80 flex flex-col gap-5 shrink-0 h-full overflow-hidden">
              <div class="flex-1 bg-card border border-border/50 rounded-[2rem] p-7 shadow-2xl flex flex-col overflow-hidden">
                 <h3 class="font-black text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2 mb-6">
                    <CheckCircle2 :size="12" class="text-emerald-500" /> Matrix Health
                 </h3>

                 <div class="space-y-6 flex-1 overflow-y-auto pr-1 scrollbar-none">
                    <div class="p-5 bg-muted/20 border border-border/50 rounded-2xl relative overflow-hidden group">
                       <span class="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">Global Status</span>
                       <div class="flex items-center gap-3 mt-1">
                          <FileCheck v-if="results.filter(r => r.type === 'error').length === 0" class="text-emerald-500" :size="24" />
                          <FileWarning v-else class="text-rose-500" :size="24" />
                          <div class="text-lg font-black tracking-tight">
                            {{ results.filter(r => r.type === 'error').length === 0 ? 'Healthy' : 'Malformed' }}
                          </div>
                       </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                       <div class="space-y-1">
                          <span class="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">Rows</span>
                          <div class="text-xl font-black">{{ stats.rows.toLocaleString() }}</div>
                       </div>
                       <div class="space-y-1">
                          <span class="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">Cols</span>
                          <div class="text-xl font-black">{{ stats.cols }}</div>
                       </div>
                    </div>

                    <div class="flex items-center gap-3 p-4 bg-muted/20 rounded-2xl">
                       <Search :size="14" class="text-muted-foreground" />
                       <div class="flex-1">
                         <div class="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">Delimiter</div>
                         <div class="text-xs font-bold font-mono">"{{ stats.delimiter === '\t' ? '\\t' : stats.delimiter }}"</div>
                       </div>
                    </div>

                    <div class="pt-4 border-t border-border/50 space-y-4">
                       <div class="flex justify-between items-center text-[10px] font-bold">
                          <span class="text-muted-foreground">Errors</span>
                          <span class="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500">{{ results.filter(r => r.type === 'error').length }}</span>
                       </div>
                       <div class="flex justify-between items-center text-[10px] font-bold">
                          <span class="text-muted-foreground">Warnings</span>
                          <span class="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500">{{ results.filter(r => r.type === 'warning').length }}</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <!-- Issue List -->
           <div class="flex-1 min-w-0 bg-card border border-border/50 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
              <div class="p-6 border-b border-border/50 flex items-center justify-between">
                 <h3 class="font-black text-sm tracking-tight uppercase tracking-widest text-[10px] opacity-60">Findings & Anomalies</h3>
                 <div v-if="results.length === 0" class="flex items-center gap-2 text-emerald-500 text-[9px] font-black tracking-widest uppercase">
                    <CheckCircle2 :size="14" /> Logic Validated
                 </div>
              </div>

              <div class="flex-1 overflow-auto p-2">
                 <div v-if="results.length === 0" class="h-full flex flex-col items-center justify-center opacity-30">
                    <CheckCircle2 :size="64" class="text-emerald-500 mb-4" />
                    <p class="font-black text-sm uppercase tracking-widest">No issues detected</p>
                 </div>
                 
                 <div v-else class="space-y-2 p-4">
                    <div 
                      v-for="(issue, idx) in results" 
                      :key="idx"
                      class="flex items-start gap-4 p-4 rounded-2xl border transition-all"
                      :class="{
                        'bg-rose-500/[0.03] border-rose-500/20': issue.type === 'error',
                        'bg-amber-500/[0.03] border-amber-500/20': issue.type === 'warning',
                        'bg-blue-500/[0.03] border-blue-500/20': issue.type === 'info'
                      }"
                    >
                       <div class="mt-1">
                          <AlertTriangle v-if="issue.type === 'error'" class="text-rose-500" :size="16" />
                          <AlertTriangle v-else-if="issue.type === 'warning'" class="text-amber-500" :size="16" />
                          <Info v-else class="text-blue-500" :size="16" />
                       </div>
                       <div class="flex-1">
                          <div class="text-xs font-bold text-foreground/90">{{ issue.message }}</div>
                          <div class="flex gap-4 mt-2">
                             <div v-if="issue.row" class="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Row {{ issue.row }}</div>
                             <div v-if="issue.column" class="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Column {{ issue.column }}</div>
                          </div>
                       </div>
                    </div>
                 </div>
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
</style>
