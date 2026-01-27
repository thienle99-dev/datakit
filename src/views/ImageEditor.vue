<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { 
  ArrowLeft, X, Download, RotateCw, RotateCw as RotateCcw, // Fix: basic RotateCcw import if needed or use Lucide's
  FlipHorizontal, FlipVertical, Image as ImageIcon,
  Loader2, Check, ZoomIn
} from 'lucide-vue-next';
import FileUploader from '../components/shared/FileUploader.vue';
import { fileToDataURL, loadImage, upscaleImage, ASPECT_RATIO_PRESETS } from '../utils/imageUtils';

const route = useRoute();
const activeTab = ref<'resize' | 'rotate' | 'compress' | 'convert' | 'crop' | 'upscaler'>('resize');

// Initialize tab from route query or name
onMounted(() => {
    if (route.path.includes('compress')) activeTab.value = 'compress';
    else if (route.path.includes('convert')) activeTab.value = 'convert';
    else if (route.path.includes('rotate')) activeTab.value = 'rotate';
    else if (route.path.includes('crop')) activeTab.value = 'crop';
    else if (route.path.includes('upscaler')) activeTab.value = 'upscaler';
    else if (route.query.tab) activeTab.value = route.query.tab as any;
});

const originalFile = ref<File | null>(null);
const currentUrl = ref<string>(''); // The current working image URL (after edits)
const previewUrl = ref<string>(''); // The preview for the current operation
const processing = ref(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);

// Image Properties
const originalDimensions = ref({ width: 0, height: 0 });
const currentDimensions = ref({ width: 0, height: 0 });
const currentSize = ref(0); // Approximate size in bytes

// --- RESIZE STATE ---
const resizeWidth = ref(0);
const resizeHeight = ref(0);
const maintainAspectRatio = ref(true);
const aspectRatio = ref(1);

// --- ROTATE STATE ---
const rotateAngle = ref(0);
const scaleX = ref(1);
const scaleY = ref(1);

// --- CROP STATE ---
const cropData = ref({ x: 0, y: 0, width: 0, height: 0 });
const imageRef = ref<HTMLImageElement | null>(null);
const displayMultiplier = ref(1);

const updateDisplayMetrics = () => {
    if (imageRef.value && imageRef.value.naturalWidth) {
        displayMultiplier.value = imageRef.value.offsetWidth / imageRef.value.naturalWidth;
    }
};

onMounted(() => {
    window.addEventListener('resize', updateDisplayMetrics);
});
onUnmounted(() => {
    window.removeEventListener('resize', updateDisplayMetrics);
});

// --- COMPRESS STATE ---
const compressQuality = ref(80);
const compressedSize = ref(0); // Estimated

// --- CONVERT STATE ---
const targetFormat = ref('image/png');
const formats = [
  { label: 'PNG', mime: 'image/png', ext: 'png' },
  { label: 'JPEG', mime: 'image/jpeg', ext: 'jpg' },
  { label: 'WEBP', mime: 'image/webp', ext: 'webp' },
];

// --- UPSCALER STATE ---
const upscaleFactor = ref(2);
const upscaleMethod = ref<'bicubic' | 'lanczos' | 'nearest' | 'bilinear'>('bicubic');
const selectedAspectRatio = ref<keyof typeof ASPECT_RATIO_PRESETS | 'custom'>('custom');
const customAspectRatio = ref({ width: 1, height: 1 });
const upscaledDimensions = ref({ width: 0, height: 0 });

async function handleFile(file: File) {
  originalFile.value = file;
  processing.value = true;
  error.value = null;
  currentSize.value = file.size;

  try {
    const url = await fileToDataURL(file);
    currentUrl.value = url;
    previewUrl.value = url;
    
    // Load image to get dims
    const img = await loadImage(url);
    originalDimensions.value = { width: img.width, height: img.height };
    currentDimensions.value = { width: img.width, height: img.height };
    
    resetResizeState();
    resetCropState(img.width, img.height);
    
    // Reset transforms
    rotateAngle.value = 0;
    scaleX.value = 1;
    scaleY.value = 1;

    // Reset compress
    compressQuality.value = 80;
    
  } catch (err: any) {
    error.value = "Failed to load image: " + err.message;
  } finally {
    processing.value = false;
  }
}

function resetResizeState() {
    resizeWidth.value = currentDimensions.value.width;
    resizeHeight.value = currentDimensions.value.height;
    aspectRatio.value = resizeWidth.value / resizeHeight.value;
}

function resetCropState(w: number, h: number) {
    cropData.value = { x: 0, y: 0, width: w, height: h };
}

// Watchers for Resize Input
function onWidthChange() {
    if (maintainAspectRatio.value && aspectRatio.value) {
        resizeHeight.value = Math.round(resizeWidth.value / aspectRatio.value);
    }
}
function onHeightChange() {
    if (maintainAspectRatio.value && aspectRatio.value) {
        resizeWidth.value = Math.round(resizeHeight.value * aspectRatio.value);
    }
}

// --- CORE IMAGE PROCESSING ---
async function processImage(operation: 'resize' | 'rotate' | 'compress' | 'convert' | 'crop' | 'upscaler'): Promise<Blob> {
    const img = await loadImage(currentUrl.value);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Canvas not supported");

    // const finalW = img.width;
    // const finalH = img.height;
    let type = originalFile.value?.type || 'image/png';
    let quality = 0.92;

    if (operation === 'resize') {
        canvas.width = resizeWidth.value;
        canvas.height = resizeHeight.value;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    } 
    else if (operation === 'rotate') {
        const rad = rotateAngle.value * Math.PI / 180;
        const sin = Math.abs(Math.sin(rad));
        const cos = Math.abs(Math.cos(rad));
        canvas.width = img.width * cos + img.height * sin;
        canvas.height = img.width * sin + img.height * cos;
        
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.rotate(rad);
        ctx.scale(scaleX.value, scaleY.value);
        ctx.drawImage(img, -img.width/2, -img.height/2);
    }
    else if (operation === 'crop') {
        canvas.width = cropData.value.width;
        canvas.height = cropData.value.height;
        ctx.drawImage(
            img, 
            cropData.value.x, cropData.value.y, cropData.value.width, cropData.value.height,
            0, 0, cropData.value.width, cropData.value.height
        );
    }
    else if (operation === 'compress') {
        quality = compressQuality.value / 100;
        type = 'image/jpeg';
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
    }
    else if (operation === 'convert') {
        type = targetFormat.value;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
    }
    else if (operation === 'upscaler') {
        if (!originalFile.value) throw new Error('No file loaded');
        const aspectRatio = selectedAspectRatio.value === 'custom' 
            ? undefined
            : ASPECT_RATIO_PRESETS[selectedAspectRatio.value];
        return await upscaleImage(originalFile.value, upscaleFactor.value, upscaleMethod.value, aspectRatio);
    }

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Operation failed'));
        }, type, quality);
    });
}

async function applyChange(op: 'resize' | 'rotate' | 'compress' | 'convert' | 'crop' | 'upscaler') {
    if (!originalFile.value) return;
    processing.value = true;
    error.value = null;

    try {
        const blob = await processImage(op);
        const newUrl = URL.createObjectURL(blob);
        
        // Revoke old URL if it wasn't the original
        // Note: For undo history we'd keep it. MVP: Overwrite.
        if (currentUrl.value && currentUrl.value !== previewUrl.value) {
            // Be careful not to revoke the one we just made if preview == current
        }

        currentUrl.value = newUrl;
        previewUrl.value = newUrl;
        currentSize.value = blob.size;
        
        // Update dimensions based on new image
        const img = await loadImage(newUrl);
        currentDimensions.value = { width: img.width, height: img.height };
        
        // Reset local state if needed
        if (op === 'resize') resetResizeState();
        if (op === 'rotate') { rotateAngle.value = 0; scaleX.value = 1; scaleY.value = 1; }
        if (op === 'crop') resetCropState(img.width, img.height);
        if (op === 'upscaler') {
            upscaledDimensions.value = { width: img.width, height: img.height };
        }
        
        successMessage.value = "Changes applied successfully!";
        setTimeout(() => successMessage.value = null, 2000);

    } catch (err: any) {
        error.value = "Failed to apply changes: " + err.message;
    } finally {
        processing.value = false;
    }
}

// Preview Compress Size logic
let debounceTimer: any;
watch(compressQuality, () => {
    if (activeTab.value !== 'compress') return;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
        try {
            const blob = await processImage('compress');
            compressedSize.value = blob.size;
        } catch(e) {}
    }, 300);
});

// Switch Tabs Logic
watch(activeTab, async (newTab) => {
    // Reset preview to current applied state when switching
    previewUrl.value = currentUrl.value; 
    
    // Initializes specific tab data
    if (newTab === 'resize') resetResizeState();
    if (newTab === 'compress') {
        // Trigger initial estimate
        try {
            const blob = await processImage('compress');
            compressedSize.value = blob.size;
        } catch(e) {}
    }
    if (newTab === 'upscaler') {
        // Preview upscaled dimensions
        const aspectRatio = selectedAspectRatio.value === 'custom' 
            ? undefined
            : ASPECT_RATIO_PRESETS[selectedAspectRatio.value];
        let targetWidth = Math.round(currentDimensions.value.width * upscaleFactor.value);
        let targetHeight = Math.round(currentDimensions.value.height * upscaleFactor.value);
        if (aspectRatio) {
            const targetRatio = aspectRatio.width / aspectRatio.height;
            const currentRatio = targetWidth / targetHeight;
            if (currentRatio > targetRatio) {
                targetHeight = Math.round(targetWidth / targetRatio);
            } else {
                targetWidth = Math.round(targetHeight * targetRatio);
            }
        }
        upscaledDimensions.value = { width: targetWidth, height: targetHeight };
    }
});

function downloadImage() {
    const link = document.createElement('a');
    link.href = currentUrl.value;
    // Construct filename
    const originalName = originalFile.value?.name || 'image';
    const dotIdx = originalName.lastIndexOf('.');
    const name = dotIdx > -1 ? originalName.substring(0, dotIdx) : originalName;
    
    // Determine extension based on mime type of blob? 
    // Since we don't store the blob mime type easily, we guess or force png/jpg depending on last op.
    // Ideally we track current mime.
    link.download = `edited-${name}`; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function resetTool() {
     if (currentUrl.value) URL.revokeObjectURL(currentUrl.value);
     originalFile.value = null;
     currentUrl.value = '';
     previewUrl.value = '';
     rotateAngle.value = 0;
     scaleX.value = 1;
     scaleY.value = 1;
     error.value = null;
}

onUnmounted(() => {
    if (currentUrl.value) URL.revokeObjectURL(currentUrl.value);
});

function formatSize(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
          <span class="p-2.5 bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-purple-500 rounded-2xl shadow-inner"><ImageIcon :size="32" /></span>
          Image Studio
        </h2>
        <p class="text-muted-foreground text-lg max-w-xl">
          Resize, Upscale, Compress, Rotate, Crop, and Convert — all in one place.
        </p>
      </div>
      
      <div v-if="originalFile" class="flex items-center gap-3">
          <button @click="downloadImage" class="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg transition-all active:scale-95">
             <Download :size="18"/> Download Result
          </button>
          <button @click="resetTool" class="bg-card border border-border px-4 py-2.5 rounded-xl font-bold hover:bg-muted transition-all text-muted-foreground">
             <X :size="18"/>
          </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 min-h-0 flex flex-col glass-card border border-border/50 rounded-3xl overflow-hidden relative shadow-2xl shadow-primary/5">
        
        <!-- Upload State -->
        <div v-if="!originalFile" class="absolute inset-0 z-10 bg-background/50 flex flex-col items-center justify-center p-8">
             <FileUploader @files-selected="handleFile" accept="image/*" description="Drop an image to start editing" class="max-w-xl w-full" />
        </div>

        <div v-else class="flex flex-col md:flex-row h-full">
            <!-- Sidebar Controls -->
            <div class="w-full md:w-80 bg-card border-r border-border/50 flex flex-col z-20">
                <!-- Tabs -->
                <div class="flex border-b border-border/50 overflow-x-auto scrollbar-hide">
                    <button 
                        v-for="tab in ['resize', 'rotate', 'crop', 'upscaler', 'compress', 'convert']" 
                        :key="tab"
                        @click="activeTab = tab as any"
                        class="flex-1 px-4 py-4 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap"
                        :class="activeTab === tab ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'"
                    >
                        {{ tab }}
                    </button>
                </div>

                <!-- Tab Content -->
                <div class="p-6 overflow-y-auto flex-1 relative">
                    <div v-if="processing" class="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
                        <Loader2 class="animate-spin text-primary" :size="32"/>
                    </div>

                    <div v-if="successMessage" class="mb-4 p-3 bg-green-500/10 text-green-600 rounded-xl border border-green-500/20 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                        <Check :size="14" /> {{ successMessage }}
                    </div>

                    <!-- RESIZE -->
                    <div v-if="activeTab === 'resize'" class="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                        <div class="space-y-4">
                            <div>
                                 <label class="text-[10px] font-bold uppercase text-muted-foreground mb-1.5 block">Width (px)</label>
                                 <input type="number" v-model.number="resizeWidth" @input="onWidthChange" class="w-full px-3 py-2.5 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono text-sm" />
                            </div>
                            <div>
                                 <label class="text-[10px] font-bold uppercase text-muted-foreground mb-1.5 block">Height (px)</label>
                                 <input type="number" v-model.number="resizeHeight" @input="onHeightChange" class="w-full px-3 py-2.5 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono text-sm" />
                            </div>
                            <div class="flex items-center gap-2 pt-2">
                                 <input type="checkbox" v-model="maintainAspectRatio" id="ratio" class="accent-primary w-4 h-4 rounded" />
                                 <label for="ratio" class="text-sm font-medium cursor-pointer select-none">Maintain Aspect Ratio</label>
                            </div>
                        </div>
                        
                        <div class="pt-4 border-t border-border/50">
                             <button @click="applyChange('resize')" class="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all">
                                Apply Resize
                             </button>
                        </div>
                    </div>

                    <!-- ROTATE -->
                    <div v-if="activeTab === 'rotate'" class="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                         <div class="grid grid-cols-2 gap-3">
                             <button @click="rotateAngle = (rotateAngle - 90) % 360" class="p-4 border border-border rounded-xl hover:bg-primary/5 hover:border-primary/50 hover:text-primary flex flex-col items-center gap-2 transition-all group">
                                 <RotateCcw :size="24" class="text-muted-foreground group-hover:text-primary transition-colors"/> 
                                 <span class="text-[10px] uppercase font-bold">-90°</span>
                             </button>
                             <button @click="rotateAngle = (rotateAngle + 90) % 360" class="p-4 border border-border rounded-xl hover:bg-primary/5 hover:border-primary/50 hover:text-primary flex flex-col items-center gap-2 transition-all group">
                                 <RotateCw :size="24" class="text-muted-foreground group-hover:text-primary transition-colors"/> 
                                 <span class="text-[10px] uppercase font-bold">+90°</span>
                             </button>
                             <button @click="scaleX *= -1" class="p-4 border border-border rounded-xl hover:bg-primary/5 hover:border-primary/50 hover:text-primary flex flex-col items-center gap-2 transition-all group">
                                 <FlipHorizontal :size="24" class="text-muted-foreground group-hover:text-primary transition-colors"/> 
                                 <span class="text-[10px] uppercase font-bold">Flip H</span>
                             </button>
                             <button @click="scaleY *= -1" class="p-4 border border-border rounded-xl hover:bg-primary/5 hover:border-primary/50 hover:text-primary flex flex-col items-center gap-2 transition-all group">
                                 <FlipVertical :size="24" class="text-muted-foreground group-hover:text-primary transition-colors"/> 
                                 <span class="text-[10px] uppercase font-bold">Flip V</span>
                             </button>
                         </div>
                         <div class="bg-muted/30 p-3 rounded-lg text-xs font-mono text-center border border-border/50">
                              Rotation: {{ rotateAngle }}° <br/> Scale: {{ scaleX }}, {{ scaleY }}
                         </div>
                         <div class="pt-4 border-t border-border/50">
                             <button @click="applyChange('rotate')" class="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all">
                                Apply Transform
                             </button>
                        </div>
                    </div>

                    <!-- CROP -->
                     <div v-if="activeTab === 'crop'" class="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                 <label class="text-[10px] font-bold uppercase text-muted-foreground mb-1.5 block">X</label>
                                 <input type="number" v-model.number="cropData.x" class="w-full px-3 py-2.5 border border-border rounded-xl bg-background font-mono text-sm" />
                            </div>
                            <div>
                                 <label class="text-[10px] font-bold uppercase text-muted-foreground mb-1.5 block">Y</label>
                                 <input type="number" v-model.number="cropData.y" class="w-full px-3 py-2.5 border border-border rounded-xl bg-background font-mono text-sm" />
                            </div>
                            <div>
                                 <label class="text-[10px] font-bold uppercase text-muted-foreground mb-1.5 block">Width</label>
                                 <input type="number" v-model.number="cropData.width" class="w-full px-3 py-2.5 border border-border rounded-xl bg-background font-mono text-sm" />
                            </div>
                            <div>
                                 <label class="text-[10px] font-bold uppercase text-muted-foreground mb-1.5 block">Height</label>
                                 <input type="number" v-model.number="cropData.height" class="w-full px-3 py-2.5 border border-border rounded-xl bg-background font-mono text-sm" />
                            </div>
                        </div>
                        <div class="bg-muted/30 p-3 rounded-lg text-xs text-center border border-border/50 text-muted-foreground">
                              Drag the box on the image or adjust values.
                        </div>
                        <div class="pt-4 border-t border-border/50 grid gap-3">
                             <button @click="applyChange('crop')" class="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all">
                                Apply Crop
                             </button>
                             <button @click="resetCropState(currentDimensions.width, currentDimensions.height)" class="w-full py-2 bg-secondary text-secondary-foreground rounded-lg font-bold text-xs hover:bg-secondary/80 transition-all">
                                Reset Selection
                             </button>
                        </div>
                     </div>

                    <!-- COMPRESS -->
                     <div v-if="activeTab === 'compress'" class="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                        <div class="space-y-4">
                            <div class="flex justify-between items-end">
                                <label class="text-[10px] font-bold uppercase text-muted-foreground block">Quality</label>
                                <span class="text-xs font-mono font-bold text-primary">{{ compressQuality }}%</span>
                            </div>
                            <input 
                                type="range" 
                                v-model.number="compressQuality" 
                                min="1" 
                                max="100" 
                                class="w-full accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                            />
                            
                            <div class="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-2">
                                <div class="flex justify-between text-xs">
                                    <span class="text-muted-foreground">Original (Current):</span>
                                    <span class="font-mono">{{ formatSize(currentSize) }}</span>
                                </div>
                                <div class="flex justify-between text-xs">
                                    <span class="text-muted-foreground">Est. Compressed:</span>
                                    <span class="font-mono font-bold text-emerald-500">{{ formatSize(compressedSize) }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="pt-4 border-t border-border/50">
                             <button @click="applyChange('compress')" class="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all">
                                Apply Compression
                             </button>
                        </div>
                     </div>

                     <!-- CONVERT -->
                     <div v-if="activeTab === 'convert'" class="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                        <div class="grid grid-cols-1 gap-2">
                              <button 
                                v-for="fmt in formats" 
                                :key="fmt.mime"
                                @click="targetFormat = fmt.mime"
                                class="flex items-center justify-between p-3 rounded-xl border transition-all text-left"
                                :class="targetFormat === fmt.mime ? 'bg-primary border-primary text-white shadow-md' : 'bg-background border-border text-muted-foreground hover:bg-muted'"
                              >
                                <span class="font-bold text-xs uppercase">{{ fmt.label }}</span>
                                <Check v-if="targetFormat === fmt.mime" :size="14" stroke-width="3" />
                              </button>
                        </div>
                        <div class="pt-4 border-t border-border/50">
                             <button @click="applyChange('convert')" class="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all">
                                Convert & Apply
                             </button>
                        </div>
                     </div>

                     <!-- UPSCALER -->
                     <div v-if="activeTab === 'upscaler'" class="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                        <!-- Scale Factor -->
                        <div>
                            <label class="text-[10px] font-bold uppercase text-muted-foreground mb-2 block">Scale Factor</label>
                            <div class="grid grid-cols-4 gap-2 mb-2">
                                <button
                                    v-for="scale in [1.5, 2, 3, 4]"
                                    :key="scale"
                                    @click="upscaleFactor = scale"
                                    class="px-3 py-2 rounded-xl border transition-all text-xs font-medium"
                                    :class="upscaleFactor === scale ? 'bg-primary border-primary text-white' : 'bg-background border-border text-muted-foreground hover:bg-muted'"
                                >
                                    {{ scale }}x
                                </button>
                            </div>
                            <input
                                v-model.number="upscaleFactor"
                                type="number"
                                min="1"
                                max="10"
                                step="0.1"
                                class="w-full px-3 py-2.5 border border-border rounded-xl bg-background font-mono text-sm"
                            />
                        </div>

                        <!-- Upscale Method -->
                        <div>
                            <label class="text-[10px] font-bold uppercase text-muted-foreground mb-2 block">Method</label>
                            <select
                                v-model="upscaleMethod"
                                class="w-full px-3 py-2.5 border border-border rounded-xl bg-background text-sm"
                            >
                                <option value="bicubic">Bicubic (Recommended)</option>
                                <option value="lanczos">Lanczos (Sharpest)</option>
                                <option value="bilinear">Bilinear (Fast)</option>
                                <option value="nearest">Nearest (Pixel Art)</option>
                            </select>
                        </div>

                        <!-- Aspect Ratio -->
                        <div>
                            <label class="text-[10px] font-bold uppercase text-muted-foreground mb-2 block">Aspect Ratio (Optional)</label>
                            <select
                                v-model="selectedAspectRatio"
                                class="w-full px-3 py-2.5 border border-border rounded-xl bg-background text-sm mb-2"
                            >
                                <option value="custom">Custom (Keep Original)</option>
                                <option v-for="(preset, key) in ASPECT_RATIO_PRESETS" :key="key" :value="key">
                                    {{ preset.label }}
                                </option>
                            </select>
                            <div v-if="selectedAspectRatio === 'custom'" class="grid grid-cols-2 gap-2">
                                <input
                                    v-model.number="customAspectRatio.width"
                                    type="number"
                                    min="1"
                                    placeholder="Width"
                                    class="px-3 py-2 border border-border rounded-xl bg-background font-mono text-sm"
                                />
                                <input
                                    v-model.number="customAspectRatio.height"
                                    type="number"
                                    min="1"
                                    placeholder="Height"
                                    class="px-3 py-2 border border-border rounded-xl bg-background font-mono text-sm"
                                />
                            </div>
                        </div>

                        <!-- Info -->
                        <div class="bg-muted/30 p-3 rounded-lg text-xs border border-border/50 space-y-1">
                            <div>Original: <span class="font-mono">{{ currentDimensions.width }} × {{ currentDimensions.height }}px</span></div>
                            <div v-if="upscaledDimensions.width" class="text-primary">
                                Upscaled: <span class="font-mono">{{ upscaledDimensions.width }} × {{ upscaledDimensions.height }}px</span>
                            </div>
                        </div>

                        <div class="pt-4 border-t border-border/50">
                            <button @click="applyChange('upscaler')" class="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                <ZoomIn :size="16" />
                                Upscale {{ upscaleFactor }}x
                            </button>
                        </div>
                     </div>
                </div>

                <!-- Footer Info -->
                <div class="p-4 bg-muted/20 border-t border-border/50 text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex justify-between">
                    <span>{{ currentDimensions.width }} x {{ currentDimensions.height }}</span>
                    <span>{{ formatSize(currentSize) }}</span>
                </div>
            </div>

            <!-- Canvas/Preview -->
            <div class="flex-1 bg-muted/10 flex items-center justify-center p-8 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] overflow-hidden relative">
                 <div class="relative inline-block">
                     <img 
                        ref="imageRef"
                        :src="previewUrl" 
                        @load="updateDisplayMetrics"
                        class="max-w-full max-h-[calc(100vh-14rem)] object-contain shadow-2xl rounded-sm ring-1 ring-black/10 transition-transform duration-300 block" 
                        :style="{ 
                            transform: activeTab === 'rotate' ? `rotate(${rotateAngle}deg) scale(${scaleX}, ${scaleY})` : 'none',
                            filter: processing ? 'blur(2px)' : 'none'
                        }" 
                    />
                    
                    <!-- Crop Overlay -->
                    <div 
                        v-if="activeTab === 'crop'"
                        class="absolute border-2 border-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] cursor-move transition-none z-10"
                        :style="{
                            left: (cropData.x * displayMultiplier) + 'px',
                            top: (cropData.y * displayMultiplier) + 'px',
                            width: (cropData.width * displayMultiplier) + 'px',
                            height: (cropData.height * displayMultiplier) + 'px',
                            pointerEvents: 'none' /* For MVP, using inputs only initially to avoid drag complexity errors */
                        }"
                    >
                    </div>
                 </div>
            </div>
        </div>
    </div>
  </div>
</template>

