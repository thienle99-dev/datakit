<script setup lang="ts">
import { ref, computed } from 'vue';
import { Download, X, Loader2, ArrowLeft, EyeOff, Mail, Phone, Regex } from 'lucide-vue-next';
import Papa from 'papaparse';
import FileUploader from '../components/shared/FileUploader.vue';
import DataTable from '../components/shared/DataTable.vue';
import { parseFile } from '../utils/fileParser';

const EMAIL_REG = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REG = /(\+?[\d\s\-()]{10,})|(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/g;

type Pattern = 'email' | 'phone' | 'custom';

const file = ref<File | null>(null);
const headers = ref<string[]>([]);
const rawData = ref<any[]>([]);
const maskedData = ref<any[]>([]);
const selectedColumns = ref<string[]>([]);
const pattern = ref<Pattern>('email');
const customRegex = ref('\\d{4}[-\s]?\\d{4}[-\s]?\\d{4}'); // default: card-like
const replacement = ref('***');

const loading = ref(false);
const error = ref<string | null>(null);

async function handleFile(selectedFile: File) {
  file.value = selectedFile;
  loading.value = true;
  error.value = null;
  rawData.value = [];
  maskedData.value = [];

  try {
    const result = await parseFile(selectedFile);
    headers.value = result.headers;
    rawData.value = result.data;
    selectedColumns.value = [...result.headers];
    applyMask();
  } catch (e: any) {
    error.value = e?.message || 'Parse failed';
  } finally {
    loading.value = false;
  }
}

function maskValue(val: unknown): string {
  const s = val == null ? '' : String(val);
  let re: RegExp;
  try {
    if (pattern.value === 'email') re = EMAIL_REG;
    else if (pattern.value === 'phone') re = PHONE_REG;
    else re = new RegExp(customRegex.value, 'g');
  } catch {
    return s;
  }
  return s.replace(re, replacement.value);
}

function applyMask() {
  const cols = selectedColumns.value.length ? selectedColumns.value : headers.value;
  maskedData.value = rawData.value.map(row => {
    const out: any = { ...row };
    cols.forEach(col => {
      if (col in out) out[col] = maskValue(out[col]);
    });
    return out;
  });
}

function toggleColumn(col: string) {
  const i = selectedColumns.value.indexOf(col);
  if (i >= 0) selectedColumns.value = selectedColumns.value.filter(c => c !== col);
  else selectedColumns.value = [...selectedColumns.value, col];
  applyMask();
}

const allSelected = computed(() => headers.value.length > 0 && selectedColumns.value.length === headers.value.length);

function selectAll(v: boolean) {
  selectedColumns.value = v ? [...headers.value] : [];
  applyMask();
}

function downloadResult() {
  const csv = Papa.unparse({ fields: headers.value, data: maskedData.value });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${file.value?.name.replace(/\.[^.]+$/, '')}_masked.csv`;
  a.click();
}

function closeTool() {
  file.value = null;
  rawData.value = [];
  maskedData.value = [];
  headers.value = [];
  selectedColumns.value = [];
  error.value = null;
}
</script>

<template>
  <div class="w-full h-[calc(100vh-6rem)] flex flex-col p-2 md:p-4">
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 shrink-0 relative z-20">
      <div class="flex items-center gap-4">
        <router-link to="/" class="p-2.5 bg-card border border-border/50 rounded-xl text-muted-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm group">
          <ArrowLeft :size="18" class="group-hover:-translate-x-0.5 transition-transform" />
        </router-link>
        <div class="h-10 w-px bg-border/30 hidden lg:block"></div>
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center ring-1 ring-rose-500/20">
            <EyeOff :size="20" stroke-width="2.5" />
          </div>
          <div>
            <h2 class="text-xl md:text-2xl font-black tracking-tight text-foreground">
              Mask <span class="text-rose-500">Sensitive Data</span>
            </h2>
          </div>
        </div>
      </div>

      <div v-if="maskedData.length > 0" class="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-700">
        <button
          @click="downloadResult"
          class="flex items-center gap-2.5 px-6 py-3 bg-rose-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:shadow-lg hover:shadow-rose-500/20 transition-all active:scale-95 group"
        >
          <Download :size="16" class="group-hover:translate-y-0.5 transition-transform" />
          <span>Export</span>
        </button>
        <button @click="closeTool" class="p-3 bg-card hover:bg-muted text-foreground border border-border/50 rounded-xl transition-all duration-300 active:scale-95 group">
          <X :size="18" class="group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </div>
    </div>

    <div class="flex-1 min-h-0 flex flex-col relative overflow-hidden">
      <div v-if="loading" class="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-card rounded-[2rem]">
        <Loader2 class="animate-spin text-rose-500" :size="48" stroke-width="3" />
        <h4 class="text-xl font-black tracking-tight uppercase">Loading...</h4>
      </div>

      <div v-else-if="!file" class="h-full flex flex-col items-center justify-center py-4 w-full">
        <div class="text-center space-y-2 mb-6">
          <h3 class="text-3xl font-black tracking-tight">Hide sensitive fields.</h3>
          <p class="text-muted-foreground text-xs font-medium max-w-sm mx-auto leading-relaxed opacity-60">
            Mask emails, phone numbers, or custom patterns with a replacement string. Choose which columns to mask.
          </p>
        </div>
        <FileUploader @files-selected="handleFile" class="w-full max-w-2xl" />
      </div>

      <div v-else class="h-full flex flex-col lg:flex-row gap-6 animate-in fade-in duration-700 overflow-hidden">
        <div class="w-full lg:w-80 flex flex-col gap-5 shrink-0 overflow-hidden">
          <div class="flex-1 bg-card border border-border/50 rounded-[2rem] p-6 shadow-2xl flex flex-col overflow-y-auto">
            <h3 class="font-black text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2 mb-4">
              <EyeOff :size="12" class="text-rose-500" />
              Mask options
            </h3>
            <div class="space-y-4">
              <div>
                <label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 block mb-2">Pattern</label>
                <div class="flex flex-wrap gap-2">
                  <button
                    @click="pattern = 'email'; applyMask()"
                    class="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[11px] font-bold"
                    :class="pattern === 'email' ? 'bg-rose-500/10 border-rose-500/30 text-rose-600' : 'border-border/50 hover:border-rose-500/20'"
                  >
                    <Mail :size="12" /> Email
                  </button>
                  <button
                    @click="pattern = 'phone'; applyMask()"
                    class="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[11px] font-bold"
                    :class="pattern === 'phone' ? 'bg-rose-500/10 border-rose-500/30 text-rose-600' : 'border-border/50 hover:border-rose-500/20'"
                  >
                    <Phone :size="12" /> Phone
                  </button>
                  <button
                    @click="pattern = 'custom'; applyMask()"
                    class="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[11px] font-bold"
                    :class="pattern === 'custom' ? 'bg-rose-500/10 border-rose-500/30 text-rose-600' : 'border-border/50 hover:border-rose-500/20'"
                  >
                    <Regex :size="12" /> Regex
                  </button>
                </div>
              </div>
              <div v-if="pattern === 'custom'">
                <label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 block mb-1">Regex (JavaScript)</label>
                <input v-model="customRegex" class="w-full px-3 py-2 rounded-lg border border-border/50 bg-muted/20 font-mono text-xs" placeholder="\d{4}..." @input="applyMask" />
              </div>
              <div>
                <label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 block mb-1">Replace with</label>
                <input v-model="replacement" class="w-full px-3 py-2 rounded-lg border border-border/50 bg-muted/20" @input="applyMask" />
              </div>
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Columns to mask</label>
                  <button type="button" class="text-[10px] font-bold text-rose-500 hover:underline" @click="selectAll(!allSelected)">
                    {{ allSelected ? 'Clear' : 'All' }}
                  </button>
                </div>
                <div class="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  <label v-for="h in headers" :key="h" class="flex items-center gap-2 cursor-pointer hover:bg-muted/30 rounded-lg px-2 py-1">
                    <input type="checkbox" :checked="selectedColumns.includes(h)" @change="toggleColumn(h)" class="rounded border-border" />
                    <span class="text-xs truncate">{{ h }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex-1 min-w-0 bg-card border border-border/50 rounded-[2rem] shadow-2xl overflow-hidden p-1.5">
          <DataTable v-if="maskedData.length > 0" :headers="headers" :data="maskedData" />
        </div>
      </div>
    </div>
  </div>
</template>
