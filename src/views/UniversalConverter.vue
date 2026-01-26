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
  FileType,
  ArrowLeft,
  Sparkles,
  FileText,
  Database
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
  const bodyRows = data.value.slice(0, 50).map(row => {
    return '| ' + headers.value.map(h => String(row[h] || '').replace(/\|/g, '\\|')).join(' | ') + ' |';
  }).join('\n');
  return `${headerRow}\n${separatorRow}\n${bodyRows}${data.value.length > 50 ? '\n\n... (truncated for preview)' : ''}`;
});

const sqlOutput = computed(() => {
  if (!data.value.length || !headers.value.length) return '';
  const tableName = file.value?.name.replace(/[^a-zA-Z0-9]/g, '_').split('.')[0] || 'table_name';
  const cols = headers.value.map(h => `\`${h}\``).join(', ');
  
  const values = data.value.slice(0, 30).map(row => {
    const rowVals = headers.value.map(h => {
      const val = row[h];
      if (val === null || val === undefined) return 'NULL';
      if (typeof val === 'number') return val;
      return `'${String(val).replace(/'/g, "''")}'`;
    }).join(', ');
    return `(${rowVals})`;
  }).join(',\n  ');

  return `INSERT INTO \`${tableName}\` (${cols}) VALUES\n  ${values};${data.value.length > 30 ? '\n\n-- ... (truncated for preview)' : ''}`;
});

const jsonOutput = computed(() => {
  return JSON.stringify(data.value.slice(0, 8), null, 2) + (data.value.length > 8 ? '\n\n... (truncated for preview)' : '');
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
          const fullMd = '| ' + headers.value.join(' | ') + ' |\n| ' + 
            headers.value.map(() => '---').join(' | ') + ' |\n' + 
            data.value.map(row => '| ' + headers.value.map(h => String(row[h] || '').replace(/\|/g, '\\|')).join(' | ') + ' |').join('\n');
          blob = new Blob([fullMd], { type: 'text/markdown' });
          filename = `${baseName}.md`;
          break;
        case 'sql':
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

const formats = [
  { id: 'json', label: 'JSON Object', icon: FileJson, color: 'text-amber-500' },
  { id: 'csv', label: 'CSV File', icon: Table, color: 'text-blue-500' },
  { id: 'xlsx', label: 'Excel Sheet', icon: FileType, color: 'text-emerald-500' },
  { id: 'sql', label: 'SQL Inserts', icon: Database, color: 'text-indigo-500' },
  { id: 'md', label: 'Markdown Table', icon: FileText, color: 'text-slate-500' },
] as const;
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
          <div class="p-4 bg-emerald-500/10 text-emerald-500 rounded-[2rem] shadow-inner ring-1 ring-emerald-500/20">
            <ArrowRightLeft :size="40" stroke-width="2.5" />
          </div>
          <div>
            <h2 class="text-4xl md:text-5xl font-black tracking-tighter text-foreground mb-2">
              Universal <span class="text-emerald-500">Converter</span>
            </h2>
            <p class="text-muted-foreground text-lg font-medium leading-relaxed">
              Seamlessly bridge formats. CSV, JSON, Excel, SQL, and Markdown.
            </p>
          </div>
        </div>
      </div>

      <div v-if="data.length > 0" class="flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-right-8 duration-700">
        <button 
          @click="downloadFile" 
          :disabled="processing"
          class="flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-[11px] hover:shadow-[0_20px_40px_-12px_rgba(var(--primary),0.3)] transition-all active:scale-95 disabled:opacity-50 group"
        >
          <Loader2 v-if="processing" :size="18" class="animate-spin" />
          <Download v-else :size="18" class="group-hover:translate-y-0.5 transition-transform" />
          <span>Export {{ outputFormat }}</span>
        </button>

        <button 
          @click="resetTool" 
          class="flex items-center gap-3 px-6 py-4 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-2xl transition-all duration-300 font-bold active:scale-95 group"
        >
          <X :size="20" class="group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="flex-1 min-h-0 flex flex-col relative">
      <!-- Content Area -->
      <div class="flex-1 overflow-hidden relative">
        <div v-if="loading" class="absolute inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-card rounded-[2.5rem]">
          <div class="relative">
            <div class="absolute inset-0 bg-emerald-500/40 rounded-full blur-3xl animate-pulse"></div>
            <div class="relative p-8 bg-background border border-border/50 rounded-[2.5rem] shadow-2xl">
              <Loader2 class="animate-spin text-emerald-500" :size="64" stroke-width="3" />
            </div>
          </div>
          <div class="text-center space-y-2">
            <h4 class="text-2xl font-black tracking-tight uppercase">Restructuring Schema</h4>
            <p class="text-muted-foreground font-bold tracking-widest text-[11px] uppercase opacity-60">Optimizing {{ file?.name }} for conversion</p>
          </div>
        </div>

        <div v-else-if="!file" class="h-full max-w-[1000px] mx-auto flex flex-col">
          <div class="flex-1 flex flex-col justify-center">
            <div class="text-center space-y-4 mb-12">
               <div class="inline-flex px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                 Schema Agnostic
               </div>
               <h3 class="text-5xl font-black tracking-tighter">Bridge your datasets.</h3>
               <p class="text-muted-foreground text-xl font-medium max-w-lg mx-auto leading-relaxed">
                 The most versatile data converter in your pocket. Optimized for modern pipelines.
               </p>
            </div>

            <FileUploader @files-selected="handleFile" class="min-h-[400px]" />
            
            <div class="mt-20 grid grid-cols-5 gap-6 justify-center opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
               <div v-for="fmt in formats" :key="fmt.id" class="flex flex-col items-center gap-3">
                  <div class="p-4 bg-muted rounded-2xl border border-border/50">
                     <component :is="fmt.icon" :size="24" :class="fmt.color" />
                  </div>
                  <span class="text-[9px] font-black uppercase tracking-widest">{{ fmt.id }}</span>
               </div>
            </div>
          </div>
        </div>

        <!-- Converter UI -->
        <div v-else class="h-full flex flex-col lg:flex-row gap-8 animate-in fade-in duration-700">
          
          <!-- Sidebar: Target Configuration -->
          <div class="w-full lg:w-96 flex flex-col gap-6">
            <div class="flex-1 bg-card border border-border/50 rounded-[2.5rem] p-8 shadow-2xl flex flex-col">
              <div class="mb-8">
                 <h3 class="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2 mb-6">
                    <Sparkles :size="14" class="text-emerald-500" />
                    Target Output
                 </h3>
                 <div class="grid grid-cols-1 gap-2.5">
                    <button 
                      v-for="fmt in formats" 
                      :key="fmt.id"
                      @click="outputFormat = fmt.id as any"
                      class="flex items-center justify-between p-4 rounded-2xl border-2 transition-all group/btn"
                      :class="outputFormat === fmt.id ? 'bg-primary/5 border-primary text-primary shadow-inner scale-[1.02]' : 'bg-background border-border/50 hover:border-primary/30 text-muted-foreground hover:text-foreground'"
                    >
                      <div class="flex items-center gap-4">
                         <div class="p-2.5 rounded-xl bg-muted group-hover/btn:bg-background transition-colors" :class="outputFormat === fmt.id ? 'bg-primary/10' : ''">
                            <component :is="fmt.icon" :size="18" :class="outputFormat === fmt.id ? 'text-primary' : 'opacity-40'" />
                         </div>
                         <div class="flex flex-col items-start">
                           <span class="font-black uppercase tracking-widest text-[10px]">{{ fmt.id }}</span>
                           <span class="text-xs font-bold opacity-60 group-hover/btn:opacity-100 transition-opacity">{{ fmt.label }}</span>
                         </div>
                      </div>
                      <div v-if="outputFormat === fmt.id" class="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Check :size="12" stroke-width="4" />
                      </div>
                    </button>
                 </div>
              </div>

              <div class="flex-1 flex flex-col min-h-0">
                 <div class="flex items-center justify-between mb-4">
                    <h4 class="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Live Preview</h4>
                    <button 
                      @click="copyPreview"
                      class="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-xl hover:bg-muted transition-all active:scale-95"
                    >
                      <Check v-if="copied" :size="12" class="text-emerald-500" />
                      <Copy v-else :size="12" />
                      <span class="text-[9px] font-black uppercase tracking-widest">{{ copied ? 'Copied' : 'Copy' }}</span>
                    </button>
                 </div>
                 <div class="flex-1 bg-muted/40 rounded-3xl p-6 font-mono text-[11px] border border-border/50 overflow-hidden relative group/preview shadow-inner">
                    <pre class="h-full overflow-auto whitespace-pre-wrap break-all opacity-70 leading-relaxed scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">{{ 
                      outputFormat === 'json' ? jsonOutput : 
                      outputFormat === 'sql' ? sqlOutput : 
                      outputFormat === 'md' ? markdownOutput : 
                      outputFormat === 'csv' ? Papa.unparse(data.slice(0, 5)) : 
                      'Ready for Excel Export...' 
                    }}</pre>
                 </div>
              </div>
            </div>
          </div>

          <!-- Table Area -->
          <div class="flex-1 min-w-0 bg-card border border-border/50 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col p-2">
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

<style scoped>
/* Scrollbar polish */
.overflow-auto::-webkit-scrollbar {
  width: 4px;
}
.overflow-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-auto::-webkit-scrollbar-thumb {
  background: hsl(var(--border) / 0.5);
  border-radius: 10px;
}
</style>

