<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { colord, extend } from 'colord';
import cmykPlugin from 'colord/plugins/cmyk';
import hwbPlugin from 'colord/plugins/hwb';
import namesPlugin from 'colord/plugins/names';
import { 
  ArrowLeft, 
  Palette, 
  Copy, 
  Check, 
  RefreshCcw,
  Droplet
} from 'lucide-vue-next';

extend([cmykPlugin, hwbPlugin, namesPlugin]);

// --- State ---
const colorInput = ref('#3b82f6'); // Start with a nice blue
const colorObject = ref(colord('#3b82f6'));
const copiedFormat = ref<string | null>(null);

// --- Computed Conversions ---
const formats = computed(() => {
    const c = colorObject.value;
    const hex = c.toHex();
    const rgb = c.toRgbString();
    const hsl = c.toHslString();
    const cmyk = c.toCmykString();
    
    // HWB is useful for CSS too sometimes
    // const hwb = c.toHwbString(); 
    
    return [
        { id: 'hex', label: 'HEX', value: hex },
        { id: 'rgb', label: 'RGB', value: rgb },
        { id: 'hsl', label: 'HSL', value: hsl },
        { id: 'cmyk', label: 'CMYK', value: cmyk },
        { id: 'css', label: 'CSS Variable', value: `${rgb.replace('rgb(', '').replace(')', '').replace(/,/g, '')}` }
    ];
});

const isValid = computed(() => colorObject.value.isValid());
const brightness = computed(() => colorObject.value.brightness());
const isDark = computed(() => colorObject.value.isDark());
const contrastColor = computed(() => isDark.value ? '#ffffff' : '#000000');

// --- Watchers ---
watch(colorInput, (newVal) => {
    const c = colord(newVal);
    if (c.isValid()) {
        colorObject.value = c;
    }
});

// --- Actions ---
const updateFromPicker = (event: Event) => {
    const target = event.target as HTMLInputElement;
    colorInput.value = target.value;
};

const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    copiedFormat.value = id;
    setTimeout(() => copiedFormat.value = null, 2000);
};

// Preset Palettes (Tailwind-ish)
const palettes = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', 
    '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', 
    '#f43f5e', '#0f172a'
];

const setPreset = (color: string) => {
    colorInput.value = color;
};

const randomColor = () => {
    const randomHex = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    colorInput.value = randomHex;
};

</script>

<template>
  <div class="h-screen-minus-header flex flex-col p-4 md:p-6 lg:p-8 max-w-5xl mx-auto w-full">
    
    <!-- Header -->
    <div class="flex items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-4">
             <router-link to="/" class="p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors">
              <ArrowLeft :size="20" />
            </router-link>
            <div class="flex items-center gap-3">
              <div class="bg-pink-500/10 text-pink-500 p-2 rounded-lg">
                <Palette :size="24" />
              </div>
              <div>
                <h1 class="text-xl font-bold tracking-tight">Color Converter</h1>
                <p class="text-sm text-muted-foreground">Convert colors between formats (HEX, RGB, HSL, CMYK)</p>
              </div>
            </div>
        </div>
        
        <button @click="randomColor" class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-pink-500 bg-muted/30 hover:bg-pink-500/10 px-3 py-2 rounded-lg transition-all">
            <RefreshCw :size="14" /> Random
        </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Left Column: Visual Picker -->
        <div class="lg:col-span-5 flex flex-col gap-6">
            
            <!-- Large Color Preview Card -->
            <div 
                class="aspect-square rounded-3xl shadow-xl flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 ring-1 ring-border/20 group"
                :style="{ backgroundColor: colorObject.toHex() }"
            >
                <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-black/10 pointer-events-none"></div>
                
                <div class="relative z-10 text-center space-y-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                    <p class="text-3xl font-black tracking-tighter" :style="{ color: contrastColor }">{{ colorObject.toHex().toUpperCase() }}</p>
                    <p class="text-sm font-bold opacity-80" :style="{ color: contrastColor }">{{ colorObject.toName({ closest: true }) || 'Custom Color' }}</p>
                </div>

                <!-- Input overlay -->
                <input 
                    type="color" 
                    :value="colorObject.toHex()"
                    @input="updateFromPicker"
                    class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                
                 <div class="absolute bottom-4 right-4 bg-background/20 backdrop-blur-md p-2 rounded-full text-foreground/80 pointer-events-none">
                     <Droplet :size="20" :style="{ color: contrastColor }" />
                 </div>
            </div>

            <!-- Input Field -->
            <div class="flex flex-col gap-2">
                <label class="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Input Color</label>
                <div class="relative">
                    <input 
                        v-model="colorInput"
                        type="text" 
                        class="w-full bg-card border border-border rounded-xl px-4 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all shadow-sm"
                        placeholder="#000000 or rgb(0,0,0)"
                    />
                    <div 
                        class="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md border border-border pointer-events-none transition-colors"
                        :style="{ backgroundColor: isValid ? colorObject.toHex() : 'transparent' }"
                    ></div>
                </div>
                <p v-if="!isValid" class="text-xs text-rose-500 font-bold px-1">Invalid color format</p>
            </div>
            
            <!-- Presets -->
            <div class="flex flex-wrap gap-2">
                <button 
                    v-for="color in palettes" 
                    :key="color"
                    @click="setPreset(color)"
                    class="w-8 h-8 rounded-full border border-border/10 shadow-sm hover:scale-110 active:scale-95 transition-transform ring-2 ring-transparent hover:ring-offset-2 hover:ring-pink-500/30"
                    :style="{ backgroundColor: color }"
                    :title="color"
                ></button>
            </div>

        </div>

        <!-- Right Column: Conversions -->
        <div class="lg:col-span-7 flex flex-col gap-4">
            <div class="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-border/50 bg-muted/20">
                     <h2 class="text-sm font-bold uppercase tracking-widest text-muted-foreground">Color Formats</h2>
                </div>
                
                <div class="divide-y divide-border/40">
                    <div v-for="fmt in formats" :key="fmt.id" class="p-4 md:p-6 flex items-center justify-between gap-4 group hover:bg-muted/10 transition-colors">
                        <div class="min-w-0 flex-1">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="text-[10px] font-black uppercase tracking-wider text-muted-foreground/70 bg-muted/50 px-1.5 py-0.5 rounded">{{ fmt.label }}</span>
                            </div>
                            <div class="font-mono text-sm md:text-base font-medium break-all text-foreground/90 group-hover:text-pink-600 transition-colors">
                                {{ fmt.value }}
                            </div>
                        </div>
                        
                        <button 
                            @click="copyToClipboard(fmt.value, fmt.id)"
                            class="p-2 rounded-lg text-muted-foreground hover:bg-pink-500/10 hover:text-pink-500 transition-all shrink-0 active:scale-95"
                            title="Copy"
                        >
                            <Check v-if="copiedFormat === fmt.id" :size="18" class="text-emerald-500" />
                            <Copy v-else :size="18" />
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Info Card -->
             <div class="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center justify-between">
                <div>
                    <h3 class="text-xs font-bold uppercase text-muted-foreground mb-1">Brightness</h3>
                    <p class="font-mono font-bold text-xl">{{ Math.round(brightness * 100) }}%</p>
                </div>
                 <div>
                    <h3 class="text-xs font-bold uppercase text-muted-foreground mb-1">Is Dark?</h3>
                    <p class="font-mono font-bold text-xl">{{ isDark ? 'Yes' : 'No' }}</p>
                </div>
            </div>

        </div>

    </div>
  </div>
</template>

<style scoped>
.h-screen-minus-header {
    height: calc(100vh - var(--header-height, 64px));
}
</style>
