<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { 
    Table, 
    ArrowLeft, 
    Download, 
    Trash2, 
    Plus, 
    Search,
    ChevronUp,
    ChevronDown,
    ArrowUpDown,
    RotateCcw,
    Clipboard,
    Grid
} from 'lucide-vue-next';
import Papa from 'papaparse';

// --- State ---
const rawInput = ref('');
const isEditingRaw = ref(true);
const headers = ref<string[]>([]);
const rows = ref<any[]>([]);
const searchTerm = ref('');
const sortColumn = ref<string | null>(null);
const sortDirection = ref<'asc' | 'desc'>('asc');

// For cell editing
const editingCell = ref<{rowIndex: number, colKey: string} | null>(null);
const editValue = ref('');
const editInputRef = ref<HTMLInputElement | null>(null);

// --- Parsers ---

const detectAndParse = () => {
    const text = rawInput.value.trim();
    if (!text) return;

    // Try JSON first
    if (text.startsWith('[') || text.startsWith('{')) {
        try {
            const parsed = JSON.parse(text);
            const arrayData = Array.isArray(parsed) ? parsed : [parsed];
            if (arrayData.length > 0) {
                // Collect all unique keys from all objects to form headers
                const keys = new Set<string>();
                arrayData.forEach(item => {
                    if (typeof item === 'object' && item !== null) {
                        Object.keys(item).forEach(k => keys.add(k));
                    }
                });
                
                headers.value = Array.from(keys);
                rows.value = arrayData;
                isEditingRaw.value = false;
                return;
            }
        } catch (e) {
            // Not valid JSON, try CSV
        }
    }

    // Try CSV
    try {
        const result = Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
        });
        
        if (result.errors.length === 0 && result.data.length > 0) {
            headers.value = result.meta.fields || Object.keys(result.data[0] as any);
            rows.value = result.data;
            isEditingRaw.value = false;
            return;
        } else if (result.data.length > 0) {
            // Fallback for simple CSV without headers? 
            // result.meta.fields might be undefined if header: true but no header line detected properly?
            // Let's assume it worked enough.
             headers.value = result.meta.fields || Object.keys(result.data[0] as any);
             rows.value = result.data;
             isEditingRaw.value = false;
             return;
        }
    } catch (e) {
        console.error("CSV Parse error", e);
    }
    
    // Fallback: TSV or just lines?
    // Let's rely on Papa parse for now. 
    alert("Could not auto-detect CSV or JSON format. Please check your syntax.");
};

const processedRows = computed(() => {
    let result = [...rows.value];

    // Filter
    if (searchTerm.value) {
        const lower = searchTerm.value.toLowerCase();
        result = result.filter(row => 
            headers.value.some(h => String(row[h] || '').toLowerCase().includes(lower))
        );
    }

    // Sort
    if (sortColumn.value) {
        const col = sortColumn.value;
        const dir = sortDirection.value === 'asc' ? 1 : -1;
        result.sort((a, b) => {
            const valA = a[col];
            const valB = b[col];
            // Simple string/numeric sort
            const numA = parseFloat(valA);
            const numB = parseFloat(valB);
            if (!isNaN(numA) && !isNaN(numB)) return (numA - numB) * dir;
            
            const strA = String(valA || '').toLowerCase();
            const strB = String(valB || '').toLowerCase();
            return strA.localeCompare(strB) * dir;
        });
    }

    return result;
});

// --- Actions ---

const handleSort = (col: string) => {
    if (sortColumn.value === col) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn.value = col;
        sortDirection.value = 'asc';
    }
};

const startEdit = (rowIndex: number, colKey: string, val: any) => {
    editingCell.value = { rowIndex, colKey };
    editValue.value = String(val !== undefined ? val : '');
    nextTick(() => {
        editInputRef.value?.focus();
    });
};

const saveEdit = () => {
    if (!editingCell.value) return;
    const { rowIndex, colKey } = editingCell.value;
    
    // We need to find the actual row in the original `rows` array.
    // If sorted/filtered, rowIndex maps to `processedRows`. 
    // BUT, modifying `processedRows` item directly modifies the object reference in `rows` IF it's a shallow copy of objects.
    // Yes, `result = [...rows.value]` creates a new array but references the same row objects.
    
    const row = processedRows.value[rowIndex];
    if (row) {
        row[colKey] = editValue.value; 
    }
    
    editingCell.value = null;
};

const cancelEdit = () => {
    editingCell.value = null;
};

const addRow = () => {
    const newRow: any = {};
    headers.value.forEach(h => newRow[h] = '');
    rows.value.push(newRow);
    // Scroll to bottom?
};

const addColumn = () => {
    const name = prompt("New Column Name:");
    if (name && !headers.value.includes(name)) {
        headers.value.push(name);
        // Reactivity for existing rows?
    }
};

const deleteRow = (actualRowIndex: number) => {
    // If filtering, this is tricky. We should delete by object reference.
    // Let's just assume simple delete for now or delete by reference.
    const rowToDelete = processedRows.value[actualRowIndex];
    const idx = rows.value.indexOf(rowToDelete);
    if (idx !== -1) rows.value.splice(idx, 1);
};

const exportData = (format: 'csv' | 'json') => {
    if (format === 'json') {
        const blob = new Blob([JSON.stringify(rows.value, null, 2)], { type: 'application/json' });
        downloadBlob(blob, 'table-export.json');
    } else {
        const csv = Papa.unparse(rows.value);
        const blob = new Blob([csv], { type: 'text/csv' });
        downloadBlob(blob, 'table-export.csv');
    }
};

const downloadBlob = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
};

const copyToClipboard = () => {
    const csv = Papa.unparse(rows.value);
    navigator.clipboard.writeText(csv);
    alert("Copied as CSV!");
};

const clearData = () => {
    if (confirm("Clear all data?")) {
        rows.value = [];
        headers.value = [];
        rawInput.value = '';
        isEditingRaw.value = true;
    }
};

</script>

<template>
  <div class="h-screen-minus-header flex flex-col p-2 md:p-4 max-w-[1800px] mx-auto w-full">
    
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 shrink-0">
        <div class="flex items-center gap-4">
            <router-link to="/" class="p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors">
              <ArrowLeft :size="20" />
            </router-link>
            <div class="flex items-center gap-3">
              <div class="bg-emerald-500/10 text-emerald-500 p-2 rounded-lg">
                <Table :size="24" />
              </div>
              <div>
                <h1 class="text-xl font-bold tracking-tight">Quick Table</h1>
                <p class="text-xs text-muted-foreground hidden md:block">Paste JSON/CSV, edit like a spreadsheet, and export.</p>
              </div>
            </div>
        </div>

        <div v-if="!isEditingRaw" class="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
             <div class="relative group mr-2">
                <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                    v-model="searchTerm" 
                    placeholder="Filter..." 
                    class="pl-9 pr-3 py-1.5 bg-muted/30 border border-border/50 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all w-32 focus:w-48"
                />
             </div>

             <button @click="isEditingRaw = true" class="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors" title="Edit Source">
                <RotateCcw :size="18" />
             </button>
             
             <div class="h-4 w-px bg-border/50 mx-1"></div>

             <button @click="exportData('csv')" class="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded-lg text-xs font-bold uppercase transition-colors">
                <Download :size="14" /> CSV
             </button>
             <button @click="exportData('json')" class="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 rounded-lg text-xs font-bold uppercase transition-colors">
                <Download :size="14" /> JSON
             </button>
        </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 min-h-0 bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden flex flex-col relative">
        
        <!-- Raw Input Mode -->
        <div v-if="isEditingRaw" class="flex-1 flex flex-col p-6 animate-in fade-in zoom-in-95 duration-300">
             <div class="text-center space-y-2 mb-6">
                <h3 class="text-lg font-bold">Paste your data</h3>
                <p class="text-sm text-muted-foreground">Supports CSV, TSV, and JSON arrays.</p>
             </div>
             
             <textarea 
                v-model="rawInput"
                class="flex-1 w-full bg-muted/30 border border-border rounded-xl p-4 font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                placeholder='id,name,role
1,Alice,Admin
2,Bob,User
...'
             ></textarea>

             <div class="flex justify-center mt-6 gap-4">
                 <button 
                    @click="detectAndParse" 
                    :disabled="!rawInput.trim()"
                    class="px-8 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                 >
                    <Grid :size="18" />
                    Generage Table
                 </button>
                 <button v-if="rows.length > 0" @click="isEditingRaw = false" class="px-6 py-2.5 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl transition-all">
                    Cancel
                 </button>
             </div>
        </div>

        <!-- Table Mode -->
        <div v-else class="flex-1 flex flex-col min-h-0">
             <!-- Table Scroll Area -->
             <div class="flex-1 overflow-auto relative scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                 <table class="w-full text-left border-collapse min-w-[800px]">
                     <thead class="sticky top-0 z-10 bg-muted/80 backdrop-blur-md shadow-sm">
                         <tr>
                             <th class="w-12 text-center py-2 text-xs text-muted-foreground border-b border-r border-border/50 bg-muted/50">#</th>
                             <th 
                                v-for="header in headers" 
                                :key="header"
                                @click="handleSort(header)"
                                class="px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-r border-border/50 cursor-pointer hover:bg-muted/50 hover:text-foreground transition-colors group select-none min-w-[120px]"
                             >
                                <div class="flex items-center justify-between gap-1">
                                    <span>{{ header }}</span>
                                    <div class="flex flex-col opacity-0 group-hover:opacity-50 transition-opacity">
                                        <ChevronUp v-if="sortColumn === header && sortDirection === 'asc'" :size="10" class="text-emerald-500 opacity-100" />
                                        <ChevronDown v-else-if="sortColumn === header && sortDirection === 'desc'" :size="10" class="text-emerald-500 opacity-100" />
                                        <ArrowUpDown v-else :size="10" />
                                    </div>
                                </div>
                             </th>
                             <th class="w-10 border-b border-border/50 p-2">
                                <button @click="addColumn" class="w-full h-full flex items-center justify-center text-muted-foreground hover:bg-muted rounded transition-colors" title="Add Column">
                                    <Plus :size="14" />
                                </button>
                             </th>
                         </tr>
                     </thead>
                     <tbody class="divide-y divide-border/30 text-sm">
                         <tr 
                            v-for="(row, idx) in processedRows" 
                            :key="idx" 
                            class="group hover:bg-primary/5 transition-colors"
                         >
                             <td class="text-center text-xs text-muted-foreground/50 border-r border-border/30 select-none">{{ idx + 1 }}</td>
                             
                             <td 
                                v-for="header in headers" 
                                :key="header + idx"
                                @click="startEdit(idx, header, row[header])"
                                class="px-4 py-2 border-r border-border/30 cursor-text relative min-h-[32px]"
                                :class="{'bg-background ring-2 ring-emerald-500 ring-inset z-10': editingCell?.rowIndex === idx && editingCell?.colKey === header}"
                             >
                                 <div v-if="editingCell?.rowIndex === idx && editingCell?.colKey === header" class="absolute inset-0">
                                     <input 
                                        ref="editInputRef"
                                        v-model="editValue"
                                        @blur="saveEdit"
                                        @keydown.enter="saveEdit"
                                        @keydown.esc="cancelEdit"
                                        class="w-full h-full px-4 py-2 bg-background outline-none text-sm font-medium"
                                     />
                                 </div>
                                 <div v-else class="truncate max-w-[300px] text-foreground/80 group-hover:text-foreground">
                                    {{ row[header] }}
                                    <span v-if="row[header] === '' || row[header] === undefined" class="opacity-0">.</span>
                                 </div>
                             </td>

                             <td class="text-center p-1">
                                 <button @click="deleteRow(idx)" class="p-1.5 text-muted-foreground/30 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                                     <Trash2 :size="14" />
                                 </button>
                             </td>
                         </tr>
                     </tbody>
                 </table>
             </div>

             <!-- Footer Toolbar -->
             <div class="p-3 border-t border-border/50 bg-muted/10 flex items-center justify-between shrink-0">
                 <button @click="addRow" class="flex items-center gap-2 px-4 py-2 bg-background border border-border/50 hover:bg-muted/50 rounded-lg text-xs font-bold uppercase transition-colors shadow-sm">
                     <Plus :size="14" /> Add Row
                 </button>
                 
                 <div class="flex items-center gap-4 text-xs text-muted-foreground">
                     <span>{{ processedRows.length }} rows</span>
                     <span>{{ headers.length }} columns</span>
                 </div>

                 <div class="flex items-center gap-2">
                     <button @click="copyToClipboard" class="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                        <Clipboard :size="14" /> Copy CSV
                     </button>
                     <button @click="clearData" class="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-rose-500/70 hover:text-rose-600 transition-colors">
                        <Trash2 :size="14" /> Clear All
                     </button>
                 </div>
             </div>
        </div>

    </div>
  </div>
</template>

<style scoped>
.h-screen-minus-header {
    height: calc(100vh - var(--header-height, 64px));
}
/* Hide scrollbar for cleaner look if needed, but keeping standard for tables is usually better */
</style>
