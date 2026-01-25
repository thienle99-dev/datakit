<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import Papa from 'papaparse';
import { Sparkles, Loader2, X, Download, Scissors, Trash2, CopyX } from 'lucide-vue-next';
import FileUploader from '../components/shared/FileUploader.vue';
import DataTable from '../components/shared/DataTable.vue';
import { parseFile } from '../utils/fileParser';

// ... logic ...
const file = shallowRef<File | null>(null);
const headers = ref<string[]>([]);
const data = ref<any[]>([]);
const loading = ref(false);
const processing = ref(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);

async function handleFile(selectedFile: File) {
  file.value = selectedFile;
  loading.value = true;
  error.value = null;
  successMessage.value = null;
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

function trimWhitespace() {
  if (!data.value.length) return;
  processing.value = true;
  
  setTimeout(() => {
    try {
      let count = 0;
      data.value = data.value.map(row => {
        const newRow: any = {};
        let modified = false;
        
        headers.value.forEach(key => {
          const val = row[key];
          if (typeof val === 'string') {
            const trimmed = val.trim();
            if (trimmed !== val) {
              modified = true;
            }
            newRow[key] = trimmed;
          } else {
            newRow[key] = val;
          }
        });
        
        if (modified) count++;
        return newRow;
      });
      successMessage.value = `Trimmed whitespace in rows.`;
    } catch (err: any) {
      error.value = 'Operation failed: ' + err.message;
    } finally {
      processing.value = false;
    }
  }, 10);
}

function removeEmptyRows() {
  if (!data.value.length) return;
  processing.value = true;
  
  setTimeout(() => {
    try {
      const initialLen = data.value.length;
      data.value = data.value.filter(row => {
        return Object.values(row).some(val => val !== null && val !== undefined && String(val).trim() !== '');
      });
      const removed = initialLen - data.value.length;
      successMessage.value = `Removed ${removed} empty rows.`;
    } catch (err: any) {
      error.value = 'Operation failed: ' + err.message;
    } finally {
      processing.value = false;
    }
  }, 10);
}

function removeDuplicates() {
  if (!data.value.length) return;
  processing.value = true;
  
  setTimeout(() => {
    try {
      const initialLen = data.value.length;
      const uniqueRows = new Set();
      const newData = data.value.filter(row => {
        const rowStr = JSON.stringify(row);
        if (uniqueRows.has(rowStr)) {
          return false;
        }
        uniqueRows.add(rowStr);
        return true;
      });
      
      data.value = newData;
      const removed = initialLen - data.value.length;
      successMessage.value = `Removed ${removed} duplicate rows.`;
    } catch (err: any) {
      error.value = 'Operation failed: ' + err.message;
    } finally {
      processing.value = false;
    }
  }, 10);
}

function downloadCleaned() {
  if (!data.value || data.value.length === 0) return;
  
  const csv = Papa.unparse(data.value);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  const originalName = file.value?.name || 'cleaned_data';
  const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
  link.setAttribute('download', `${baseName}_cleaned.csv`);
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function reset() {
  file.value = null;
  data.value = [];
  headers.value = [];
  error.value = null;
  successMessage.value = null;
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
          <span class="p-2.5 bg-amber-500/10 text-amber-500 rounded-2xl shadow-inner"><Sparkles :size="32" /></span>
          Data Cleaner
        </h2>
        <p class="text-muted-foreground text-lg max-w-xl">
          Automated data normalization and formatting repair.
        </p>
      </div>

      <div v-if="data.length > 0" class="flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
        <button 
          @click="downloadCleaned" 
          class="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 shadow-sm"
        >
          <Download :size="18" />
          <span>Export Cleaned CSV</span>
        </button>

        <button 
          @click="reset" 
          class="flex items-center gap-2 px-5 py-2.5 bg-card hover:bg-muted text-foreground border border-border rounded-xl transition-all shadow-sm group font-semibold text-sm"
        >
          <X :size="18" class="text-muted-foreground group-hover:text-red-500 transition-colors" />
          <span>Clear</span>
        </button>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="flex-1 min-h-0 flex flex-col relative">
      <!-- Feedback Overlays -->
      <transition name="slide-up">
        <div v-if="error" class="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md p-4 bg-red-500 text-white rounded-2xl shadow-2xl flex items-center justify-between">
          <p class="text-sm font-bold">{{ error }}</p>
          <button @click="error = null" class="p-1 hover:bg-white/20 rounded-lg"><X :size="16" /></button>
        </div>
      </transition>
      
      <transition name="slide-up">
        <div v-if="successMessage" class="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md p-4 bg-primary text-primary-foreground rounded-2xl shadow-2xl flex items-center justify-between">
          <div class="flex items-center gap-3">
             <Check :size="20" stroke-width="3" />
             <p class="text-sm font-bold">{{ successMessage }}</p>
          </div>
          <button @click="successMessage = null" class="p-1 hover:bg-white/20 rounded-lg"><X :size="16" /></button>
        </div>
      </transition>

      <!-- Content Area -->
      <div class="flex-1 overflow-hidden">
        <div v-if="loading" class="h-full flex flex-col items-center justify-center p-12 bg-card/60 backdrop-blur-md rounded-3xl border border-border/50">
          <Loader2 class="animate-spin text-primary mb-4" :size="48" />
          <p class="font-extrabold uppercase tracking-widest text-xs opacity-50">Sanitizing Environment...</p>
        </div>

        <div v-else-if="data.length === 0" class="h-full max-w-2xl mx-auto flex flex-col justify-center">
          <FileUploader @files-selected="handleFile" class="min-h-[350px]" />
        </div>

        <!-- Tool Workspace -->
        <div v-else class="h-full flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-500">
          <!-- Quick Actions Panel (Sticky-like top of workspace) -->
          <div class="glass-card border border-border/50 rounded-3xl p-4 bg-card shadow-lg shadow-primary/5 flex flex-wrap items-center gap-4">
             <div class="px-4 py-2 border-r border-border hidden lg:block">
                <span class="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/50">Processing Engine</span>
             </div>
             
             <div class="flex flex-wrap gap-2">
                <button 
                  @click="trimWhitespace"
                  :disabled="processing"
                  class="group flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-primary/10 hover:border-primary/30 border border-border/50 text-foreground/80 hover:text-primary rounded-xl text-xs font-bold transition-all disabled:opacity-30"
                >
                  <Scissors :size="14" class="group-hover:rotate-12 transition-transform" /> 
                  Trim All Spaces
                </button>
                
                <button 
                  @click="removeEmptyRows"
                  :disabled="processing"
                  class="group flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-red-50 hover:border-red-200 border border-border/50 text-foreground/80 hover:text-red-600 rounded-xl text-xs font-bold transition-all disabled:opacity-30"
                >
                  <Trash2 :size="14" /> 
                  Drop Empty Rows
                </button>

                <button 
                  @click="removeDuplicates"
                  :disabled="processing"
                  class="group flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-orange-50 hover:border-orange-200 border border-border/50 text-foreground/80 hover:text-orange-600 rounded-xl text-xs font-bold transition-all disabled:opacity-30"
                >
                  <CopyX :size="14" /> 
                  Deduplicate
                </button>
             </div>
             
             <transition name="fade">
               <div v-if="processing" class="flex items-center gap-2 text-[10px] font-bold text-primary ml-auto animate-pulse">
                  <Loader2 :size="12" class="animate-spin" /> RUNNING HEURISTICS...
               </div>
             </transition>
          </div>

          <!-- Data Preview Table -->
          <div class="flex-1 min-w-0 glass-card rounded-3xl border border-border/50 shadow-2xl shadow-primary/5 overflow-hidden flex flex-col">
             <DataTable 
               :headers="headers" 
               :data="data" 
             />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translate(-50%, 40px);
  opacity: 0;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
