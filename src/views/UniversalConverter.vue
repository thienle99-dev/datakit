<script setup lang="ts">
import { ref, shallowRef, computed } from 'vue';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { 
  ArrowRightLeft, 
  Loader2, 
  X, 
  Download, 
  FileJson, 
  Table, 
  Check,
  Copy,
  FileType
} from 'lucide-vue-next';
import FileUploader from '../components/shared/FileUploader.vue';
import DataTable from '../components/shared/DataTable.vue';
import { parseFile } from '../utils/fileParser';

const file = shallowRef<File | null>(null);
const headers = ref<string[]>([]);
const data = ref<any[]>([]);
const loading = ref(false);
const processing = ref(false);
const error = ref<string | null>(null);
const copied = ref(false);

const outputFormat = ref<'csv' | 'json' | 'xlsx' | 'md' | 'sql'>('json');

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
    
    // Auto-detect best output format
    if (selectedFile.name.endsWith('.json')) {
        outputFormat.value = 'csv';
    } else {
        outputFormat.value = 'json';
    }
  } catch (err: any) {
    console.error(err);
    error.value = 'Failed to parse file: ' + (err.message || err);
  } finally {
    loading.value = false;
  }
}

// Formatters
const markdownOutput = computed(() => {
  if (!data.value.length || !headers.value.length) return '';
  const headerRow = '| ' + headers.value.join(' | ') + ' |';
  const separatorRow = '| ' + headers.value.map(() => '---').join(' | ') + ' |';
  const bodyRows = data.value.slice(0, 100).map(row => {
    return '| ' + headers.value.map(h => String(row[h] || '').replace(/\|/g, '\\|')).join(' | ') + ' |';
  }).join('\n');
  return `${headerRow}\n${separatorRow}\n${bodyRows}${data.value.length > 100 ? '\n\n... (truncated for preview)' : ''}`;
});

const sqlOutput = computed(() => {
  if (!data.value.length || !headers.value.length) return '';
  const tableName = file.value?.name.replace(/[^a-zA-Z0-9]/g, '_').split('.')[0] || 'table_name';
  const cols = headers.value.map(h => `\`${h}\``).join(', ');
  
  const values = data.value.slice(0, 50).map(row => {
    const rowVals = headers.value.map(h => {
      const val = row[h];
      if (val === null || val === undefined) return 'NULL';
      if (typeof val === 'number') return val;
      return `'${String(val).replace(/'/g, "''")}'`;
    }).join(', ');
    return `(${rowVals})`;
  }).join(',\n  ');

  return `INSERT INTO \`${tableName}\` (${cols}) VALUES\n  ${values};${data.value.length > 50 ? '\n\n-- ... (truncated for preview)' : ''}`;
});

const jsonOutput = computed(() => {
  return JSON.stringify(data.value.slice(0, 10), null, 2) + (data.value.length > 10 ? '\n\n... (truncated for preview)' : '');
});

// Respective handlers
function downloadFile() {
  if (!data.value.length) return;
  processing.value = true;
  
  setTimeout(() => {
    try {
      const originalName = file.value?.name || 'data';
      const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
      
      let blob: Blob;
      let filename: string;

      switch(outputFormat.value) {
        case 'csv':
          const csv = Papa.unparse(data.value);
          blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          filename = `${baseName}.csv`;
          break;
        case 'json':
          blob = new Blob([JSON.stringify(data.value, null, 2)], { type: 'application/json' });
          filename = `${baseName}.json`;
          break;
        case 'md':
          // Re-calculate full MD for download
          const fullMd = '| ' + headers.value.join(' | ') + ' |\n| ' + 
            headers.value.map(() => '---').join(' | ') + ' |\n' + 
            data.value.map(row => '| ' + headers.value.map(h => String(row[h] || '').replace(/\|/g, '\\|')).join(' | ') + ' |').join('\n');
          blob = new Blob([fullMd], { type: 'text/markdown' });
          filename = `${baseName}.md`;
          break;
        case 'sql':
          // Re-calculate full SQL
          const tableName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
          const cols = headers.value.map(h => `\`${h}\``).join(', ');
          const sql = `INSERT INTO \`${tableName}\` (${cols}) VALUES\n  ` + 
            data.value.map(row => '(' + headers.value.map(h => {
                const val = row[h];
                return (val === null || val === undefined) ? 'NULL' : (typeof val === 'number' ? val : `'${String(val).replace(/'/g, "''")}'`);
            }).join(', ') + ')').join(',\n  ') + ';';
          blob = new Blob([sql], { type: 'text/plain' });
          filename = `${baseName}.sql`;
          break;
        case 'xlsx':
          const wb = XLSX.utils.book_new();
          const ws = XLSX.utils.json_to_sheet(data.value);
          XLSX.utils.book_append_sheet(wb, ws, 'Data');
          const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          blob = new Blob([wbout], { type: 'application/octet-stream' });
          filename = `${baseName}.xlsx`;
          break;
      }

      const url = URL.createObjectURL(blob!);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename!);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      error.value = 'Export failed: ' + err.message;
    } finally {
      processing.value = false;
    }
  }, 100);
}

function copyPreview() {
    let text = '';
    if (outputFormat.value === 'md') text = markdownOutput.value;
    else if (outputFormat.value === 'sql') text = sqlOutput.value;
    else if (outputFormat.value === 'json') text = jsonOutput.value;
    else if (outputFormat.value === 'csv') text = Papa.unparse(data.value.slice(0, 10));

    navigator.clipboard.writeText(text).then(() => {
        copied.value = true;
        setTimeout(() => copied.value = false, 2000);
    });
}

function resetTool() {
  file.value = null;
  data.value = [];
  headers.value = [];
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
          <span class="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-2xl shadow-inner"><ArrowRightLeft :size="32" /></span>
          Universal Converter
        </h2>
        <p class="text-muted-foreground text-lg max-w-xl">
          Convert between CSV, JSON, Excel, SQL, and Markdown in seconds.
        </p>
      </div>

      <div v-if="data.length > 0" class="flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
        <button 
          @click="downloadFile" 
          :disabled="processing"
          class="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
        >
          <Loader2 v-if="processing" :size="18" class="animate-spin" />
          <Download v-else :size="18" />
          <span>Download {{ outputFormat.toUpperCase() }}</span>
        </button>

        <button 
          @click="resetTool" 
          class="flex items-center gap-2 px-5 py-2.5 bg-card hover:bg-muted text-foreground border border-border rounded-xl transition-all shadow-sm group"
        >
          <X :size="18" class="text-muted-foreground group-hover:text-red-500 font-bold" />
          <span class="font-semibold text-sm">Clear</span>
        </button>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="flex-1 min-h-0 flex flex-col relative">
      <!-- Content Area -->
      <div class="flex-1 overflow-hidden">
        <div v-if="loading" class="h-full flex flex-col items-center justify-center p-12 bg-card/60 backdrop-blur-md rounded-3xl border border-border/50">
          <Loader2 class="animate-spin text-primary mb-4" :size="48" />
          <p class="font-bold">Converting data structure...</p>
        </div>

        <div v-else-if="!file" class="h-full max-w-2xl mx-auto flex flex-col justify-center">
          <FileUploader @files-selected="handleFile" class="min-h-[350px]" />
          <div class="mt-8 flex justify-center gap-8 opacity-40 grayscale group-hover:grayscale-0 transition-all">
             <div class="flex items-center gap-2 font-bold text-xs"><Table :size="14"/> CSV</div>
             <div class="flex items-center gap-2 font-bold text-xs"><FileJson :size="14"/> JSON</div>
             <div class="flex items-center gap-2 font-bold text-xs"><FileType :size="14"/> XLSX</div>
          </div>
        </div>

        <!-- Converter UI -->
        <div v-else class="h-full flex flex-col md:flex-row gap-6 animate-in fade-in zoom-in-95 duration-500">
          
          <!-- Sidebar: Format Options -->
          <div class="w-full md:w-80 flex flex-col glass-card border border-border/50 rounded-3xl bg-card overflow-hidden shadow-xl shadow-primary/5">
            <div class="p-5 border-b border-border bg-muted/20">
               <h3 class="font-bold text-sm tracking-tight flex items-center gap-2 mb-4">
                  Target Format
               </h3>
               <div class="grid grid-cols-1 gap-2">
                  <button 
                    v-for="fmt in ['json', 'csv', 'xlsx', 'sql', 'md']" 
                    :key="fmt"
                    @click="outputFormat = fmt as any"
                    class="flex items-center justify-between p-3 rounded-2xl border transition-all group/btn"
                    :class="outputFormat === fmt ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 translate-x-1' : 'bg-background border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'"
                  >
                    <div class="flex items-center gap-3">
                       <div class="p-2 rounded-lg bg-current opacity-10 group-hover/btn:opacity-20 transition-opacity"></div>
                       <span class="font-bold uppercase tracking-wider text-xs">{{ fmt }}</span>
                    </div>
                    <Check v-if="outputFormat === fmt" :size="14" stroke-width="3" />
                  </button>
               </div>
            </div>

            <div class="p-5 flex-1 flex flex-col">
               <h4 class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Live Preview</h4>
               <div class="flex-1 bg-muted/30 rounded-2xl p-4 overflow-hidden font-mono text-[10px] relative border border-border/50 group/preview">
                  <button 
                    @click="copyPreview"
                    class="absolute top-2 right-2 p-2 bg-background border border-border rounded-xl opacity-0 group-hover/preview:opacity-100 transition-opacity hover:bg-muted"
                  >
                    <Check v-if="copied" :size="12" class="text-green-500" />
                    <Copy v-else :size="12" />
                  </button>
                  <pre class="whitespace-pre-wrap break-all opacity-70">{{ 
                    outputFormat === 'json' ? jsonOutput : 
                    outputFormat === 'sql' ? sqlOutput : 
                    outputFormat === 'md' ? markdownOutput : 
                    outputFormat === 'csv' ? Papa.unparse(data.slice(0, 5)) : 
                    'Binary Excel format' 
                  }}</pre>
               </div>
            </div>
          </div>

          <!-- Table Area -->
          <div class="flex-1 min-w-0 glass-card rounded-3xl border border-border/50 shadow-2xl shadow-primary/5 overflow-hidden flex flex-col">
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
