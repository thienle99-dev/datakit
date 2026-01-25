<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
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

function convertToCsv() {
  if (!data.value || data.value.length === 0) return;
  
  processing.value = true;
  try {
    // Unparse to CSV
    const csv = Papa.unparse(data.value);
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const originalName = file.value?.name || 'converted';
    const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
    link.setAttribute('download', `${baseName}_converted.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    successMessage.value = 'Converted to CSV successfully!';
  } catch (err: any) {
    error.value = 'Conversion failed: ' + err.message;
  } finally {
    processing.value = false;
  }
}

function convertToExcel() {
  if (!data.value || data.value.length === 0) return;
  
  processing.value = true;
  try {
    // Convert to Worksheet
    const ws = XLSX.utils.json_to_sheet(data.value);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    
    // Download
    const originalName = file.value?.name || 'converted';
    const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
    
    XLSX.writeFile(wb, `${baseName}_converted.xlsx`);
    
    successMessage.value = 'Converted to Excel successfully!';
  } catch (err: any) {
    error.value = 'Conversion failed: ' + err.message;
  } finally {
    processing.value = false;
  }
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
          <span>📗</span> CSV ↔ Excel Converter
        </h2>
        <p class="text-text-muted">Convert between CSV and Excel formats instantly.</p>
      </div>
      
      <div v-if="data.length > 0" class="flex gap-2">
         <button 
          v-if="file?.name.endsWith('.xlsx') || file?.name.endsWith('.xls')"
          @click="convertToCsv" 
          :disabled="processing"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {{ processing ? 'Converting...' : 'Export as CSV' }}
        </button>
        
        <button 
          v-else
          @click="convertToExcel" 
          :disabled="processing"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {{ processing ? 'Converting...' : 'Export as Excel' }}
        </button>

        <button 
          @click="reset" 
          class="text-sm text-text-muted hover:text-red-500 px-3 py-1 rounded hover:bg-red-50 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
    
    <!-- Success/Error Messages -->
    <div v-if="error" class="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
      {{ error }}
    </div>
    <div v-if="successMessage" class="mb-4 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 flex justify-between items-center">
      <span>{{ successMessage }}</span>
      <button @click="successMessage = null" class="text-green-700 hover:text-green-900">&times;</button>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-hidden">
      <!-- Loading State -->
      <div v-if="loading" class="h-full flex items-center justify-center text-primary">
        <svg class="animate-spin -ml-1 mr-3 h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Parsing file...</span>
      </div>

      <!-- Upload State -->
      <FileUploader 
        v-else-if="data.length === 0" 
        @files-selected="handleFile" 
        class="h-[400px]"
      />
      
      <!-- Preview State (Reusable DataTable) -->
      <div v-else class="h-full flex flex-col">
        <div class="mb-2 text-sm text-text-muted">
          Previewing: <span class="font-semibold">{{ file?.name }}</span>
        </div>
        <DataTable 
          :headers="headers" 
          :data="data" 
        />
      </div>
    </div>
  </div>
</template>
