<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import { Table, Loader2, X, Shield, Cpu, Zap, ArrowLeft } from 'lucide-vue-next';
import FileUploader from '../components/shared/FileUploader.vue';
import DataTable from '../components/shared/DataTable.vue';
import { parseFile } from '../utils/fileParser';

const file = shallowRef<File | null>(null);
const headers = ref<string[]>([]);
const data = ref<any[]>([]);
const sheets = ref<string[]>([]);
const currentSheet = ref('');
const loading = ref(false);
const error = ref<string | null>(null);

async function handleFile(selectedFile: File, sheetName?: string) {
  file.value = selectedFile;
  loading.value = true;
  error.value = null;
  
  if (!sheetName) {
    headers.value = [];
    data.value = [];
    sheets.value = [];
  }

  try {
    const result = await parseFile(selectedFile, sheetName);
    headers.value = result.headers;
    data.value = result.data;
    if (result.sheets) {
      sheets.value = result.sheets;
      if (!currentSheet.value) currentSheet.value = result.sheets[0] || '';
    }
  } catch (err: any) {
    console.error(err);
    error.value = 'Failed to parse file: ' + (err.message || err);
  } finally {
    loading.value = false;
  }
}

async function handleSheetChange() {
  if (file.value) {
    await handleFile(file.value, currentSheet.value);
  }
}

function reset() {
  file.value = null;
  data.value = [];
  headers.value = [];
  sheets.value = [];
  currentSheet.value = '';
}
</script>

<template>
  <div class="w-full flex flex-col h-[calc(100vh-5rem)]">
    <!-- Premium Header Section -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 shrink-0 relative z-20">
      <div class="flex items-center gap-4">
        <router-link to="/" class="p-2.5 bg-card border border-border/50 rounded-xl text-muted-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm group">
          <ArrowLeft :size="18" class="group-hover:-translate-x-0.5 transition-transform" />
        </router-link>
        
        <div class="h-10 w-px bg-border/30 hidden lg:block"></div>

        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center ring-1 ring-blue-500/20">
            <Table :size="20" stroke-width="2.5" />
          </div>
          <div>
            <h2 class="text-lg md:text-xl font-black tracking-tight text-foreground">
              Data <span class="text-blue-500">Viewer</span>
            </h2>
          </div>
        </div>
      </div>

      <div v-if="data.length > 0" class="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-700">
        <div v-if="sheets.length > 1" class="flex items-center gap-2 px-3 py-1.5 bg-muted/50 border border-border/50 rounded-xl">
          <span class="text-[9px] font-black uppercase text-muted-foreground/40">Sheet</span>
          <select 
            v-model="currentSheet" 
            @change="handleSheetChange"
            class="bg-transparent text-xs font-bold outline-none cursor-pointer"
          >
            <option v-for="s in sheets" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>

        <div class="flex items-baseline gap-2 px-4 py-2 bg-blue-500/5 border border-blue-500/10 rounded-xl">
          <span class="text-xl font-black text-blue-500">{{ data.length.toLocaleString() }}</span>
          <span class="text-[9px] font-black uppercase tracking-widest text-blue-500/40">Records</span>
        </div>
        
        <button 
          @click="reset" 
          class="p-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-xl transition-all duration-300 active:scale-95 group"
        >
          <X :size="18" class="group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="flex-1 min-h-0 flex flex-col relative">
      <!-- Error Notification -->
      <transition name="slide-up">
        <div v-if="error" class="absolute top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md p-5 bg-rose-500 text-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(244,63,94,0.4)] flex items-center justify-between gap-6 pointer-events-auto">
          <div class="flex items-center gap-4">
             <div class="bg-white/20 p-2 rounded-xl">
               <X :size="20" />
             </div>
             <p class="text-sm font-bold tracking-tight">{{ error }}</p>
          </div>
          <button @click="error = null" class="p-2 hover:bg-white/20 rounded-xl transition-colors"><X :size="18" /></button>
        </div>
      </transition>

      <!-- Content Area -->
      <div class="flex-1 h-full bg-card border border-border/50 rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col relative">
        
        <!-- Premium Loading -->
        <div v-if="loading" class="absolute inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-card">
          <div class="relative">
            <div class="absolute inset-0 bg-blue-500/40 rounded-full blur-3xl animate-pulse"></div>
            <div class="relative p-8 bg-background border border-border/50 rounded-[2.5rem] shadow-2xl">
              <Loader2 class="animate-spin text-blue-500" :size="64" stroke-width="3" />
            </div>
          </div>
          <div class="text-center space-y-2">
            <h4 class="text-2xl font-black tracking-tight uppercase">Quantizing Logic</h4>
            <p class="text-muted-foreground font-bold tracking-widest text-[11px] uppercase opacity-60">Building virtual DOM for {{ file?.name }}</p>
          </div>
        </div>

        <!-- Hero Search / File Uploader -->
        <div v-else-if="data.length === 0" class="h-full flex flex-col items-center justify-center p-4">
          <div class="max-w-3xl w-full">
            <div class="text-center space-y-3 mb-8">
               <div class="inline-flex px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[9px] font-black uppercase tracking-[0.2em] mb-2">
                 Ready for processing
               </div>
               <h3 class="text-2xl font-black tracking-tight">Your data sandbox.</h3>
               <p class="text-muted-foreground text-xs font-medium max-w-md mx-auto opacity-60">
                 Drop any file to get a high-performance interactive view.
               </p>
            </div>

            <FileUploader 
              @files-selected="handleFile" 
              class="min-h-[400px]"
            />
            
            <div class="mt-20 grid grid-cols-1 md:grid-cols-3 gap-10">
              <div class="p-6 rounded-2xl bg-muted/20 border border-border/50 space-y-4 hover:bg-muted/30 transition-colors">
                <div class="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Shield :size="24" />
                </div>
                <h5 class="text-lg font-bold tracking-tight">Zero Cloud</h5>
                <p class="text-sm text-muted-foreground leading-relaxed">Files never leave your hardware. Everything happens 100% locally in memory.</p>
              </div>
              
              <div class="p-6 rounded-2xl bg-muted/20 border border-border/50 space-y-4 hover:bg-muted/30 transition-colors">
                <div class="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Cpu :size="24" />
                </div>
                <h5 class="text-lg font-bold tracking-tight">V8 Optimized</h5>
                <p class="text-sm text-muted-foreground leading-relaxed">Optimized JavaScript engine processing for smooth scrolling on 1M+ rows.</p>
              </div>
              
              <div class="p-6 rounded-2xl bg-muted/20 border border-border/50 space-y-4 hover:bg-muted/30 transition-colors">
                <div class="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Zap :size="24" />
                </div>
                <h5 class="text-lg font-bold tracking-tight">Instant Sort</h5>
                <p class="text-sm text-muted-foreground leading-relaxed">Parallelized sorting and filtering logic that won't lock up your browser UI.</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- High-Performance Data Table -->
        <div v-else class="h-full flex flex-col animate-in fade-in duration-1000">
           <div class="p-2 flex-1">
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
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translate(-50%, 40px);
  opacity: 0;
  filter: blur(10px);
}

/* Custom scrollbar for better look */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: 10px;
}
</style>

