<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ChevronUp, ChevronDown, ArrowUpDown, Search as SearchIcon, Table, Columns } from 'lucide-vue-next';

interface Props {
  headers: string[];
  data: any[];
}

const props = defineProps<Props>();

const searchTerm = ref('');
const currentPage = ref(1);
const pageSize = ref(20);
const sortColumn = ref<string | null>(null);
const sortDirection = ref<'asc' | 'desc'>('asc');

// Reset page when search or data changes
watch([searchTerm, () => props.data], () => {
  currentPage.value = 1;
});

const handleSort = (column: string) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = column;
    sortDirection.value = 'asc';
  }
};

const processedData = computed(() => {
  let result = [...props.data];

  // 1. Filter
  if (searchTerm.value) {
    const lowerSearch = searchTerm.value.toLowerCase();
    result = result.filter(row => {
      return Object.values(row).some(val => 
        String(val || '').toLowerCase().includes(lowerSearch)
      );
    });
  }

  // 2. Sort
  if (sortColumn.value) {
    const col = sortColumn.value;
    const dir = sortDirection.value === 'asc' ? 1 : -1;
    
    result.sort((a, b) => {
      const valA = a[col];
      const valB = b[col];

      // Numeric check
      const numA = parseFloat(valA);
      const numB = parseFloat(valB);

      if (!isNaN(numA) && !isNaN(numB)) {
        return (numA - numB) * dir;
      }

      // String comparison
      const strA = String(valA || '').toLowerCase();
      const strB = String(valB || '').toLowerCase();
      if (strA < strB) return -1 * dir;
      if (strA > strB) return 1 * dir;
      return 0;
    });
  }

  return result;
});

const totalPages = computed(() => Math.ceil(processedData.value.length / pageSize.value));

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return processedData.value.slice(start, end);
});

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}
</script>

<template>
  <div class="flex flex-col h-full border border-border/50 rounded-3xl bg-card shadow-2xl overflow-hidden transition-all duration-500">
    <!-- Enhanced Toolbar -->
    <div class="p-5 border-b border-border/50 flex flex-wrap gap-6 justify-between items-center bg-muted/20">
      <div class="flex items-center gap-6 flex-1 min-w-[300px]">
        <div class="relative flex-1 max-w-md group">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors">
            <SearchIcon :size="18" />
          </span>
          <input 
            v-model="searchTerm"
            type="text" 
            placeholder="Filter records..." 
            class="w-full pl-11 pr-4 py-2.5 bg-background border border-border/50 rounded-2xl text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-muted-foreground/30 shadow-inner"
          />
        </div>
        
        <div class="h-8 w-px bg-border/30 hidden md:block"></div>
        
        <div class="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
          <div class="flex flex-col">
            <span class="text-[10px] opacity-60">Visibility</span>
            <span class="text-foreground/80 font-black">{{ processedData.length.toLocaleString() }} / {{ props.data.length.toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2">
         <!-- Future view controls could go here -->
         <div class="p-1 bg-muted/50 rounded-xl border border-border/50 flex gap-1">
            <button class="p-1.5 rounded-lg bg-background text-foreground shadow-sm"><Table :size="14" /></button>
            <button class="p-1.5 rounded-lg text-muted-foreground hover:bg-background/50 transition-all opacity-40 cursor-not-allowed" title="Grid View coming soon"><Columns :size="14" /></button>
         </div>
      </div>
    </div>

    <!-- Table Container -->
    <div class="flex-1 overflow-auto relative scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
      <table class="w-full text-sm text-left border-separate border-spacing-0">
        <thead class="sticky top-0 z-20">
          <tr>
            <th class="px-5 py-4 bg-muted border-b border-r border-border/50 w-16 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">#</th>
            <th 
              v-for="(header, index) in headers" 
              :key="index"
              @click="handleSort(header)"
              class="px-5 py-4 bg-muted border-b border-border/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground cursor-pointer hover:bg-muted/100 transition-all group/header first:rounded-tl-2xl relative"
            >
              <div class="flex items-center justify-between gap-2">
                <span class="truncate" :class="{ 'text-primary': sortColumn === header }">{{ header }}</span>
                <span class="transition-all duration-300 transform" :class="{ 'text-primary scale-110': sortColumn === header, 'opacity-0 group-hover/header:opacity-40': sortColumn !== header }">
                  <ChevronUp v-if="sortColumn === header && sortDirection === 'asc'" :size="14" stroke-width="3" />
                  <ChevronDown v-else-if="sortColumn === header && sortDirection === 'desc'" :size="14" stroke-width="3" />
                  <ArrowUpDown v-else :size="12" />
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border/30">
          <tr 
            v-for="(row, rowIndex) in paginatedData" 
            :key="rowIndex"
            class="group hover:bg-primary/5 transition-colors duration-200"
          >
            <td class="px-5 py-3.5 text-center text-muted-foreground/40 border-r border-border/20 text-[10px] font-mono font-bold bg-muted/5 group-hover:bg-primary/5 group-hover:text-primary transition-all">
              {{ (currentPage - 1) * pageSize + rowIndex + 1 }}
            </td>
            <td 
              v-for="(header, colIndex) in headers" 
              :key="colIndex"
              class="px-5 py-3.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs text-foreground/70 group-hover:text-foreground font-medium transition-colors"
              :title="String(row[header] || '')"
            >
              <div class="flex items-center">
                 <span v-if="!row[header]" class="text-[10px] italic opacity-20">null</span>
                 <span v-else>{{ row[header] }}</span>
              </div>
            </td>
          </tr>
          
          <!-- Empty State -->
          <tr v-if="processedData.length === 0">
            <td :colspan="headers.length + 1" class="px-5 py-32 text-center">
              <div class="flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-700">
                 <div class="w-20 h-20 rounded-[2rem] bg-muted/50 flex items-center justify-center mb-6 shadow-inner ring-1 ring-border/50">
                   <SearchIcon :size="32" class="opacity-20 text-primary" />
                 </div>
                 <h4 class="text-xl font-black tracking-tight text-foreground/40">No Matches Found</h4>
                 <p class="text-xs font-bold uppercase tracking-widest text-muted-foreground/50 mt-3 max-w-[240px] leading-relaxed">
                   We couldn't find any records matching your search criteria.
                 </p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Enhanced Pagination -->
    <div class="px-6 py-4 border-t border-border/50 flex flex-col sm:flex-row gap-4 justify-between items-center bg-muted/20 dark:bg-card">
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2">
           <span class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Per Page</span>
           <select 
            v-model="pageSize" 
            class="bg-background/80 border border-border/50 rounded-xl px-3 py-1 text-xs font-bold text-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
           >
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>
        
        <div class="h-4 w-px bg-border/20"></div>

        <div class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
          Showing <span class="text-foreground mr-1">{{ ((currentPage - 1) * pageSize) + 1 }}-{{ Math.min(currentPage * pageSize, processedData.length) }}</span> 
          of <span class="text-foreground ml-1">{{ processedData.length.toLocaleString() }}</span>
        </div>
      </div>

      <div class="flex items-center gap-1.5 p-1 bg-muted/50 border border-border/30 rounded-2xl shadow-inner">
        <button 
          @click="currentPage = 1" 
          :disabled="currentPage === 1"
          class="p-2 rounded-xl hover:bg-background text-muted-foreground hover:text-primary disabled:opacity-20 disabled:pointer-events-none transition-all"
          title="First Page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m11 17-5-5 5-5"/><path d="m18 17-5-5 5-5"/></svg>
        </button>
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1"
          class="px-4 py-2 rounded-xl bg-background text-xs font-black uppercase tracking-widest text-foreground shadow-sm hover:shadow-md hover:text-primary disabled:opacity-30 disabled:pointer-events-none transition-all border border-border/50"
        >
          Prev
        </button>
        
        <div class="px-4 text-xs font-black text-primary/80">
          {{ currentPage }} / {{ totalPages || 1 }}
        </div>

        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages || totalPages === 0"
          class="px-4 py-2 rounded-xl bg-background text-xs font-black uppercase tracking-widest text-foreground shadow-sm hover:shadow-md hover:text-primary disabled:opacity-30 disabled:pointer-events-none transition-all border border-border/50"
        >
          Next
        </button>
        <button 
          @click="currentPage = totalPages" 
          :disabled="currentPage === totalPages || totalPages === 0"
          class="p-2 rounded-xl hover:bg-background text-muted-foreground hover:text-primary disabled:opacity-20 disabled:pointer-events-none transition-all"
          title="Last Page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>
