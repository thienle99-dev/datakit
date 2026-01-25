<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import { FileJson, Loader2, X, Download } from 'lucide-vue-next';
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

function downloadJson() {
  if (!data.value.length) return;
  
  const jsonStr = JSON.stringify(data.value, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  const originalName = file.value?.name || 'data';
  const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
  link.setAttribute('download', `${baseName}.json`);
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function reset() {
  file.value = null;
  data.value = [];
  headers.value = [];
  error.value = null;
}
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold flex items-center gap-2">
          <span class="text-primary"><FileJson :size="32" /></span> CSV → JSON
        </h2>
        <p class="text-text-muted">Convert CSV/Excel to JSON format.</p>
      </div>
      
      <div v-if="data.length > 0" class="flex gap-2">
        <button 
          @click="downloadJson" 
          class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download :size="18" /> Download JSON
        </button>

        <button 
          @click="reset" 
          class="text-sm text-text-muted hover:text-red-500 px-3 py-1 rounded hover:bg-red-50 transition-colors flex items-center gap-1"
        >
          <X :size="16" /> Close
        </button>
      </div>
    </div>
    
    <!-- Success/Error Messages -->
    <div v-if="error" class="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
      {{ error }}
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-hidden">
      <div v-if="loading" class="h-full flex items-center justify-center text-primary">
        <Loader2 class="animate-spin -ml-1 mr-3 h-8 w-8" />
        <span>Parsing file...</span>
      </div>

      <FileUploader 
        v-else-if="data.length === 0" 
        @files-selected="handleFile" 
        class="h-[400px]"
      />
      
      <div v-else class="h-full flex flex-col">
          <div class="mb-4 bg-surface border border-border rounded-lg p-4 overflow-auto max-h-60 font-mono text-xs shadow-inner">
            <pre>{{ data.slice(0, 3) }} ... ({{ data.length - 3 }} more items)</pre>
          </div>
          <div class="flex-1 overflow-hidden">
              <DataTable 
                :headers="headers" 
                :data="data" 
              />
          </div>
      </div>
    </div>
  </div>
</template>
