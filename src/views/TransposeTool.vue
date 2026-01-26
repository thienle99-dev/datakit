<script setup lang="ts">
import { ref } from 'vue';
import { 
  ArrowRightLeft, 
  Download, 
  X, 
  Loader2, 
  ArrowLeft,
  LayoutGrid,
  Zap,
  CheckCircle2,
  Info
} from 'lucide-vue-next';
import Papa from 'papaparse';
import FileUploader from '../components/shared/FileUploader.vue';
import DataTable from '../components/shared/DataTable.vue';
import { parseFile } from '../utils/fileParser';

const file = ref<File | null>(null);
const rawData = ref<any[]>([]);
const rawHeaders = ref<string[]>([]);
const transposedData = ref<any[]>([]);
const transposedHeaders = ref<string[]>([]);

const loading = ref(false);
const processing = ref(false);
const error = ref<string | null>(null);

async function handleFile(selectedFile: File) {
  file.value = selectedFile;
  loading.value = true;
  error.value = null;
  resetData();

  try {
    const result = await parseFile(selectedFile);
    rawHeaders.value = result.headers;
    rawData.value = result.data;
    performTranspose();
  } catch (err: any) {
    error.value = 'Failed to parse file: ' + err.message;
  } finally {
    loading.value = false;
  }
}

function performTranspose() {
  if (rawData.value.length === 0) return;
  processing.value = true;
  
  setTimeout(() => {
    try {
      // Logic Transpose: Row -> Column
      // Dòng 1 của file cũ sẽ chứa các Header mới.
      // Cột 1 của file cũ sẽ trở thành Header của file mới? 
      // Thường transpose là: Hàng thành Cột.
      
      const newHeaders = ['Metric', ...rawData.value.map((_, i) => `Row ${i + 1}`)];
      const newData: any[] = [];

      rawHeaders.value.forEach(h => {
        const newRow: any = { Metric: h };
        rawData.value.forEach((row, rowIndex) => {
          newRow[`Row ${rowIndex + 1}`] = row[h];
        });
        newData.push(newRow);
      });

      transposedHeaders.value = newHeaders;
      transposedData.value = newData;
    } catch (err: any) {
      error.value = 'Transpose failed: ' + err.message;
    } finally {
      processing.value = false;
    }
  }, 100);
}

function downloadTransposed() {
  const csv = Papa.unparse({
    fields: transposedHeaders.value,
    data: transposedData.value
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${file.value?.name.split('.')[0]}_transposed.csv`);
  link.click();
}

function resetData() {
  transposedData.value = [];
  transposedHeaders.value = [];
  rawData.value = [];
  rawHeaders.value = [];
}

function closeTool() {
  file.value = null;
  resetData();
  error.value = null;
}
</script>

<template>
  <div class="w-full h-[calc(100vh-6rem)] flex flex-col p-2 md:p-4">
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
              Data <span class="text-violet-500">Transpose</span>
            </h2>
          </div>
        </div>
      </div>

      <div v-if="transposedData.length > 0" class="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-700">
        <button 
          @click="downloadTransposed" 
          class="flex items-center gap-2.5 px-6 py-3 bg-violet-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:shadow-lg hover:shadow-violet-500/20 transition-all active:scale-95 group"
        >
          <Download :size="16" class="group-hover:translate-y-0.5 transition-transform" />
          <span>Export Axes</span>
        </button>

        <button 
          @click="closeTool" 
          class="p-3 bg-card hover:bg-muted text-foreground border border-border/50 rounded-xl transition-all duration-300 active:scale-95 group"
        >
          <X :size="18" class="group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </div>
    </div>

    <div class="flex-1 min-h-0 flex flex-col relative overflow-hidden">
      <div v-if="loading" class="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-card rounded-[2rem]">
        <Loader2 class="animate-spin text-violet-500" :size="48" stroke-width="3" />
        <h4 class="text-xl font-black tracking-tight uppercase">Inverting Matrix...</h4>
      </div>

      <div v-else-if="!file" class="h-full flex flex-col items-center justify-center py-4 w-full">
          <div class="text-center space-y-2 mb-6">
             <h3 class="text-3xl font-black tracking-tight">Shift your perspective.</h3>
             <p class="text-muted-foreground text-xs font-medium max-w-sm mx-auto leading-relaxed opacity-60">
               Swap rows and columns instantly. Perfect for unpivoting data.
             </p>
          </div>
          <FileUploader @files-selected="handleFile" class="w-full max-w-2xl" />
      </div>

      <div v-else class="h-full flex flex-col lg:flex-row gap-6 animate-in fade-in duration-700 overflow-hidden">
        <div class="w-full lg:w-80 flex flex-col gap-5 shrink-0 h-full overflow-hidden">
          <div class="flex-1 bg-card border border-border/50 rounded-[2rem] p-7 shadow-2xl flex flex-col overflow-hidden">
            <h3 class="font-black text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2 mb-6">
               <LayoutGrid :size="12" class="text-violet-500" />
               Matrix Stats
            </h3>

            <div class="space-y-6 flex-1 overflow-y-auto pr-1 scrollbar-none">
              <div class="p-5 bg-muted/20 border border-border/50 rounded-2xl space-y-4">
                 <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                       <span class="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">Original</span>
                       <div class="text-base font-black truncate">{{ rawHeaders.length }}x{{ rawData.length }}</div>
                    </div>
                    <div class="space-y-1 border-l border-border/50 pl-4">
                       <span class="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">Target</span>
                       <div class="text-base font-black text-violet-500">{{ transposedHeaders.length }}x{{ transposedData.length }}</div>
                    </div>
                 </div>
              </div>

              <div class="space-y-4">
                 <div class="flex items-center gap-3 p-4 bg-violet-500/5 rounded-2xl border border-violet-500/10">
                    <Zap :size="14" class="text-violet-500" />
                    <span class="text-[10px] font-bold text-violet-500 uppercase tracking-widest leading-relaxed">Quantized Matrix Transformation active.</span>
                 </div>
                 <div class="flex items-center gap-3 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                    <CheckCircle2 :size="14" class="text-emerald-500" />
                    <span class="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-relaxed">Row-to-Column Hash alignment complete.</span>
                 </div>
              </div>

              <div class="pt-6 border-t border-border/50">
                 <div class="flex items-start gap-3 opacity-40">
                    <Info :size="14" class="shrink-0 mt-0.5 text-muted-foreground" />
                    <p class="text-[9px] font-bold uppercase tracking-widest leading-relaxed">Large datasets may experience slight latency during inversion due to in-memory buffering.</p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex-1 min-w-0 bg-card border border-border/50 rounded-[2rem] shadow-2xl overflow-hidden p-1.5">
           <DataTable 
             v-if="transposedData.length > 0"
             :headers="transposedHeaders" 
             :data="transposedData" 
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
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
