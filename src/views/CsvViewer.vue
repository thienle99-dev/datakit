<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import { Table, Loader2, X } from 'lucide-vue-next';
import FileUploader from '../components/shared/FileUploader.vue';
import DataTable from '../components/shared/DataTable.vue';
import { parseFile } from '../utils/fileParser';

const file = shallowRef<File | null>(null);
const headers = ref<string[]>([]);
const data = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

async function handleFile(selectedFile: File) {
  file.value = selectedFile;
  loading.value = true;
  error.value = null;
  headers.value = [];
  data.value = [];

  try {
    const result = await parseFile(selectedFile);
    headers.value = result.headers;
    data.value = result.data;
  } catch (err: any) {
    console.error(err);
    error.value = 'Failed to parse file: ' + (err.message || err);
  } finally {
    loading.value = false;
  }
}

function reset() {
  file.value = null;
  data.value = [];
  headers.value = [];
}
</script>

<template>
  <div class="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col p-4 md:p-6 lg:p-8">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
      <div class="space-y-1">
        <router-link to="/" class="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider hover:gap-3 transition-all mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          All Tools
        </router-link>
        <h2 class="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3">
          <span class="p-2.5 bg-blue-500/10 text-blue-500 rounded-2xl shadow-inner"><Table :size="32" /></span>
          CSV Viewer
        </h2>
        <p class="text-muted-foreground text-lg max-w-xl">
          Lightning-fast browser processing for your largest datasets.
        </p>
      </div>

      <div v-if="data.length > 0" class="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
        <div class="hidden lg:flex flex-col items-end mr-4">
          <span class="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Current File</span>
          <span class="text-sm font-medium max-w-[200px] truncate text-foreground/80">{{ file?.name }}</span>
        </div>
        <button 
          @click="reset" 
          class="flex items-center gap-2 px-5 py-2.5 bg-card hover:bg-muted text-foreground border border-border rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 group"
        >
          <X :size="18" class="text-muted-foreground group-hover:text-red-500 transition-colors" />
          <span class="font-semibold text-sm">Clear Workspace</span>
        </button>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="flex-1 min-h-0 flex flex-col relative group">
      <!-- Error Message -->
      <transition name="slide-up">
        <div v-if="error" class="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md p-4 bg-red-500 text-white rounded-2xl shadow-2xl shadow-red-500/20 flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p class="text-sm font-medium">{{ error }}</p>
          </div>
          <button @click="error = null" class="p-1 hover:bg-white/20 rounded-lg"><X :size="16" /></button>
        </div>
      </transition>

      <!-- Content Area -->
      <div class="flex-1 h-full glass-card rounded-3xl border border-border/50 shadow-2xl shadow-primary/5 overflow-hidden flex flex-col">
        <!-- Loading -->
        <div v-if="loading" class="h-full flex flex-col items-center justify-center gap-6 p-12 bg-card/40 backdrop-blur-md">
          <div class="relative">
            <div class="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
            <Loader2 class="animate-spin text-primary relative z-10" :size="48" />
          </div>
          <div class="text-center space-y-1">
            <h4 class="text-xl font-bold tracking-tight">Processing Data</h4>
            <p class="text-muted-foreground">Parsing and indexing records...</p>
          </div>
        </div>

        <!-- Empty State / File Uploader -->
        <div v-else-if="data.length === 0" class="h-full overflow-y-auto">
          <div class="max-w-2xl mx-auto py-12 px-4 h-full flex flex-col justify-center">
            <FileUploader 
              @files-selected="handleFile" 
              class="min-h-[300px]"
            />
            
            <div class="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center opacity-60">
              <div class="space-y-2">
                <div class="mx-auto w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <p class="text-xs font-bold uppercase tracking-widest">Privacy-First</p>
              </div>
              <div class="space-y-2">
                <div class="mx-auto w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                </div>
                <p class="text-xs font-bold uppercase tracking-widest">Client-Side</p>
              </div>
              <div class="space-y-2">
                <div class="mx-auto w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
                </div>
                <p class="text-xs font-bold uppercase tracking-widest">Fast Export</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Data Table -->
        <div v-else class="h-full flex flex-col animate-in fade-in zoom-in-95 duration-700">
          <DataTable 
            :headers="headers" 
            :data="data" 
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translate(-50%, 20px);
  opacity: 0;
}

/* Custom scrollbar for better look */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 10px;
}
</style>
