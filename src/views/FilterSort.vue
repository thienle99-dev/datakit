<script setup lang="ts">
import { ref, computed } from 'vue';
import Papa from 'papaparse';
import { ListFilter, Download, X, Loader2, Plus, Trash2, ArrowUpDown } from 'lucide-vue-next';
import FileUploader from '../components/shared/FileUploader.vue';
import DataTable from '../components/shared/DataTable.vue';
import { parseFile } from '../utils/fileParser';

interface FilterRule {
  id: string;
  column: string;
  operator: string;
  value: string;
}

interface SortRule {
  column: string;
  direction: 'asc' | 'desc';
}

const file = ref<File | null>(null);
const rawData = ref<any[]>([]);
const headers = ref<string[]>([]);
const loading = ref(false);
const processing = ref(false);
const error = ref<string | null>(null);

// State for Filters and Sorts
const filters = ref<FilterRule[]>([]);
const sortRule = ref<SortRule>({ column: '', direction: 'asc' });

const operators = [
  { label: 'Contains', value: 'contains' },
  { label: 'Equals', value: 'equals' },
  { label: 'Starts with', value: 'starts_with' },
  { label: 'Ends with', value: 'ends_with' },
  { label: 'Not equal', value: 'not_equal' },
  { label: 'Greater than', value: 'gt' },
  { label: 'Less than', value: 'lt' },
];

async function handleFile(selectedFile: File) {
  file.value = selectedFile;
  loading.value = true;
  error.value = null;
  rawData.value = [];
  headers.value = [];
  filters.value = [];

  try {
    const result = await parseFile(selectedFile);
    rawData.value = result.data;
    headers.value = result.headers;
    // Default sort column
    if (result.headers.length > 0 && result.headers[0]) {
      sortRule.value.column = result.headers[0];
    }
  } catch (err: any) {
    console.error(err);
    error.value = 'Failed to parse file: ' + (err.message || err);
  } finally {
    loading.value = false;
  }
}

function addFilter() {
  if (headers.value.length === 0) return;
  const firstHeader = headers.value[0];
  if (!firstHeader) return;
  
  filters.value.push({
    id: Date.now().toString(),
    column: firstHeader,
    operator: 'contains',
    value: ''
  });
}

function removeFilter(index: number) {
  filters.value.splice(index, 1);
}

// Computed property to show preview of processed data
const processedData = computed(() => {
  if (rawData.value.length === 0) return [];
  
  let result = [...rawData.value];

  // 1. Apply Filters
  if (filters.value.length > 0) {
    result = result.filter(row => {
      // AND logic: all filters must pass
      return filters.value.every(filter => {
        const val = String(row[filter.column] || '').toLowerCase();
        const criteria = filter.value.toLowerCase();
        
        // Simple number conversion for numeric comparisons
        const numVal = parseFloat(row[filter.column]);
        const numCriteria = parseFloat(filter.value);
        const isNumeric = !isNaN(numVal) && !isNaN(numCriteria);

        switch (filter.operator) {
          case 'contains': return val.includes(criteria);
          case 'equals': return val === criteria;
          case 'not_equal': return val !== criteria;
          case 'starts_with': return val.startsWith(criteria);
          case 'ends_with': return val.endsWith(criteria);
          case 'gt': return isNumeric ? numVal > numCriteria : val > criteria;
          case 'lt': return isNumeric ? numVal < numCriteria : val < criteria;
          default: return true;
        }
      });
    });
  }

  // 2. Apply Sort
  if (sortRule.value.column) {
    const col = sortRule.value.column;
    const dir = sortRule.value.direction === 'asc' ? 1 : -1;
    
    result.sort((a, b) => {
      const valA = a[col];
      const valB = b[col];

      // Numeric sort check
      const numA = parseFloat(valA);
      const numB = parseFloat(valB);

      if (!isNaN(numA) && !isNaN(numB)) {
        return (numA - numB) * dir;
      }

      // String sort
      const strA = String(valA || '').toLowerCase();
      const strB = String(valB || '').toLowerCase();
      if (strA < strB) return -1 * dir;
      if (strA > strB) return 1 * dir;
      return 0;
    });
  }

  return result;
});

function downloadProcessed() {
  if (processedData.value.length === 0) return;
  processing.value = true;
  
  setTimeout(() => {
    try {
      const csv = Papa.unparse(processedData.value);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const originalName = file.value?.name || 'data';
      const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
      link.setAttribute('download', `${baseName}_filtered.csv`);
      
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

function resetTool() {
  file.value = null;
  rawData.value = [];
  filters.value = [];
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
          <span class="p-2.5 bg-orange-500/10 text-orange-500 rounded-2xl shadow-inner"><ListFilter :size="32" /></span>
          Filter & Sort
        </h2>
        <p class="text-muted-foreground text-lg max-w-xl">
          Apply powerful conditions and sorting to refine your datasets.
        </p>
      </div>

      <div v-if="rawData.length > 0" class="flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
        <button 
          @click="downloadProcessed" 
          :disabled="processing || processedData.length === 0"
          class="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
        >
          <Loader2 v-if="processing" :size="18" class="animate-spin" />
          <Download v-else :size="18" />
          <span>Export Result</span>
        </button>

        <button 
          @click="resetTool" 
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
          
          <!-- Controls Sidebar -->
          <div class="w-full md:w-80 flex flex-col glass-card border border-border/50 rounded-3xl bg-card overflow-hidden shadow-xl shadow-primary/5">
            <!-- Sort Section -->
            <div class="p-5 border-b border-border bg-muted/20">
               <h3 class="font-bold text-sm tracking-tight flex items-center gap-2 mb-4">
                  <ArrowUpDown :size="16" class="text-primary"/> Sorting
               </h3>
               <div class="space-y-3">
                 <select v-model="sortRule.column" class="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm">
                   <option v-for="h in headers" :key="h" :value="h">{{ h }}</option>
                 </select>
                 
                 <div class="flex items-center gap-1.5 p-1 bg-muted/50 rounded-xl border border-border/50">
                    <button 
                      @click="sortRule.direction = 'asc'"
                      class="flex-1 text-[10px] font-bold uppercase tracking-wider py-2 rounded-lg transition-all"
                      :class="sortRule.direction === 'asc' ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'hover:bg-muted text-muted-foreground'"
                    >
                      Ascending
                    </button>
                    <button 
                      @click="sortRule.direction = 'desc'"
                      class="flex-1 text-[10px] font-bold uppercase tracking-wider py-2 rounded-lg transition-all"
                      :class="sortRule.direction === 'desc' ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'hover:bg-muted text-muted-foreground'"
                    >
                      Descending
                    </button>
                 </div>
               </div>
            </div>

            <!-- Filter Section Header -->
            <div class="p-5 border-b border-border bg-muted/10 flex justify-between items-center">
               <h3 class="font-bold text-sm tracking-tight flex items-center gap-2">
                  <ListFilter :size="16" class="text-primary"/> Filters
                  <span class="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold ml-1">{{ filters.length }}</span>
               </h3>
               <button @click="addFilter" class="p-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-all shadow-sm shadow-primary/20 active:scale-90">
                  <Plus :size="14" stroke-width="3" />
               </button>
            </div>
            
            <div class="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-border">
               <div v-if="filters.length === 0" class="flex flex-col items-center justify-center py-12 text-center text-muted-foreground opacity-40">
                  <ListFilter :size="32" class="mb-2" />
                  <p class="text-xs font-bold uppercase tracking-wider">No active filters</p>
               </div>

               <transition-group name="filter-list">
                 <div 
                    v-for="(filter, index) in filters" 
                    :key="filter.id"
                    class="p-4 bg-muted/30 rounded-2xl border border-border/50 space-y-3 relative group/filter"
                 >
                    <div class="flex justify-between items-center">
                       <span class="text-[10px] uppercase tracking-widest font-extrabold text-muted-foreground/60">Stage {{ index + 1}}</span>
                       <button @click="removeFilter(index)" class="text-muted-foreground hover:text-red-500 p-1 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 :size="14" />
                       </button>
                    </div>

                    <div class="grid grid-cols-1 gap-2">
                      <select v-model="filter.column" class="w-full bg-background border border-border/50 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary transition-all">
                         <option v-for="h in headers" :key="h" :value="h">{{ h }}</option>
                      </select>

                      <select v-model="filter.operator" class="w-full bg-background border border-border/50 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary font-medium">
                         <option v-for="op in operators" :key="op.value" :value="op.value">{{ op.label }}</option>
                      </select>

                      <input 
                        type="text" 
                        v-model="filter.value" 
                        placeholder="Value..."
                        class="w-full bg-background border border-border/50 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary transition-all placeholder:text-muted-foreground/30"
                      />
                    </div>
                 </div>
               </transition-group>
            </div>
            
            <!-- Summary Footer -->
            <div class="p-4 border-t border-border bg-muted/10">
               <div class="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <span>Matched Records</span>
                  <span class="text-foreground">{{ processedData.length.toLocaleString() }} / {{ rawData.length.toLocaleString() }}</span>
               </div>
               <div class="mt-2 w-full bg-muted rounded-full h-1 overflow-hidden">
                 <div class="bg-primary h-full transition-all duration-700" :style="{ width: `${(processedData.length / rawData.length) * 100}%` }"></div>
               </div>
            </div>
          </div>

          <!-- Preview Area -->
          <div class="flex-1 min-w-0 glass-card rounded-3xl border border-border/50 shadow-2xl shadow-primary/5 overflow-hidden flex flex-col">
             <DataTable 
               v-if="processedData.length > 0"
              :headers="headers" 
              :data="processedData" 
            />
            <div v-else class="h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/20 p-8 text-center animate-pulse">
              <div class="w-16 h-16 rounded-3xl bg-muted/50 flex items-center justify-center mb-6">
                <Search :size="32" class="opacity-20" />
              </div>
              <h4 class="text-xl font-bold text-foreground/40">Zero Matches</h4>
              <p class="max-w-[200px] text-sm font-medium mt-2">Adjust your filters to discover records within your dataset.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-list-enter-active,
.filter-list-leave-active {
  transition: all 0.3s ease-out;
}
.filter-list-enter-from,
.filter-list-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

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
