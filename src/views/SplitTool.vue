<script setup lang="ts">
import { ref, shallowRef, computed } from 'vue';
import { 
  Scissors, 
  Loader2, 
  AlertCircle,
  FileText,
  Settings2,
  Download,
  Zap,
  X
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
  <div class="max-w-5xl mx-auto py-12 px-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
      <div class="space-y-1">
        <router-link to="/" class="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider hover:gap-3 transition-all mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          All Tools
        </router-link>
        <h1 class="text-4xl font-black tracking-tight flex items-center gap-3">
          <Scissors class="text-rose-500" :size="36" />
          Data Splitter
        </h1>
        <p class="text-muted-foreground">Tear large datasets into smaller, manageable chunks or a specific number of files.</p>
      </div>

      <button 
        v-if="fileData.length > 0"
        @click="splitData"
        :disabled="processing"
        class="group relative px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold shadow-lg shadow-rose-500/25 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
      >
        <div class="flex items-center gap-2">
          <Loader2 v-if="processing" class="animate-spin" :size="20" />
          <Download v-else :size="20" />
          <span>Generate ZIP with {{ estimatedFiles }} Files</span>
        </div>
      </button>
    </div>

    <!-- Feedback -->
    <Transition name="slide-up">
      <div v-if="error" class="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500">
        <AlertCircle :size="20" />
        <span class="text-sm font-medium">{{ error }}</span>
      </div>
    </Transition>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <!-- Main Config -->
      <div class="lg:col-span-2 space-y-6">
        <div v-if="!file" class="animate-in fade-in zoom-in-95 duration-700">
           <FileUploader @files-selected="handleFileSelected" />
        </div>

        <div v-else class="glass-card rounded-[2rem] border border-border/50 overflow-hidden animate-in slide-in-from-bottom-6 duration-700">
          <div class="p-6 border-b border-border/50 bg-muted/30 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <FileText :size="20" />
              </div>
              <div>
                <div class="font-bold text-sm">{{ file.name }}</div>
                <div class="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/60">{{ fileData.length.toLocaleString() }} Rows detected</div>
              </div>
            </div>
            <button @click="file = null; fileData = []" class="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors">
              <X :size="18" />
            </button>
          </div>

          <div class="p-8 space-y-8">
            <!-- Mode Selection -->
            <div class="space-y-4">
              <label class="text-xs font-black uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
                <Settings2 :size="14" />
                Splitting Method
              </label>
              <div class="grid grid-cols-2 gap-4">
                <button 
                  @click="splitMode = 'rows'"
                  class="p-4 rounded-2xl border-2 transition-all text-left"
                  :class="splitMode === 'rows' ? 'border-rose-500 bg-rose-500/5 shadow-inner' : 'border-border/50 hover:border-rose-500/30'"
                >
                  <div class="font-bold mb-1">By Row Count</div>
                  <div class="text-xs text-muted-foreground">Every N rows create a new file.</div>
                </button>
                <button 
                  @click="splitMode = 'parts'"
                  class="p-4 rounded-2xl border-2 transition-all text-left"
                  :class="splitMode === 'parts' ? 'border-rose-500 bg-rose-500/5 shadow-inner' : 'border-border/50 hover:border-rose-500/30'"
                >
                  <div class="font-bold mb-1">By Part Count</div>
                  <div class="text-xs text-muted-foreground">Divide total rows into N equal parts.</div>
                </button>
              </div>
            </div>

            <!-- Inputs -->
            <div class="animate-in fade-in duration-500">
              <div v-if="splitMode === 'rows'" class="space-y-3">
                <label class="text-sm font-bold">Rows per file</label>
                <div class="flex items-center gap-4">
                  <input 
                    v-model.number="rowsPerFile" 
                    type="range" min="10" max="50000" step="10"
                    class="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                  <div class="w-24 px-3 py-2 bg-muted/50 rounded-xl font-mono text-center border border-border/50">
                    {{ rowsPerFile }}
                  </div>
                </div>
              </div>

              <div v-else class="space-y-3">
                <label class="text-sm font-bold">Number of output files</label>
                <div class="flex items-center gap-4">
                  <input 
                    v-model.number="numberOfParts" 
                    type="range" min="2" max="50" step="1"
                    class="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                  <div class="w-24 px-3 py-2 bg-muted/50 rounded-xl font-mono text-center border border-border/50">
                    {{ numberOfParts }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Summary -->
      <div v-if="file" class="space-y-6">
        <div class="glass-card p-6 rounded-2xl border border-border/50 animate-in fade-in slide-in-from-right-6 duration-700 delay-200">
          <h3 class="font-bold mb-6 flex items-center gap-2 uppercase tracking-tighter text-muted-foreground">
            <Zap :size="16" class="text-rose-500" fill="currentColor" />
            Output Preview
          </h3>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
              <span class="text-sm text-muted-foreground">Total Rows</span>
              <span class="font-bold">{{ fileData.length.toLocaleString() }}</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
              <span class="text-sm text-muted-foreground">Chunks</span>
              <span class="font-bold text-rose-500 text-lg">{{ estimatedFiles }}</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-rose-500/5 rounded-xl border border-rose-500/10">
              <span class="text-sm text-muted-foreground">Format</span>
              <span class="font-bold">ZIP (.csv files)</span>
            </div>
          </div>

          <div class="mt-8 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
             <div class="flex gap-3 text-amber-600">
               <AlertCircle :size="16" class="shrink-0" />
               <p class="text-[11px] leading-relaxed font-medium">Large files are split in your browser. For 100k+ rows, your memory might be pushed.</p>
             </div>
          </div>
        </div>
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
