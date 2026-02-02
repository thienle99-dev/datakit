<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { Sparkles, Download, Image as ImageIcon, Trash2, ArrowLeft, RefreshCw, Layout, Maximize, Settings2, Palette } from 'lucide-vue-next';
import { beautifyImage } from '../utils/imageUtils';
import { useRouter } from 'vue-router';

const router = useRouter();
const file = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const beautifiedUrl = ref<string | null>(null);
const isProcessing = ref(false);

// Settings
const settings = ref({
  paddingX: 80,
  paddingY: 80,
  borderRadius: 20,
  shadowBlur: 40,
  shadowColor: 'rgba(0,0,0,0.3)',
  background: 'linear-gradient(to right, #6366f1, #a855f7)'
});

const backgroundPresets = [
  { label: 'Indigo Purple', value: 'linear-gradient(to right, #6366f1, #a855f7)' },
  { label: 'Ocean Blue', value: 'linear-gradient(to right, #0ea5e9, #2dd4bf)' },
  { label: 'Sunset Orange', value: 'linear-gradient(to right, #f59e0b, #ef4444)' },
  { label: 'Midnight', value: 'linear-gradient(to right, #0f172a, #334155)' },
  { label: 'Rose Pink', value: 'linear-gradient(to right, #f43f5e, #fb923c)' },
  { label: 'Clean White', value: '#ffffff' },
  { label: 'Dark Card', value: '#1e293b' }
];

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    file.value = target.files[0];
    previewUrl.value = URL.createObjectURL(file.value);
    await processImage();
  }
};

const processImage = async () => {
  if (!file.value) return;
  isProcessing.value = true;
  try {
    const blob = await beautifyImage(file.value, settings.value);
    if (beautifiedUrl.value) URL.revokeObjectURL(beautifiedUrl.value);
    beautifiedUrl.value = URL.createObjectURL(blob);
  } catch (error) {
    console.error('Beautification failed:', error);
  } finally {
    isProcessing.value = false;
  }
};

// Auto-process when settings change
watch(settings, () => {
  processImage();
}, { deep: true });

const downloadImage = () => {
  if (!beautifiedUrl.value) return;
  const a = document.createElement('a');
  a.href = beautifiedUrl.value;
  a.download = `beautified-${Date.now()}.png`;
  a.click();
};

const handlePaste = async (event: ClipboardEvent) => {
  const items = event.clipboardData?.items;
  if (!items) return;
  for (const item of items) {
    if (item.type.indexOf('image') !== -1) {
      const pastedFile = item.getAsFile();
      if (pastedFile) {
        file.value = pastedFile;
        previewUrl.value = URL.createObjectURL(pastedFile);
        await processImage();
        break;
      }
    }
  }
};

onMounted(() => {
  window.addEventListener('paste', handlePaste);
});

onUnmounted(() => {
  window.removeEventListener('paste', handlePaste);
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  if (beautifiedUrl.value) URL.revokeObjectURL(beautifiedUrl.value);
});

const reset = () => {
  file.value = null;
  previewUrl.value = null;
  beautifiedUrl.value = null;
};
</script>

<template>
  <div class="min-h-screen bg-background font-outfit">
    <!-- Header -->
    <header class="h-[var(--header-h)] border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
      <div class="max-w-screen-2xl mx-auto h-full px-4 md:px-8 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button @click="router.push('/')" class="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground group">
            <ArrowLeft :size="20" class="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 class="text-lg font-black tracking-tight flex items-center gap-2 uppercase">
              <Sparkles :size="20" class="text-primary" />
              Screenshot Beautifier
            </h1>
            <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Professional Presentation Tool
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button 
            v-if="beautifiedUrl"
            @click="downloadImage"
            class="hidden md:flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            <Download :size="16" />
            Download PNG
          </button>
          <button 
            v-if="file"
            @click="reset"
            class="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
          >
            <Trash2 :size="20" />
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-screen-2xl mx-auto p-4 md:p-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Sidebar Controls -->
        <div class="lg:col-span-4 space-y-6 animate-in slide-in-from-left-4 duration-700">
          <div class="bg-card/80 backdrop-blur-md shadow-sm border border-border/50 rounded-3xl p-6 space-y-6">
            <div class="flex items-center gap-2 mb-2">
              <Settings2 :size="18" class="text-primary" />
              <h3 class="text-sm font-black uppercase tracking-widest text-muted-foreground">Appearance</h3>
            </div>

            <!-- Padding -->
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <label class="text-xs font-bold text-muted-foreground uppercase">Padding</label>
                <span class="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded">{{ settings.paddingX }}px</span>
              </div>
              <input type="range" v-model.number="settings.paddingX" @input="settings.paddingY = settings.paddingX" min="20" max="200" class="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary-foreground" />
            </div>

            <!-- Radius -->
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <label class="text-xs font-bold text-muted-foreground uppercase">Corner Radius</label>
                <span class="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded">{{ settings.borderRadius }}px</span>
              </div>
              <input type="range" v-model.number="settings.borderRadius" min="0" max="100" class="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary-foreground" />
            </div>

            <!-- Shadow -->
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <label class="text-xs font-bold text-muted-foreground uppercase">Shadow</label>
                <span class="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded">{{ settings.shadowBlur }}px</span>
              </div>
              <input type="range" v-model.number="settings.shadowBlur" min="0" max="100" class="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary-foreground" />
            </div>

            <!-- Background Preset Grid -->
            <div class="space-y-4">
              <label class="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                <Palette :size="14" /> Background
              </label>
              <div class="grid grid-cols-4 gap-2">
                <button 
                  v-for="preset in backgroundPresets" 
                  :key="preset.value"
                  @click="settings.background = preset.value"
                  class="aspect-square rounded-xl border-2 transition-all hover:scale-105"
                  :class="settings.background === preset.value ? 'border-primary ring-2 ring-primary/20' : 'border-transparent shadow-sm'"
                  :style="{ background: preset.value.includes('gradient') ? preset.value : preset.value, backgroundColor: preset.value.includes('#') ? preset.value : 'transparent' }"
                  :title="preset.label"
                ></button>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Workspace -->
        <div class="lg:col-span-8 flex flex-col gap-6">
          <div class="relative bg-card/80 backdrop-blur-md shadow-sm border border-border/50 rounded-[2.5rem] overflow-hidden min-h-[500px] flex items-center justify-center p-8 group">
            <template v-if="!previewUrl">
              <label class="w-full h-full flex flex-col items-center justify-center cursor-pointer p-12 text-center group">
                <div class="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ring-1 ring-primary/20">
                  <Layout :size="40" />
                </div>
                <h3 class="text-xl font-bold mb-2">Drop, Paste or Browse</h3>
                <p class="text-muted-foreground text-sm mb-6 max-w-[280px]">Turn your messy screenshots into professional marketing assets instantly.</p>
                <div class="px-6 py-3 bg-primary text-primary-foreground rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all uppercase tracking-widest">
                  Select Screenshot
                </div>
                <input type="file" @change="handleFileUpload" accept="image/*" class="hidden" />
              </label>
            </template>
            
            <template v-else>
              <!-- Live Preview Container -->
              <div class="relative max-w-full max-h-full overflow-auto p-4 flex items-center justify-center bg-muted/20 rounded-2xl border border-dashed border-border/50">
                <img v-if="beautifiedUrl" :src="beautifiedUrl" class="max-w-full h-auto shadow-2xl rounded-sm animate-in fade-in zoom-in-95 duration-500" />
                <div v-if="isProcessing" class="absolute inset-0 flex flex-col items-center justify-center bg-card/40 backdrop-blur-sm z-10 rounded-2xl">
                   <RefreshCw :size="48" class="text-primary animate-spin mb-4" />
                   <p class="font-bold text-sm uppercase tracking-widest">Processing...</p>
                </div>
              </div>

              <!-- Controls Overlay when hovered image -->
              <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-black/80 backdrop-blur-md rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 shadow-2xl z-20">
                <button @click="downloadImage" class="p-2 text-white hover:text-primary transition-colors" title="Download">
                   <Download :size="20" />
                </button>
                <div class="w-px h-4 bg-white/20 mx-1"></div>
                <label class="p-2 text-white hover:text-primary cursor-pointer transition-colors" title="Replace">
                   <RefreshCw :size="20" />
                   <input type="file" @change="handleFileUpload" accept="image/*" class="hidden" />
                </label>
                 <div class="w-px h-4 bg-white/20 mx-1"></div>
                <button @click="reset" class="p-2 text-rose-400 hover:text-rose-300 transition-colors" title="Delete">
                   <Trash2 :size="20" />
                </button>
              </div>
            </template>
          </div>

          <!-- Quick Tips -->
          <div class="flex gap-4">
            <div class="flex-1 p-4 rounded-2xl border border-border/40 bg-card/40 flex items-start gap-3">
              <div class="p-2 bg-blue-500/10 text-blue-500 rounded-lg shrink-0"><Maximize :size="16" /></div>
              <div>
                <h4 class="text-xs font-bold uppercase tracking-tight mb-1">High Quality</h4>
                <p class="text-[10px] text-muted-foreground leading-snug">Automatically exports at native resolution with zero compression.</p>
              </div>
            </div>
            <div class="flex-1 p-4 rounded-2xl border border-border/40 bg-card/40 flex items-start gap-3">
              <div class="p-2 bg-amber-500/10 text-amber-500 rounded-lg shrink-0"><ImageIcon :size="16" /></div>
              <div>
                <h4 class="text-xs font-bold uppercase tracking-tight mb-1">Canvas Auto-Size</h4>
                <p class="text-[10px] text-muted-foreground leading-snug">Canvas automatically wraps around your image dimensions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* No specific styles needed */
</style>
