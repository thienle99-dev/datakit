<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import { Table, Upload, Loader2, X } from 'lucide-vue-next';
import FileUploader from '../components/shared/FileUploader.vue';
import DataTable from '../components/shared/DataTable.vue';
import { parseFile } from '../utils/fileParser';

const file = shallowRef<File | null>(null);
// ... setup ...
// Note: I need to preserve existing setup logic not shown here completely, 
// so I will target imports and the template.
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Header Area -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold flex items-center gap-2">
          <span class="text-primary"><Table :size="32" /></span> CSV Viewer
        </h2>
        <div class="flex items-center gap-2 mt-1">
          <p class="text-text-muted">View and analyze large CSV files instantly.</p> 
          <span v-if="file" class="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-mono">
            {{ file.name }} ({{ data.length }} rows)
          </span>
        </div>
      </div>
      
      <div v-if="data.length > 0">
        <button 
          @click="reset" 
          class="text-sm text-text-muted hover:text-red-500 px-3 py-1 rounded hover:bg-red-50 transition-colors flex items-center gap-1"
        >
          <X :size="16" /> Close File
        </button>
      </div>
    </div>
    
    <!-- Main Content -->
    <div class="flex-1 overflow-hidden">
      <!-- Loading State -->
      <div v-if="loading" class="h-full flex items-center justify-center text-primary">
        <Loader2 class="animate-spin -ml-1 mr-3 h-8 w-8" />
        <span>Parsing file...</span>
      </div>

      <!-- Upload State -->
      <FileUploader 
        v-else-if="data.length === 0" 
        @files-selected="handleFile" 
        class="h-[400px]"
      />
      
      <!-- Data Table State -->
      <DataTable 
        v-else 
        :headers="headers" 
        :data="data" 
      />
    </div>
  </div>
</template>
