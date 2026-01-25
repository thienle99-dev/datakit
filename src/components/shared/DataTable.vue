<script setup lang="ts">
import { computed, ref } from 'vue';

interface Props {
  headers: string[];
  data: any[];
}

const props = defineProps<Props>();

const searchTerm = ref('');
const currentPage = ref(1);
const pageSize = 20;

const totalPages = computed(() => Math.ceil(props.data.length / pageSize));

const filteredData = computed(() => {
  if (!searchTerm.value) return props.data;
  const lowerSearch = searchTerm.value.toLowerCase();
  
  return props.data.filter(row => {
    return Object.values(row).some(val => 
      String(val).toLowerCase().includes(lowerSearch)
    );
  });
});

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  return filteredData.value.slice(start, end);
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
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </span>
        <input 
          v-model="searchTerm"
          type="text" 
          placeholder="Search data..." 
          class="w-full pl-9 pr-4 py-2 bg-background/50 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
        />
      </div>
      
      <div class="text-xs font-medium text-muted-foreground bg-accent/50 px-2 py-1 rounded-md">
        {{ filteredData.length.toLocaleString() }} records
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
              class="px-4 py-3 border-b border-border font-medium whitespace-nowrap tracking-wider"
            >
              {{ header }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(row, rowIndex) in paginatedData" 
            :key="rowIndex"
            class="group transition-colors border-b border-border/50 last:border-0 hover:bg-muted/50"
          >
            <td class="px-4 py-2.5 text-center text-muted-foreground border-r border-border/30 bg-muted/20 text-xs font-mono">
              {{ (currentPage - 1) * pageSize + rowIndex + 1 }}
            </td>
            <td 
              v-for="(header, colIndex) in headers" 
              :key="colIndex"
              class="px-4 py-2.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs text-foreground/90 font-medium"
              :title="String(row[header] || '')"
            >
              {{ row[header] }}
            </td>
          </tr>
          <tr v-if="filteredData.length === 0">
            <td :colspan="headers.length + 1" class="px-4 py-12 text-center text-muted-foreground">
              <div class="flex flex-col items-center justify-center gap-2">
                 <span class="text-4xl opacity-20">🔍</span>
                 <p>No matching data found</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Footer / Pagination -->
    <div class="p-3 border-t border-border flex justify-between items-center bg-card/80 text-sm backdrop-blur-sm">
      <span class="text-muted-foreground text-xs">
        Page <span class="font-medium text-foreground">{{ currentPage }}</span> of {{ totalPages || 1 }}
      </span>
      <div class="flex gap-2">
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1"
          class="px-3 py-1.5 border border-border rounded-md hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
        >
          Previous
        </button>
        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages || totalPages === 0"
          class="px-3 py-1.5 border border-border rounded-md hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>
