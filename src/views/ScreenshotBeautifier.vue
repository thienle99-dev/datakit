<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { Sparkles, Download, Trash2, ArrowLeft, RefreshCw, Layout, Maximize, Palette, RotateCw, Monitor, Zap, Plus, X } from 'lucide-vue-next';
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
  exportFormat: 'png' | 'jpeg' | 'webp';
  exportQuality: number;
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
  noise: false,
  exportFormat: 'png',
  exportQuality: 0.9
});

const activeTab = ref<'studio' | 'scene'>('studio');
const meshColors = ref(['#4f46e5', '#7c3aed', '#06b6d4']);

const backgroundPresets = [
  { label: 'Aurora', value: 'mesh:#4f46e5,#7c3aed,#06b6d4' },
  { label: 'Tokyo Night', value: 'mesh:#1a1b26,#bb9af7,#7aa2f7' },
  { label: 'Cyberpunk', value: 'mesh:#ff007c,#00eaff,#7000ff' },
  { label: 'Cotton Candy', value: 'mesh:#f472b6,#60a5fa,#ffffff' },
  { label: 'Golden Hour', value: 'mesh:#f59e0b,#ef4444,#db2777' },
  { label: 'Deep Sea', value: 'mesh:#0f172a,#1e40af,#06b6d4' },
  { label: 'Soft Velvet', value: 'mesh:#881337,#4c0519,#9f1239' },
  { label: 'Forest', value: 'mesh:#064e3b,#059669,#34d399' },
  { label: 'Minimal Grey', value: 'mesh:#1f2937,#4b5563,#9ca3af' },
  { label: 'Glassy Blue', value: 'linear-gradient(to right, #e0f2fe, #7dd3fc)' },
  { label: 'Clean White', value: '#ffffff' },
  { label: 'Dark Card', value: '#0f172a' }
];

const addColor = () => {
  if (meshColors.value.length < 6) {
    meshColors.value.push('#ffffff');
    updateMeshFromCustom();
  }
};

const removeColor = (index: number) => {
  if (meshColors.value.length > 1) {
    meshColors.value.splice(index, 1);
    updateMeshFromCustom();
  }
};

const updateMeshFromCustom = () => {
  if (meshColors.value.length === 1) {
    settings.value.background = meshColors.value[0]!;
  } else {
    settings.value.background = `mesh:${meshColors.value.join(',')}`;
  }
};

const getPresetStyle = (value: string) => {
  if (value.startsWith('mesh:')) {
    const colors = value.replace('mesh:', '').split(',');
    if (colors.length === 1) return { backgroundColor: colors[0] };
    
    const gradients = colors.map((color, i) => {
      const positions = [
        'at 0% 0%', 'at 100% 0%', 'at 0% 100%', 
        'at 100% 100%', 'at 50% 50%', 'at 50% 0%', 'at 50% 100%'
      ];
      return `radial-gradient(${positions[i % positions.length]}, ${color}, transparent)`;
    });
    
    return {
      background: gradients.join(', '),
      backgroundColor: colors[0]
    };
  }
  if (value.includes('gradient')) return { background: value };
  return { backgroundColor: value };
};

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
    const extension = settings.value.exportFormat;
    a.download = `beautified-${Date.now()}.${extension}`;
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
          <div class="bg-card/50 backdrop-blur-xl shadow-2xl border border-border/40 rounded-[2.5rem] p-7 space-y-7 animate-in slide-in-from-left-4 duration-700">
            
            <!-- Tab Switcher -->
            <div class="flex bg-muted/30 p-1 rounded-2xl border border-border/20">
               <button 
                 @click="activeTab = 'studio'"
                 class="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                 :class="activeTab === 'studio' ? 'bg-card text-primary shadow-lg' : 'text-muted-foreground opacity-50 hover:opacity-100'"
               >
                 <Maximize :size="14" />
                 Studio
               </button>
               <button 
                 @click="activeTab = 'scene'"
                 class="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                 :class="activeTab === 'scene' ? 'bg-card text-primary shadow-lg' : 'text-muted-foreground opacity-50 hover:opacity-100'"
               >
                 <Palette :size="14" />
                 Scene
               </button>
            </div>

            <!-- TAB 1: STUDIO (Subject Controls) -->
            <div v-if="activeTab === 'studio'" class="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <!-- Canvas Section -->
                <div class="space-y-6">
                  <div class="flex items-center gap-2">
                    <Layout :size="14" class="text-primary" />
                    <h4 class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Subject Control</h4>
                  </div>
                  
                  <div class="space-y-4 px-1">
                      <div class="flex justify-between items-center text-[10px] font-black uppercase">
                        <span class="text-muted-foreground">Padding</span>
                        <span class="text-primary">{{ settings.paddingX }}px</span>
                      </div>
                      <input type="range" v-model.number="settings.paddingX" @input="settings.paddingY = settings.paddingX" min="40" max="300" class="w-full h-1 bg-muted-foreground/20 rounded-full appearance-none accent-primary cursor-pointer" />
                  </div>

                  <div class="space-y-4 px-1">
                      <div class="flex justify-between items-center text-[10px] font-black uppercase">
                        <span class="text-muted-foreground">Inset</span>
                        <span class="text-primary">{{ settings.inset }}%</span>
                      </div>
                      <input type="range" v-model.number="settings.inset" min="0" max="30" class="w-full h-1 bg-muted-foreground/20 rounded-full appearance-none accent-primary cursor-pointer" />
                  </div>
                </div>

                <!-- Transformation Section -->
                <div class="space-y-6">
                  <div class="flex items-center gap-2">
                    <RotateCw :size="14" class="text-primary" />
                    <h4 class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Transform</h4>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-4 px-1">
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

                <!-- Frame Style -->
                <div class="space-y-6">
                  <div class="flex items-center gap-2">
                    <Monitor :size="14" class="text-primary" />
                    <h4 class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Frame Style</h4>
                  </div>
                  
                  <div class="grid grid-cols-3 gap-2 px-1">
                    <button 
                      v-for="frame in (['none', 'safari', 'chrome'] as const)" :key="frame"
                      @click="settings.browserFrame = frame"
                      class="py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all"
                      :class="settings.browserFrame === frame ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-[1.02]' : 'bg-background border-border hover:border-primary/50'"
                    >
                      {{ frame }}
                    </button>
                  </div>

                  <div class="space-y-4 px-1">
                    <div class="flex justify-between items-center text-[10px] font-black uppercase">
                      <span class="text-muted-foreground">Border Radius</span>
                      <span class="text-primary">{{ settings.borderRadius }}px</span>
                    </div>
                    <input type="range" v-model.number="settings.borderRadius" min="0" max="100" class="w-full h-1 bg-muted-foreground/20 rounded-full appearance-none accent-primary cursor-pointer" />
                  </div>
                </div>

                <!-- Export Settings -->
                <div class="space-y-6 pt-4 border-t border-border/20">
                  <div class="flex items-center gap-2">
                    <Download :size="14" class="text-primary" />
                    <h4 class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Export Settings</h4>
                  </div>
                  
                  <div class="space-y-6 px-1">
                    <div class="grid grid-cols-3 gap-2">
                      <button 
                        v-for="format in (['png', 'jpeg', 'webp'] as const)" :key="format"
                        @click="settings.exportFormat = format"
                        class="py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all"
                        :class="settings.exportFormat === format ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-[1.02]' : 'bg-background border-border hover:border-primary/50'"
                      >
                        {{ format }}
                      </button>
                    </div>

                    <div v-if="settings.exportFormat !== 'png'" class="space-y-4">
                      <div class="flex justify-between items-center text-[10px] font-black uppercase">
                        <span class="text-muted-foreground">Quality</span>
                        <span class="text-primary">{{ (settings.exportQuality * 100).toFixed(0) }}%</span>
                      </div>
                      <input type="range" v-model.number="settings.exportQuality" min="0.1" max="1.0" step="0.05" class="w-full h-1 bg-muted-foreground/20 rounded-full appearance-none accent-primary cursor-pointer" />
                    </div>
                  </div>
                </div>
            </div>

            <!-- TAB 2: SCENE (Background Controls) -->
            <div v-else class="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
               <!-- Mesh Presets -->
               <div class="space-y-6">
                  <div class="flex items-center gap-2">
                    <Sparkles :size="14" class="text-primary" />
                    <h4 class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Mesh Presets</h4>
                  </div>
                  
                  <div class="grid grid-cols-4 gap-3">
                    <button 
                      v-for="preset in backgroundPresets" 
                      :key="preset.value"
                      @click="settings.background = preset.value"
                      class="aspect-square rounded-2xl border-4 transition-all hover:scale-110 active:scale-90 relative group"
                      :class="settings.background === preset.value ? 'border-primary ring-4 ring-primary/20' : 'border-transparent shadow-xl'"
                      :style="getPresetStyle(preset.value)"
                      :title="preset.label"
                    >
                      <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <div class="bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded text-[7px] text-white font-bold">{{ preset.label }}</div>
                      </div>
                    </button>
                  </div>
               </div>

               <!-- Custom Mesh Builder -->
               <div class="space-y-6">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                       <Palette :size="14" class="text-primary" />
                       <h4 class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Mesh Builder</h4>
                    </div>
                    <button 
                      v-if="meshColors.length < 7"
                      @click="addColor" 
                      class="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-lg text-[8px] font-black uppercase hover:bg-primary/20 transition-colors"
                    >
                       <Plus :size="10" /> Add Color
                    </button>
                  </div>

                  <div class="space-y-4">
                     <p class="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter italic opacity-60">
                        Select 1 to 7 colors to create your custom {{ meshColors.length > 1 ? 'mesh' : 'solid' }} background.
                     </p>
                     
                     <div class="grid grid-cols-4 gap-3 bg-muted/20 p-4 rounded-3xl border border-border/20">
                        <div v-for="(c, i) in meshColors" :key="i" class="relative group/color">
                           <div class="flex flex-col items-center gap-2">
                              <div class="relative">
                                 <input 
                                   type="color" 
                                   v-model="meshColors[i]" 
                                   @input="updateMeshFromCustom" 
                                   class="w-10 h-10 rounded-xl border-0 bg-transparent cursor-pointer hover:scale-110 transition-transform" 
                                 />
                                 <button 
                                   v-if="meshColors.length > 1"
                                   @click="removeColor(i)"
                                   class="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/color:opacity-100 transition-opacity shadow-lg"
                                 >
                                    <X :size="8" />
                                 </button>
                              </div>
                              <span class="text-[7px] font-mono opacity-40">{{ c.toUpperCase() }}</span>
                           </div>
                        </div>
                     </div>
                     
                     <div class="space-y-3 pt-2">
                        <label class="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Raw Output / Solid Override</label>
                        <div class="flex gap-2">
                           <input 
                             type="text" 
                             v-model="settings.background" 
                             placeholder="#hex or linear-gradient..."
                             class="flex-1 bg-muted/30 border border-border/40 rounded-xl px-4 py-3 text-[10px] font-mono focus:outline-none focus:border-primary/50 transition-colors"
                           />
                           <div class="w-10 h-10 rounded-xl border border-border/40 shadow-inner" :style="getPresetStyle(settings.background)"></div>
                        </div>
                     </div>
                  </div>
               </div>

               <!-- Effects -->
               <div class="space-y-4 px-1 pt-2">
                  <label class="w-full flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10 cursor-pointer group hover:bg-primary/10 transition-all">
                     <div class="flex items-center gap-3">
                        <Zap :size="16" class="text-primary" />
                        <span class="text-[10px] font-black uppercase tracking-widest text-primary">Subtle Noise Texture</span>
                     </div>
                     <input type="checkbox" v-model="settings.noise" class="rounded border-primary text-primary focus:ring-primary h-4 w-4" />
                  </label>
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
