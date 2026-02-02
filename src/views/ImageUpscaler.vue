<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ArrowLeft, Download, Maximize2, AlertCircle, RefreshCw, Layers, Sliders, Layout } from 'lucide-vue-next';
import FileUploader from '@components/shared/FileUploader.vue';
import { upscaleImage, ASPECT_RATIO_PRESETS, loadImage, dataToImage } from '@utils/imageUtils';
import { parseFile } from '@utils/fileParser';

const originalFile = ref<File | null>(null);
const originalUrl = ref<string>('');
const upscaledUrl = ref<string>('');
const processing = ref(false);
const error = ref<string | null>(null);

const scaleFactor = ref(2);
const upscaleMethod = ref<'bicubic' | 'lanczos' | 'nearest' | 'bilinear'>('bicubic');
const selectedAspectRatio = ref<keyof typeof ASPECT_RATIO_PRESETS | 'original'>('original');

const originalDimensions = ref({ width: 0, height: 0 });
const upscaledDimensions = ref({ width: 0, height: 0 });
const hiddenInputRef = ref<HTMLInputElement | null>(null);
const sourceContainerRef = ref<HTMLElement | null>(null);

const cropPosition = ref({ x: 50, y: 50 });
const cropScale = ref(100); // 10-100%
const isDraggingCrop = ref(false);
const isResizingCrop = ref(false);

let dragStartPos = { x: 0, y: 0 };
let frameStartPos = { x: 50, y: 50 };

function startDraggingCrop(e: MouseEvent | TouchEvent) {
  if (selectedAspectRatio.value === 'original' || !sourceContainerRef.value) return;
  
  const clientX = 'touches' in e ? (e.touches[0]?.clientX ?? 0) : (e as MouseEvent).clientX;
  const clientY = 'touches' in e ? (e.touches[0]?.clientY ?? 0) : (e as MouseEvent).clientY;

  // Check if we hit a resize handle
  if ((e.target as HTMLElement).classList.contains('resize-handle')) {
    isResizingCrop.value = true;
    dragStartPos = { x: clientX, y: clientY };
    return;
  }

  isDraggingCrop.value = true;
  dragStartPos = { x: clientX, y: clientY };
  frameStartPos = { ...cropPosition.value };
}

function stopDraggingCrop() {
  isDraggingCrop.value = false;
  isResizingCrop.value = false;
}

function updateCropPosition(e: MouseEvent | TouchEvent) {
  if (!isDraggingCrop.value && !isResizingCrop.value) return;
  if (!sourceContainerRef.value) return;

  const rect = sourceContainerRef.value.getBoundingClientRect();
  const clientX = 'touches' in e ? (e.touches[0]?.clientX ?? 0) : (e as MouseEvent).clientX;
  const clientY = 'touches' in e ? (e.touches[0]?.clientY ?? 0) : (e as MouseEvent).clientY;

  if (isResizingCrop.value) {
    // Handle resizing (relative to center)
    const centerX = rect.left + (rect.width * cropPosition.value.x) / 100;
    const distance = Math.abs(clientX - centerX);
    const newScale = (distance / (rect.width / 2)) * 100;
    cropScale.value = Math.max(10, Math.min(100, newScale));
    return;
  }

  // Handle Relative Dragging
  const deltaX = ((clientX - dragStartPos.x) / rect.width) * 100;
  const deltaY = ((clientY - dragStartPos.y) / rect.height) * 100;
  
  cropPosition.value = {
    x: Math.max(0, Math.min(100, frameStartPos.x + deltaX)),
    y: Math.max(0, Math.min(100, frameStartPos.y + deltaY))
  };
}



function triggerChooseAnother() {
  if (hiddenInputRef.value) hiddenInputRef.value.value = '';
  hiddenInputRef.value?.click();
}

function onHiddenFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) handleFile(file);
}

const scaleOptions = [2, 4, 8];
const qualityOptions = [
  { value: 'bilinear', label: 'Standard', desc: 'Fast & Clean' },
  { value: 'bicubic', label: 'Balanced', desc: 'Natural Detail' },
  { value: 'lanczos', label: 'Ultra Sharp', desc: 'Maximum Clarity' },
  { value: 'nearest', label: 'Pixel Art', desc: 'Preserve Edges' },
];

const sizeIncrease = computed(() => {
  if (!originalDimensions.value.width || !upscaledDimensions.value.width) return 0;
  return (upscaledDimensions.value.width * upscaledDimensions.value.height) / 
         (originalDimensions.value.width * originalDimensions.value.height);
});

async function handleFile(file: File) {
  originalFile.value = file;
  error.value = null;
  upscaledUrl.value = '';
  
  try {
    let fileToLoad: File | Blob = file;
    
    // Check if it's a document format
    const isDoc = file.name.match(/\.(csv|xlsx|xls|txt)$/);
    if (isDoc) {
      const { headers, data } = await parseFile(file);
      fileToLoad = await dataToImage(headers, data);
    }

    if (originalUrl.value) URL.revokeObjectURL(originalUrl.value);
    originalUrl.value = URL.createObjectURL(fileToLoad);
    const img = await loadImage(originalUrl.value);
    originalDimensions.value = { width: img.width, height: img.height };
    upscaledDimensions.value = { width: 0, height: 0 };
  } catch (err: any) {
    error.value = 'Failed to load file: ' + err.message;
  }
}

async function processUpscale() {
  if (!originalFile.value) return;
  processing.value = true;
  error.value = null;
  
  try {
    const aspectRatio = selectedAspectRatio.value === 'original' 
      ? undefined
      : ASPECT_RATIO_PRESETS[selectedAspectRatio.value];
    
    const blob = await upscaleImage(
      originalFile.value,
      scaleFactor.value,
      upscaleMethod.value,
      aspectRatio,
      cropPosition.value,
      cropScale.value
    );
    
    if (upscaledUrl.value) URL.revokeObjectURL(upscaledUrl.value);
    upscaledUrl.value = URL.createObjectURL(blob);
    
    const img = await loadImage(upscaledUrl.value);
    upscaledDimensions.value = { width: img.width, height: img.height };
    
  } catch (err: any) {
    error.value = 'Upscaling failed: ' + err.message;
  } finally {
    processing.value = false;
  }
}

function downloadUpscaled() {
  if (!upscaledUrl.value || !originalFile.value) return;
  const a = document.createElement('a');
  a.href = upscaledUrl.value;
  const ext = originalFile.value.name.split('.').pop() || 'png';
  a.download = `upscaled-${scaleFactor.value}x-${originalFile.value.name.replace(/\.[^/.]+$/, '')}.${ext}`;
  a.click();
}

onMounted(() => {
  window.addEventListener('paste', handlePaste);
  window.addEventListener('mouseup', stopDraggingCrop);
  window.addEventListener('touchend', stopDraggingCrop);
});

onUnmounted(() => {
  window.removeEventListener('paste', handlePaste);
  window.removeEventListener('mouseup', stopDraggingCrop);
  window.removeEventListener('touchend', stopDraggingCrop);
  if (originalUrl.value) URL.revokeObjectURL(originalUrl.value);
  if (upscaledUrl.value) URL.revokeObjectURL(upscaledUrl.value);
});

function handlePaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items;
  if (!items) return;
  
  for (const item of items) {
    if (item.type.indexOf('image') !== -1) {
      const file = item.getAsFile();
      if (file) handleFile(file);
      break;
    }
  }
}
</script>

<template>
  <div class="h-screen bg-background text-foreground flex flex-col overflow-hidden font-sans selection:bg-primary/30">
    <!-- Slim Header -->
    <header class="h-14 border-b border-border/40 flex items-center justify-between px-4 shrink-0 bg-background/60 backdrop-blur-xl z-50">
      <div class="flex items-center gap-3">
        <router-link to="/" class="p-1.5 hover:bg-muted rounded-lg transition-all group">
          <ArrowLeft :size="18" class="group-hover:-translate-x-0.5 transition-transform" />
        </router-link>
        <div class="h-4 w-px bg-border/40 mx-1"></div>
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 bg-primary/10 text-primary rounded-lg flex items-center justify-center shadow-inner">
            <Maximize2 :size="14" />
          </div>
          <h1 class="text-sm font-bold tracking-tight">Upscale <span class="text-primary italic">Pro</span></h1>
        </div>
      </div>

      <div v-if="upscaledUrl" class="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
        <button @click="upscaledUrl = ''" class="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 hover:bg-muted rounded-lg transition-all text-muted-foreground ml-2">Reset</button>
        <button @click="downloadUpscaled" class="h-9 px-5 bg-primary hover:brightness-110 text-primary-foreground rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-primary/20 active:scale-95">
          <Download :size="12" /> Save Result
        </button>
      </div>
    </header>

    <main class="flex-1 relative flex overflow-hidden">
      <!-- Main Scene -->
      <section class="flex-1 bg-background relative flex items-start justify-center p-6 lg:p-12 overflow-hidden">
        <!-- Subtle Background Deco -->
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-primary)_0%,transparent_100%)] opacity-[0.02] pointer-events-none"></div>
        
        <!-- Stable Workspace Container -->
        <div class="w-full h-full max-w-5xl max-h-[80vh] flex items-start justify-center relative">
          <!-- Interactive Side-by-Side Preview -->
          <div v-if="originalUrl" class="w-full h-full flex flex-col gap-6 animate-in zoom-in-95 duration-500">
             <!-- Floating Ratio Bar -->
             <div class="flex items-center justify-center">
                <div class="bg-card/60 backdrop-blur-2xl border border-border/40 p-1 rounded-2xl shadow-xl flex items-center gap-1">
                   <button 
                    @click="selectedAspectRatio = 'original'" 
                    :class="['px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2', selectedAspectRatio === 'original' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:bg-muted']"
                   >
                     <RefreshCw :size="10" /> Auto
                   </button>
                   <div class="w-px h-4 bg-border/40 mx-1"></div>
                   <button 
                    v-for="(_, key) in ASPECT_RATIO_PRESETS" 
                    :key="key" 
                    @click="selectedAspectRatio = key; cropPosition = { x: 50, y: 50 }" 
                    :class="['px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all', selectedAspectRatio === key ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:bg-muted']"
                   >
                     {{ key }}
                   </button>
                </div>
             </div>

             <div class="grid grid-cols-1 md:grid-cols-2 gap-6 h-full items-start">
                <!-- Original Pane -->
                <div class="flex flex-col gap-3 h-full">
                  <div class="flex items-center justify-between px-2">
                    <div class="flex items-center gap-2">
                       <span class="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Source</span>
                       <div v-if="selectedAspectRatio !== 'original'" class="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[8px] font-bold border border-primary/20">{{ selectedAspectRatio }} Frame</div>
                    </div>
                    <span class="text-[9px] font-mono text-muted-foreground/40">{{ originalDimensions.width }}×{{ originalDimensions.height }}</span>
                  </div>
                  <div 
                    ref="sourceContainerRef"
                    class="flex-1 min-h-0 bg-card rounded-3xl border border-border/30 overflow-hidden shadow-2xl relative select-none bg-black/5 group/original"
                    :class="selectedAspectRatio !== 'original' ? 'cursor-move' : ''"
                    @mousedown="startDraggingCrop"
                    @mousemove="updateCropPosition"
                    @touchstart="startDraggingCrop"
                    @touchmove="updateCropPosition"
                  >
                    <!-- The Original Image -->
                    <img :src="originalUrl" class="w-full h-full object-contain block image-pixelated" alt="Original" />
                    
                    <!-- Frame Overlay (Only visible when Aspect Ratio is NOT Auto) -->
                    <div v-if="selectedAspectRatio !== 'original'" class="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <!-- Darkened Backdrop -->
                       <div class="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
                       
                       <!-- Clear Viewport (The Frame) -->
                       <div 
                        class="absolute border-2 border-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] pointer-events-auto cursor-grab active:cursor-grabbing"
                        :class="[
                          { 'transition-all duration-500': !isDraggingCrop && !isResizingCrop },
                          isDraggingCrop ? 'scale-[1.02] shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.5)] border-white' : ''
                        ]"
                        :style="{
                          aspectRatio: `${ASPECT_RATIO_PRESETS[selectedAspectRatio as keyof typeof ASPECT_RATIO_PRESETS].width} / ${ASPECT_RATIO_PRESETS[selectedAspectRatio as keyof typeof ASPECT_RATIO_PRESETS].height}`,
                          height: 'auto',
                          maxHeight: '100%',
                          maxWidth: '100%',
                          width: `${cropScale}%`,
                          left: `${cropPosition.x}%`,
                          top: `${cropPosition.y}%`,
                          transform: 'translate(-50%, -50%)'
                        }"
                        @mousedown.stop="startDraggingCrop"
                        @touchstart.stop="startDraggingCrop"
                       >
                          <!-- Frame Corners/Handles -->
                          <div class="resize-handle absolute -top-2 -left-2 w-4 h-4 rounded-full bg-white border-2 border-primary shadow-lg cursor-nwse-resize pointer-events-auto z-10 transition-transform hover:scale-125"></div>
                          <div class="resize-handle absolute -top-2 -right-2 w-4 h-4 rounded-full bg-white border-2 border-primary shadow-lg cursor-nesw-resize pointer-events-auto z-10 transition-transform hover:scale-125"></div>
                          <div class="resize-handle absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-white border-2 border-primary shadow-lg cursor-nesw-resize pointer-events-auto z-10 transition-transform hover:scale-125"></div>
                          <div class="resize-handle absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-white border-2 border-primary shadow-lg cursor-nwse-resize pointer-events-auto z-10 transition-transform hover:scale-125"></div>
                          
                          <!-- Center Crosshair -->
                          <div class="absolute inset-0 flex items-center justify-center opacity-20 group-hover/original:opacity-40 transition-opacity">
                             <div class="w-4 h-px bg-white"></div>
                             <div class="h-4 w-px bg-white absolute"></div>
                          </div>

                          <div class="absolute -top-6 left-0 right-0 text-center pointer-events-none select-none">
                             <span class="text-[8px] font-black uppercase tracking-[0.3em] text-white bg-primary px-2 py-0.5 rounded-full shadow-lg">Active Frame</span>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>

                <!-- Result Pane -->
                <div class="flex flex-col gap-3 h-full">
                  <div class="flex items-center justify-between px-2">
                    <span class="text-[9px] font-black uppercase tracking-widest text-primary/80">Upscaled Result</span>
                    <span v-if="upscaledUrl" class="text-[9px] font-mono text-primary/40">{{ upscaledDimensions.width }}×{{ upscaledDimensions.height }}</span>
                  </div>
                  <div class="flex-1 min-h-0 bg-card rounded-3xl border border-border/30 overflow-hidden shadow-2xl relative select-none bg-black/5 group">
                    <img v-if="upscaledUrl" :src="upscaledUrl" class="w-full h-full object-contain block animate-in fade-in duration-500" alt="Upscaled" />
                    
                    <!-- Empty Result State -->
                    <div v-else class="w-full h-full flex flex-col items-center justify-center gap-4 bg-muted/20">
                      <div class="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary/30">
                        <Maximize2 :size="20" />
                      </div>
                      <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">Awaiting Signal</p>
                    </div>

                    <!-- Processing Overlay -->
                    <div v-if="processing" class="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-xl z-40 transition-all">
                       <div class="relative w-12 h-12 mb-4">
                          <div class="absolute inset-0 border-2 border-primary/5 rounded-full"></div>
                          <div class="absolute inset-0 border-2 border-t-primary rounded-full animate-spin"></div>
                       </div>
                       <p class="text-[9px] font-black uppercase tracking-widest text-foreground animate-pulse">Processing...</p>
                    </div>
                  </div>
                </div>
             </div>
          </div>

          <!-- empty state -->
          <div v-else class="max-w-lg w-full flex flex-col gap-6 animate-in zoom-in-95 duration-700">
             <div class="relative group">
                <div class="absolute inset-0 bg-primary/20 blur-[100px] opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none"></div>
                <FileUploader 
                  @files-selected="handleFile" 
                  accept="image/*,.csv,.xlsx,.xls,.txt"
                  class="!bg-card/40 !backdrop-blur-xl !border-border/40 hover:!border-primary/50 !transition-all !duration-500 !cursor-pointer !rounded-[3rem] !shadow-2xl !flex !items-center !justify-center !text-center !py-24 overflow-hidden"
                />
             </div>
             <p class="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 text-center">Images • Spreadsheets • Raw Data</p>
          </div>
        </div>

        <!-- Error Toast -->
        <div v-if="error" class="absolute bottom-10 left-1/2 -translate-x-1/2 z-[60] bg-red-500 text-white px-6 py-3 rounded-2xl flex items-center gap-4 shadow-2xl animate-in slide-in-from-bottom-10">
          <AlertCircle :size="18" />
          <span class="text-sm font-bold uppercase tracking-widest">{{ error }}</span>
        </div>
      </section>

      <!-- Glass UI Control Panel (Floating on top or fixed side) -->
      <aside v-if="originalFile" class="absolute left-6 top-6 bottom-6 w-[280px] z-40 flex flex-col pointer-events-none">
        <div class="bg-card/70 backdrop-blur-3xl border border-border/40 rounded-[1.5rem] p-5 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] flex flex-col gap-5 pointer-events-auto h-fit max-h-full overflow-y-auto custom-scrollbar">
          
          <!-- Compact Group: Scaling -->
          <section>
            <div class="flex items-center gap-2 mb-3">
              <Sliders :size="12" class="text-primary" />
              <h2 class="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Scaling & Focus</h2>
            </div>
            
            <div class="grid grid-cols-3 gap-2 mb-4">
               <button
                v-for="s in scaleOptions" :key="s" @click="scaleFactor = s"
                :class="[
                  'h-8 rounded-lg text-[10px] font-bold transition-all border',
                  scaleFactor === s ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20' : 'bg-muted/50 border-border/50 text-muted-foreground hover:bg-primary/30'
                ]"
               >{{ s }}x</button>
            </div>
            
            <!-- Crop Scale Slider -->
            <div class="flex flex-col gap-2 mb-3 bg-muted/20 p-2 rounded-xl border border-border/30">
              <div class="flex justify-between items-center px-1">
                <span class="text-[8px] font-bold uppercase text-muted-foreground/60">Frame Size</span>
                <span class="text-[9px] font-black text-primary">{{ Math.round(cropScale) }}%</span>
              </div>
              <input type="range" v-model.number="cropScale" min="10" max="100" step="1" class="w-full h-1 bg-muted rounded-full appearance-none accent-primary cursor-pointer" />
            </div>
          </section>

          <!-- Compact Group: Quality -->
          <section>
             <div class="flex items-center gap-2 mb-3">
              <Layers :size="12" class="text-primary" />
              <h2 class="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Output Quality</h2>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="q in qualityOptions" :key="q.value" @click="upscaleMethod = q.value as any"
                :class="[
                  'flex flex-col items-start p-2.5 rounded-xl border transition-all text-left group relative overflow-hidden',
                  upscaleMethod === q.value ? 'bg-primary/5 border-primary shadow-inner' : 'bg-muted/30 border-border/50 text-muted-foreground hover:border-primary/20'
                ]"
              >
                <span class="text-[9px] font-black uppercase relative z-10" :class="upscaleMethod === q.value ? 'text-primary' : ''">{{ q.label }}</span>
                <span class="text-[8px] opacity-60 group-hover:opacity-100 transition-opacity relative z-10 line-clamp-1">{{ q.desc }}</span>
                <div v-if="upscaleMethod === q.value" class="absolute inset-0 bg-primary/5 animate-pulse"></div>
              </button>
            </div>
          </section>

          <!-- Compact Group: Aspect Ratio -->
          <section>
            <div class="flex items-center gap-2 mb-3">
              <Layout :size="12" class="text-primary" />
              <h2 class="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Aspect Ratio</h2>
            </div>
            <div class="grid grid-cols-2 gap-2">
               <button 
                @click="selectedAspectRatio = 'original'" 
                :class="['flex items-center gap-3 p-2 rounded-xl border transition-all text-left group', selectedAspectRatio === 'original' ? 'bg-primary/5 border-primary shadow-inner' : 'bg-muted/30 border-border/50 text-muted-foreground hover:border-primary/20']"
               >
                 <div class="w-6 h-6 rounded-md border-2 border-dashed flex items-center justify-center" :class="selectedAspectRatio === 'original' ? 'border-primary bg-primary/10' : 'border-muted-foreground/30'">
                   <RefreshCw :size="10" :class="selectedAspectRatio === 'original' ? 'text-primary' : 'text-muted-foreground/30'" />
                 </div>
                 <div class="flex flex-col">
                   <span class="text-[9px] font-black uppercase tracking-widest" :class="selectedAspectRatio === 'original' ? 'text-foreground' : ''">Auto</span>
                   <span class="text-[7px] opacity-40">Original</span>
                 </div>
               </button>

               <button 
                v-for="(preset, key) in ASPECT_RATIO_PRESETS" 
                :key="key" 
                @click="selectedAspectRatio = key" 
                :class="['flex items-center gap-3 p-2 rounded-xl border transition-all text-left group', selectedAspectRatio === key ? 'bg-primary/5 border-primary shadow-inner' : 'bg-muted/30 border-border/50 text-muted-foreground hover:border-primary/20']"
               >
                 <div 
                  class="w-6 h-6 rounded border-2 transition-transform group-hover:scale-110" 
                  :class="selectedAspectRatio === key ? 'border-primary bg-primary/20 shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.2)]' : 'border-muted-foreground/30 bg-muted/20'"
                  :style="{ 
                    aspectRatio: `${preset.width} / ${preset.height}`,
                    height: preset.width > preset.height ? 'auto' : '100%',
                    width: preset.width > preset.height ? '100%' : 'auto',
                    maxHeight: '1rem',
                    maxWidth: '1rem',
                    margin: 'auto'
                  }"
                 ></div>
                 <div class="flex flex-col">
                   <span class="text-[9px] font-black uppercase tracking-widest" :class="selectedAspectRatio === key ? 'text-foreground' : ''">{{ key }}</span>
                   <span class="text-[7px] opacity-40">{{ preset.width }}:{{ preset.height }}</span>
                 </div>
               </button>
            </div>
          </section>

          <!-- Footer Stats & Actions -->
          <div class="mt-0 space-y-4">
            <div class="bg-muted/40 rounded-[1rem] p-3 border border-border/40 space-y-2">
               <div class="flex justify-between items-end">
                  <div class="flex flex-col">
                    <span class="text-[8px] font-black text-muted-foreground uppercase opacity-50 mb-1">Resolution</span>
                    <span class="text-[11px] font-mono font-bold leading-none">
                      {{ originalDimensions.width }}×{{ originalDimensions.height }}
                    </span>
                  </div>
                  <div class="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Maximize2 :size="10" />
                  </div>
                  <div class="flex flex-col items-end text-right">
                    <span class="text-[8px] font-black text-primary uppercase mb-1">Target</span>
                    <span class="text-[11px] font-mono font-bold leading-none text-primary">
                      {{ upscaledUrl ? upscaledDimensions.width : Math.round(originalDimensions.width * scaleFactor) }}×{{ upscaledUrl ? upscaledDimensions.height : Math.round(originalDimensions.height * scaleFactor) }}
                    </span>
                  </div>
               </div>
               
               <div v-if="sizeIncrease > 0" class="flex items-center justify-between pt-2 border-t border-border/30">
                  <span class="text-[8px] text-muted-foreground font-bold italic">Pixels increased by</span>
                  <span class="text-[10px] font-black text-primary">{{ sizeIncrease.toFixed(1) }}x</span>
               </div>
            </div>

            <button
              @click="processUpscale" :disabled="processing"
              class="w-full h-11 bg-primary text-primary-foreground disabled:opacity-30 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-2xl hover:brightness-110 shadow-primary/20"
            >
              <RefreshCw v-if="processing" :size="16" class="animate-spin" />
              <span v-else>Enhance Image</span>
            </button>
          </div>
        </div>

        <!-- Secondary Floating Button: Change Image -->
        <button @click="triggerChooseAnother" class="mt-3 pointer-events-auto w-fit bg-card/60 backdrop-blur-xl border border-border/40 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 text-muted-foreground px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl group">
           <RefreshCw :size="10" class="group-hover:rotate-180 transition-transform duration-500" /> Change Image
        </button>

        <!-- Hidden input for immediate selection -->
        <input 
          type="file" 
          ref="hiddenInputRef" 
          class="hidden" 
          accept="image/*,.csv,.xlsx,.xls,.txt" 
          @change="onHiddenFileSelect" 
        />
      </aside>
    </main>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 3px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }

/* Range Input Styling */
input[type=range] { -webkit-appearance: none; appearance: none; background: transparent; }
input[type=range]:focus { outline: none; }
input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 2px; cursor: pointer; background: rgba(255, 255, 255, 0.1); border-radius: 1px; }
input[type=range]::-webkit-slider-thumb { height: 12px; width: 12px; border-radius: 50%; background: #fff; cursor: pointer; -webkit-appearance: none; margin-top: -5px; box-shadow: 0 0 10px rgba(0,0,0,0.5); border: 2px solid #a855f7; }

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }

.image-pixelated {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
</style>
