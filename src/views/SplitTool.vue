<script setup lang="ts">
import { ref, shallowRef, computed } from 'vue';
import { 
  Scissors, 
  Loader2, 
  AlertCircle,
  FileText,
  Settings2,
  Download,
  X,
  ArrowLeft,
  Split,
  Layers,
  Archive
} from 'lucide-vue-next';
import Papa from 'papaparse';
import JSZip from 'jszip';
import FileUploader from '../components/shared/FileUploader.vue';
import { parseFile } from '../utils/fileParser';

const file = shallowRef<File | null>(null);
const fileData = ref<any[]>([]);
const headers = ref<string[]>([]);
const processing = ref(false);
const error = ref<string | null>(null);
const success = ref(false);

const splitMode = ref<'rows' | 'parts'>('rows');
const rowsPerFile = ref(1000);
const numberOfParts = ref(2);

const handleFileSelected = async (selectedFile: File) => {
  file.value = selectedFile;
  error.value = null;
  success.value = false;
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

const estimatedFiles = computed(() => {
  if (fileData.value.length === 0) return 0;
  if (splitMode.value === 'rows') {
    return Math.ceil(fileData.value.length / rowsPerFile.value);
  } else {
    return numberOfParts.value;
  }
});

const splitData = async () => {
  if (!fileData.value.length) return;
  
  processing.value = true;
  error.value = null;
  
  try {
    const zip = new JSZip();
    const totalRows = fileData.value.length;
    let chunks: any[][] = [];

    if (splitMode.value === 'rows') {
      const size = rowsPerFile.value;
      for (let i = 0; i < totalRows; i += size) {
        chunks.push(fileData.value.slice(i, i + size));
      }
    } else {
      const size = Math.ceil(totalRows / numberOfParts.value);
      for (let i = 0; i < totalRows; i += size) {
        chunks.push(fileData.value.slice(i, i + size));
      }
    }

    chunks.forEach((chunk, index) => {
      const csv = Papa.unparse({
        fields: headers.value,
        data: chunk
      });
      zip.file(`part_${index + 1}.csv`, csv);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `${file.value?.name.split('.')[0]}_split.zip`;
    link.click();
    
    success.value = true;
  } catch (err: any) {
    error.value = `Split failed: ${err.message}`;
  } finally {
    processing.value = false;
  }
};
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
          <div class="p-4 bg-rose-500/10 text-rose-500 rounded-[2rem] shadow-inner ring-1 ring-rose-500/20">
            <Scissors :size="40" stroke-width="2.5" />
          </div>
          <div>
            <h2 class="text-5xl md:text-6xl font-black tracking-tighter text-foreground mb-4">
              Data <span class="text-rose-500">Splitter</span>
            </h2>
            <p class="text-muted-foreground text-lg font-medium leading-relaxed">
              Tear massive datasets into atomic, precision-sized chunks.
            </p>
          </div>
        </div>
      </div>

      <div v-if="fileData.length > 0" class="flex items-center gap-4 animate-in fade-in slide-in-from-right-8 duration-700">
        <button 
          @click="splitData" 
          :disabled="processing"
          class="flex items-center gap-3 px-8 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:shadow-[0_20px_40px_-12px_rgba(244,63,94,0.3)] transition-all active:scale-95 group"
        >
          <Loader2 v-if="processing" :size="18" class="animate-spin" />
          <Download v-else :size="18" class="group-hover:translate-y-0.5 transition-transform" />
          <span>Generate {{ estimatedFiles }} Chunks</span>
        </button>

        <button 
          @click="file = null; fileData = []" 
          class="flex items-center gap-3 px-6 py-4 bg-card hover:bg-muted text-foreground border border-border/50 rounded-2xl transition-all duration-300 font-bold active:scale-95 group"
        >
          <X :size="20" class="group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="flex-1 min-h-0 flex flex-col relative overflow-hidden">
      <!-- Content Area -->
      <div class="flex-1 overflow-hidden relative">
        <div v-if="processing" class="absolute inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-card rounded-[2.5rem]">
          <div class="p-8 bg-background border border-border/50 rounded-[2.5rem] shadow-2xl">
            <Loader2 class="animate-spin text-rose-500" :size="64" stroke-width="3" />
          </div>
          <h4 class="text-2xl font-black uppercase tracking-tight">Deconstructing...</h4>
        </div>

        <div v-else-if="!file" class="h-full max-w-[1000px] mx-auto flex flex-col justify-center">
            <div class="text-center space-y-4 mb-12">
               <div class="inline-flex px-4 py-1.5 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                 Atomic subdivision
               </div>
               <h3 class="text-5xl font-black tracking-tighter">Small chunks, big insight.</h3>
               <p class="text-muted-foreground text-xl font-medium max-w-lg mx-auto leading-relaxed">
                 Partition your heavy data files into light, manageable units tailored for any processing pipeline.
               </p>
            </div>
            <FileUploader @files-selected="handleFileSelected" class="min-h-[400px]" />
        </div>

        <!-- Tool UI -->
        <div v-else class="h-full flex flex-col lg:flex-row gap-8 animate-in fade-in duration-700 overflow-hidden">
          <!-- Left: Configuration Logic -->
          <div class="w-full lg:w-[600px] flex flex-col gap-6 shrink-0 h-full overflow-hidden">
            <div class="flex-1 bg-card border border-border/50 rounded-[2.5rem] p-10 shadow-2xl flex flex-col overflow-hidden">
              <div class="mb-12">
                 <div class="flex items-center justify-between mb-8">
                    <h3 class="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                       <Settings2 :size="14" class="text-rose-500" />
                       Partition Logic
                    </h3>
                    <div class="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full text-[10px] font-black tracking-widest uppercase">
                       Mode: {{ splitMode }}
                    </div>
                 </div>

                 <div class="grid grid-cols-2 gap-4">
                     <button 
                      @click="splitMode = 'rows'"
                      class="flex flex-col gap-6 p-10 rounded-[2.5rem] border-2 transition-all duration-500 text-left relative overflow-hidden group/opt h-full"
                      :class="splitMode === 'rows' ? 'border-rose-500 bg-rose-500/5 shadow-[0_20px_50px_-20px_rgba(244,63,94,0.15)] scale-[1.02]' : 'border-border/50 bg-background hover:border-rose-500/30'"
                    >
                      <div class="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm" :class="splitMode === 'rows' ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/20' : 'bg-muted text-muted-foreground group-hover/opt:bg-rose-500/10 group-hover/opt:text-rose-500'">
                         <Layers :size="28" stroke-width="2.5" />
                      </div>
                      <div class="translate-y-1">
                        <div class="font-black text-xl uppercase tracking-tighter">By Row Limit</div>
                        <div class="text-[10px] uppercase font-black text-muted-foreground mt-2 tracking-[0.2em] opacity-40">Fixed-size fragments</div>
                      </div>
                      <div v-if="splitMode === 'rows'" class="absolute right-6 top-6 animate-in zoom-in duration-300">
                         <div class="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)]"></div>
                      </div>
                    </button>

                    <button 
                      @click="splitMode = 'parts'"
                      class="flex flex-col gap-6 p-10 rounded-[2.5rem] border-2 transition-all duration-500 text-left relative overflow-hidden group/opt h-full"
                      :class="splitMode === 'parts' ? 'border-rose-500 bg-rose-500/5 shadow-[0_20px_50px_-20px_rgba(244,63,94,0.15)] scale-[1.02]' : 'border-border/50 bg-background hover:border-rose-500/30'"
                    >
                      <div class="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm" :class="splitMode === 'parts' ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/20' : 'bg-muted text-muted-foreground group-hover/opt:bg-rose-500/10 group-hover/opt:text-rose-500'">
                         <Split :size="28" stroke-width="2.5" />
                      </div>
                      <div class="translate-y-1">
                        <div class="font-black text-xl uppercase tracking-tighter">By File Count</div>
                        <div class="text-[10px] uppercase font-black text-muted-foreground mt-2 tracking-[0.2em] opacity-40">Equal distribution</div>
                      </div>
                      <div v-if="splitMode === 'parts'" class="absolute right-6 top-6 animate-in zoom-in duration-300">
                         <div class="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)]"></div>
                      </div>
                    </button>
                 </div>
              </div>
              
              <div class="flex-1 space-y-12">
                 <div v-if="splitMode === 'rows'" class="space-y-6 animate-in slide-in-from-left-4 duration-500">
                    <div class="flex items-center justify-between">
                       <label class="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Rows per Fragment</label>
                       <div class="px-4 py-1.5 bg-background border border-border/50 rounded-xl font-black text-rose-500 shadow-sm">{{ rowsPerFile.toLocaleString() }}</div>
                    </div>
                    <div class="relative py-4">
                       <input 
                         v-model.number="rowsPerFile" 
                         type="range" min="100" max="100000" step="100"
                         class="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-rose-500"
                       />
                       <div class="flex justify-between mt-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground/30">
                          <span>100 ROWS</span>
                          <span>50K ROWS</span>
                          <span>100K ROWS</span>
                       </div>
                    </div>
                 </div>

                 <div v-else class="space-y-6 animate-in slide-in-from-right-4 duration-500">
                    <div class="flex items-center justify-between">
                       <label class="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Target Fragments</label>
                       <div class="px-4 py-1.5 bg-background border border-border/50 rounded-xl font-black text-rose-500 shadow-sm">{{ numberOfParts }} FILES</div>
                    </div>
                    <div class="relative py-4">
                       <input 
                         v-model.number="numberOfParts" 
                         type="range" min="2" max="100" step="1"
                         class="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-rose-500"
                       />
                       <div class="flex justify-between mt-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground/30">
                          <span>2 PARTS</span>
                          <span>50 PARTS</span>
                          <span>100 PARTS</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div class="pt-10 border-t border-border/50 flex items-center gap-6">
                 <div class="shrink-0 w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground">
                    <Archive :size="24" />
                 </div>
                 <div class="flex-1 min-w-0">
                    <div class="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Packaging Profile</div>
                    <div class="font-black truncate uppercase tracking-tighter">{{ file?.name.split('.')[0] }}_split.zip</div>
                 </div>
              </div>
            </div>
          </div>

          <!-- Right: Summary & Analysis -->
          <div class="flex-1 flex flex-col gap-8 h-full overflow-hidden">
             <!-- Source Analysis Card -->
             <div class="bg-card border border-border/50 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden shrink-0">
                <div class="flex items-center gap-4 mb-8">
                   <div class="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                      <FileText :size="24" />
                   </div>
                   <div>
                      <h4 class="font-black text-xs uppercase tracking-widest text-muted-foreground/60">Source Insight</h4>
                      <p class="font-black text-2xl tracking-tighter truncate max-w-sm">{{ file?.name }}</p>
                   </div>
                </div>

                <div class="grid grid-cols-3 gap-6">
                   <div class="space-y-1">
                      <div class="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">Population</div>
                      <div class="text-xl font-black uppercase tracking-tighter">{{ fileData.length.toLocaleString() }}</div>
                   </div>
                   <div class="space-y-1 border-l border-border/50 pl-6">
                      <div class="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">Dimensions</div>
                      <div class="text-xl font-black uppercase tracking-tighter">{{ headers.length }} COLS</div>
                   </div>
                   <div class="space-y-1 border-l border-border/50 pl-6">
                      <div class="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">Encoding</div>
                      <div class="text-xl font-black uppercase tracking-tighter text-emerald-500">UTF-8</div>
                   </div>
                </div>
                <Scissors :size="120" class="absolute -right-8 -bottom-8 opacity-[0.03] rotate-12" />
             </div>

             <!-- Preview Visualization -->
             <div class="flex-1 bg-card border border-border/50 rounded-[2.5rem] p-10 flex flex-col justify-center items-center text-center shadow-inner ring-1 ring-border/50">
                <div class="relative mb-12">
                   <div class="absolute inset-0 bg-rose-500/10 rounded-full blur-3xl group-hover:bg-rose-500/20 transition-all duration-700"></div>
                   <div class="relative p-10 bg-background border border-border/50 rounded-[3rem] shadow-2xl">
                      <div class="flex items-center gap-1.5">
                         <div v-for="i in 3" :key="i" class="w-10 h-14 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-500" :style="{ opacity: 1 - (i * 0.2) }">
                            <FileText :size="14" class="text-rose-500/40" />
                         </div>
                         <div class="px-2 text-rose-500 font-black animate-pulse">+{{ estimatedFiles - 3 }}</div>
                      </div>
                   </div>
                </div>
                
                <h3 class="text-3xl font-black tracking-tighter mb-4 text-foreground">Synthesis Output</h3>
                <p class="text-muted-foreground text-lg font-medium leading-relaxed max-w-sm">
                   Your dataset will be serialized into <span class="text-rose-500 font-black tracking-tight">{{ estimatedFiles }} standardized fragments</span> compressed into a single ZIP archive.
                </p>

                <div class="mt-12 flex gap-4 w-full max-w-md">
                   <div class="flex-1 p-4 bg-muted/20 border border-border/50 rounded-2xl">
                      <div class="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1">Row Density</div>
                      <div class="font-black text-lg">{{ splitMode === 'rows' ? rowsPerFile.toLocaleString() : Math.ceil(fileData.length / numberOfParts).toLocaleString() }}</div>
                   </div>
                   <div class="flex-1 p-4 bg-muted/20 border border-border/50 rounded-2xl">
                      <div class="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1">Package Weight</div>
                      <div class="font-black text-lg">~ {{ (file ? (file.size / 1024 / 1024).toFixed(1) : 0) }} MB</div>
                   </div>
                </div>

                <div class="mt-10 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-center gap-4 max-w-md mx-auto">
                   <AlertCircle :size="16" class="text-amber-500 shrink-0" />
                   <p class="text-[10px] text-amber-600 font-bold uppercase tracking-wider text-left leading-relaxed">
                      Surgical splitting occurs locally. Zero bytes transferred to external nodes.
                   </p>
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
  transform: translateY(20px);
}

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 24px;
  width: 24px;
  border-radius: 50%;
  background: #f43f5e;
  cursor: pointer;
  border: 4px solid hsl(var(--background));
  box-shadow: 0 4px 10px rgba(244, 63, 94, 0.3);
  transition: all 0.2s ease;
}

input[type=range]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 5px 15px rgba(244, 63, 94, 0.4);
}
</style>
