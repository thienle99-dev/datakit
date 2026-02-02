<script setup lang="ts">
import { ref } from 'vue';
import { Palette, Copy, Check, Download, Image as ImageIcon, Trash2, ArrowLeft, RefreshCw, Layers, Layout } from 'lucide-vue-next';
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

const downloadPalette = (format: 'json' | 'css' | 'tailwind' | 'scss') => {
  if (palette.value.length === 0) return;
  
  let content = '';
  let filename = `palette-${Date.now()}`;
  
  if (format === 'json') {
    content = JSON.stringify({
      name: 'Extracted Palette',
      colors: palette.value.map(hex => ({
        hex,
        rgb: hexToRgb(hex),
        hsl: hexToHsl(hex)
      }))
    }, null, 2);
    filename += '.json';
  } else if (format === 'css') {
    content = ':root {\n' + palette.value.map((hex, i) => `  --color-${i + 1}: ${hex};`).join('\n') + '\n}';
    filename += '.css';
  } else if (format === 'tailwind') {
    content = 'module.exports = {\n  theme: {\n    extend: {\n      colors: {\n' + 
      palette.value.map((hex, i) => `        'brand-${i + 1}': '${hex}',`).join('\n') + 
      '\n      }\n    }\n  }\n}';
    filename += '.js';
  } else if (format === 'scss') {
    content = palette.value.map((hex, i) => `$color-${i + 1}: ${hex};`).join('\n');
    filename += '.scss';
  }

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
};

const exportPoster = async () => {
  if (!file.value || palette.value.length === 0) return;
  isProcessing.value = true;
  try {
    const blob = await generatePalettePoster(file.value, palette.value);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `presentation-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Poster generation failed:', error);
  } finally {
    isProcessing.value = false;
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
            <div class="absolute right-0 top-full mt-2 w-48 bg-card border border-border shadow-2xl rounded-2xl overflow-hidden opacity-0 invisible group-hover/export:opacity-100 group-hover/export:visible transition-all z-50">
               <button @click="downloadPalette('json')" class="w-full text-left px-4 py-3 text-xs font-bold hover:bg-primary/10 transition-colors border-b border-border/50">JSON Format</button>
               <button @click="downloadPalette('css')" class="w-full text-left px-4 py-3 text-xs font-bold hover:bg-primary/10 transition-colors border-b border-border/50">CSS Variables</button>
               <button @click="downloadPalette('tailwind')" class="w-full text-left px-4 py-3 text-xs font-bold hover:bg-primary/10 transition-colors border-b border-border/50">Tailwind Config</button>
               <button @click="downloadPalette('scss')" class="w-full text-left px-4 py-3 text-xs font-bold hover:bg-primary/10 transition-colors border-b border-border/50">SCSS Variables</button>
               <button @click="exportPoster" class="w-full text-left px-4 py-3 text-xs font-bold bg-primary/5 text-primary hover:bg-primary/10 transition-colors">Presentation Poster</button>
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

    <main class="max-w-screen-2xl mx-auto p-4 md:p-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Selection & Preview Area -->
        <div class="lg:col-span-12">
           <div class="text-center mb-8">
              <h2 class="text-2xl font-black mb-2 animate-in fade-in slide-in-from-bottom-2 duration-700">Extract Colors</h2>
              <p class="text-muted-foreground text-sm max-w-xl mx-auto">
                Generate a stunning color palette from any image. Our AI-powered sampling extracts the most prominent and harmonious colors.
              </p>
           </div>
        </div>

        <!-- Left: Upload/Image -->
        <div class="lg:col-span-5 space-y-6">
          <div class="bg-card/80 backdrop-blur-md shadow-sm rounded-3xl overflow-hidden border border-border/50 bg-card min-h-[400px] flex items-center justify-center relative group">
            <template v-if="!previewUrl">
              <label class="w-full h-full flex flex-col items-center justify-center cursor-pointer p-12 text-center group">
                <div class="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ring-1 ring-primary/20">
                  <ImageIcon :size="40" />
                </div>
                <h3 class="text-xl font-bold mb-2">Drop or Paste your image here</h3>
                <p class="text-muted-foreground text-sm mb-6 max-w-[240px]">Supporting JPEG, PNG, and WebP. Just Ctrl+V to paste!</p>
                <div class="px-6 py-3 bg-primary text-primary-foreground rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all">
                  Browse Files
                </div>
                <input type="file" @change="handleFileUpload" accept="image/*" class="hidden" />
              </label>
            </template>
            <template v-else>
              <img :src="previewUrl" class="max-w-full max-h-[600px] object-contain rounded-2xl p-4 shadow-sm" />
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                 <label class="p-4 bg-white text-black rounded-2xl cursor-pointer hover:scale-105 transition-transform font-bold flex items-center gap-2 shadow-xl">
                   <RefreshCw :size="18" :class="{ 'animate-spin': isProcessing }" />
                   Change Image
                   <input type="file" @change="handleFileUpload" accept="image/*" class="hidden" />
                 </label>
              </div>
            </template>
          </div>

          <div v-if="previewUrl" class="bg-card/80 backdrop-blur-md shadow-sm p-6 rounded-3xl border border-border/50 bg-card">
            <div class="flex items-center justify-between mb-4">
               <h3 class="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                 <Layers :size="14" /> Settings
               </h3>
               <span class="px-2 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-md">{{ colorCount }} Colors</span>
            </div>
            <input 
              type="range" v-model.number="colorCount" min="4" max="12" step="1" 
              @change="processImage"
              class="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary-foreground"
            />
            <div class="flex justify-between text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-tighter">
              <span>Minimal (4)</span>
              <span>Rich (12)</span>
            </div>

            <!-- Styles & Sorting -->
            <div class="mt-8 pt-8 border-t border-border/50 space-y-6">
               <div class="space-y-3">
                  <label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Palette Style</label>
                  <div class="flex flex-wrap gap-2">
                    <button 
                      v-for="s in styles" :key="s.id"
                      @click="selectedStyle = s.id as any; processImage()"
                      class="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border"
                      :class="selectedStyle === s.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 border-border/50 hover:border-primary/30'"
                    >
                      {{ s.label }}
                    </button>
                  </div>
               </div>

               <div class="space-y-3">
                  <label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sort By</label>
                  <select 
                    v-model="sortBy" @change="palette = sortPalette(palette)"
                    class="w-full bg-muted/50 border border-border/50 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-1 ring-primary/30 transition-all"
                  >
                    <option value="none">Default (Frequency)</option>
                    <option value="hue">Hue</option>
                    <option value="saturation">Saturation</option>
                    <option value="luminance">Luminance</option>
                  </select>
               </div>
            </div>
          </div>
        </div>

        <!-- Right: Palette Display -->
        <div class="lg:col-span-7 space-y-6">
          <div v-if="palette.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              v-for="(color, index) in palette" 
              :key="color"
              class="animate-in fade-in slide-in-from-right-4 duration-500"
              :style="{ animationDelay: `${index * 100}ms` }"
            >
              <div class="bg-card/80 backdrop-blur-md shadow-sm group/color p-4 rounded-3xl border border-border/50 bg-card hover:border-primary/40 transition-all hover:shadow-xl cursor-pointer" @click="openHarmonyLab(color)">
                <div class="flex gap-4">
                  <!-- Color Swatch -->
                  <div 
                    class="w-24 h-24 rounded-2xl shadow-inner relative overflow-hidden group-hover/color:scale-105 transition-transform"
                    :style="{ backgroundColor: color }"
                  >
                    <div class="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></div>
                  </div>

                  <!-- Color Info -->
                  <div class="flex-1 flex flex-col justify-center gap-1.5">
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
                           <span class="cursor-pointer group-hover/val:text-primary transition-colors">{{ getRgbString(color) }}</span>
                           <Check v-if="copiedText === getRgbString(color)" :size="10" class="text-emerald-500" />
                           <Copy v-else :size="10" class="opacity-0 group-hover/val:opacity-100 transition-opacity" />
                         </div>
                       </div>
                       <div class="flex items-center justify-between text-[10px] font-bold group/val p-1 hover:bg-muted/50 rounded-lg transition-all" @click.stop="copyToClipboard(hexToHsl(color))">
                         <span class="text-muted-foreground uppercase opacity-50">HSL</span>
                         <div class="flex items-center gap-2">
                           <span class="cursor-pointer group-hover/val:text-primary transition-colors">{{ hexToHsl(color) }}</span>
                           <Check v-if="copiedText === hexToHsl(color)" :size="10" class="text-emerald-500" />
                           <Copy v-else :size="10" class="opacity-0 group-hover/val:opacity-100 transition-opacity" />
                         </div>
                       </div>
                    </div>

                    <!-- Contrast Badges -->
                    <div class="mt-2 flex gap-2">
                      <div 
                        class="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter"
                        :class="getContrastRatio(color, '#ffffff') > 4.5 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'"
                      >
                        WHE ON WHT: {{ getContrastRatio(color, '#ffffff').toFixed(1) }}
                      </div>
                      <div 
                        class="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter"
                        :class="getContrastRatio(color, '#000000') > 4.5 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'"
                      >
                        WHE ON BLK: {{ getContrastRatio(color, '#000000').toFixed(1) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="!isProcessing && !file" class="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-border/40 rounded-[2.5rem] bg-card/10">
            <div class="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground/40 mb-4">
              <Palette :size="32" />
            </div>
            <h3 class="text-lg font-bold text-muted-foreground/60">No Palette Extracted</h3>
            <p class="text-sm text-muted-foreground/40 max-w-[200px]">Upload an image to see the color magic happen</p>
          </div>

          <div v-if="isProcessing" class="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-border/40 rounded-[2.5rem] bg-card/10">
            <RefreshCw :size="40" class="text-primary animate-spin mb-4" />
            <h3 class="text-lg font-bold">Analyzing Pixels...</h3>
            <p class="text-sm text-muted-foreground">Extracting the DNA of your image</p>
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
                             color: getContrastRatio(palette[3] || palette[0], '#ffffff') > 4.5 ? '#ffffff' : '#000000' 
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
  </div>
</template>


<style scoped>
/* Scoped styles removed to avoid @apply compilation issues */
</style>
