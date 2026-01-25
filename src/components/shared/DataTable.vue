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
  <div class="flex flex-col h-full border border-border rounded-lg bg-surface shadow-sm overflow-hidden">
    <!-- Toolbar -->
    <div class="p-4 border-b border-border flex justify-between items-center gap-4">
      <div class="relative max-w-sm w-full">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </span>
        <input 
          v-model="searchTerm"
          type="text" 
          placeholder="Search..." 
          class="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
      
      <div class="text-sm text-text-muted">
        {{ filteredData.length.toLocaleString() }} rows
      </div>
    </div>

    <!-- Table Container -->
    <div class="flex-1 overflow-auto relative">
      <table class="w-full text-sm text-left border-collapse">
        <thead class="text-xs text-text-muted uppercase bg-background sticky top-0 z-10 shadow-sm">
          <tr>
            <th class="px-4 py-3 border-b border-border w-16 text-center">#</th>
            <th 
              v-for="(header, index) in headers" 
              :key="index"
              class="px-4 py-3 border-b border-border font-semibold whitespace-nowrap"
            >
              {{ header }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(row, rowIndex) in paginatedData" 
            :key="rowIndex"
            class="hover:bg-background/50 transition-colors border-b border-border/50 last:border-0"
          >
            <td class="px-4 py-2 text-center text-text-muted border-r border-border/30">
              {{ (currentPage - 1) * pageSize + rowIndex + 1 }}
            </td>
            <td 
              v-for="(header, colIndex) in headers" 
              :key="colIndex"
              class="px-4 py-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs"
              :title="String(row[header] || '')"
            >
              {{ row[header] }}
            </td>
          </tr>
          <tr v-if="filteredData.length === 0">
            <td :colspan="headers.length + 1" class="px-4 py-8 text-center text-text-muted">
              No data found
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Footer / Pagination -->
    <div class="p-3 border-t border-border flex justify-between items-center bg-background/50 text-sm">
      <span class="text-text-muted">
        Page {{ currentPage }} of {{ totalPages || 1 }}
      </span>
      <div class="flex gap-2">
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1"
          class="px-3 py-1 border border-border rounded hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages || totalPages === 0"
          class="px-3 py-1 border border-border rounded hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>
