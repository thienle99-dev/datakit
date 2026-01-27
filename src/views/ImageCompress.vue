<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import { 
  ArrowLeft, 
  Loader2, 
  X, 
  Download, 
  Minimize2
} from 'lucide-vue-next';
import FileUploader from '../components/shared/FileUploader.vue';
import ImagePreview from '../components/shared/ImagePreview.vue';
import { fileToDataURL, compressImage } from '../utils/imageUtils';

const originalFile = ref<File | null>(null);
const originalUrl = ref<string>('');
const compressedUrl = ref<string>('');
const compressedBlob = ref<Blob | null>(null);

// Settings
const quality = ref(80);
const maxWidth = ref<number | undefined>(undefined);
const maxHeight = ref<number | undefined>(undefined);

const processing = ref(false);
const error = ref<string | null>(null);

// Computed stats
const originalSize = ref(0);
const compressedSize = ref(0);

function formatSize(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function handleFile(file: File) {
  originalFile.value = file;
  originalSize.value = file.size;
  error.value = null;
  processing.value = true;
  
  try {
    originalUrl.value = await fileToDataURL(file);
    await processImage();
  } catch (err: any) {
    error.value = "Failed to load image: " + err.message;
  } finally {
    processing.value = false;
  }
}

async function processImage() {
  if (!originalFile.value) return;
  processing.value = true;
  
  try {
    // Revoke previous URL to avoid memory leaks
    if (compressedUrl.value) URL.revokeObjectURL(compressedUrl.value);
    
    const blob = await compressImage(
      originalFile.value, 
      quality.value / 100, 
      originalFile.value.type,
      maxWidth.value, 
      maxHeight.value
    );
    
    compressedBlob.value = blob;
    compressedSize.value = blob.size;
    compressedUrl.value = URL.createObjectURL(blob);
  } catch (err: any) {
    error.value = "Compression failed: " + err.message;
  } finally {
    processing.value = false;
  }
}

function downloadImage() {
  if (!compressedBlob.value || !originalFile.value) return;
  
  const link = document.createElement('a');
  link.href = compressedUrl.value;
  // Insert -compressed before extension
  const name = originalFile.value.name;
  const dotIndex = name.lastIndexOf('.');
  const baseName = dotIndex !== -1 ? name.substring(0, dotIndex) : name;
  const ext = dotIndex !== -1 ? name.substring(dotIndex) : '';
  
  link.download = `${baseName}-compressed${ext}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function resetTool() {
  if (compressedUrl.value) URL.revokeObjectURL(compressedUrl.value);
  originalFile.value = null;
  originalUrl.value = '';
  compressedUrl.value = '';
  compressedBlob.value = null;
  error.value = null;
  quality.value = 80;
}

// Watch for setting changes to re-process (debounce could be added)
let debounceTimer: any;
watch([quality, maxWidth, maxHeight], () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    processImage();
  }, 300);
});

onUnmounted(() => {
  if (compressedUrl.value) URL.revokeObjectURL(compressedUrl.value);
});
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
          <span class="p-2.5 bg-blue-500/10 text-blue-500 rounded-2xl shadow-inner"><Minimize2 :size="32" /></span>
          Image Compress
        </h2>
        <p class="text-muted-foreground text-lg max-w-xl">
          Reduce image file size while maintaining quality.
        </p>
      </div>

      <div v-if="originalFile" class="flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
        <button 
          @click="downloadImage" 
          :disabled="processing"
          class="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
        >
          <Loader2 v-if="processing" :size="18" class="animate-spin" />
          <Download v-else :size="18" />
          <span>Download Compressed</span>
        </button>

        <button 
          @click="resetTool" 
          class="flex items-center gap-2 px-5 py-2.5 bg-card hover:bg-muted text-foreground border border-border rounded-xl transition-all shadow-sm group"
        >
          <X :size="18" class="text-muted-foreground group-hover:text-red-500 font-bold" />
          <span class="font-semibold text-sm">Clear</span>
        </button>
      </div>
    </div>

    <!-- Main Content -->
     <div class="flex-1 min-h-0 flex flex-col relative">
       <!-- Error Message -->
       <div v-if="error" class="mb-4 p-4 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 font-medium text-sm">
         {{ error }}
       </div>

       <!-- Upload State -->
       <div v-if="!originalFile" class="h-full max-w-2xl mx-auto flex flex-col justify-center animate-in fade-in zoom-in-95 duration-500">
         <FileUploader 
            @files-selected="handleFile" 
            accept="image/*" 
            description="Supports JPG, PNG, WebP" 
            class="min-h-[350px]" 
         />
       </div>

       <!-- Editor State -->
       <div v-else class="h-full flex flex-col md:flex-row gap-6 animate-in fade-in zoom-in-95 duration-500">
         
         <!-- Controls Sidebar -->
         <div class="w-full md:w-80 flex flex-col glass-card border border-border/50 rounded-3xl bg-card overflow-hidden shadow-xl shadow-primary/5">
            <div class="p-5 border-b border-border bg-muted/20">
               <h3 class="font-bold text-sm tracking-tight flex items-center gap-2 mb-4">
                  Compression Settings
               </h3>
               
               <div class="space-y-6">
                 <div>
                   <label class="text-xs font-bold uppercase text-muted-foreground mb-2 block">Quality: {{ quality }}%</label>
                   <input 
                     type="range" 
                     v-model.number="quality" 
                     min="1" 
                     max="100" 
                     class="w-full accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                   />
                 </div>

                 <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">Max Width</label>
                        <input type="number" v-model.number="maxWidth" placeholder="Auto" class="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm" />
                    </div>
                    <div>
                        <label class="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">Max Height</label>
                        <input type="number" v-model.number="maxHeight" placeholder="Auto" class="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm" />
                    </div>
                 </div>
               </div>
            </div>

            <div class="p-5 flex-1 bg-muted/10">
               <h3 class="font-bold text-sm tracking-tight mb-4">Statistics</h3>
               
               <div class="space-y-3">
                 <div class="flex justify-between items-center text-sm">
                   <span class="text-muted-foreground">Original Size:</span>
                   <span class="font-mono font-medium">{{ formatSize(originalSize) }}</span>
                 </div>
                 <div class="flex justify-between items-center text-sm">
                   <span class="text-muted-foreground">Compressed:</span>
                   <span class="font-mono font-bold text-primary">{{ formatSize(compressedSize) }}</span>
                 </div>
                 <div class="w-full h-px bg-border my-2"></div>
                 <div class="flex justify-between items-center">
                   <span class="font-bold text-sm">Savings:</span>
                   <span class="font-bold text-emerald-500 text-lg">
                     {{ ((originalSize - compressedSize) / originalSize * 100).toFixed(1) }}%
                   </span>
                 </div>
               </div>
            </div>
         </div>

         <!-- Preview Area -->
         <div class="flex-1 min-w-0 glass-card rounded-3xl border border-border/50 shadow-2xl shadow-primary/5 p-4 flex flex-col">
            <h3 class="font-bold text-sm tracking-tight mb-4 text-muted-foreground uppercase flex justify-between">
              <span>Preview</span>
              <span v-if="processing" class="text-primary flex items-center gap-2"><Loader2 class="animate-spin" :size="12"/> Processing...</span>
            </h3>
            <div class="flex-1 relative rounded-xl overflow-hidden bg-muted/30 border border-border/50">
               <ImagePreview :src="compressedUrl || originalUrl" />
            </div>
         </div>

       </div>
     </div>
  </div>
</template>
