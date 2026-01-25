<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits(['files-selected']);
const isDragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

function onDragOver(e: DragEvent) {
  e.preventDefault();
  isDragging.value = true;
}

function onDragLeave(e: DragEvent) {
  e.preventDefault();
  isDragging.value = false;
}

function onDrop(e: DragEvent) {
  e.preventDefault();
  isDragging.value = false;
  if (e.dataTransfer?.files) {
    handleFiles(e.dataTransfer.files);
  }
}

function onFileSelect(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files) {
    handleFiles(target.files);
  }
}

function handleFiles(fileList: FileList) {
  if (fileList.length > 0) {
    emit('files-selected', fileList[0]); // MVP: Handle single file for now
  }
}

function triggerBrowse() {
  fileInput.value?.click();
}
</script>

<template>
  <div 
    class="border-2 border-dashed rounded-xl flex items-center justify-center transition-colors cursor-pointer p-12 text-center"
    :class="[
      isDragging ? 'border-primary bg-primary/5' : 'border-border bg-surface hover:bg-background'
    ]"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
    @click="triggerBrowse"
  >
    <input 
      type="file" 
      ref="fileInput" 
      class="hidden" 
      accept=".csv,.xlsx,.xls,.txt"
      @change="onFileSelect"
    />
    
    <div>
      <div 
        class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-300"
        :class="[isDragging ? 'scale-110 bg-primary/20 text-primary' : 'bg-primary/10 text-primary']"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
      </div>
      <h3 class="font-semibold text-lg">
        {{ isDragging ? 'Drop file to upload' : 'Drop your file here' }}
      </h3>
      <p class="text-text-muted mt-1">Supports .csv, .xlsx, .xls</p>
      <button class="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors pointer-events-none">
        Browse Files
      </button>
    </div>
  </div>
</template>
