<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import { Table, Loader2, X, Shield, Cpu, Zap, ArrowLeft } from 'lucide-vue-next';
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
  <div class="max-w-[1600px] mx-auto h-[calc(100vh-8rem)] flex flex-col p-4 md:p-6 lg:p-10">
    <!-- Premium Header Section -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
      <div class="space-y-4 max-w-2xl">
        <router-link to="/" class="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-primary/80 transition-all mb-2">
          <ArrowLeft :size="14" class="group-hover:-translate-x-1 transition-transform" />
          Back to Toolkit
        </router-link>
        
        <div class="flex items-center gap-6">
          <div class="p-4 bg-blue-500/10 text-blue-500 rounded-[2rem] shadow-inner ring-1 ring-blue-500/20">
            <Table :size="40" stroke-width="2.5" />
          </div>
          <div>
            <h2 class="text-4xl md:text-5xl font-black tracking-tighter text-foreground mb-2">
              Data <span class="text-blue-500">Viewer</span>
            </h2>
            <p class="text-muted-foreground text-lg font-medium leading-relaxed">
              Industrial-grade CSV processing. 100% Client-side. Zero latency.
            </p>
          </div>
        </div>
      </div>

      <div v-if="data.length > 0" class="flex items-center gap-4 animate-in fade-in slide-in-from-right-8 duration-700">
        <div class="flex flex-col items-end px-6 py-3 bg-card/40 border border-border/50 rounded-2xl shadow-sm">
          <span class="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Mounted Records</span>
          <span class="text-xl font-black text-foreground">{{ data.length.toLocaleString() }}</span>
        </div>
        
        <button 
          @click="reset" 
          class="flex items-center gap-3 px-8 py-4 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-2xl transition-all duration-300 font-bold shadow-sm active:scale-95 group"
        >
          <X :size="20" class="group-hover:rotate-90 transition-transform duration-500" />
          <span>Eject File</span>
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
      <div class="flex-1 h-full bg-card/98 dark:bg-card/95 border border-border/50 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col relative">
        
        <!-- Premium Loading -->
        <div v-if="loading" class="absolute inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-card/80 backdrop-blur-2xl">
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
        <div v-else-if="data.length === 0" class="h-full overflow-y-auto overflow-x-hidden">
          <div class="max-w-4xl mx-auto py-20 px-8 flex flex-col h-full">
            <div class="text-center space-y-4 mb-12">
               <div class="inline-flex px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                 Ready for processing
               </div>
               <h3 class="text-5xl font-black tracking-tighter">Your data sandbox.</h3>
               <p class="text-muted-foreground text-xl font-medium max-w-lg mx-auto">
                 Drop any CSV or Excel file to get a high-performance interactive view.
               </p>
            </div>

            <FileUploader 
              @files-selected="handleFile" 
              class="min-h-[400px]"
            />
            
            <div class="mt-20 grid grid-cols-1 md:grid-cols-3 gap-10">
              <div class="p-8 rounded-3xl bg-muted/20 border border-border/50 space-y-4 hover:bg-muted/30 transition-colors">
                <div class="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Shield :size="24" />
                </div>
                <h5 class="text-lg font-bold tracking-tight">Zero Cloud</h5>
                <p class="text-sm text-muted-foreground leading-relaxed">Files never leave your hardware. Everything happens 100% locally in memory.</p>
              </div>
              
              <div class="p-8 rounded-3xl bg-muted/20 border border-border/50 space-y-4 hover:bg-muted/30 transition-colors">
                <div class="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Cpu :size="24" />
                </div>
                <h5 class="text-lg font-bold tracking-tight">V8 Optimized</h5>
                <p class="text-sm text-muted-foreground leading-relaxed">Optimized JavaScript engine processing for smooth scrolling on 1M+ rows.</p>
              </div>
              
              <div class="p-8 rounded-3xl bg-muted/20 border border-border/50 space-y-4 hover:bg-muted/30 transition-colors">
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

