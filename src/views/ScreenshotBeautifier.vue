<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { Sparkles, Download, Trash2, ArrowLeft, RefreshCw, Layout, Maximize, Settings2, Palette, RotateCw, Monitor, Zap } from 'lucide-vue-next';
import { drawBeautifiedImage, fileToDataURL, loadImage, beautifyImage } from '../utils/imageUtils';
import { useRouter } from 'vue-router';

const router = useRouter();
const file = ref<File | null>(null);
const sourceImage = ref<HTMLImageElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const isProcessing = ref(false);

interface BeautifySettings {
  paddingX: number;
  paddingY: number;
  borderRadius: number;
  shadowBlur: number;
  shadowColor: string;
  background: string;
  inset: number;
  rotation: number;
  scale: number;
  browserFrame: 'none' | 'safari' | 'chrome';
  noise: boolean;
}

const settings = ref<BeautifySettings>({
  paddingX: 100,
  paddingY: 100,
  borderRadius: 24,
  shadowBlur: 50,
  shadowColor: 'rgba(0,0,0,0.3)',
  background: 'linear-gradient(to right, #6366f1, #a855f7)',
  inset: 0,
  rotation: 0,
  scale: 1,
  browserFrame: 'none',
  noise: false
});

const backgroundPresets = [
  { label: 'Indigo Purple', value: 'linear-gradient(to right, #6366f1, #a855f7)' },
  { label: 'Ocean Blue', value: 'linear-gradient(to right, #0ea5e9, #2dd4bf)' },
  { label: 'Sunset Orange', value: 'linear-gradient(to right, #f59e0b, #ef4444)' },
  { label: 'Midnight', value: 'linear-gradient(to right, #0f172a, #334155)' },
  { label: 'Rose Pink', value: 'linear-gradient(to right, #f43f5e, #fb923c)' },
  { label: 'Emerald', value: 'linear-gradient(to right, #10b981, #3b82f6)' },
  { label: 'Clean White', value: '#ffffff' },
  { label: 'Dark Card', value: '#1e293b' }
];

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    await loadFile(target.files[0]);
  }
};

const loadFile = async (f: File) => {
  file.value = f;
  isProcessing.value = true;
  try {
    const dataUrl = await fileToDataURL(f);
    sourceImage.value = await loadImage(dataUrl);
    // Use nextTick or a small timeout to ensure the canvas is rendered in DOM
    setTimeout(updatePreview, 0);
  } catch (e) {
    console.error('Failed to load image:', e);
  } finally {
    isProcessing.value = false;
  }
};

const updatePreview = () => {
  if (!sourceImage.value || !canvasRef.value) return;
  const canvas = canvasRef.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Set canvas size
  canvas.width = sourceImage.value.width + settings.value.paddingX * 2;
  canvas.height = sourceImage.value.height + settings.value.paddingY * 2;

  drawBeautifiedImage(ctx, sourceImage.value, settings.value);
};

// Real-time update via watch
watch(settings, () => {
  updatePreview();
}, { deep: true });

const downloadImage = async () => {
  if (!sourceImage.value) return;
  isProcessing.value = true;
  try {
    const blob = await beautifyImage(sourceImage.value, settings.value);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `beautified-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
  } finally {
    isProcessing.value = false;
  }
};

const handlePaste = async (event: ClipboardEvent) => {
  const items = event.clipboardData?.items;
  if (!items) return;
  for (const item of items) {
    if (item.type.indexOf('image') !== -1) {
      const pastedFile = item.getAsFile();
      if (pastedFile) {
        await loadFile(pastedFile);
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
});

const reset = () => {
  file.value = null;
  sourceImage.value = null;
};
</script>

<template>
  <div class="min-h-screen bg-background font-outfit text-foreground">
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
              Pro Marketing Assets
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button 
            v-if="sourceImage"
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

    <main class="max-w-screen-2xl mx-auto p-4 md:p-6 lg:p-10">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        <!-- Sidebar Controls -->
        <div class="lg:col-span-4 space-y-6">
          <div class="bg-card/50 backdrop-blur-xl shadow-2xl border border-border/40 rounded-[2.5rem] p-8 space-y-8 animate-in slide-in-from-left-4 duration-700">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-3">
                <Settings2 :size="18" class="text-primary" />
                <h3 class="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Studio Settings</h3>
              </div>
              <Zap :size="14" class="text-amber-500 animate-pulse" />
            </div>

            <!-- Canvas Section -->
            <div class="space-y-6 p-4 bg-muted/30 rounded-3xl border border-border/20">
               <h4 class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Canvas Control</h4>
               
               <div class="space-y-4">
                  <div class="flex justify-between items-center text-[10px] font-black uppercase">
                    <span class="text-muted-foreground">Padding</span>
                    <span class="text-primary">{{ settings.paddingX }}px</span>
                  </div>
                  <input type="range" v-model.number="settings.paddingX" @input="settings.paddingY = settings.paddingX" min="40" max="300" class="w-full h-1 bg-muted-foreground/20 rounded-full appearance-none accent-primary cursor-pointer" />
               </div>

               <div class="space-y-4">
                  <div class="flex justify-between items-center text-[10px] font-black uppercase">
                    <span class="text-muted-foreground">Inset</span>
                    <span class="text-primary">{{ settings.inset }}%</span>
                  </div>
                  <input type="range" v-model.number="settings.inset" min="0" max="30" class="w-full h-1 bg-muted-foreground/20 rounded-full appearance-none accent-primary cursor-pointer" />
               </div>
            </div>

            <!-- Transformation Section -->
            <div class="space-y-6 p-4 bg-muted/30 rounded-3xl border border-border/20">
               <h4 class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Transform</h4>
               
               <div class="grid grid-cols-2 gap-4">
                 <div class="space-y-3">
                    <div class="flex justify-between items-center text-[10px] font-black uppercase">
                      <span class="text-muted-foreground">Tilt</span>
                      <span class="text-primary">{{ settings.rotation }}°</span>
                    </div>
                    <input type="range" v-model.number="settings.rotation" min="-15" max="15" class="w-full h-1 bg-muted-foreground/20 rounded-full appearance-none accent-primary cursor-pointer" />
                 </div>
                 <div class="space-y-3">
                    <div class="flex justify-between items-center text-[10px] font-black uppercase">
                      <span class="text-muted-foreground">Scale</span>
                      <span class="text-primary">{{ settings.scale.toFixed(1) }}x</span>
                    </div>
                    <input type="range" v-model.number="settings.scale" min="0.5" max="1.5" step="0.1" class="w-full h-1 bg-muted-foreground/20 rounded-full appearance-none accent-primary cursor-pointer" />
                 </div>
               </div>
            </div>

            <!-- Frame & Details -->
            <div class="space-y-6 p-4 bg-muted/30 rounded-3xl border border-border/20">
               <h4 class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Frame Style</h4>
               
               <div class="grid grid-cols-3 gap-2">
                 <button 
                  v-for="frame in (['none', 'safari', 'chrome'] as const)" :key="frame"
                  @click="settings.browserFrame = frame"
                  class="py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all"
                  :class="settings.browserFrame === frame ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-[1.02]' : 'bg-background border-border hover:border-primary/50'"
                 >
                   {{ frame }}
                 </button>
               </div>

               <div class="flex items-center justify-between pt-2">
                  <label class="text-[10px] font-black uppercase text-muted-foreground select-none cursor-pointer flex items-center gap-2">
                     <input type="checkbox" v-model="settings.noise" class="rounded border-border text-primary focus:ring-primary h-3 w-3" />
                     Subtle Noise Texture
                  </label>
                  <label class="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2">
                    <Maximize :size="12" />
                    Radius: {{ settings.borderRadius }}
                  </label>
               </div>
               <input type="range" v-model.number="settings.borderRadius" min="0" max="100" class="w-full h-1 bg-muted-foreground/20 rounded-full appearance-none accent-primary cursor-pointer" />
            </div>

            <!-- Background Preset Grid -->
            <div class="space-y-6">
              <div class="flex items-center gap-2">
                <Palette :size="14" class="text-primary" />
                <label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stage Background</label>
              </div>
              <div class="grid grid-cols-4 gap-3">
                <button 
                  v-for="preset in backgroundPresets" 
                  :key="preset.value"
                  @click="settings.background = preset.value"
                  class="aspect-square rounded-2xl border-4 transition-all hover:scale-110 active:scale-90"
                  :class="settings.background === preset.value ? 'border-primary ring-4 ring-primary/20' : 'border-transparent shadow-xl'"
                  :style="{ background: preset.value.includes('gradient') ? preset.value : preset.value, backgroundColor: preset.value.includes('#') ? preset.value : 'transparent' }"
                  :title="preset.label"
                ></button>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Workspace -->
        <div class="lg:col-span-8 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-700">
          <div class="relative bg-card/40 backdrop-blur-sm border-4 border-dashed border-border/20 rounded-[3rem] overflow-hidden min-h-[600px] flex items-center justify-center p-8 lg:p-12 group transition-all hover:border-primary/20">
            <template v-if="!sourceImage">
              <label class="w-full h-full flex flex-col items-center justify-center cursor-pointer text-center group">
                <div class="w-24 h-24 rounded-[2rem] bg-primary/5 border border-primary/10 flex items-center justify-center text-primary mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 shadow-2xl relative">
                  <Layout :size="48" />
                  <div class="absolute -top-2 -right-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white animate-bounce shadow-lg">
                    <Sparkles :size="16" />
                  </div>
                </div>
                <h3 class="text-2xl font-black uppercase tracking-tighter mb-4">Beautify Your Work</h3>
                <p class="text-muted-foreground text-sm mb-10 max-w-[320px] font-medium leading-relaxed">Turn messy screenshots into professional high-end marketing visuals instantly.</p>
                <div class="px-10 py-5 bg-primary text-primary-foreground rounded-2xl text-[11px] font-black shadow-2xl shadow-primary/30 hover:shadow-primary/50 group-hover:scale-105 transition-all uppercase tracking-[0.2em]">
                  Upload Screenshot
                </div>
                <input type="file" @change="handleFileUpload" accept="image/*" class="hidden" />
                <p class="mt-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">or simply paste (Ctrl+V) anywhere</p>
              </label>
            </template>
            
            <template v-else>
              <!-- Real-time Canvas Preview -->
              <div class="relative w-full h-full flex items-center justify-center rounded-[2rem] overflow-hidden bg-black/5 p-4 group/preview">
                <div class="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none"></div>
                
                <canvas 
                  ref="canvasRef" 
                  class="max-w-full max-h-[70vh] object-contain shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] rounded-lg transition-transform duration-300" 
                ></canvas>
                
                <div v-if="isProcessing" class="absolute inset-0 flex flex-col items-center justify-center bg-card/60 backdrop-blur-md z-10 transition-opacity">
                   <div class="relative">
                      <RefreshCw :size="64" class="text-primary animate-spin" />
                   </div>
                   <p class="mt-6 font-black text-xs uppercase tracking-[0.3em] text-primary">Loading Agent...</p>
                </div>

                <!-- Controls Overlay -->
                <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 bg-card/90 backdrop-blur-xl rounded-[2rem] border border-border shadow-2xl opacity-0 translate-y-4 group-hover/preview:opacity-100 group-hover/preview:translate-y-0 transition-all z-20">
                  <button @click="downloadImage" class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform">
                     <Download :size="14" /> Download
                  </button>
                  <div class="w-px h-4 bg-border mx-1"></div>
                  <label class="p-2 text-muted-foreground hover:text-primary cursor-pointer transition-colors" title="Replace">
                     <RefreshCw :size="20" />
                     <input type="file" @change="handleFileUpload" accept="image/*" class="hidden" />
                  </label>
                  <button @click="reset" class="p-2 text-rose-500 hover:text-rose-400 transition-colors" title="Delete">
                     <Trash2 :size="20" />
                  </button>
                </div>
              </div>
            </template>
          </div>

          <!-- Feature Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="p-6 rounded-[2rem] border border-border/40 bg-card/30 flex flex-col gap-4">
              <div class="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center"><Zap :size="20" /></div>
              <div class="space-y-1">
                <h4 class="text-xs font-black uppercase tracking-tight">Smart Preview</h4>
                <p class="text-[10px] text-muted-foreground leading-relaxed font-medium uppercase tracking-tighter">Real-time canvas rendering bypasses slow image decoding for instant feedback.</p>
              </div>
            </div>
            <div class="p-6 rounded-[2rem] border border-border/40 bg-card/30 flex flex-col gap-4">
              <div class="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center"><Monitor :size="20" /></div>
              <div class="space-y-1">
                <h4 class="text-xs font-black uppercase tracking-tight">Browser Frames</h4>
                <p class="text-[10px] text-muted-foreground leading-relaxed font-medium uppercase tracking-tighter">Add premium Safari or Chrome frames to give your screenshots authentic context.</p>
              </div>
            </div>
            <div class="p-6 rounded-[2rem] border border-border/40 bg-card/30 flex flex-col gap-4">
              <div class="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center"><RotateCw :size="20" /></div>
              <div class="space-y-1">
                <h4 class="text-xs font-black uppercase tracking-tight">3D Perspective</h4>
                <p class="text-[10px] text-muted-foreground leading-relaxed font-medium uppercase tracking-tighter">Apply tilt and rotation to create dynamic, modern presentation layouts.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Scoped styles kept minimal */
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: hsl(var(--primary));
  border: 3px solid white;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  transition: all 0.2s;
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}
</style>
