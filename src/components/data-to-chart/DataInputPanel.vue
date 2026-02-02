<script setup lang="ts">
// import { ref } from 'vue';
import { Upload, Clipboard, Table } from 'lucide-vue-next';

defineProps<{
  inputMethod: 'upload' | 'paste' | 'manual';
  rawData: string;
}>();

const emit = defineEmits(['update:rawData', 'file-select', 'parse']);

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    emit('file-select', file);
  }
};

const updateRawData = (value: string) => {
  emit('update:rawData', value);
};

const setTemplate = (template: string) => {
  emit('update:rawData', template);
  // Optional: auto parse? Parent logic did not auto parse on click, just set data.
  // But parent code had: @click="rawDataString = '...'; handlePaste()"
  // So it DID auto parse.
  emit('parse');
};
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Upload View -->
    <div v-if="inputMethod === 'upload'" class="bg-card border border-border rounded-2xl p-6 shadow-xl relative overflow-hidden group">
      <div class="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
      <div class="relative z-10 flex flex-col items-center text-center py-4">
        <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 ring-4 ring-primary/5 group-hover:scale-110 transition-transform duration-500">
          <Upload :size="24" class="text-primary" />
        </div>
        <h3 class="text-sm font-black uppercase tracking-widest mb-2">Drop your file</h3>
        <p class="text-[11px] font-medium text-muted-foreground mb-4">CSV, Excel, or JSON are welcome</p>
        <label class="px-6 py-2.5 bg-background border border-border rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:border-primary/50 transition-all shadow-sm">
          Choose File
          <input type="file" @change="onFileChange" class="hidden" accept=".csv,.xlsx,.xls,.json" />
        </label>
      </div>
    </div>

    <!-- Paste View -->
    <div v-if="inputMethod === 'paste'" class="flex flex-col bg-card border border-border rounded-2xl p-5 shadow-xl overflow-hidden min-h-[300px]">
      <div class="flex items-center justify-between mb-4 px-2">
        <h3 class="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Clipboard :size="12" /> Paste Data
        </h3>
        <button @click="emit('parse')" class="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Parse Now</button>
      </div>
      <textarea 
        :value="rawData"
        @input="updateRawData(($event.target as HTMLTextAreaElement).value)"
        placeholder="Paste columns from Excel or stringified JSON here..."
        class="flex-1 w-full bg-background/50 border border-border rounded-xl p-4 text-[11px] font-bold outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all resize-none custom-scrollbar"
      ></textarea>
    </div>

    <!-- Manual/Template View -->
    <div v-if="inputMethod === 'manual'" class="flex flex-col bg-card border border-border rounded-2xl p-5 shadow-xl overflow-hidden min-h-[300px]">
      <div class="flex items-center justify-between mb-4 px-2">
        <h3 class="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Table :size="12" /> Templates
        </h3>
        <!-- Templates Buttons -->
        <div class="flex gap-2 flex-wrap justify-end">
           <button @click="setTemplate('Category,Value\nA,40\nB,20\nC,60\nD,30')" class="px-3 py-1 bg-muted rounded-lg text-[9px] font-black uppercase hover:bg-primary/20 hover:text-primary transition-colors">Bar</button>
           <button @click="setTemplate('Date,Value\n2024-01-01,100\n2024-01-02,150\n2024-01-03,130\n2024-01-04,180')" class="px-3 py-1 bg-muted rounded-lg text-[9px] font-black uppercase hover:bg-primary/20 hover:text-primary transition-colors">Line</button>
           <button @click="setTemplate('Segment,Share\nDirect,40\nSocial,30\nReferral,20\nEmail,10')" class="px-3 py-1 bg-muted rounded-lg text-[9px] font-black uppercase hover:bg-primary/20 hover:text-primary transition-colors">Pie</button>
           <button @click="setTemplate('Height,Weight\n160,50\n170,60\n180,75\n165,55\n175,70')" class="px-3 py-1 bg-muted rounded-lg text-[9px] font-black uppercase hover:bg-primary/20 hover:text-primary transition-colors">Scatter</button>
           <button @click="setTemplate('Attribute,Score\nSpeed,90\nPower,80\nAgility,85\nTechnique,95\nStamina,70')" class="px-3 py-1 bg-muted rounded-lg text-[9px] font-black uppercase hover:bg-primary/20 hover:text-primary transition-colors">Radar</button>
        </div>
      </div>
      
      <textarea 
        :value="rawData"
        @input="updateRawData(($event.target as HTMLTextAreaElement).value)"
        placeholder="Select a template or type your data..."
        class="flex-1 w-full bg-background/50 border border-border rounded-xl p-4 text-[11px] font-bold outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all resize-none custom-scrollbar font-mono leading-relaxed"
      ></textarea>
      
      <div class="mt-4 flex justify-end">
           <button @click="emit('parse')" class="px-6 py-2 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Visualize</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: theme('colors.border');
  border-radius: 4px;
}
</style>
