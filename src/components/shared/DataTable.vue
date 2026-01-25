<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ChevronUp, ChevronDown, ArrowUpDown, Search as SearchIcon } from 'lucide-vue-next';

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
  <div class="flex flex-col h-full border border-border rounded-xl bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden transition-all hover:shadow-md">
    <!-- Toolbar -->
    <div class="p-4 border-b border-border flex flex-wrap gap-4 justify-between items-center bg-card/40">
      <div class="relative max-w-sm w-full">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60">
          <SearchIcon :size="16" />
        </span>
        <input 
          v-model="searchTerm"
          type="text" 
          placeholder="Search records..." 
          class="w-full pl-9 pr-4 py-2 bg-background/50 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40"
        />
      </div>
      
      <div class="text-xs font-medium text-muted-foreground bg-accent/30 px-3 py-1.5 rounded-full border border-border/50">
        {{ processedData.length.toLocaleString() }} records
      </div>
    </div>

    <!-- Table Container -->
    <div class="flex-1 overflow-auto relative scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
      <table class="w-full text-sm text-left border-collapse">
        <thead class="text-xs font-semibold text-muted-foreground uppercase bg-muted/50 sticky top-0 z-10 shadow-sm backdrop-blur-md">
          <tr>
            <th class="px-4 py-3 border-b border-border w-16 text-center font-medium">#</th>
            <th 
              v-for="(header, index) in headers" 
              :key="index"
              @click="handleSort(header)"
              class="px-4 py-3 border-b border-border font-medium whitespace-nowrap tracking-wider cursor-pointer hover:bg-muted/80 transition-colors group/header"
            >
              <div class="flex items-center gap-2">
                {{ header }}
                <span class="text-muted-foreground/30 transition-colors" :class="{ 'text-primary': sortColumn === header }">
                  <ChevronUp v-if="sortColumn === header && sortDirection === 'asc'" :size="14" />
                  <ChevronDown v-else-if="sortColumn === header && sortDirection === 'desc'" :size="14" />
                  <ArrowUpDown v-else :size="12" class="opacity-0 group-hover/header:opacity-100" />
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(row, rowIndex) in paginatedData" 
            :key="rowIndex"
            class="group transition-colors border-b border-border/50 last:border-0 hover:bg-muted/30"
          >
            <td class="px-4 py-2 text-center text-muted-foreground/60 border-r border-border/30 bg-muted/10 text-xs font-mono">
              {{ (currentPage - 1) * pageSize + rowIndex + 1 }}
            </td>
            <td 
              v-for="(header, colIndex) in headers" 
              :key="colIndex"
              class="px-4 py-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs text-foreground/80"
              :title="String(row[header] || '')"
            >
              {{ row[header] }}
            </td>
          </tr>
          <tr v-if="processedData.length === 0">
            <td :colspan="headers.length + 1" class="px-4 py-16 text-center text-muted-foreground">
              <div class="flex flex-col items-center justify-center gap-3">
                 <div class="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-1">
                   <SearchIcon :size="20" class="opacity-30" />
                 </div>
                 <p class="font-medium text-foreground/60">No matching data found</p>
                 <p class="text-xs">Try adjusting your search query</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Footer / Pagination -->
    <div class="p-3 border-t border-border flex justify-between items-center bg-card/80 text-sm backdrop-blur-sm">
      <div class="flex items-center gap-4">
        <span class="text-muted-foreground text-xs">
          Page <span class="font-medium text-foreground">{{ currentPage }}</span> of {{ totalPages || 1 }}
        </span>
        
        <select v-model="pageSize" class="bg-transparent border border-border/50 rounded px-1.5 py-0.5 text-xs focus:outline-none">
          <option :value="10">10 / Page</option>
          <option :value="20">20 / Page</option>
          <option :value="50">50 / Page</option>
          <option :value="100">100 / Page</option>
        </select>
      </div>

      <div class="flex gap-2">
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1"
          class="px-3 py-1.5 border border-border rounded-md hover:bg-accent hover:text-accent-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-medium bg-background shadow-sm"
        >
          Previous
        </button>
        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages || totalPages === 0"
          class="px-3 py-1.5 border border-border rounded-md hover:bg-accent hover:text-accent-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-medium bg-background shadow-sm"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>
