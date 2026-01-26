<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import Papa from 'papaparse';
import { Sparkles, Loader2, X, Download, Scissors, Trash2, CopyX, ArrowLeft, Check, ShieldCheck } from 'lucide-vue-next';
import FileUploader from '../components/shared/FileUploader.vue';
import DataTable from '../components/shared/DataTable.vue';
import { parseFile } from '../utils/fileParser';

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
      successMessage.value = `Whitespace trimmed across dataset.`;
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
      successMessage.value = `Purged ${removed} empty records.`;
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
      successMessage.value = `Deduplication complete. ${removed} records removed.`;
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
  <div class="max-w-[1600px] mx-auto h-[calc(100vh-8rem)] flex flex-col p-4 md:p-6 lg:p-10">
    <!-- Premium Header Section -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
      <div class="space-y-4 max-w-2xl">
        <router-link to="/" class="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-primary/80 transition-all mb-2">
          <ArrowLeft :size="14" class="group-hover:-translate-x-1 transition-transform" />
          Back to Toolkit
        </router-link>
        
        <div class="flex items-center gap-6">
          <div class="p-4 bg-amber-500/10 text-amber-500 rounded-[2rem] shadow-inner ring-1 ring-amber-500/20">
            <Sparkles :size="40" stroke-width="2.5" />
          </div>
          <div>
            <h2 class="text-4xl md:text-5xl font-black tracking-tighter text-foreground mb-2">
              Data <span class="text-amber-500">Cleaner</span>
            </h2>
            <p class="text-muted-foreground text-lg font-medium leading-relaxed">
              Automated heuristics for data normalization and repair.
            </p>
          </div>
        </div>
      </div>

      <div v-if="data.length > 0" class="flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-right-8 duration-700">
        <button 
          @click="downloadCleaned" 
          class="flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-[11px] hover:shadow-[0_20px_40px_-12px_rgba(var(--primary),0.3)] transition-all active:scale-95 group"
        >
          <Download :size="18" class="group-hover:translate-y-0.5 transition-transform" />
          <span>Export Cleaned</span>
        </button>

        <button 
          @click="reset" 
          class="flex items-center gap-3 px-6 py-4 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-2xl transition-all duration-300 font-bold active:scale-95 group"
        >
          <X :size="20" class="group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="flex-1 min-h-0 flex flex-col relative">
      <!-- Success/Error Notifications -->
      <transition name="slide-up">
        <div v-if="error" class="absolute top-0 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md p-5 bg-rose-500 text-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(244,63,94,0.4)] flex items-center justify-between gap-6">
          <div class="flex items-center gap-4">
             <div class="bg-white/20 p-2 rounded-xl">
               <X :size="20" />
             </div>
             <p class="text-sm font-bold tracking-tight">{{ error }}</p>
          </div>
          <button @click="error = null" class="p-2 hover:bg-white/20 rounded-xl transition-colors"><X :size="18" /></button>
        </div>
      </transition>
      
      <transition name="slide-up">
        <div v-if="successMessage" class="absolute top-0 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md p-5 bg-emerald-500 text-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(16,185,129,0.4)] flex items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div class="flex items-center gap-4">
             <div class="bg-white/20 p-2 rounded-xl">
               <Check :size="20" stroke-width="3" />
             </div>
             <p class="text-sm font-bold tracking-tight">{{ successMessage }}</p>
          </div>
          <button @click="successMessage = null" class="p-2 hover:bg-white/20 rounded-xl transition-colors"><X :size="18" /></button>
        </div>
      </transition>

      <!-- Content Area -->
      <div class="flex-1 overflow-hidden relative">
        <!-- Premium Loading -->
        <div v-if="loading" class="absolute inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-card/80 backdrop-blur-2xl rounded-[2.5rem]">
          <div class="relative">
            <div class="absolute inset-0 bg-amber-500/40 rounded-full blur-3xl animate-pulse"></div>
            <div class="relative p-8 bg-background border border-border/50 rounded-[2.5rem] shadow-2xl">
              <Loader2 class="animate-spin text-amber-500" :size="64" stroke-width="3" />
            </div>
          </div>
          <div class="text-center space-y-2">
            <h4 class="text-2xl font-black tracking-tight uppercase">Infecting Heuristics</h4>
            <p class="text-muted-foreground font-bold tracking-widest text-[11px] uppercase opacity-60">Preparing sanitization engine</p>
          </div>
        </div>

        <div v-else-if="data.length === 0" class="h-full max-w-[1000px] mx-auto flex flex-col justify-center">
            <div class="text-center space-y-4 mb-12">
               <div class="inline-flex px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                 Dirty data? Not for long.
               </div>
               <h3 class="text-5xl font-black tracking-tighter">Polish your datasets.</h3>
               <p class="text-muted-foreground text-xl font-medium max-w-lg mx-auto leading-relaxed">
                 Drop your messy CSV files here to automatically repair types, trim spaces, and purge noise.
               </p>
            </div>

            <FileUploader @files-selected="handleFile" class="min-h-[400px]" />
        </div>

        <!-- Tool Workspace -->
        <div v-else class="h-full flex flex-col gap-6 animate-in fade-in duration-700">
          <!-- Premium Actions Panel -->
          <div class="bg-card/98 dark:bg-card/95 border border-border/50 rounded-[2.25rem] p-6 shadow-xl flex flex-wrap items-center gap-8 relative overflow-hidden group">
             <!-- Ambient Glow -->
             <div class="absolute -right-20 -top-20 w-40 h-40 bg-amber-500/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-amber-500/10 transition-all duration-700"></div>

             <div class="flex items-center gap-4 px-6 border-r border-border/50 hidden xl:flex">
                <div class="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 ring-1 ring-amber-500/20">
                   <ShieldCheck :size="20" />
                </div>
                <div class="flex flex-col">
                   <span class="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Logic Engine</span>
                   <span class="text-xs font-bold">V-Sanitize 2.0</span>
                </div>
             </div>
             
             <div class="flex flex-wrap items-center gap-3">
                <button 
                  @click="trimWhitespace"
                  :disabled="processing"
                  class="group flex items-center gap-3 px-6 py-3.5 bg-background hover:bg-amber-500/5 hover:border-amber-500/30 border border-border/50 text-foreground/80 hover:text-amber-500 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-30 active:scale-95"
                >
                  <Scissors :size="16" class="group-hover:rotate-12 transition-transform" /> 
                  Trim Whitespace
                </button>
                
                <button 
                  @click="removeEmptyRows"
                  :disabled="processing"
                  class="group flex items-center gap-3 px-6 py-3.5 bg-background hover:bg-rose-500/5 hover:border-rose-500/30 border border-border/50 text-foreground/80 hover:text-rose-500 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-30 active:scale-95"
                >
                  <Trash2 :size="16" class="group-hover:translate-y-[-1px] transition-transform" /> 
                  Purge Empty
                </button>

                <button 
                  @click="removeDuplicates"
                  :disabled="processing"
                  class="group flex items-center gap-3 px-6 py-3.5 bg-background hover:bg-blue-500/5 hover:border-blue-500/30 border border-border/50 text-foreground/80 hover:text-blue-500 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-30 active:scale-95"
                >
                  <CopyX :size="16" class="group-hover:scale-110 transition-transform" /> 
                  Deduplicate
                </button>
             </div>
             
             <transition name="fade">
               <div v-if="processing" class="flex items-center gap-3 text-[10px] font-black tracking-[0.2em] text-amber-500 ml-auto bg-amber-500/10 px-4 py-2 rounded-full ring-1 ring-amber-500/20 animate-pulse">
                  <Loader2 :size="14" class="animate-spin" /> ANALYZING PATTERNS...
               </div>
             </transition>
          </div>

          <!-- Data Preview Table Area -->
          <div class="flex-1 min-w-0 bg-card/40 border border-border/50 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col p-2">
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
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translate(-50%, 60px);
  opacity: 0;
  filter: blur(10px);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>

