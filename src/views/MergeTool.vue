<script setup lang="ts">
import { ref } from 'vue';
import { 
  Plus, 
  Files, 
  X, 
  Download, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  GripVertical,
  Layers
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
    // Collect all headers
    const allHeaders = new Set<string>();
    files.value.forEach(f => f.headers.forEach(h => allHeaders.add(h)));
    const finalHeaders = Array.from(allHeaders);

    // Combine data
    const combinedData = files.value.flatMap(f => f.data);

    // Export to CSV
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
          <Layers class="text-indigo-500" :size="36" />
          Merge Data
        </h1>
        <p class="text-muted-foreground">Combine multiple CSV or Excel files into a single master document.</p>
      </div>

      <button 
        v-if="files.length >= 2"
        @click="mergeFiles"
        :disabled="processing"
        class="group relative px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
      >
        <div class="flex items-center gap-2">
          <Loader2 v-if="processing" class="animate-spin" :size="20" />
          <Download v-else :size="20" />
          <span>Merge & Export CSV</span>
        </div>
      </button>
    </div>

    <!-- Error/Success Messages -->
    <Transition name="slide-up">
      <div v-if="error" class="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500">
        <AlertCircle :size="20" />
        <span class="text-sm font-medium">{{ error }}</span>
      </div>
    </Transition>

    <Transition name="slide-up">
      <div v-if="success" class="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-500">
        <CheckCircle2 :size="20" />
        <span class="text-sm font-medium">Files merged successfully! Your download has started.</span>
      </div>
    </Transition>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <!-- Left: File List -->
      <div class="lg:col-span-2 space-y-6">
        <div class="glass-card rounded-[2rem] border border-border/50 overflow-hidden">
          <div class="p-6 border-b border-border/50 bg-muted/30 flex items-center justify-between">
            <h2 class="font-bold flex items-center gap-2">
              <Files :size="18" class="text-indigo-500" />
              Upload Queue ({{ files.length }})
            </h2>
            <button 
              v-if="files.length > 0"
              @click="files = []"
              class="text-xs font-bold text-muted-foreground hover:text-red-500 transition-colors uppercase tracking-widest"
            >
              Clear All
            </button>
          </div>

          <div v-if="files.length === 0" class="p-12 text-center">
            <div class="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus :size="32" class="text-muted-foreground/30" />
            </div>
            <p class="text-muted-foreground font-medium">Add files to get started</p>
          </div>

          <div v-else class="divide-y divide-border/30">
            <div 
              v-for="file in files" 
              :key="file.id"
              class="p-4 flex items-center gap-4 hover:bg-muted/20 transition-colors group"
            >
              <div class="cursor-grab p-1 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors">
                <GripVertical :size="18" />
              </div>
              
              <div class="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Files :size="20" />
              </div>

              <div class="flex-1 min-w-0">
                <div class="font-bold text-sm truncate">{{ file.name }}</div>
                <div class="flex items-center gap-3 text-[10px] uppercase font-bold tracking-wider text-muted-foreground/60 mt-0.5">
                  <span>{{ formatSize(file.size) }}</span>
                  <span>•</span>
                  <span>{{ file.data.length.toLocaleString() }} Rows</span>
                </div>
              </div>

              <button 
                @click="removeFile(file.id)"
                class="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
              >
                <X :size="18" />
              </button>
            </div>
          </div>

          <!-- Quick Add Button -->
          <div v-if="files.length > 0" class="p-4 bg-muted/10 border-t border-border/30">
             <FileUploader :multiple="true" @files-selected="handleFilesSelected" class="!p-4 border-dashed border-1" />
          </div>
        </div>
      </div>

      <!-- Right: Instructions & Config -->
      <div class="space-y-6">
        <div v-if="files.length === 0">
          <FileUploader :multiple="true" @files-selected="handleFilesSelected" />
        </div>

        <div class="glass-card p-6 rounded-2xl border border-border/50">
          <h3 class="font-bold mb-4 flex items-center gap-2">
            <AlertCircle :size="16" class="text-indigo-500" />
            How it works
          </h3>
          <ul class="text-sm text-muted-foreground space-y-4">
            <li class="flex gap-3">
              <span class="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
              <span>Upload multiple files with similar structures.</span>
            </li>
            <li class="flex gap-3">
              <span class="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
              <span>We'll automatically align columns with the same names.</span>
            </li>
            <li class="flex gap-3">
              <span class="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-bold flex items-center justify-center shrink-0">3</span>
              <span>Extra columns in any file will be preserved and filled with nulls in others.</span>
            </li>
          </ul>
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
