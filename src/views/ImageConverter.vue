<script setup lang="ts">
import { ref } from 'vue';
import { ArrowLeft, Loader2, Download, X, ArrowRightLeft } from 'lucide-vue-next';
import FileUploader from '../components/shared/FileUploader.vue';
import ImagePreview from '../components/shared/ImagePreview.vue';
import { fileToDataURL, convertImageFormat } from '../utils/imageUtils';

const originalFile = ref<File | null>(null);
const originalUrl = ref<string>('');
const convertedUrl = ref<string>('');
const processing = ref(false);
const error = ref<string | null>(null);

const targetFormat = ref('image/png');
const formats = [
  { label: 'PNG', mime: 'image/png', ext: 'png' },
  { label: 'JPEG', mime: 'image/jpeg', ext: 'jpg' },
  { label: 'WEBP', mime: 'image/webp', ext: 'webp' },
];

async function handleFile(file: File) {
  originalFile.value = file;
  error.value = null;
  processing.value = true;
  convertedUrl.value = '';
  
  try {
    originalUrl.value = await fileToDataURL(file);
    // Auto process or wait? Let's wait for format selection or click
  } catch (err: any) {
    error.value = "Failed to load image: " + err.message;
  } finally {
    processing.value = false;
  }
}

async function convert() {
  if (!originalFile.value) return;
  processing.value = true;
  
  try {
    if (convertedUrl.value) URL.revokeObjectURL(convertedUrl.value);
    
    const blob = await convertImageFormat(originalFile.value, targetFormat.value);
    convertedUrl.value = URL.createObjectURL(blob);
  } catch (err: any) {
    error.value = "Conversion failed: " + err.message;
  } finally {
    processing.value = false;
  }
}

function downloadImage() {
  if (!convertedUrl.value || !originalFile.value) return;
  
  const link = document.createElement('a');
  link.href = convertedUrl.value;
  
  const originalName = originalFile.value.name;
  const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
  const ext = formats.find(f => f.mime === targetFormat.value)?.ext || 'png';
  
  link.download = `${baseName}.${ext}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function resetTool() {
  if (convertedUrl.value) URL.revokeObjectURL(convertedUrl.value);
  originalFile.value = null;
  originalUrl.value = '';
  convertedUrl.value = '';
  error.value = null;
}
</script>

<template>
  <div class="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col p-4 md:p-6 lg:p-8">
     <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
      <div class="space-y-1">
        <router-link to="/" class="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider hover:gap-3 transition-all mb-2">
           <ArrowLeft :size="14" /> All Tools
        </router-link>
        <h2 class="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3">
          <span class="p-2.5 bg-pink-500/10 text-pink-500 rounded-2xl shadow-inner"><ArrowRightLeft :size="32" /></span>
          Image Converter
        </h2>
        <p class="text-muted-foreground text-lg max-w-xl">
          Convert images between PNG, JPEG, and WebP formats.
        </p>
      </div>

      <div v-if="originalFile" class="flex items-center gap-3">
          <button @click="resetTool" class="bg-card border border-border px-4 py-2.5 rounded-xl font-bold hover:bg-muted transition-all text-muted-foreground">
             <X :size="18"/>
          </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 min-h-0 flex flex-col md:flex-row gap-8">
        <div v-if="!originalFile" class="w-full flex justify-center items-center flex-1 glass-card rounded-3xl border border-border/50">
             <FileUploader @files-selected="handleFile" accept="image/*" description="Start by uploading an image" />
        </div>

        <template v-else>
             <!-- Preview Grid -->
             <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <!-- Original -->
                 <div class="glass-card rounded-3xl border border-border/50 p-4 flex flex-col">
                      <h3 class="font-bold text-sm text-muted-foreground mb-4 uppercase">Original</h3>
                      <div class="flex-1 rounded-xl bg-muted/20 overflow-hidden relative">
                          <ImagePreview :src="originalUrl" />
                      </div>
                 </div>

                 <!-- Converted -->
                 <div class="glass-card rounded-3xl border border-border/50 p-4 flex flex-col relative group">
                      <div class="flex justify-between items-center mb-4">
                          <h3 class="font-bold text-sm text-muted-foreground uppercase">Converted Preview</h3>
                          <div v-if="convertedUrl && !processing" class="text-xs font-bold text-emerald-500 flex items-center gap-1">
                              <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Ready
                          </div>
                      </div>
                      
                      <div class="flex-1 rounded-xl bg-muted/20 overflow-hidden relative flex items-center justify-center">
                          <Loader2 v-if="processing" class="animate-spin text-primary" :size="32"/>
                          <ImagePreview v-else-if="convertedUrl" :src="convertedUrl" />
                          <div v-else class="text-muted-foreground text-sm">Select format to convert</div>
                      </div>

                      <div class="mt-4 pt-4 border-t border-border/50 flex flex-col gap-4">
                          <div class="grid grid-cols-3 gap-2">
                              <button 
                                v-for="fmt in formats" 
                                :key="fmt.mime"
                                @click="targetFormat = fmt.mime; convert()"
                                class="py-2 rounded-lg text-xs font-bold uppercase transition-all border"
                                :class="targetFormat === fmt.mime ? 'bg-primary border-primary text-white shadow-lg shadow-primary/25' : 'bg-background border-border text-muted-foreground hover:bg-muted'"
                              >
                                {{ fmt.label }}
                              </button>
                          </div>
                          
                          <button 
                             @click="downloadImage"
                             :disabled="!convertedUrl" 
                             class="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all flex items-center justify-center gap-2"
                          >
                             <Download :size="16" /> Download Image
                          </button>
                      </div>
                 </div>
             </div>
        </template>
    </div>
  </div>
</template>
