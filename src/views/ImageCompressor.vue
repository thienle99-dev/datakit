<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Compressor from 'compressorjs';
import { 
  ArrowLeft, 
  Image as ImageIcon, 
  UploadCloud, 
  Download, 
  Maximize, 
  Minimize, 
  RefreshCw, 
  FileImage,
  Sliders,
  Check,
  Trash2
} from 'lucide-vue-next';

// --- State ---
const file = ref<File | null>(null);
const fileUrl = ref<string | null>(null);
const compressedFile = ref<Blob | null>(null);
const compressedUrl = ref<string | null>(null);
const isProcessing = ref(false);

const settings = ref({
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1920,
    mimeType: 'auto', // auto, image/jpeg, image/png, image/webp
    convertSize: 1000000, // Files over this size (1MB) are compressed automatically? No, we compress always on trigger.
});

const originalSize = computed(() => file.value ? file.value.size : 0);
const compressedSize = computed(() => compressedFile.value ? compressedFile.value.size : 0);
const compressionRatio = computed(() => {
    if (!originalSize.value || !compressedSize.value) return 0;
    return Math.round((1 - compressedSize.value / originalSize.value) * 100);
});

// Watch settings changes to re-compress (debounce?)
let debounceTimer: any = null;
watch(settings, () => {
    if (file.value) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(compressImage, 500);
    }
}, { deep: true });

// --- Actions ---

const handleFile = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
        loadFile(input.files[0]);
    }
};

const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
        loadFile(event.dataTransfer.files[0]);
    }
};

const loadFile = (f: File) => {
    // Reset
    if (fileUrl.value) URL.revokeObjectURL(fileUrl.value);
    if (compressedUrl.value) URL.revokeObjectURL(compressedUrl.value);
    
    file.value = f;
    fileUrl.value = URL.createObjectURL(f);
    
    // Default settings based on image
    // We could read image dimensions here to set max width/height defaults
    // For now, keep defaults or set to current?
    
    compressImage();
};

const compressImage = () => {
    if (!file.value) return;
    
    isProcessing.value = true;
    
    // Determine type
    let mime = settings.value.mimeType;
    if (mime === 'auto') mime = file.value.type;
    
    new Compressor(file.value, {
        quality: settings.value.quality,
        maxWidth: settings.value.maxWidth || undefined, // 0 or empty means no max
        maxHeight: settings.value.maxHeight || undefined,
        mimeType: mime,
        success(result) {
            if (compressedUrl.value) URL.revokeObjectURL(compressedUrl.value);
            compressedFile.value = result;
            compressedUrl.value = URL.createObjectURL(result);
            isProcessing.value = false;
        },
        error(err) {
            console.error(err);
            isProcessing.value = false;
        },
    });
};

const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const downloadImage = () => {
    if (!compressedFile.value || !compressedUrl.value) return;
    
    const link = document.createElement('a');
    link.href = compressedUrl.value;
    
    // Name
    const ext = settings.value.mimeType === 'auto' ? file.value?.name.split('.').pop() : settings.value.mimeType.split('/')[1];
    let name = file.value?.name.split('.')[0] + '_compressed.' + ext;
    if (settings.value.mimeType !== 'auto') {
         // Force extension if format changed
         name = file.value?.name.split('.')[0] + '_compressed.' + settings.value.mimeType.split('/')[1];
    }
    
    link.download = name;
    link.click();
};

const clearAll = () => {
    if (fileUrl.value) URL.revokeObjectURL(fileUrl.value);
    if (compressedUrl.value) URL.revokeObjectURL(compressedUrl.value);
    file.value = null;
    fileUrl.value = null;
    compressedFile.value = null;
    compressedUrl.value = null;
};

// Utils for input
const setQuality = (q: number) => {
    settings.value.quality = q;
};

</script>

<template>
  <div class="h-screen-minus-header flex flex-col p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
    
    <!-- Header -->
    <div class="flex items-center justify-between gap-4 mb-6 shrink-0">
        <div class="flex items-center gap-4">
             <router-link to="/" class="p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors">
              <ArrowLeft :size="20" />
            </router-link>
            <div class="flex items-center gap-3">
              <div class="bg-indigo-500/10 text-indigo-500 p-2 rounded-lg">
                <ImageIcon :size="24" />
              </div>
              <div>
                <h1 class="text-xl font-bold tracking-tight">Image Compressor</h1>
                <p class="text-sm text-muted-foreground">Compress and resize images directly in your browser</p>
              </div>
            </div>
        </div>
        
        <div v-if="file" class="flex gap-2">
             <button @click="compressImage" class="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                 <RefreshCw :size="14" :class="{ 'animate-spin': isProcessing }" /> Refresh
             </button>
             <button @click="clearAll" class="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors">
                 <Trash2 :size="14" /> Clear
             </button>
        </div>
    </div>

    <!-- Empty State -->
    <div 
        v-if="!file"
        class="flex-1 border-2 border-dashed border-border/50 hover:border-indigo-500/50 hover:bg-indigo-500/5 rounded-3xl transition-all flex flex-col items-center justify-center gap-6 cursor-pointer group animate-in fade-in zoom-in-95 duration-300"
        @dragover.prevent
        @drop.prevent="handleDrop"
        @click="(document.querySelector('#file-upload') as HTMLInputElement)?.click()"
    >
        <input id="file-upload" type="file" accept="image/*" @change="handleFile" class="hidden" />
        <div class="p-6 bg-background rounded-full shadow-xl shadow-indigo-500/10 text-muted-foreground group-hover:text-indigo-500 group-hover:scale-110 transition-all duration-300">
            <UploadCloud :size="48" stroke-width="1.5" />
        </div>
        <div class="text-center space-y-2">
            <h3 class="text-xl font-bold tracking-tight">Click or Drop Image Here</h3>
            <p class="text-muted-foreground max-w-sm mx-auto">Supports JPG, PNG, WebP. Compression happens locally—your images are never uploaded.</p>
        </div>
    </div>

    <!-- Workspace -->
    <div v-else class="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        
        <!-- Controls Sidebar -->
        <div class="w-full lg:w-80 shrink-0 flex flex-col gap-4 overflow-y-auto">
            
            <div class="bg-card border border-border rounded-xl p-5 space-y-6 shadow-sm">
                <div class="flex items-center gap-2 pb-2 border-b border-border/50">
                    <Sliders :size="16" class="text-indigo-500" />
                    <h3 class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Settings</h3>
                </div>
                
                <!-- Format -->
                <div class="space-y-3">
                    <label class="text-xs font-bold text-foreground">Output Format</label>
                    <div class="grid grid-cols-2 gap-2">
                        <button 
                            v-for="fmt in ['auto', 'image/jpeg', 'image/png', 'image/webp']" 
                            :key="fmt"
                            @click="settings.mimeType = fmt"
                            class="px-3 py-2 rounded-lg text-xs font-medium border transition-all text-center"
                            :class="settings.mimeType === fmt ? 'bg-indigo-500 text-white border-indigo-500 shadow-custom' : 'bg-background border-border hover:border-indigo-500/50'"
                        >
                            {{ fmt === 'auto' ? 'Original' : fmt.split('/')[1].toUpperCase() }}
                        </button>
                    </div>
                </div>

                <!-- Quality -->
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <label class="text-xs font-bold text-foreground">Quality</label>
                        <span class="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{{ Math.round(settings.quality * 100) }}%</span>
                    </div>
                    <input 
                        v-model.number="settings.quality" 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01" 
                        class="w-full accent-indigo-500 cursor-pointer h-2 bg-muted rounded-full appearance-none" 
                    />
                    <div class="flex justify-between text-[10px] text-muted-foreground font-medium uppercase px-1">
                        <span @click="setQuality(0.1)" class="cursor-pointer hover:text-foreground">Low</span>
                         <span @click="setQuality(0.6)" class="cursor-pointer hover:text-foreground">Balanced</span>
                        <span @click="setQuality(1)" class="cursor-pointer hover:text-foreground">High</span>
                    </div>
                </div>

                <!-- Dimensions -->
                <div class="space-y-3">
                    <label class="text-xs font-bold text-foreground">Max Dimensions</label>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="space-y-1">
                            <span class="text-[10px] text-muted-foreground font-bold uppercase">Width</span>
                            <input v-model.number="settings.maxWidth" type="number" class="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-indigo-500 transition-colors" />
                        </div>
                        <div class="space-y-1">
                            <span class="text-[10px] text-muted-foreground font-bold uppercase">Height</span>
                            <input v-model.number="settings.maxHeight" type="number" class="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-indigo-500 transition-colors" />
                        </div>
                    </div>
                    <p class="text-[10px] text-muted-foreground leading-relaxed">
                        Aspect ratio is always maintained. Images smaller than these dimensions won't be upscaled.
                    </p>
                </div>

            </div>

            <!-- Stats & Download -->
             <div class="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
                 <div class="space-y-2">
                     <div class="flex justify-between items-center text-sm">
                         <span class="text-muted-foreground">Original:</span>
                         <span class="font-mono">{{ formatSize(originalSize) }}</span>
                     </div>
                     <div class="flex justify-between items-center text-sm">
                         <span class="text-muted-foreground">Compressed:</span>
                         <span class="font-mono font-bold" :class="compressionRatio > 0 ? 'text-emerald-500' : 'text-foreground'">{{ formatSize(compressedSize) }}</span>
                     </div>
                      <div class="flex justify-between items-center text-sm pt-2 border-t border-border/50">
                         <span class="text-muted-foreground">Savings:</span>
                         <span class="font-mono font-bold text-emerald-500">{{ compressionRatio }}%</span>
                     </div>
                 </div>

                 <button 
                    @click="downloadImage"
                    :disabled="isProcessing || !compressedFile"
                    class="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                 >
                     <Download :size="18" /> {{ isProcessing ? 'Compressing...' : 'Download Image' }}
                 </button>
             </div>

        </div>

        <!-- Preview Area -->
        <div class="flex-1 bg-muted/10 border border-border/50 rounded-2xl flex items-center justify-center relative overflow-hidden group">
            
            <div class="absolute inset-0 pattern-grid opacity-[0.4] pointer-events-none"></div>

            <div v-if="compressedUrl" class="relative max-w-full max-h-full p-4 md:p-8 flex flex-col items-center">
                 <img :src="compressedUrl" class="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl ring-1 ring-border/20 bg-background" />
                 
                 <div class="absolute bottom-6 bg-black/70 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                     Preview Mode
                 </div>
            </div>
            
            <div v-if="isProcessing" class="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
                <RefreshCw :size="32" class="animate-spin text-indigo-500" />
            </div>

        </div>
    </div>

  </div>
</template>

<style scoped>
.h-screen-minus-header {
    height: calc(100vh - var(--header-height, 64px));
}
.pattern-grid {
    background-image: radial-gradient(var(--border) 1px, transparent 1px);
    background-size: 20px 20px;
}
.shadow-custom {
    box-shadow: 0 4px 12px -2px rgba(99, 102, 241, 0.3);
}
</style>
