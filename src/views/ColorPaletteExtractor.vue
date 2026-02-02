<script setup lang="ts">
import { ref } from 'vue';
import { Palette, Copy, Check, Download, Image as ImageIcon, Trash2, ArrowLeft, RefreshCw, Layout, Layers } from 'lucide-vue-next';
import { extractPalette, hexToRgb, hexToHsl, getContrastRatio, getHslData, getHarmoniousColors, generatePalettePoster } from '../utils/imageUtils';
import { useRouter } from 'vue-router';

const router = useRouter();
const file = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const palette = ref<string[]>([]);
const isProcessing = ref(false);
const copiedText = ref<string | null>(null);
const colorCount = ref(8);
const selectedStyle = ref<'all' | 'vibrant' | 'muted' | 'light' | 'dark'>('all');
const sortBy = ref<'none' | 'hue' | 'saturation' | 'luminance'>('none');
const hasEyeDropper = ref(typeof window !== 'undefined' && 'EyeDropper' in window);
const showPreview = ref(false);
const activeColor = ref<string | null>(null);
const harmonyColors = ref<{ type: string; colors: string[] }[]>([]);

const showExportModal = ref(false);
const exportMode = ref<'code' | 'poster'>('code');
const codeFormat = ref<'json' | 'css' | 'tailwind' | 'scss'>('json');
const generatedCode = ref('');
const posterPreviewUrl = ref<string | null>(null);

const styles = [
  { id: 'all', label: 'All Colors' },
  { id: 'vibrant', label: 'Vibrant' },
  { id: 'muted', label: 'Muted' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' }
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
    let result = await extractPalette(file.value, colorCount.value, selectedStyle.value);
    palette.value = sortPalette(result);
  } catch (error) {
    console.error('Extraction failed:', error);
  } finally {
    isProcessing.value = false;
  }
};

const sortPalette = (colors: string[]) => {
  if (sortBy.value === 'none') return colors;
  
  return [...colors].sort((a, b) => {
    const hslA = getHslData(a);
    const hslB = getHslData(b);
    
    if (sortBy.value === 'hue') return hslA.h - hslB.h;
    if (sortBy.value === 'saturation') return hslB.s - hslA.s;
    if (sortBy.value === 'luminance') return hslB.l - hslA.l;
    return 0;
  });
};

const handleEyedropper = async () => {
  if (!hasEyeDropper.value) return;
  try {
    // @ts-ignore
    const eyeDropper = new window.EyeDropper();
    const result = await eyeDropper.open();
    const newColor = result.sRGBHex;
    if (!palette.value.includes(newColor)) {
      palette.value = [newColor, ...palette.value].slice(0, 12);
    }
  } catch (e) {
    console.log('Eyedropper cancelled or failed');
  }
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  copiedText.value = text;
  setTimeout(() => {
    copiedText.value = null;
  }, 2000);
};

const generateCode = (format: 'json' | 'css' | 'tailwind' | 'scss') => {
  codeFormat.value = format;
  if (palette.value.length === 0) return;
  
  if (format === 'json') {
    generatedCode.value = JSON.stringify({
      name: 'Extracted Palette',
      colors: palette.value.map(hex => ({
        hex,
        rgb: hexToRgb(hex),
        hsl: hexToHsl(hex)
      }))
    }, null, 2);
  } else if (format === 'css') {
    generatedCode.value = ':root {\n' + palette.value.map((hex, i) => `  --color-${i + 1}: ${hex};`).join('\n') + '\n}';
  } else if (format === 'tailwind') {
    generatedCode.value = 'module.exports = {\n  theme: {\n    extend: {\n      colors: {\n' + 
      palette.value.map((hex, i) => `        'brand-${i + 1}': '${hex}',`).join('\n') + 
      '\n      }\n    }\n  }\n}';
  } else if (format === 'scss') {
    generatedCode.value = palette.value.map((hex, i) => `$color-${i + 1}: ${hex};`).join('\n');
  }
};

const openExportPreview = (mode: 'code' | 'poster', format?: any) => {
  exportMode.value = mode;
  if (mode === 'code') {
    generateCode(format || 'json');
  } else {
    updatePosterPreview();
  }
  showExportModal.value = true;
};

const updatePosterPreview = async () => {
  if (!file.value || palette.value.length === 0) return;
  isProcessing.value = true;
  try {
    const blob = await generatePalettePoster(file.value, palette.value);
    if (posterPreviewUrl.value) URL.revokeObjectURL(posterPreviewUrl.value);
    posterPreviewUrl.value = URL.createObjectURL(blob);
  } catch (error) {
    console.error('Poster generation failed:', error);
  } finally {
    isProcessing.value = false;
  }
};

const downloadFromPreview = () => {
  if (exportMode.value === 'code') {
    const blob = new Blob([generatedCode.value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const ext = codeFormat.value === 'json' ? 'json' : codeFormat.value === 'tailwind' ? 'js' : codeFormat.value;
    a.download = `palette-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  } else if (posterPreviewUrl.value) {
    const a = document.createElement('a');
    a.href = posterPreviewUrl.value;
    a.download = `presentation-${Date.now()}.png`;
    a.click();
  }
};

const openHarmonyLab = (color: string) => {
  activeColor.value = color;
  harmonyColors.value = getHarmoniousColors(color);
};

const reset = () => {
  file.value = null;
  previewUrl.value = null;
  palette.value = [];
};

const getRgbString = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${r}, ${g}, ${b})`;
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

import { onMounted, onUnmounted } from 'vue';

onMounted(() => {
  window.addEventListener('paste', handlePaste);
});

onUnmounted(() => {
  window.removeEventListener('paste', handlePaste);
});
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
              <Palette :size="20" class="text-primary" />
              Color Extractor
            </h1>
            <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Premium Palette Generator
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div v-if="palette.length > 0" class="relative group/export">
            <button 
              class="hidden md:flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
              <Download :size="16" />
              Export
            </button>
            <!-- Dropdown Menu -->
            <div class="absolute right-0 top-full mt-2 w-48 bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl overflow-hidden opacity-0 invisible group-hover/export:opacity-100 group-hover/export:visible transition-all z-50">
               <button @click="openExportPreview('code', 'json')" class="w-full text-left px-4 py-3 text-xs font-bold hover:bg-primary/10 transition-colors border-b border-border/50">JSON Format</button>
               <button @click="openExportPreview('code', 'css')" class="w-full text-left px-4 py-3 text-xs font-bold hover:bg-primary/10 transition-colors border-b border-border/50">CSS Variables</button>
               <button @click="openExportPreview('code', 'tailwind')" class="w-full text-left px-4 py-3 text-xs font-bold hover:bg-primary/10 transition-colors border-b border-border/50">Tailwind Config</button>
               <button @click="openExportPreview('code', 'scss')" class="w-full text-left px-4 py-3 text-xs font-bold hover:bg-primary/10 transition-colors border-b border-border/50">SCSS Variables</button>
               <button @click="openExportPreview('poster')" class="w-full text-left px-4 py-3 text-xs font-bold bg-primary/5 text-primary hover:bg-primary/10 transition-colors">Presentation Poster</button>
            </div>
          </div>
          <button 
            v-if="file"
            @click="reset"
            class="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
          >
            <Trash2 :size="20" />
          </button>
          <button 
            v-if="palette.length > 0"
            @click="showPreview = !showPreview"
            class="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors"
            :class="{ 'bg-primary text-primary-foreground': showPreview }"
            title="Toggle UI Preview"
          >
            <Layout :size="20" />
          </button>
          <button 
            v-if="hasEyeDropper && previewUrl"
            @click="handleEyedropper"
            class="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors"
            title="Pick a color from screen"
          >
            <ImageIcon :size="20" />
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-screen-2xl mx-auto p-4 md:p-6">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Left: Upload & Settings (Sidebar style) -->
        <div class="lg:col-span-4 space-y-6">
          <!-- Compact Upload Area -->
          <div 
            class="bg-card/50 backdrop-blur-xl border border-border/40 rounded-3xl overflow-hidden transition-all duration-500"
            :class="previewUrl ? 'min-h-[200px]' : 'min-h-[340px]'"
          >
            <template v-if="!previewUrl">
              <label class="w-full h-full flex flex-col items-center justify-center cursor-pointer p-8 text-center group">
                <div class="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                  <ImageIcon :size="32" />
                </div>
                <h3 class="text-sm font-black uppercase tracking-widest mb-2">Upload Image</h3>
                <p class="text-[10px] text-muted-foreground font-bold uppercase tracking-tight opacity-60">Paste (Ctrl+V) or click</p>
                <input type="file" @change="handleFileUpload" accept="image/*" class="hidden" />
              </label>
            </template>
            <template v-else>
              <div class="relative group p-4">
                <img :src="previewUrl" class="w-full h-auto max-h-[300px] object-contain rounded-2xl shadow-2xl shadow-primary/5" />
                <div class="absolute inset-x-5 bottom-8 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center">
                   <label class="px-4 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl shadow-2xl cursor-pointer hover:scale-105 transition-transform flex items-center gap-2">
                     <RefreshCw :size="12" />
                     Change Image
                     <input type="file" @change="handleFileUpload" accept="image/*" class="hidden" />
                   </label>
                </div>
              </div>
            </template>
          </div>

          <!-- Settings Panel -->
          <div v-if="previewUrl" class="bg-card/50 backdrop-blur-xl p-6 rounded-3xl border border-border/40 animate-in slide-in-from-left-4 duration-500">
            <div class="flex items-center justify-between mb-6">
               <h3 class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Configuration</h3>
               <span class="px-2 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-md">{{ colorCount }} colors</span>
            </div>
            
            <div class="space-y-6">
              <input type="range" v-model.number="colorCount" min="4" max="12" step="1" @change="processImage" class="w-full" />
              
              <div class="space-y-4">
                <label class="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Palette Style</label>
                <div class="grid grid-cols-3 gap-2">
                  <button 
                    v-for="s in styles" :key="s.id"
                    @click="selectedStyle = s.id as any; processImage()"
                    class="px-2 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border"
                    :class="selectedStyle === s.id ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20' : 'bg-muted/30 border-border/40 hover:bg-muted/50'"
                  >
                    {{ s.label }}
                  </button>
                </div>
              </div>

              <div class="space-y-3">
                <label class="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Sort Strategy</label>
                <div class="flex bg-muted/30 p-1 rounded-xl border border-border/40">
                  <button 
                    v-for="mode in (['none', 'hue', 'saturation', 'luminance'] as const)" :key="mode"
                    @click="sortBy = mode; palette = sortPalette(palette)"
                    class="flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-tighter transition-all"
                    :class="sortBy === mode ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground opacity-60 hover:opacity-100'"
                  >
                    {{ mode === 'none' ? 'Freq' : mode }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Professional Palette Grid -->
        <div class="lg:col-span-8 space-y-6">
          <div v-if="palette.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              v-for="(color, index) in palette" :key="color"
              class="animate-in fade-in slide-in-from-right-4 duration-500"
              :style="{ animationDelay: `${index * 50}ms` }"
            >
              <div 
                class="bg-card/50 backdrop-blur-xl p-4 rounded-3xl border border-border/40 hover:border-primary/40 transition-all cursor-pointer group/card shadow-sm hover:shadow-xl"
                @click="openHarmonyLab(color)"
              >
                <div class="flex gap-4">
                  <!-- Original Large Swatch -->
                  <div 
                    class="w-24 h-24 rounded-2xl shadow-inner relative overflow-hidden group-hover/card:scale-105 transition-transform shrink-0"
                    :style="{ backgroundColor: color }"
                  >
                    <div class="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent"></div>
                  </div>

                  <!-- Color Info -->
                  <div class="flex-1 flex flex-col justify-center gap-1.5 min-w-0">
                    <div class="flex items-center justify-between">
                      <span class="text-lg font-black tracking-tight">{{ color.toUpperCase() }}</span>
                      <button 
                        @click.stop="copyToClipboard(color)"
                        class="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-primary relative"
                      >
                        <Check v-if="copiedText === color" :size="16" class="text-emerald-500" />
                        <Copy v-else :size="16" />
                      </button>
                    </div>

                    <div class="space-y-1">
                       <div class="flex items-center justify-between text-[10px] font-bold group/val p-1 hover:bg-muted/50 rounded-lg transition-all" @click.stop="copyToClipboard(getRgbString(color))">
                         <span class="text-muted-foreground uppercase opacity-50">RGB</span>
                         <div class="flex items-center gap-2">
                           <span class="cursor-pointer group-hover/val:text-primary transition-colors">{{ getRgbString(color).replace('rgb(', '').replace(')', '') }}</span>
                           <Check v-if="copiedText === getRgbString(color)" :size="10" class="text-emerald-500" />
                         </div>
                       </div>
                       <div class="flex items-center justify-between text-[10px] font-bold group/val p-1 hover:bg-muted/50 rounded-lg transition-all" @click.stop="copyToClipboard(hexToHsl(color))">
                         <span class="text-muted-foreground uppercase opacity-50">HSL</span>
                         <div class="flex items-center gap-2">
                           <span class="cursor-pointer group-hover/val:text-primary transition-colors text-right truncate max-w-[80px]">{{ hexToHsl(color).replace('hsl(', '').replace(')', '') }}</span>
                           <Check v-if="copiedText === hexToHsl(color)" :size="10" class="text-emerald-500" />
                         </div>
                       </div>
                    </div>

                    <!-- Contrast Badges -->
                    <div class="mt-2 flex gap-2">
                      <div 
                        class="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter"
                        :class="getContrastRatio(color, '#ffffff') > 4.5 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'"
                      >
                        WHT: {{ getContrastRatio(color, '#ffffff').toFixed(1) }}
                      </div>
                      <div 
                        class="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter"
                        :class="getContrastRatio(color, '#000000') > 4.5 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'"
                      >
                        BLK: {{ getContrastRatio(color, '#000000').toFixed(1) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- No Image/Processing States -->
          <div v-if="!file && !isProcessing" class="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-border/20 rounded-[2.5rem] bg-card/5">
            <div class="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground/40 mb-4">
              <Palette :size="32" />
            </div>
            <h3 class="text-sm font-black uppercase tracking-widest text-muted-foreground/60">No Palette yet</h3>
            <p class="text-[10px] text-muted-foreground/40 max-w-[200px] font-bold uppercase tracking-widest mt-2">Upload an image to start</p>
          </div>

          <div v-if="isProcessing" class="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-card/5 rounded-[2.5rem]">
            <RefreshCw :size="40" class="text-primary animate-spin mb-4" />
            <h3 class="text-sm font-black uppercase tracking-widest">Analyzing...</h3>
          </div>
        </div>

        <!-- Harmony Lab Section -->
        <div v-if="activeColor && !showPreview" class="lg:col-span-12 animate-in slide-in-from-bottom-4 duration-500">
           <div class="bg-card/80 backdrop-blur-md shadow-2xl border border-border/50 rounded-[2.5rem] p-8">
              <div class="flex items-center justify-between mb-8">
                <div>
                   <h3 class="text-2xl font-black flex items-center gap-3">
                     <span class="w-8 h-8 rounded-full shadow-lg" :style="{ backgroundColor: activeColor }"></span>
                     Color Harmony Lab
                   </h3>
                   <p class="text-muted-foreground text-sm mt-1">Professional color theory suggestions for {{ activeColor.toUpperCase() }}</p>
                </div>
                <button @click="activeColor = null" class="p-2 hover:bg-muted rounded-full text-muted-foreground"><Trash2 :size="20" /></button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div v-for="harmony in harmonyColors" :key="harmony.type" class="space-y-4">
                  <h4 class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{{ harmony.type }}</h4>
                  <div class="flex gap-2">
                    <div 
                      v-for="color in harmony.colors" :key="color"
                      class="flex-1 group/h relative"
                    >
                      <div 
                        class="aspect-square rounded-2xl shadow-sm cursor-pointer hover:scale-105 transition-transform"
                        :style="{ backgroundColor: color }"
                        @click="copyToClipboard(color)"
                      >
                        <div class="absolute inset-x-0 bottom-0 p-2 bg-black/20 backdrop-blur-sm opacity-0 group-hover/h:opacity-100 transition-opacity rounded-b-2xl">
                          <span class="text-[10px] font-black text-white block text-center">{{ color.toUpperCase() }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
           </div>
        </div>

        <!-- UI Preview Section -->
        <div v-if="showPreview && palette.length > 0" class="lg:col-span-12 animate-in fade-in zoom-in duration-500">
           <!-- (Mockup content remains the same) -->
           <div class="bg-card/80 backdrop-blur-md shadow-2xl border border-border/50 rounded-[2.5rem] p-8 md:p-12">
              <div class="flex flex-col md:flex-row gap-12 items-center">
                <!-- Mockup Device -->
                <div class="w-full md:w-1/2 space-y-6">
                  <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-black/5 max-w-sm mx-auto aspect-[9/16] flex flex-col" :style="{ backgroundColor: palette.length > 0 ? palette[palette.length - 1] : '#f8fafc' }">
                      <!-- App Header -->
                      <div class="p-6 flex items-center justify-between" :style="{ backgroundColor: palette[0] }">
                         <div class="w-8 h-8 rounded-full bg-white/20"></div>
                         <div class="w-24 h-3 rounded-full bg-white/30"></div>
                         <div class="w-6 h-6 rounded-lg bg-white/20"></div>
                      </div>
                      <!-- Content -->
                      <div class="p-8 flex-1 space-y-6">
                         <div class="space-y-2">
                            <div class="w-3/4 h-6 rounded-lg" :style="{ backgroundColor: palette[1] || palette[0] }"></div>
                            <div class="w-1/2 h-4 rounded-lg opacity-40" :style="{ backgroundColor: palette[1] || palette[0] }"></div>
                         </div>
                         <div class="aspect-video rounded-2xl shadow-sm" :style="{ backgroundColor: palette[2] || palette[1] }"></div>
                         <div class="space-y-3">
                            <div class="w-full h-3 rounded-full opacity-20" :style="{ backgroundColor: palette[1] || palette[0] }"></div>
                            <div class="w-full h-3 rounded-full opacity-20" :style="{ backgroundColor: palette[1] || palette[0] }"></div>
                            <div class="w-2/3 h-3 rounded-full opacity-20" :style="{ backgroundColor: palette[1] || palette[0] }"></div>
                         </div>
                         <button 
                           class="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg transition-transform active:scale-95" 
                           :style="{ 
                             backgroundColor: palette[3] || palette[0], 
                             color: (palette[3] || palette[0]) && getContrastRatio(palette[3] || palette[0], '#ffffff') > 4.5 ? '#ffffff' : '#000000' 
                           }"
                         >
                           Action Button
                         </button>
                      </div>
                      <!-- Tab Bar -->
                      <div class="p-4 bg-white/80 border-t border-black/5 flex justify-around items-center backdrop-blur-md">
                         <div v-for="i in 4" :key="i" class="w-8 h-8 rounded-xl opacity-40" :style="{ backgroundColor: i === 1 ? palette[0] : '#94a3b8' }"></div>
                      </div>
                  </div>
                </div>
                <!-- Explainer -->
                <div class="w-full md:w-1/2 space-y-6">
                  <h3 class="text-3xl font-black leading-tight">Live UI Preview</h3>
                  <p class="text-muted-foreground text-lg">See how your extracted colors work together in a real application interface.</p>
                  <div class="grid grid-cols-2 gap-4">
                     <div class="p-4 rounded-2xl bg-muted/30 border border-border/50">
                        <span class="text-[10px] uppercase font-black text-muted-foreground block mb-2">Primary Color</span>
                        <div class="flex items-center gap-2">
                           <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: palette[0] }"></div>
                           <span class="text-xs font-bold">{{ palette[0] }}</span>
                        </div>
                     </div>
                     <div class="p-4 rounded-2xl bg-muted/30 border border-border/50">
                        <span class="text-[10px] uppercase font-black text-muted-foreground block mb-2">Accent Color</span>
                        <div class="flex items-center gap-2">
                           <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: palette[3] || palette[1] }"></div>
                           <span class="text-xs font-bold">{{ palette[3] || palette[1] }}</span>
                        </div>
                     </div>
                  </div>
                  <button @click="showPreview = false" class="text-primary text-sm font-black uppercase tracking-widest hover:underline">Close Preview</button>
                </div>
              </div>
           </div>
        </div>

      </div>
    </main>

    <!-- Premium Export Preview Modal -->
    <div v-if="showExportModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300">
       <div class="absolute inset-0 bg-black/80 backdrop-blur-xl" @click="showExportModal = false"></div>
       
       <div class="bg-card w-full max-w-5xl max-h-[85vh] overflow-hidden rounded-[3rem] border border-white/10 shadow-[0_0_100px_-20px_rgba(0,0,0,0.5)] relative animate-in zoom-in-95 duration-500 flex flex-col md:flex-row">
          
          <!-- Modal Sidebar: Actions & Formats -->
          <div class="w-full md:w-80 border-b md:border-b-0 md:border-r border-border/40 p-8 flex flex-col justify-between bg-muted/20">
            <div class="space-y-10">
              <div class="space-y-2">
                <h3 class="text-2xl font-black tracking-tight uppercase">Export</h3>
                <p class="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Professional Output</p>
              </div>

              <!-- Export Type Toggle -->
              <div class="space-y-4">
                <label class="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Select Mode</label>
                <div class="flex flex-col gap-2">
                  <button 
                    @click="exportMode = 'code'; generateCode(codeFormat)"
                    class="group flex items-center gap-4 p-4 rounded-2xl transition-all"
                    :class="exportMode === 'code' ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20' : 'hover:bg-muted/50'"
                  >
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center transition-colors" :class="exportMode === 'code' ? 'bg-white/20' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'">
                       <Layers :size="18" />
                    </div>
                    <div class="text-left">
                       <p class="text-xs font-black uppercase">Code</p>
                       <p class="text-[9px] opacity-60 font-bold uppercase">{{ codeFormat }} format</p>
                    </div>
                  </button>
                  <button 
                    @click="exportMode = 'poster'; updatePosterPreview()"
                    class="group flex items-center gap-4 p-4 rounded-2xl transition-all"
                    :class="exportMode === 'poster' ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20' : 'hover:bg-muted/50'"
                  >
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center transition-colors" :class="exportMode === 'poster' ? 'bg-white/20' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'">
                       <Layout :size="18" />
                    </div>
                    <div class="text-left">
                       <p class="text-xs font-black uppercase">Poster</p>
                       <p class="text-[9px] opacity-60 font-bold uppercase">Presentation</p>
                    </div>
                  </button>
                </div>
              </div>

              <!-- Format Selector (only for code) -->
              <div v-if="exportMode === 'code'" class="space-y-4 pt-4 animate-in slide-in-from-top-4 duration-500">
                <label class="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Format</label>
                <div class="grid grid-cols-2 gap-2">
                   <button 
                     v-for="fmt in (['json', 'css', 'tailwind', 'scss'] as const)" :key="fmt"
                     @click="generateCode(fmt)"
                     class="py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border"
                     :class="codeFormat === fmt ? 'bg-primary/10 border-primary text-primary' : 'bg-transparent border-border/40 hover:border-primary/50'"
                   >
                     {{ fmt }}
                   </button>
                </div>
              </div>
            </div>

            <div class="space-y-4 pt-8">
              <button 
                @click="downloadFromPreview"
                class="w-full py-5 bg-primary text-primary-foreground rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <Download :size="18" />
                Download
              </button>
              <button @click="showExportModal = false" class="w-full py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                 Close Window
              </button>
            </div>
          </div>

          <!-- Modal Main Area: Preview -->
          <div class="flex-1 bg-black/90 relative flex flex-col">
             <!-- Top bar with Copy info -->
             <div class="p-6 border-b border-white/5 flex items-center justify-between">
                <div class="flex items-center gap-3">
                   <div class="flex gap-1.5">
                      <div class="w-3 h-3 rounded-full bg-rose-500/80"></div>
                      <div class="w-3 h-3 rounded-full bg-amber-500/80"></div>
                      <div class="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                   </div>
                   <span class="text-[10px] font-mono text-white/40 uppercase tracking-widest ml-4">{{ exportMode === 'code' ? `${codeFormat.toUpperCase()} Preview` : 'Presentation Render' }}</span>
                </div>
                <button 
                  v-if="exportMode === 'code'"
                  @click="copyToClipboard(generatedCode)"
                  class="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 group"
                >
                   <Check v-if="copiedText === generatedCode" :size="14" class="text-emerald-400" />
                   <Copy v-else :size="14" class="text-white/40 group-hover:text-white" />
                   <span class="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white">{{ copiedText === generatedCode ? 'Copied!' : 'Copy Snippet' }}</span>
                </button>
             </div>

             <!-- Preview Content -->
             <div class="flex-1 overflow-hidden flex items-center justify-center p-8 lg:p-12">
                <!-- Code Preview -->
                <div v-if="exportMode === 'code'" class="w-full h-full animate-in fade-in slide-in-from-right-8 duration-700">
                   <pre class="h-full w-full font-mono text-[13px] leading-relaxed overflow-auto custom-scrollbar text-emerald-400/90 selection:bg-primary/30"><code>{{ generatedCode }}</code></pre>
                </div>

                <!-- Poster Preview with Stage -->
                <div v-else-if="exportMode === 'poster'" class="w-full h-full flex items-center justify-center animate-in fade-in zoom-in duration-700">
                    <div class="relative group/stage flex items-center justify-center w-full h-full">
                       <!-- Stage Background -->
                       <div class="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent rounded-3xl"></div>
                       
                       <div v-if="isProcessing" class="flex flex-col items-center gap-4">
                          <RefreshCw :size="48" class="text-primary animate-spin" />
                          <p class="text-[10px] font-black uppercase text-white/40 tracking-[0.3em]">Rendering Poster</p>
                       </div>
                       
                       <img 
                         v-else-if="posterPreviewUrl" 
                         :src="posterPreviewUrl" 
                         class="max-h-full max-w-full rounded-lg shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border border-white/10 transition-transform duration-700 hover:scale-[1.02]"
                       />
                    </div>
                </div>
             </div>
             
             <!-- Bottom Status -->
             <div class="p-6 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-white/20 uppercase tracking-[0.2em]">
                <span>Status: Ready for export</span>
                <span>DataKit Graphics Engine v1.0</span>
             </div>
          </div>
       </div>
    </div>
  </div>
</template>


<style scoped>
/* Scoped styles removed to avoid @apply compilation issues */
</style>
