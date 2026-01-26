<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  Files, 
  X, 
  Download, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Grip,
  Layers,
  ArrowLeft,
  ChevronRight,
  Database,
  Info
} from 'lucide-vue-next';
import Papa from 'papaparse';
import FileUploader from '../components/shared/FileUploader.vue';
import { parseFile } from '../utils/fileParser';

interface MergedFile {
  id: string;
  name: string;
  size: number;
  data: any[];
  headers: string[];
}

const files = ref<MergedFile[]>([]);
const processing = ref(false);
const error = ref<string | null>(null);
const success = ref(false);

const handleFilesSelected = async (fileList: File[]) => {
  error.value = null;
  success.value = false;
  
  for (const file of fileList) {
    try {
      const result = await parseFile(file);
      files.value.push({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        data: result.data,
        headers: result.headers
      });
    } catch (err: any) {
      error.value = `Error parsing ${file.name}: ${err.message}`;
    }
  }
};

const removeFile = (id: string) => {
  files.value = files.value.filter(f => f.id !== id);
};

const mergeFiles = async () => {
  if (files.value.length < 2) {
     error.value = "Please upload at least two files to merge.";
     return;
  }

  processing.value = true;
  error.value = null;

  try {
    const allHeaders = new Set<string>();
    files.value.forEach(f => f.headers.forEach(h => allHeaders.add(h)));
    const finalHeaders = Array.from(allHeaders);
    const combinedData = files.value.flatMap(f => f.data);

    const csv = Papa.unparse({
      fields: finalHeaders,
      data: combinedData
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `merged_data_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    success.value = true;
  } catch (err: any) {
    error.value = `Merge failed: ${err.message}`;
  } finally {
    processing.value = false;
  }
};

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const totalRowsInQueue = computed(() => {
    return files.value.reduce((acc, f) => acc + f.data.length, 0);
});

const uniqueHeadersCount = computed(() => {
    const allHeaders = new Set<string>();
    files.value.forEach(f => f.headers.forEach(h => allHeaders.add(h)));
    return allHeaders.size;
});
</script>

<template>
  <div class="w-full h-[calc(100vh-6rem)] flex flex-col p-2 md:p-4">
    <!-- Premium Header Section -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 shrink-0 relative z-20">
      <div class="flex items-center gap-4">
        <router-link to="/" class="p-2.5 bg-card border border-border/50 rounded-xl text-muted-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm group">
          <ArrowLeft :size="18" class="group-hover:-translate-x-0.5 transition-transform" />
        </router-link>
        
        <div class="h-10 w-px bg-border/30 hidden lg:block"></div>

        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center ring-1 ring-indigo-500/20">
            <Layers :size="20" stroke-width="2.5" />
          </div>
          <div>
            <h2 class="text-xl md:text-2xl font-black tracking-tight text-foreground">
              Merge <span class="text-indigo-500">Datasets</span>
            </h2>
          </div>
        </div>
      </div>

      <div v-if="files.length >= 2" class="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-700">
        <button 
          @click="mergeFiles"
          :disabled="processing"
          class="flex items-center gap-2.5 px-6 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95 group"
        >
          <Loader2 v-if="processing" class="animate-spin text-white" :size="16" />
          <Download v-else :size="16" class="group-hover:translate-y-0.5 transition-transform" />
          <span>Export Merge</span>
        </button>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="flex-1 min-h-0 flex flex-col relative overflow-hidden">
      <!-- Success/Error Notifications -->
      <transition name="slide-up">
        <div v-if="error" class="absolute top-0 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md p-5 bg-rose-500 text-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(244,63,94,0.4)] flex items-center justify-between gap-6">
          <div class="flex items-center gap-4">
             <div class="bg-white/20 p-2 rounded-xl">
               <AlertCircle :size="20" />
             </div>
             <p class="text-sm font-bold tracking-tight">{{ error }}</p>
          </div>
          <button @click="error = null" class="p-2 hover:bg-white/20 rounded-xl transition-colors"><X :size="18" /></button>
        </div>
      </transition>
      
      <transition name="slide-up">
        <div v-if="success" class="absolute top-0 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md p-5 bg-indigo-500 text-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(79,70,229,0.4)] flex items-center justify-between gap-6">
          <div class="flex items-center gap-4">
             <div class="bg-white/20 p-2 rounded-xl">
               <CheckCircle2 :size="20" />
             </div>
             <p class="text-sm font-bold tracking-tight">Merge complete. Synthesis successful.</p>
          </div>
          <button @click="success = false" class="p-2 hover:bg-white/20 rounded-xl transition-colors"><X :size="18" /></button>
        </div>
      </transition>

      <div class="h-full grid grid-cols-1 lg:grid-cols-12 gap-10 overflow-hidden">
        <!-- Left: Orchestration Queue -->
        <div class="lg:col-span-8 flex flex-col gap-6 overflow-hidden">
          <div v-if="files.length === 0" class="flex-1 flex flex-col items-center justify-center py-4 w-full">
            <div class="text-center space-y-2 mb-6">
               <h3 class="text-3xl font-black tracking-tight">Merge your logic.</h3>
               <p class="text-muted-foreground text-xs font-medium max-w-sm mx-auto leading-relaxed opacity-60">
                 Synthesize multiple files. We'll handle column alignment and resolution.
               </p>
            </div>
            <FileUploader :multiple="true" @files-selected="handleFilesSelected" class="w-full max-w-2xl" />
          </div>

          <div v-else class="flex-1 bg-card border border-border/50 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in duration-700">
            <div class="p-8 border-b border-border/50 bg-muted/20 flex items-center justify-between shrink-0">
               <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 ring-1 ring-indigo-500/20">
                     <Files :size="24" />
                  </div>
                  <div>
                    <h3 class="font-black text-lg tracking-tight uppercase tracking-widest text-xs opacity-60">Synthesis Queue</h3>
                    <p class="text-sm font-bold">{{ files.length }} Files identified</p>
                  </div>
               </div>
               <button 
                 @click="files = []"
                 class="px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-xl transition-all font-black uppercase tracking-widest text-[9px]"
               >
                 Flush Queue
               </button>
            </div>

            <div class="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
              <div 
                v-for="(f, index) in files" 
                :key="f.id"
                class="bg-card border border-border/80 p-8 rounded-[2.5rem] flex items-center gap-8 group hover:border-indigo-500/50 transition-all duration-500 hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.12)] relative overflow-hidden"
              >
                <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div class="cursor-grab text-muted-foreground/10 group-hover:text-indigo-500/30 transition-colors shrink-0">
                  <Grip :size="20" />
                </div>
                
                <div class="w-16 h-16 rounded-[1.5rem] bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-indigo-500/10 group-hover:text-indigo-500 transition-all duration-500 group-hover:scale-110 shadow-inner shrink-0">
                   <Database :size="28" stroke-width="2" />
                </div>

                <div class="flex-1 min-w-0 relative z-10">
                  <div class="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] mb-2 flex items-center gap-3">
                     Source {{ (index + 1).toString().padStart(2, '0') }} <ChevronRight :size="10" /> {{ f.headers.length }} Dimensions
                  </div>
                  <div class="font-black text-xl tracking-tight truncate">{{ f.name }}</div>
                  <div class="flex items-center gap-5 mt-3">
                     <div class="flex items-center gap-2 px-3 py-1 bg-muted rounded-xl text-[10px] font-black text-muted-foreground uppercase tracking-widest">{{ formatSize(f.size) }}</div>
                     <div class="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-xl text-[10px] font-black text-emerald-600 uppercase tracking-widest">{{ f.data.length.toLocaleString() }} Entries</div>
                  </div>
                </div>

                <button 
                  @click="removeFile(f.id)"
                  class="p-4 bg-muted text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 rounded-2xl transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4"
                >
                  <X :size="20" />
                </button>
              </div>

              <!-- Inline Dropzone -->
              <div class="p-2">
                 <FileUploader :multiple="true" @files-selected="handleFilesSelected" class="!min-h-[140px] !border-dashed !rounded-[2rem]" />
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Synthesis Configuration -->
        <div class="lg:col-span-4 flex flex-col gap-8 h-full overflow-hidden">
           <div class="bg-card border border-border/50 rounded-[2.5rem] p-10 flex flex-col shadow-2xl h-full overflow-hidden">
              <div class="flex items-center gap-3 mb-8">
                 <Info :size="18" class="text-indigo-500" />
                 <h3 class="font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground/60">Synthesis Analysis</h3>
              </div>

              <div class="space-y-8 flex-1 overflow-y-auto pr-2 -mr-2 scrollbar-none">
                 <div class="space-y-1">
                    <h4 class="text-3xl font-black tracking-tighter">Unified Projection.</h4>
                    <p class="text-muted-foreground text-sm font-medium leading-relaxed">
                       Our engine automatically maps overlapping schemas and pads missing data points.
                    </p>
                 </div>

                 <!-- Global Metrics -->
                 <div class="grid grid-cols-1 gap-4">
                    <div class="p-6 bg-muted/20 border border-border/50 rounded-3xl relative overflow-hidden group/m">
                       <span class="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Projected Rows</span>
                       <div class="text-3xl font-black mt-1">{{ totalRowsInQueue.toLocaleString() }}</div>
                       <Layers :size="48" class="absolute -right-4 -bottom-4 opacity-[0.03] group-hover/m:opacity-[0.08] transition-opacity rotate-12" />
                    </div>
                    <div class="p-6 bg-muted/20 border border-border/50 rounded-3xl relative overflow-hidden group/m">
                       <span class="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Total Dimensions</span>
                       <div class="text-3xl font-black mt-1">{{ uniqueHeadersCount }} Columns</div>
                       <Database :size="48" class="absolute -right-4 -bottom-4 opacity-[0.03] group-hover/m:opacity-[0.08] transition-opacity -rotate-12" />
                    </div>
                 </div>

                 <!-- Logic Steps -->
                 <div class="space-y-6 pt-4 border-t border-border/50">
                    <div v-for="step in ['Schema Detection', 'Atomic Alignment', 'Memory Buffer Pooling', 'Quantized Export']" :key="step" class="flex gap-4 items-center group/step">
                       <div class="w-2 h-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 group-hover/step:bg-indigo-500 group-hover/step:shadow-[0_0_10px_rgba(79,70,229,0.5)] transition-all"></div>
                       <span class="text-xs font-black uppercase tracking-widest text-muted-foreground/60 group-hover/step:text-foreground transition-colors">{{ step }}</span>
                    </div>
                 </div>
              </div>

              <div class="pt-10 border-t border-border/50 mt-auto">
                 <div class="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex items-center gap-4">
                    <div class="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                       <CheckCircle2 :size="18" />
                    </div>
                    <div class="text-[10px] font-bold text-indigo-500/80 leading-relaxed uppercase tracking-wider">
                       Zero-transfer encryption. Files remain in memory.
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
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, 60px);
  filter: blur(10px);
}

.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
