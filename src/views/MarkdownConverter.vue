<script setup lang="ts">
import { ref, shallowRef, computed } from 'vue';
import { FileText, Loader2, X, Copy, Check } from 'lucide-vue-next';
import FileUploader from '../components/shared/FileUploader.vue';
import DataTable from '../components/shared/DataTable.vue';
import { parseFile } from '../utils/fileParser';

const file = shallowRef<File | null>(null);
const headers = ref<string[]>([]);
const data = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const copied = ref(false);

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

const markdownOutput = computed(() => {
  if (!data.value.length || !headers.value.length) return '';

  const headerRow = '| ' + headers.value.join(' | ') + ' |';
  const separatorRow = '| ' + headers.value.map(() => '---').join(' | ') + ' |';
  const bodyRows = data.value.map(row => {
    return '| ' + headers.value.map(h => String(row[h] || '').replace(/\|/g, '\\|')).join(' | ') + ' |';
  }).join('\n');

  return `${headerRow}\n${separatorRow}\n${bodyRows}`;
});

function copyToClipboard() {
  if (!markdownOutput.value) return;
  navigator.clipboard.writeText(markdownOutput.value).then(() => {
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  });
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
          <span class="text-primary"><FileText :size="32" /></span> CSV → Markdown
        </h2>
        <p class="text-text-muted">Convert CSV/Excel to Markdown table format.</p>
      </div>
      
      <div v-if="data.length > 0" class="flex gap-2">
        <button 
          @click="copyToClipboard" 
          class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Check v-if="copied" :size="18" />
          <Copy v-else :size="18" />
          {{ copied ? 'Copied!' : 'Copy Markdown' }}
        </button>

        <button 
          @click="reset" 
          class="text-sm text-text-muted hover:text-red-500 px-3 py-1 rounded hover:bg-red-50 transition-colors flex items-center gap-1"
        >
          <X :size="16" /> Close
        </button>
      </div>
    </div>
    
    <!-- Error Messages -->
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
      
      <div v-else class="h-full flex flex-col gap-4">
          <div class="bg-surface border border-border rounded-lg p-4 overflow-auto shrink-0 max-h-60 shadow-inner group relative">
            <button 
                @click="copyToClipboard"
                class="absolute right-4 top-4 p-2 bg-background border border-border rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
            >
                <Copy :size="14" />
            </button>
            <pre class="text-xs font-mono">{{ markdownOutput.slice(0, 1000) }}{{ markdownOutput.length > 1000 ? '...' : '' }}</pre>
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
