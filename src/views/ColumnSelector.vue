<script setup lang="ts">
import { ref, computed } from 'vue';
import Papa from 'papaparse';
import { Columns, Download, X, Loader2, ArrowUp, ArrowDown, GripVertical, Check, RefreshCw } from 'lucide-vue-next';
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
    // Initialize column states from the first row or detected headers
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
    const temp = columnStates.value[index];
    const prev = columnStates.value[index - 1];
    if (temp && prev) {
      columnStates.value[index] = prev;
      columnStates.value[index - 1] = temp;
    }
  } else if (direction === 'down' && index < columnStates.value.length - 1) {
    const temp = columnStates.value[index];
    const next = columnStates.value[index + 1];
    if (temp && next) {
      columnStates.value[index] = next;
      columnStates.value[index + 1] = temp;
    }
  }
}

function toggleColumn(index: number) {
  const col = columnStates.value[index];
  if (col) {
    col.visible = !col.visible;
  }
}

function selectAll() {
  columnStates.value.forEach(c => c.visible = true);
}

function selectNone() {
  columnStates.value.forEach(c => c.visible = false);
}

function resetOrder() {
  // A simple way to reset is re-parse or just re-sort by original id if we kept track.
  // For now, let's just re-parse logic-ish, but since we modified the array, we might want to store original index.
  // Simpler: Just allow user to drag manually. Or re-upload.
  if (!file.value) return;
  handleFile(file.value);
}

function downloadNewCsv() {
  if (!rawData.value || rawData.value.length === 0) return;
  
  processing.value = true;
  
  setTimeout(() => {
    try {
      // Filter data to only include selected columns in the correct order
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
  <div class="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col p-4 md:p-6 lg:p-8">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
      <div class="space-y-1">
        <router-link to="/" class="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider hover:gap-3 transition-all mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          All Tools
        </router-link>
        <h2 class="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3">
          <span class="p-2.5 bg-pink-500/10 text-pink-500 rounded-2xl shadow-inner"><Columns :size="32" /></span>
          Column Selector
        </h2>
        <p class="text-muted-foreground text-lg max-w-xl">
          Pick, reorder, and refine your data structure effortlessly.
        </p>
      </div>

      <div v-if="rawData.length > 0" class="flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
        <button 
          @click="downloadNewCsv" 
          :disabled="processing || activeHeaders.length === 0"
          class="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
        >
          <Loader2 v-if="processing" :size="18" class="animate-spin" />
          <Download v-else :size="18" />
          <span>Export CSV</span>
        </button>

        <button 
          @click="closeTool" 
          class="flex items-center gap-2 px-5 py-2.5 bg-card hover:bg-muted text-foreground border border-border rounded-xl transition-all shadow-sm group"
        >
          <X :size="18" class="text-muted-foreground group-hover:text-red-500" />
          <span class="font-semibold text-sm">Clear</span>
        </button>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="flex-1 min-h-0 flex flex-col relative">
      <div v-if="error" class="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md p-4 bg-red-500 text-white rounded-2xl shadow-xl flex items-center justify-between">
        <div class="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p class="text-sm font-medium">{{ error }}</p>
        </div>
          <button @click="error = null" class="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg"><X :size="16" /></button>
        </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-hidden">
        <div v-if="loading" class="h-full flex flex-col items-center justify-center p-12 bg-card/60 backdrop-blur-md rounded-3xl border border-border/50">
          <Loader2 class="animate-spin text-primary mb-4" :size="48" />
          <p class="font-bold">Analyzing document...</p>
        </div>

        <div v-else-if="!file" class="h-full max-w-2xl mx-auto flex flex-col justify-center">
          <FileUploader @files-selected="handleFile" class="min-h-[350px]" />
          <p class="mt-6 text-center text-xs text-muted-foreground uppercase tracking-[0.2em] font-bold opacity-40">Your data stays safe in your browser</p>
        </div>

        <!-- Tool UI -->
        <div v-else class="h-full flex flex-col md:flex-row gap-6 animate-in fade-in zoom-in-95 duration-500">
          <!-- Sidebar: Column Controls (Sticky-like via flex) -->
          <div class="w-full md:w-80 flex flex-col glass-card border border-border/50 rounded-3xl bg-card overflow-hidden shadow-xl shadow-primary/5">
            <div class="p-5 border-b border-border bg-muted/30">
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-bold text-sm tracking-tight flex items-center gap-2">
                  <Columns :size="16" class="text-primary"/>
                  Active Schema
                </h3>
                <span class="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase">{{ activeHeaders.length }} / {{ columnStates.length }}</span>
              </div>
              <div class="flex gap-2">
                <button @click="selectAll" class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors flex-1 py-1 rounded-md bg-muted/50 border border-border/50">Show All</button>
                <button @click="selectNone" class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors flex-1 py-1 rounded-md bg-muted/50 border border-border/50">Hide All</button>
                <button @click="resetOrder" class="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all" title="Reset Original Order"><RefreshCw :size="12"/></button>
              </div>
            </div>
            
            <div class="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin scrollbar-thumb-border">
              <div 
                v-for="(col, index) in columnStates" 
                :key="col.id"
                class="group flex items-center gap-3 p-2.5 rounded-xl border border-transparent hover:border-border/50 hover:bg-muted/50 transition-all duration-200"
                :class="{ 'opacity-50 grayscale-[0.5]': !col.visible }"
              >
                <div class="cursor-grab text-muted-foreground/30 hover:text-foreground transition-colors">
                  <GripVertical :size="16" />
                </div>
                
                <button 
                  @click="toggleColumn(index)"
                  class="flex-1 text-left text-sm truncate flex items-center gap-3 group/item"
                >
                  <div 
                    class="w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-300"
                    :class="col.visible ? 'bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/30' : 'border-muted-foreground/30'"
                  >
                    <Check v-if="col.visible" :size="12" stroke-width="4" />
                  </div>
                  <span class="font-semibold transition-colors truncate" :class="col.visible ? 'text-foreground' : 'text-muted-foreground font-medium'">{{ col.label }}</span>
                </button>

                <div class="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="moveColumn(index, 'up')" :disabled="index === 0" class="p-1 hover:bg-background border border-border/50 rounded-lg shadow-sm disabled:opacity-30"><ArrowUp :size="12" /></button>
                  <button @click="moveColumn(index, 'down')" :disabled="index === columnStates.length - 1" class="p-1 hover:bg-background border border-border/50 rounded-lg shadow-sm disabled:opacity-30"><ArrowDown :size="12" /></button>
                </div>
              </div>
            </div>
          </div>

          <!-- Preview Area -->
          <div class="flex-1 min-w-0 glass-card rounded-3xl border border-border/50 shadow-2xl shadow-primary/5 overflow-hidden flex flex-col">
             <DataTable 
               v-if="activeHeaders.length > 0"
              :headers="activeHeaders" 
              :data="rawData" 
            />
            <div v-else class="h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/20 p-8 text-center animate-pulse">
              <div class="w-16 h-16 rounded-3xl bg-muted/50 flex items-center justify-center mb-6">
                <Columns :size="32" class="opacity-20" />
              </div>
              <h4 class="text-xl font-bold text-foreground/40">Canvas is Empty</h4>
              <p class="max-w-[200px] text-sm font-medium mt-2">Select at least one column from the sidebar to visualize your data.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 10px;
}
</style>
