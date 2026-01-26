<script setup lang="ts">
import { ArrowLeft, FileSpreadsheet, FileText, Download } from 'lucide-vue-next';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const templates = [
  {
    id: 'contacts',
    name: 'Contacts',
    description: 'Name, Email, Phone for mailing lists or CRM',
    csvHeaders: ['Name', 'Email', 'Phone', 'Company', 'Notes'],
    icon: FileSpreadsheet,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    id: 'inventory',
    name: 'Inventory',
    description: 'Product id, name, quantity, price',
    csvHeaders: ['ID', 'Product', 'Quantity', 'Price', 'SKU'],
    icon: FileSpreadsheet,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    id: 'events',
    name: 'Events',
    description: 'Event name, date, location, attendees',
    csvHeaders: ['Event', 'Date', 'Location', 'Attendees', 'Status'],
    icon: FileText,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    id: 'blank',
    name: 'Blank (headers only)',
    description: 'Empty CSV with Column A, B, C',
    csvHeaders: ['Column A', 'Column B', 'Column C'],
    icon: FileText,
    color: 'text-muted-foreground',
    bg: 'bg-muted/30',
  },
];

function downloadCSV(headers: string[], filename: string) {
  const csv = Papa.unparse({ fields: headers, data: [] });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadExcel(headers: string[], filename: string) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([headers]);
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, filename);
}

function onDownload(t: (typeof templates)[0], format: 'csv' | 'xlsx') {
  const base = `template_${t.id}`;
  const ext = format === 'csv' ? 'csv' : 'xlsx';
  const filename = `${base}.${ext}`;
  if (format === 'csv') {
    downloadCSV(t.csvHeaders, filename);
  } else {
    downloadExcel(t.csvHeaders, filename);
  }
}
</script>

<template>
  <div class="w-full min-h-screen-minus-header flex flex-col p-2 md:p-4">
    <div class="flex items-center gap-4 mb-6 shrink-0">
      <router-link to="/" class="p-2.5 bg-card border border-border/50 rounded-xl text-muted-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm group">
        <ArrowLeft :size="18" class="group-hover:-translate-x-0.5 transition-transform" />
      </router-link>
      <div class="h-10 w-px bg-border/30 hidden lg:block"></div>
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 bg-slate-500/10 text-slate-500 rounded-xl flex items-center justify-center ring-1 ring-slate-500/20">
          <FileText :size="20" stroke-width="2.5" />
        </div>
        <div>
          <h2 class="text-xl md:text-2xl font-black tracking-tight text-foreground">
            Download <span class="text-slate-500">Templates</span>
          </h2>
        </div>
      </div>
    </div>

    <div class="max-w-3xl mx-auto w-full space-y-6">
      <p class="text-muted-foreground text-sm">
        Start from a pre-made CSV or Excel template. No upload needed — just pick a template and download.
      </p>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          v-for="t in templates"
          :key="t.id"
          class="bg-card border border-border/50 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
        >
          <div class="flex items-start gap-4">
            <div :class="[t.bg, t.color]" class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
              <component :is="t.icon" :size="24" stroke-width="2" />
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="font-bold text-foreground mb-1">{{ t.name }}</h3>
              <p class="text-xs text-muted-foreground mb-4">{{ t.description }}</p>
              <p class="text-[10px] text-muted-foreground/80 font-mono mb-3 truncate" :title="t.csvHeaders.join(', ')">
                {{ t.csvHeaders.join(', ') }}
              </p>
              <div class="flex flex-wrap gap-2">
                <button
                  @click="onDownload(t, 'csv')"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted border border-border/50 text-xs font-bold transition-colors"
                >
                  <Download :size="12" />
                  CSV
                </button>
                <button
                  @click="onDownload(t, 'xlsx')"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted border border-border/50 text-xs font-bold transition-colors"
                >
                  <Download :size="12" />
                  Excel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
