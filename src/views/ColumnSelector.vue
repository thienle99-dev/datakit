<script setup lang="ts">
import { ref, computed } from 'vue';
import Papa from 'papaparse';
import { 
  Download, 
  X, 
  Loader2, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  RefreshCw,
  ArrowLeft,
  Grip,
  Layout,
  MousePointer2
} from 'lucide-vue-next';
import FileUploader from '../components/shared/FileUploader.vue';
import DataTable from '../components/shared/DataTable.vue';
import { parseFile } from '../utils/fileParser';

interface ColumnState {
  id: string;
  label: string;
  visible: boolean;
}

const file = ref<File | null>(null);
const rawData = ref<any[]>([]);
const columnStates = ref<ColumnState[]>([]);
const loading = ref(false);
const processing = ref(false);
const error = ref<string | null>(null);

const activeHeaders = computed(() => {
  return columnStates.value
    .filter(c => c.visible)
    .map(c => c.label);
});

async function handleFile(selectedFile: File) {
  file.value = selectedFile;
  loading.value = true;
  error.value = null;
  rawData.value = [];
  columnStates.value = [];

  try {
    const result = await parseFile(selectedFile);
    rawData.value = result.data;
    columnStates.value = result.headers.map((h, i) => ({
      id: `col-${i}`,
      label: h,
      visible: true
    }));
  } catch (err: any) {
    console.error(err);
    error.value = 'Failed to parse file: ' + (err.message || err);
  } finally {
    loading.value = false;
  }
}

function moveColumn(index: number, direction: 'up' | 'down') {
  if (direction === 'up' && index > 0) {
    const current = columnStates.value[index];
    const prev = columnStates.value[index - 1];
    if (current && prev) {
        columnStates.value[index] = prev;
        columnStates.value[index - 1] = current;
    }
  } else if (direction === 'down' && index < columnStates.value.length - 1) {
    const current = columnStates.value[index];
    const next = columnStates.value[index + 1];
    if (current && next) {
        columnStates.value[index] = next;
        columnStates.value[index + 1] = current;
    }
  }
}

function toggleColumn(index: number) {
  const col = columnStates.value[index];
  if (col) col.visible = !col.visible;
}

function selectAll() {
  columnStates.value.forEach(c => c.visible = true);
}

function selectNone() {
  columnStates.value.forEach(c => c.visible = false);
}

function resetOrder() {
  if (!file.value) return;
  handleFile(file.value);
}

function downloadNewCsv() {
  if (!rawData.value || rawData.value.length === 0) return;
  processing.value = true;
  
  setTimeout(() => {
    try {
      const orderedFields = activeHeaders.value;
      const newData = rawData.value.map(row => {
        const newRow: any = {};
        orderedFields.forEach(field => {
          newRow[field] = row[field];
        });
        return newRow;
      });

      const csv = Papa.unparse({
        fields: orderedFields,
        data: newData
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const originalName = file.value?.name || 'modified_data';
      const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
      link.setAttribute('download', `${baseName}_columns.csv`);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      error.value = 'Failed to generate CSV: ' + err.message;
    } finally {
      processing.value = false;
    }
  }, 100);
}

function closeTool() {
  file.value = null;
  rawData.value = [];
  columnStates.value = [];
  error.value = null;
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
          <div class="p-4 bg-pink-500/10 text-pink-500 rounded-[2rem] shadow-inner ring-1 ring-pink-500/20">
            <Layout :size="40" stroke-width="2.5" />
          </div>
          <div>
            <h2 class="text-4xl md:text-5xl font-black tracking-tighter text-foreground mb-2">
              Column <span class="text-pink-500">Selector</span>
            </h2>
            <p class="text-muted-foreground text-lg font-medium leading-relaxed">
              Curate and reorder your dataset schema with atomic precision.
            </p>
          </div>
        </div>
      </div>

      <div v-if="rawData.length > 0" class="flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-right-8 duration-700">
        <button 
          @click="downloadNewCsv" 
          :disabled="processing || activeHeaders.length === 0"
          class="flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-[11px] hover:shadow-[0_20px_40px_-12px_rgba(var(--primary),0.3)] transition-all active:scale-95 disabled:opacity-50 group"
        >
          <Loader2 v-if="processing" :size="18" class="animate-spin" />
          <Download v-else :size="18" class="group-hover:translate-y-0.5 transition-transform" />
          <span>Export Schema</span>
        </button>

        <button 
          @click="closeTool" 
          class="flex items-center gap-3 px-6 py-4 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-2xl transition-all duration-300 font-bold active:scale-95 group"
        >
          <X :size="20" class="group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="flex-1 min-h-0 flex flex-col relative overflow-hidden">
      <!-- Content Area -->
      <div class="flex-1 overflow-hidden relative">
        <div v-if="loading" class="absolute inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-card rounded-[2.5rem]">
          <div class="relative">
            <div class="absolute inset-0 bg-pink-500/40 rounded-full blur-3xl animate-pulse"></div>
            <div class="relative p-8 bg-background border border-border/50 rounded-[2.5rem] shadow-2xl">
              <Loader2 class="animate-spin text-pink-500" :size="64" stroke-width="3" />
            </div>
          </div>
          <div class="text-center space-y-2">
            <h4 class="text-2xl font-black tracking-tight uppercase">Quantizing Schema</h4>
            <p class="text-muted-foreground font-bold tracking-widest text-[11px] uppercase opacity-60">Building virtual column mapping for {{ file?.name }}</p>
          </div>
        </div>

        <div v-else-if="!file" class="h-full max-w-[1000px] mx-auto flex flex-col justify-center">
            <div class="text-center space-y-4 mb-12">
               <div class="inline-flex px-4 py-1.5 rounded-full bg-pink-500/10 text-pink-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                 Surgical precision
               </div>
               <h3 class="text-5xl font-black tracking-tighter">Your data, your rules.</h3>
               <p class="text-muted-foreground text-xl font-medium max-w-lg mx-auto leading-relaxed">
                 Drop any table-based file to surgically include, exclude, or rearrange columns for the perfect output.
               </p>
            </div>
            <FileUploader @files-selected="handleFile" class="min-h-[400px]" />
        </div>

        <!-- Tool UI -->
        <div v-else class="h-full flex flex-col lg:flex-row gap-8 animate-in fade-in duration-700 overflow-hidden">
          <!-- Sidebar: Atomic Controls -->
          <div class="w-full lg:w-96 flex flex-col gap-6 shrink-0 h-full overflow-hidden">
            <div class="flex-1 bg-card border border-border/50 rounded-[2.5rem] p-8 shadow-2xl flex flex-col overflow-hidden">
              <div class="mb-8">
                 <div class="flex items-center justify-between mb-8">
                    <h3 class="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                      <Layout :size="14" class="text-pink-500" />
                      Schema Logic
                    </h3>
                    <div class="px-3 py-1 bg-pink-500/10 text-pink-500 rounded-full text-[10px] font-black tracking-widest whitespace-nowrap">
                       {{ activeHeaders.length }} / {{ columnStates.length }} ACTIVE
                    </div>
                 </div>
                 <div class="grid grid-cols-3 gap-2">
                    <button @click="selectAll" class="text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all p-3 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50">Show All</button>
                    <button @click="selectNone" class="text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all p-3 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50">Hide All</button>
                    <button @click="resetOrder" class="flex items-center justify-center p-3 rounded-2xl bg-muted/30 border border-border/50 text-muted-foreground hover:text-primary hover:bg-muted/50 transition-all"><RefreshCw :size="14"/></button>
                 </div>
              </div>
              
              <div class="flex-1 overflow-y-auto pr-2 -mr-2 space-y-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                <div 
                  v-for="(col, index) in columnStates" 
                  :key="col.id"
                  class="group flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300"
                  :class="[
                    col.visible ? 'bg-primary/5 border-primary shadow-inner scale-[1.01]' : 'bg-background border-border/50 opacity-40 hover:opacity-100 grayscale hover:grayscale-0'
                  ]"
                >
                  <div class="cursor-grab text-muted-foreground/30 group-hover:text-primary/40 transition-colors">
                    <Grip :size="14" />
                  </div>
                  
                  <button 
                    @click="toggleColumn(index)"
                    class="flex-1 text-left flex items-center gap-4 overflow-hidden"
                  >
                    <div 
                      class="shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300"
                      :class="col.visible ? 'bg-primary border-primary text-primary-foreground shadow-sm' : 'border-muted-foreground/20'"
                    >
                      <Check v-if="col.visible" :size="12" stroke-width="4" />
                    </div>
                    <div class="flex flex-col min-w-0">
                       <span class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-0.5">Index {{ index.toString().padStart(2, '0') }}</span>
                       <span class="font-black text-sm truncate uppercase tracking-tight" :class="col.visible ? 'text-foreground' : 'text-muted-foreground'">{{ col.label }}</span>
                    </div>
                  </button>

                  <div class="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0">
                    <button @click="moveColumn(index, 'up')" :disabled="index === 0" class="p-1.5 hover:bg-background border border-border/50 rounded-lg shadow-sm disabled:opacity-30 bg-card"><ArrowUp :size="10" /></button>
                    <button @click="moveColumn(index, 'down')" :disabled="index === columnStates.length - 1" class="p-1.5 hover:bg-background border border-border/50 rounded-lg shadow-sm disabled:opacity-30 bg-card"><ArrowDown :size="10" /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Preview Area -->
          <div class="flex-1 min-w-0 bg-card border border-border/50 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden p-2">
             <DataTable 
               v-if="activeHeaders.length > 0"
              :headers="activeHeaders" 
              :data="rawData" 
            />
            <div v-else class="h-full flex flex-col items-center justify-center text-muted-foreground p-12 text-center animate-in fade-in zoom-in-95 duration-700">
              <div class="w-24 h-24 rounded-[3rem] bg-muted/40 flex items-center justify-center mb-8 shadow-inner ring-1 ring-border/50">
                <MousePointer2 :size="32" class="opacity-20 translate-x-1 translate-y-1" />
              </div>
              <h4 class="text-3xl font-black tracking-tighter text-foreground mb-4">No columns selected.</h4>
              <p class="max-w-[280px] text-lg font-medium text-muted-foreground leading-relaxed">Use the logic panel on the left to activate data points you wish to preserve.</p>
              <button @click="selectAll" class="mt-8 px-8 py-3 bg-pink-500/10 text-pink-500 border border-pink-500/20 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-pink-500 hover:text-white transition-all active:scale-95">Auto-Select All</button>
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
</style>
