<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import Papa from 'papaparse';
import { 
  Sparkles, 
  Loader2, 
  X, 
  Download, 
  Scissors, 
  Trash2, 
  CopyX, 
  ArrowLeft, 
  Check, 
  ShieldCheck,
  Zap
} from 'lucide-vue-next';
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

const cleaningStats = ref({
    trimmed: 0,
    purged: 0,
    deduplicated: 0
});

async function handleFile(selectedFile: File) {
  file.value = selectedFile;
  loading.value = true;
  error.value = null;
  successMessage.value = null;
  headers.value = [];
  data.value = [];
  cleaningStats.value = { trimmed: 0, purged: 0, deduplicated: 0 };

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
      cleaningStats.value.trimmed += count;
      successMessage.value = `Whitespace trimmed across dataset.`;
    } catch (err: any) {
      error.value = 'Operation failed: ' + err.message;
    } finally {
      processing.value = false;
    }
  }, 100);
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
      cleaningStats.value.purged += removed;
      successMessage.value = `Purged ${removed} empty records.`;
    } catch (err: any) {
      error.value = 'Operation failed: ' + err.message;
    } finally {
      processing.value = false;
    }
  }, 100);
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
      cleaningStats.value.deduplicated += removed;
      successMessage.value = `Deduplication complete. ${removed} records removed.`;
    } catch (err: any) {
      error.value = 'Operation failed: ' + err.message;
    } finally {
      processing.value = false;
    }
  }, 100);
}

const fillValueInput = ref('');

function fillEmptyValues() {
  if (!data.value.length) return;
  processing.value = true;
  
  setTimeout(() => {
    try {
      let count = 0;
      data.value = data.value.map(row => {
        const newRow: any = {};
        headers.value.forEach(key => {
          const val = row[key];
          if (val === null || val === undefined || String(val).trim() === '') {
            newRow[key] = fillValueInput.value;
            count++;
          } else {
            newRow[key] = val;
          }
        });
        return newRow;
      });
      successMessage.value = `Filled ${count} empty cells with "${fillValueInput.value}".`;
    } catch (err: any) {
      error.value = 'Operation failed: ' + err.message;
    } finally {
      processing.value = false;
    }
  }, 100);
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
  <div class="w-full h-[calc(100vh-6rem)] flex flex-col p-2 md:p-4">
    <!-- Premium Header Section -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 shrink-0 relative z-20">
      <div class="flex items-center gap-4">
        <router-link to="/" class="p-2.5 bg-card border border-border/50 rounded-xl text-muted-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm group">
          <ArrowLeft :size="18" class="group-hover:-translate-x-0.5 transition-transform" />
        </router-link>
        
        <div class="h-10 w-px bg-border/30 hidden lg:block"></div>

        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center ring-1 ring-amber-500/20">
            <Sparkles :size="20" stroke-width="2.5" />
          </div>
          <div>
            <h2 class="text-xl md:text-2xl font-black tracking-tight text-foreground">
              Data <span class="text-amber-500">Cleaner</span>
            </h2>
          </div>
        </div>
      </div>

      <div v-if="data.length > 0" class="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-700">
        <button 
          @click="downloadCleaned" 
          class="flex items-center gap-2.5 px-6 py-3 bg-amber-500 text-black rounded-xl font-black uppercase tracking-widest text-[10px] hover:shadow-lg hover:shadow-amber-500/20 transition-all active:scale-95 group"
        >
          <Download :size="16" class="group-hover:translate-y-0.5 transition-transform" />
          <span>Export Cleaned</span>
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
        <div v-if="successMessage" class="absolute top-0 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md p-5 bg-amber-500 text-black rounded-3xl shadow-[0_20px_50px_-12px_rgba(245,158,11,0.4)] flex items-center justify-between gap-6">
          <div class="flex items-center gap-4">
             <div class="bg-black/10 p-2 rounded-xl">
               <Check :size="20" stroke-width="3" />
             </div>
             <p class="text-sm font-bold tracking-tight">{{ successMessage }}</p>
          </div>
          <button @click="successMessage = null" class="p-2 hover:bg-black/10 rounded-xl transition-colors"><X :size="18" /></button>
        </div>
      </transition>

      <div class="h-full flex flex-col lg:flex-row gap-8 overflow-hidden">
        <!-- Sidebar: Global Sanitization Controls -->
        <div class="w-full lg:w-96 flex flex-col gap-6 shrink-0 h-full overflow-hidden">
            <div v-if="data.length === 0" class="hidden"></div>
            <div v-else class="flex-1 bg-card border border-border/50 rounded-[2rem] p-6 shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-700">
               <div class="mb-6 shrink-0">
                  <h3 class="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2 mb-6">
                     <ShieldCheck :size="12" class="text-amber-500" />
                     Sanitization Suite
                  </h3>

                  <div class="space-y-2.5">
                      <button 
                       @click="trimWhitespace"
                       :disabled="processing"
                       class="w-full group flex items-center gap-4 p-4 bg-card hover:bg-amber-500/5 hover:border-amber-500/30 border border-border/80 rounded-2xl transition-all duration-300 text-left active:scale-[0.98] disabled:opacity-30 shadow-sm"
                     >
                        <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 shadow-inner group-hover:rotate-6 shrink-0">
                           <Scissors :size="16" stroke-width="2.5" />
                        </div>
                        <div class="flex-1 min-w-0">
                           <div class="text-[11px] font-black uppercase tracking-[0.1em] text-foreground">Trim Whitespace</div>
                           <div class="text-[9px] font-bold text-muted-foreground/40 mt-0.5 truncate uppercase">Strip spaces</div>
                        </div>
                     </button>

                      <button 
                       @click="removeEmptyRows"
                       :disabled="processing"
                       class="w-full group flex items-center gap-4 p-4 bg-card hover:bg-rose-500/5 hover:border-rose-500/30 border border-border/80 rounded-2xl transition-all duration-300 text-left active:scale-[0.98] disabled:opacity-30 shadow-sm"
                     >
                        <div class="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all duration-300 shadow-inner group-hover:-rotate-6 shrink-0">
                           <Trash2 :size="16" stroke-width="2.5" />
                        </div>
                        <div class="flex-1 min-w-0">
                           <div class="text-[11px] font-black uppercase tracking-[0.1em] text-foreground">Purge Nulls</div>
                           <div class="text-[9px] font-bold text-muted-foreground/40 mt-0.5 truncate uppercase">Eliminate noise</div>
                        </div>
                     </button>

                      <button 
                        @click="removeDuplicates"
                        :disabled="processing"
                        class="w-full group flex items-center gap-4 p-4 bg-card hover:bg-blue-500/5 hover:border-blue-500/30 border border-border/80 rounded-2xl transition-all duration-300 text-left active:scale-[0.98] disabled:opacity-30 shadow-sm"
                      >
                         <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 shadow-inner group-hover:scale-110 shrink-0">
                            <CopyX :size="16" stroke-width="2.5" />
                         </div>
                         <div class="flex-1 min-w-0">
                            <div class="text-[11px] font-black uppercase tracking-[0.1em] text-foreground">Deduplicate</div>
                            <div class="text-[9px] font-bold text-muted-foreground/40 mt-0.5 truncate uppercase">Filter unique</div>
                         </div>
                      </button>

                      <div class="p-4 bg-muted/20 border border-border/50 rounded-2xl space-y-3">
                         <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                               <Check :size="14" stroke-width="3" />
                            </div>
                            <span class="text-[10px] font-black uppercase tracking-widest text-foreground">Fill Empties</span>
                         </div>
                         <div class="flex gap-2">
                            <input 
                              v-model="fillValueInput"
                              type="text" 
                              placeholder="Value..."
                              class="flex-1 min-w-0 bg-background border border-border/50 rounded-xl px-3 py-2 text-[10px] font-bold outline-none focus:border-amber-500/50"
                            />
                            <button 
                              @click="fillEmptyValues"
                              :disabled="processing"
                              class="px-3 bg-emerald-500 text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:shadow-lg transition-all active:scale-90 disabled:opacity-30"
                            >Fill</button>
                         </div>
                      </div>
                   </div>
               </div>

              <!-- Metrics Analysis -->
              <div class="flex-1 overflow-y-auto pr-2 -mr-2 scrollbar-none space-y-6">
                 <div class="p-6 bg-muted/20 border border-border/50 rounded-3xl space-y-4">
                    <h4 class="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Operation Impact</h4>
                    
                    <div class="space-y-3">
                       <div class="flex items-center justify-between">
                          <span class="text-[10px] font-bold text-muted-foreground">Original Records</span>
                          <span class="text-[10px] font-black font-mono tracking-tighter">{{ data.length + cleaningStats.purged + cleaningStats.deduplicated }}</span>
                       </div>
                       <div class="flex items-center justify-between">
                          <span class="text-[10px] font-bold text-amber-500">Trimmed Cells</span>
                          <span class="text-[10px] font-black font-mono tracking-tighter">{{ cleaningStats.trimmed }}</span>
                       </div>
                       <div class="flex items-center justify-between">
                          <span class="text-[10px] font-bold text-rose-500">Purged Rows</span>
                          <span class="text-[10px] font-black font-mono tracking-tighter">{{ cleaningStats.purged }}</span>
                       </div>
                       <div class="flex items-center justify-between border-t border-border/50 pt-3 mt-3">
                          <span class="text-[10px] font-black uppercase">Current Total</span>
                          <span class="text-xs font-black font-mono tracking-tighter">{{ data.length.toLocaleString() }}</span>
                       </div>
                    </div>
                 </div>

                 <div class="p-6 bg-amber-500/5 border border-amber-500/10 rounded-3xl flex items-center gap-4 group/h">
                    <div class="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover/h:animate-spin">
                       <Zap :size="14" />
                    </div>
                    <p class="text-[10px] font-bold text-amber-600 uppercase tracking-widest leading-relaxed">Local Buffer Execution</p>
                 </div>
              </div>
           </div>
        </div>

        <!-- Content Area -->
        <div class="flex-1 overflow-hidden relative">
          <!-- Premium Loading -->
          <div v-if="loading" class="absolute inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-card rounded-[2.5rem]">
            <div class="relative p-8 bg-background border border-border/50 rounded-[2.5rem] shadow-2xl">
              <Loader2 class="animate-spin text-amber-500" :size="64" stroke-width="3" />
            </div>
            <h4 class="text-2xl font-black uppercase tracking-tight">Booting Engine...</h4>
          </div>

          <div v-else-if="data.length === 0" class="h-full flex flex-col items-center justify-center py-4 w-full">
              <div class="text-center space-y-2 mb-6">
                 <h3 class="text-3xl font-black tracking-tight">Polish your datasets.</h3>
                 <p class="text-muted-foreground text-xs font-medium max-w-sm mx-auto leading-relaxed opacity-60">
                   Automatically repair common data issues like whitespace, duplicates, and noise.
                 </p>
              </div>
              <FileUploader @files-selected="handleFile" class="w-full max-w-2xl" />
          </div>

          <!-- Table Container -->
          <div v-else class="h-full flex flex-col animate-in fade-in duration-700 overflow-hidden bg-card border border-border/50 rounded-[2.5rem] shadow-2xl p-2 relative">
             <DataTable 
               :headers="headers" 
               :data="data" 
             />
             
             <!-- Active Processing Overlay -->
             <transition name="fade">
                <div v-if="processing" class="absolute inset-0 z-40 bg-card/60 backdrop-blur-md flex flex-col items-center justify-center gap-6">
                   <div class="relative">
                      <div class="absolute inset-0 bg-amber-500/20 rounded-full blur-2xl animate-pulse"></div>
                      <div class="relative w-16 h-16 rounded-2xl bg-background border border-border/50 flex items-center justify-center shadow-xl">
                         <Loader2 class="animate-spin text-amber-500" :size="32" stroke-width="3" />
                      </div>
                   </div>
                   <div class="text-center">
                      <div class="text-sm font-black uppercase tracking-widest text-foreground">Scrubbing Buffer</div>
                      <div class="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">Applying heuristic filters</div>
                   </div>
                </div>
             </transition>
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

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>


