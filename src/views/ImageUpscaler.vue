<script setup lang="ts">
import { ref } from 'vue';
import { ArrowLeft, ZoomIn, Download, Loader2 } from 'lucide-vue-next';
import FileUploader from '@components/shared/FileUploader.vue';
import { upscaleImage, ASPECT_RATIO_PRESETS, loadImage } from '@utils/imageUtils';

const originalFile = ref<File | null>(null);
const originalUrl = ref<string>('');
const upscaledUrl = ref<string>('');
const processing = ref(false);
const error = ref<string | null>(null);

const scaleFactor = ref(2);
const upscaleMethod = ref<'bicubic' | 'lanczos' | 'nearest' | 'bilinear'>('bicubic');
const selectedAspectRatio = ref<keyof typeof ASPECT_RATIO_PRESETS | 'custom'>('custom');
const customAspectRatio = ref({ width: 1, height: 1 });

const originalDimensions = ref({ width: 0, height: 0 });
const upscaledDimensions = ref({ width: 0, height: 0 });

const scaleOptions = [1.5, 2, 3, 4];
const methodOptions = [
  { value: 'bicubic', label: 'Bicubic (Recommended)' },
  { value: 'lanczos', label: 'Lanczos (Sharpest)' },
  { value: 'bilinear', label: 'Bilinear (Fast)' },
  { value: 'nearest', label: 'Nearest Neighbor (Pixel Art)' },
];

async function handleFile(file: File) {
  originalFile.value = file;
  error.value = null;
  upscaledUrl.value = '';
  
  try {
    originalUrl.value = URL.createObjectURL(file);
    const img = await loadImage(originalUrl.value);
    originalDimensions.value = { width: img.width, height: img.height };
  } catch (err: any) {
    error.value = 'Failed to load image: ' + err.message;
  }
}

async function processUpscale() {
  if (!originalFile.value) return;
  
  processing.value = true;
  error.value = null;
  
  try {
    const aspectRatio = selectedAspectRatio.value === 'custom' 
      ? undefined
      : ASPECT_RATIO_PRESETS[selectedAspectRatio.value];
    
    const blob = await upscaleImage(
      originalFile.value,
      scaleFactor.value,
      upscaleMethod.value,
      aspectRatio
    );
    
    // Revoke old URL if exists
    if (upscaledUrl.value) {
      URL.revokeObjectURL(upscaledUrl.value);
    }
    
    upscaledUrl.value = URL.createObjectURL(blob);
    
    // Calculate new dimensions
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
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Cleanup URLs on unmount
import { onUnmounted } from 'vue';
onUnmounted(() => {
  if (originalUrl.value) URL.revokeObjectURL(originalUrl.value);
  if (upscaledUrl.value) URL.revokeObjectURL(upscaledUrl.value);
});
</script>

<template>
  <div class="w-full h-screen-minus-header flex flex-col p-2 md:p-4 overflow-hidden">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3 shrink-0 relative z-20">
      <div class="flex items-center gap-4">
        <router-link to="/" class="p-2.5 bg-card border border-border/50 rounded-xl text-muted-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm group">
          <ArrowLeft :size="18" class="group-hover:-translate-x-0.5 transition-transform" />
        </router-link>
        
        <div class="h-10 w-px bg-border/30 hidden lg:block"></div>

        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center ring-1 ring-purple-500/20">
            <ZoomIn :size="20" stroke-width="2.5" />
          </div>
          <div>
            <h2 class="text-xl md:text-2xl font-black tracking-tight text-foreground">
              Image <span class="text-purple-500">Upscaler</span>
            </h2>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto custom-scrollbar">
      <div class="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
        
        <!-- Controls Panel -->
        <div class="bg-card border border-border rounded-3xl p-6 shadow-xl flex flex-col gap-6">
          <FileUploader @file-selected="handleFile" accept="image/*" />
          
          <div v-if="error" class="bg-red-500/10 border border-red-500/50 text-red-500 rounded-xl p-4 text-sm">
            {{ error }}
          </div>
          
          <div v-if="originalFile" class="space-y-6">
            <!-- Scale Factor -->
            <div>
              <label class="text-[10px] uppercase font-bold text-muted-foreground mb-2 block">
                Scale Factor
              </label>
              <div class="flex gap-2 mb-2">
                <button
                  v-for="scale in scaleOptions"
                  :key="scale"
                  @click="scaleFactor = scale"
                  :class="[
                    'px-4 py-2 rounded-xl border transition-all font-medium text-sm',
                    scaleFactor === scale
                      ? 'bg-purple-500 text-white border-purple-500'
                      : 'bg-muted border-border hover:border-purple-500/50'
                  ]"
                >
                  {{ scale }}x
                </button>
              </div>
              <input
                v-model.number="scaleFactor"
                type="number"
                min="1"
                max="10"
                step="0.1"
                class="w-full bg-muted border border-border rounded-xl px-4 py-2.5 font-mono text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <!-- Upscale Method -->
            <div>
              <label class="text-[10px] uppercase font-bold text-muted-foreground mb-2 block">
                Upscale Method
              </label>
              <select
                v-model="upscaleMethod"
                class="w-full bg-muted border border-border rounded-xl px-4 py-2.5 font-medium text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option v-for="method in methodOptions" :key="method.value" :value="method.value">
                  {{ method.label }}
                </option>
              </select>
            </div>

            <!-- Aspect Ratio -->
            <div>
              <label class="text-[10px] uppercase font-bold text-muted-foreground mb-2 block">
                Aspect Ratio (Optional)
              </label>
              <select
                v-model="selectedAspectRatio"
                class="w-full bg-muted border border-border rounded-xl px-4 py-2.5 font-medium text-sm outline-none focus:ring-2 focus:ring-purple-500/20 mb-2"
              >
                <option value="custom">Custom (Keep Original)</option>
                <option v-for="(preset, key) in ASPECT_RATIO_PRESETS" :key="key" :value="key">
                  {{ preset.label }}
                </option>
              </select>
              
              <div v-if="selectedAspectRatio === 'custom'" class="grid grid-cols-2 gap-2">
                <div>
                  <label class="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Width</label>
                  <input
                    v-model.number="customAspectRatio.width"
                    type="number"
                    min="1"
                    placeholder="Width"
                    class="w-full bg-muted border border-border rounded-xl px-4 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
                <div>
                  <label class="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Height</label>
                  <input
                    v-model.number="customAspectRatio.height"
                    type="number"
                    min="1"
                    placeholder="Height"
                    class="w-full bg-muted border border-border rounded-xl px-4 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>
            </div>

            <!-- Info -->
            <div class="bg-muted/30 rounded-xl p-4 text-sm space-y-1 border border-border">
              <div class="font-medium">Original: <span class="font-mono">{{ originalDimensions.width }} × {{ originalDimensions.height }}px</span></div>
              <div v-if="upscaledDimensions.width" class="font-medium text-purple-500">
                Upscaled: <span class="font-mono">{{ upscaledDimensions.width }} × {{ upscaledDimensions.height }}px</span>
              </div>
              <div v-if="upscaledDimensions.width" class="text-xs text-muted-foreground">
                Size increase: {{ ((upscaledDimensions.width * upscaledDimensions.height) / (originalDimensions.width * originalDimensions.height)).toFixed(1) }}x
              </div>
            </div>

            <!-- Actions -->
            <button
              @click="processUpscale"
              :disabled="processing"
              class="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-xl px-6 py-3 font-bold uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Loader2 v-if="processing" :size="16" class="animate-spin" />
              <ZoomIn v-else :size="16" />
              {{ processing ? 'Processing...' : `Upscale ${scaleFactor}x` }}
            </button>
          </div>
        </div>

        <!-- Preview Panel -->
        <div class="bg-card border border-border rounded-3xl p-6 shadow-xl flex flex-col gap-4">
          <div v-if="originalUrl" class="space-y-4">
            <div>
              <h3 class="text-sm font-bold mb-2 text-foreground">Original</h3>
              <div class="relative bg-muted/30 rounded-xl border border-border overflow-hidden">
                <img :src="originalUrl" class="w-full h-auto max-h-[400px] object-contain" alt="Original image" />
              </div>
            </div>
            
            <div v-if="upscaledUrl">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-sm font-bold text-purple-500">Upscaled</h3>
                <button
                  @click="downloadUpscaled"
                  class="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
                >
                  <Download :size="14" /> Download
                </button>
              </div>
              <div class="relative bg-muted/30 rounded-xl border border-border overflow-hidden">
                <img :src="upscaledUrl" class="w-full h-auto max-h-[400px] object-contain" alt="Upscaled image" />
              </div>
            </div>
            
            <div v-else-if="originalFile && !processing" class="text-center text-muted-foreground text-sm py-8">
              Click "Upscale" to process the image
            </div>
          </div>
          
          <div v-else class="text-center text-muted-foreground text-sm py-16">
            Upload an image to get started
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
