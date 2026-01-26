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
  newName: string; // New: tracking user's rename
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
      newName: h,
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
      const orderedFields = columnStates.value.filter(c => c.visible);
      const newData = rawData.value.map(row => {
        const newRow: any = {};
        orderedFields.forEach(col => {
          newRow[col.newName] = row[col.label];
        });
        return newRow;
      });

      const csv = Papa.unparse({
        fields: orderedFields.map(c => c.newName),
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
  <div class="w-full h-[calc(100vh-6rem)] flex flex-col p-2 md:p-4">
    <!-- Premium Header Section -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 shrink-0 relative z-20">
      <div class="flex items-center gap-4">
        <router-link to="/" class="p-2.5 bg-card border border-border/50 rounded-xl text-muted-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm group">
          <ArrowLeft :size="18" class="group-hover:-translate-x-0.5 transition-transform" />
        </router-link>
        
        <div class="h-10 w-px bg-border/30 hidden lg:block"></div>

        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-pink-500/10 text-pink-500 rounded-xl flex items-center justify-center ring-1 ring-pink-500/20">
            <Layout :size="20" stroke-width="2.5" />
          </div>
          <div>
            <h2 class="text-xl md:text-2xl font-black tracking-tight text-foreground">
              Column <span class="text-pink-500">Selector</span>
            </h2>
          </div>
        </div>
      </div>

      <div v-if="rawData.length > 0" class="flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-700">
        <button 
          @click="downloadNewCsv" 
          :disabled="processing || activeHeaders.length === 0"
          class="flex items-center gap-2.5 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-black uppercase tracking-widest text-[10px] hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 group"
        >
          <Loader2 v-if="processing" :size="16" class="animate-spin" />
          <Download v-else :size="16" class="group-hover:translate-y-0.5 transition-transform" />
          <span>Export Schema</span>
        </button>

        <button 
          @click="closeTool" 
          class="p-3 bg-card hover:bg-muted text-foreground border border-border/50 rounded-xl transition-all duration-300 active:scale-95 group"
        >
          <X :size="18" class="group-hover:rotate-90 transition-transform duration-500" />
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

        <div v-else-if="!file" class="h-full flex flex-col items-center justify-center py-4">
            <div class="text-center space-y-2 mb-6">
               <h3 class="text-3xl font-black tracking-tight">Your data, your rules.</h3>
               <p class="text-muted-foreground text-sm font-medium max-w-sm mx-auto leading-relaxed opacity-60">
                 Include, exclude, or rearrange columns for the perfect output.
               </p>
            </div>
            <FileUploader @files-selected="handleFile" class="w-full max-w-2xl" />
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
                  class="group flex items-center gap-3 p-3 rounded-2xl border-2 transition-all duration-300"
                  :class="[
                    col.visible ? 'bg-primary/5 border-primary shadow-inner scale-[1.01]' : 'bg-background border-border/50 opacity-40 hover:opacity-100 grayscale hover:grayscale-0'
                  ]"
                >
                  <div class="cursor-grab text-muted-foreground/30 group-hover:text-primary/40 transition-colors">
                    <Grip :size="12" />
                  </div>
                  
                  <button 
                    @click="toggleColumn(index)"
                    class="flex-1 text-left flex items-center gap-3 overflow-hidden"
                  >
                    <div 
                      class="shrink-0 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-300"
                      :class="col.visible ? 'bg-primary border-primary text-primary-foreground shadow-sm' : 'border-muted-foreground/20'"
                    >
                      <Check v-if="col.visible" :size="10" stroke-width="4" />
                    </div>
                    <div class="flex flex-col min-w-0 flex-1">
                       <span class="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 mb-0.5">Original: {{ col.label }}</span>
                       <input 
                         v-model="col.newName" 
                         @click.stop
                         type="text"
                         class="bg-transparent border-none p-0 text-xs font-black uppercase tracking-tight focus:ring-0 focus:outline-none w-full"
                         :class="col.visible ? 'text-foreground' : 'text-muted-foreground'"
                         placeholder="New name..."
                       />
                    </div>
                  </button>

                  <div class="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button @click="moveColumn(index, 'up')" :disabled="index === 0" class="p-1 hover:bg-background border border-border/50 rounded-lg shadow-sm disabled:opacity-30 bg-card"><ArrowUp :size="8" /></button>
                    <button @click="moveColumn(index, 'down')" :disabled="index === columnStates.length - 1" class="p-1 hover:bg-background border border-border/50 rounded-lg shadow-sm disabled:opacity-30 bg-card"><ArrowDown :size="8" /></button>
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
