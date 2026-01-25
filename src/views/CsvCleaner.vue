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
  <div class="h-full flex flex-col">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold flex items-center gap-2">
          <span class="text-primary"><Sparkles :size="32" /></span> CSV Cleaner
        </h2>
        <p class="text-text-muted">Clean and normalize your data.</p>
      </div>
      
      <div v-if="data.length > 0" class="flex gap-2">
         <button 
          @click="downloadCleaned" 
          class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download :size="18" /> Download CSV
        </button>

        <button 
          @click="reset" 
          class="text-sm text-text-muted hover:text-red-500 px-3 py-1 rounded hover:bg-red-50 transition-colors flex items-center gap-1"
        >
          <X :size="16" /> Close
        </button>
      </div>
    </div>
    
    <!-- Tools Panel -->
    <div v-if="data.length > 0" class="mb-4 p-4 bg-surface border border-border rounded-xl flex flex-wrap gap-4 items-center">
      <span class="font-semibold text-sm uppercase tracking-wide text-text-muted">Quick Actions:</span>
      
      <button 
        @click="trimWhitespace"
        :disabled="processing"
        class="flex items-center gap-2 px-3 py-1.5 bg-secondary/10 text-secondary hover:bg-secondary/20 rounded-md text-sm transition-colors disabled:opacity-50"
      >
        <Scissors :size="16" /> Trim Whitespace
      </button>
      
      <button 
        @click="removeEmptyRows"
        :disabled="processing"
        class="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm transition-colors disabled:opacity-50"
      >
        <Trash2 :size="16" /> Remove Empty Rows
      </button>

      <button 
        @click="removeDuplicates"
        :disabled="processing"
        class="flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-md text-sm transition-colors disabled:opacity-50"
      >
        <CopyX :size="16" /> Remove Duplicates
      </button>
      
      <div v-if="processing" class="text-sm text-primary animate-pulse ml-auto">
        Processing...
      </div>
    </div>
    
    <!-- Success/Error Messages -->
    <div v-if="error" class="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
      {{ error }}
    </div>
    <div v-if="successMessage" class="mb-4 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 flex justify-between items-center">
      <span>{{ successMessage }}</span>
      <button @click="successMessage = null" class="text-green-700 hover:text-green-900"><X :size="16" /></button>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-hidden">
      <!-- Loading State -->
      <div v-if="loading" class="h-full flex items-center justify-center text-primary">
        <Loader2 class="animate-spin -ml-1 mr-3 h-8 w-8" />
        <span>Parsing file...</span>
      </div>

      <!-- Upload State -->
      <FileUploader 
        v-else-if="data.length === 0" 
        @files-selected="handleFile" 
        class="h-[400px]"
      />
      
      <!-- Data Table State -->
      <DataTable 
        v-else 
        :headers="headers" 
        :data="data" 
      />
    </div>
  </div>
</template>
