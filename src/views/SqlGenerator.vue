<script setup lang="ts">
import { ref, shallowRef, computed } from 'vue';
import { Database, Loader2, X, Download, Copy } from 'lucide-vue-next';
import FileUploader from '../components/shared/FileUploader.vue';
import DataTable from '../components/shared/DataTable.vue';
import { parseFile } from '../utils/fileParser';

const file = shallowRef<File | null>(null);
const headers = ref<string[]>([]);
const data = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const tableName = ref('my_table');

async function handleFile(selectedFile: File) {
  file.value = selectedFile;
  loading.value = true;
  error.value = null;
  headers.value = [];
  data.value = [];
  
  // Default table name from filename
  const fname = selectedFile.name;
  tableName.value = fname.substring(0, fname.lastIndexOf('.'))
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .toLowerCase();

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

const sqlPreview = computed(() => {
  if (!data.value.length) return '';
  return generateSql(data.value.slice(0, 5));
});

function generateSql(rows: any[]) {
    if (!rows.length) return '';
    
    // Simple INSERT generation
    const cols = headers.value.map(h => `"${h}"`).join(', ');
    
    const statements = rows.map(row => {
        const values = headers.value.map(h => {
            const val = row[h];
            if (val === null || val === undefined) return 'NULL';
            if (typeof val === 'number') return val;
            // Escape single quotes
            return `'${String(val).replace(/'/g, "''")}'`;
        }).join(', ');
        return `INSERT INTO "${tableName.value}" (${cols}) VALUES (${values});`;
    });
    
    return statements.join('\n');
}

function downloadSql() {
  if (!data.value.length) return;
  
  const sql = generateSql(data.value);
  
  const blob = new Blob([sql], { type: 'application/sql' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  link.setAttribute('download', `${tableName.value}.sql`);
  
  document.body.appendChild(link);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function copySql() {
    if (!data.value.length) return;
    const sql = generateSql(data.value);
    try {
        await navigator.clipboard.writeText(sql);
        // We can reuse successMessage if we expose it, but SqlGenerator doesn't have it yet.
        // Let's add simple feedback state
        error.value = null;
        alert('SQL copied to clipboard!'); // Simple fallback or use a toast if available.
        // Better: add a temporary success message state like in CsvCleaner
    } catch (err) {
        console.error('Failed to copy', err);
    }
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
          <span class="text-primary"><Database :size="32" /></span> CSV → SQL
        </h2>
        <p class="text-text-muted">Generate SQL INSERT statements from your data.</p>
      </div>
      
      <div v-if="data.length > 0" class="flex gap-2">
        <button 
          @click="downloadSql" 
          class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download :size="18" /> Download SQL
        </button>

        <button 
          @click="reset" 
          class="text-sm text-text-muted hover:text-red-500 px-3 py-1 rounded hover:bg-red-50 transition-colors flex items-center gap-1"
        >
          <X :size="16" /> Close
        </button>
      </div>
    </div>
    
    <div v-if="data.length > 0" class="mb-4 p-4 bg-surface border border-border rounded-xl flex items-center gap-4">
        <label class="text-sm font-semibold">Table Name:</label>
        <input 
            v-model="tableName"
            type="text" 
            class="px-3 py-1.5 bg-background border border-border rounded-md text-sm focus:outline-none focus:border-primary"
            placeholder="enter_table_name"
        />
        
        <button 
          @click="copySql"
          class="flex items-center gap-2 px-3 py-1.5 bg-secondary/10 text-secondary hover:bg-secondary/20 rounded-md text-sm transition-colors ml-auto"
        >
            <Copy :size="16" /> Copy to Clipboard
        </button>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="error" class="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
      {{ error }}
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-hidden flex flex-col">
      <div v-if="loading" class="h-full flex items-center justify-center text-primary">
        <Loader2 class="animate-spin -ml-1 mr-3 h-8 w-8" />
        <span>Parsing file...</span>
      </div>

      <FileUploader 
        v-else-if="data.length === 0" 
        @files-selected="handleFile" 
        class="h-[400px]"
      />
      
      <div v-else class="flex-1 flex flex-col overflow-hidden">
          <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 h-full overflow-hidden">
             <!-- Preview Data -->
             <div class="flex flex-col h-full overflow-hidden">
                 <h3 class="font-semibold mb-2 text-sm">Data Preview</h3>
                 <div class="flex-1 overflow-hidden">
                    <DataTable 
                        :headers="headers" 
                        :data="data" 
                    />
                 </div>
             </div>
             
             <!-- Preview SQL -->
             <div class="flex flex-col h-full overflow-hidden">
                 <h3 class="font-semibold mb-2 text-sm">SQL Preview (First 5 rows)</h3>
                 <div class="flex-1 bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto font-mono text-xs">
                     <pre>{{ sqlPreview }}</pre>
                 </div>
             </div>
          </div>
      </div>
    </div>
  </div>
</template>
