<script setup lang="ts">
import { ref } from 'vue';
import { Upload } from 'lucide-vue-next';

const props = withDefaults(defineProps<{
  multiple?: boolean;
  accept?: string;
}>(), {
  accept: '.csv,.xlsx,.xls,.txt'
});

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
    const files = Array.from(fileList);
    if (props.multiple) {
      emit('files-selected', files);
    } else {
      emit('files-selected', files[0]);
    }
  }
}

function triggerBrowse() {
  fileInput.value?.click();
}
</script>

<template>
  <div 
    class="border-2 border-dashed rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer p-12 text-center relative overflow-hidden group"
    :class="[
      isDragging 
        ? 'border-primary bg-primary/5 scale-[1.02]' 
        : 'border-border/50 hover:border-primary/50 bg-card hover:bg-primary/5'
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
      :multiple="multiple"
      :accept="accept"
      @change="onFileSelect"
    />
    
    <div>
      <div 
        class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-300"
        :class="[isDragging ? 'scale-110 bg-primary/20 text-primary' : 'bg-primary/10 text-primary']"
      >
        <Upload :size="32" />
      </div>
      <h3 class="font-semibold text-lg">
        {{ isDragging ? 'Drop files to upload' : 'Drop your files here' }}
      </h3>
      <p class="text-muted-foreground mt-1">Supports .csv, .xlsx, .xls</p>
      <button class="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors pointer-events-none">
        Browse Files
      </button>
    </div>
    
    <!-- Background Decoration -->
    <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
  </div>
</template>
