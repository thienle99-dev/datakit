<script setup lang="ts">
import { ref, computed } from 'vue';
import { faker } from '@faker-js/faker';
import { 
  Plus, 
  Trash2, 
  Download, 
  Play, 
  ArrowLeft, 
  Database, 
  GripVertical,
  Settings2,
  Table as TableIcon,
  FileType,
  Cpu,
  User,
  MapPin,
  Briefcase,
  Globe,
  Hash,
  ToggleLeft,
  Image as ImageIcon,
  Type,
  ShoppingCart,
  Palette,
  Layers as LayersIcon,
  Search as SearchIcon
} from 'lucide-vue-next';
import DataTable from '../components/shared/DataTable.vue';
import Papa from 'papaparse';

interface Field {
  id: string;
  name: string;
  type: string;
  blankPct: number;
  options?: any;
}

const rowCount = ref(100);
const exportFormat = ref<'csv' | 'json' | 'sql'>('csv');
const activeSelector = ref<string | null>(null);
const typeQuery = ref('');

const fields = ref<Field[]>([
  { id: '1', name: 'id', type: 'ID', blankPct: 0 },
  { id: '2', name: 'first_name', type: 'First Name', blankPct: 0 },
  { id: '3', name: 'last_name', type: 'Last Name', blankPct: 0 },
  { id: '4', name: 'email', type: 'Email', blankPct: 5 },
  { id: '5', name: 'gender', type: 'Gender', blankPct: 0 },
  { id: '6', name: 'country', type: 'Country', blankPct: 0 },
]);

const dataCategories = [
  {
    name: 'Identity',
    icon: User,
    types: [
      { name: 'Full Name', icon: User },
      { name: 'First Name', icon: User },
      { name: 'Last Name', icon: User },
      { name: 'Gender', icon: User },
      { name: 'Job Title', icon: Briefcase },
      { name: 'Avatar URL', icon: ImageIcon },
    ]
  },
  {
    name: 'Internet & Tech',
    icon: Globe,
    types: [
      { name: 'Email', icon: Globe },
      { name: 'IP Address', icon: Cpu },
      { name: 'Boolean', icon: ToggleLeft },
      { name: 'ID', icon: Hash },
    ]
  },
  {
    name: 'Geography',
    icon: MapPin,
    types: [
      { name: 'Country', icon: Globe },
      { name: 'City', icon: MapPin },
      { name: 'Street Address', icon: MapPin },
      { name: 'Phone', icon: Globe },
    ]
  },
  {
    name: 'Business & Content',
    icon: ShoppingCart,
    types: [
      { name: 'Company', icon: Briefcase },
      { name: 'Product Name', icon: ShoppingCart },
      { name: 'Price', icon: ShoppingCart },
      { name: 'Description', icon: Type },
      { name: 'Color', icon: Palette },
      { name: 'Date', icon: TableIcon },
      { name: 'Number', icon: Hash },
      { name: 'Custom List', icon: LayersIcon },
    ]
  }
];

const filteredCategories = computed(() => {
  if (!typeQuery.value) return dataCategories;
  const q = typeQuery.value.toLowerCase();
  return dataCategories.map(c => ({
    ...c,
    types: c.types.filter(t => t.name.toLowerCase().includes(q))
  })).filter(c => c.types.length > 0);
});

const selectType = (fieldId: string, typeName: string) => {
  const field = fields.value.find(f => f.id === fieldId);
  if (field) field.type = typeName;
  activeSelector.value = null;
  typeQuery.value = '';
};

const generatedData = ref<any[]>([]);
const isGenerating = ref(false);

const addField = () => {
  fields.value.push({
    id: Math.random().toString(36).substr(2, 9),
    name: `field_${fields.value.length + 1}`,
    type: 'Full Name',
    blankPct: 0
  });
};

const removeField = (id: string) => {
  fields.value = fields.value.filter(f => f.id !== id);
};

const generateData = () => {
    isGenerating.value = true;
    setTimeout(() => {
        const result = [];
        for (let i = 0; i < rowCount.value; i++) {
            const row: any = {};
            fields.value.forEach(field => {
                if (field.blankPct > 0 && Math.random() < (field.blankPct / 100)) {
                  row[field.name] = null;
                } else {
                  row[field.name] = generateValue(field, i + 1);
                }
            });
            result.push(row);
        }
        generatedData.value = result;
        isGenerating.value = false;
    }, 500);
};

const generateValue = (field: Field, index: number) => {
    switch (field.type) {
        case 'ID': return index;
        case 'Full Name': return faker.person.fullName();
        case 'First Name': return faker.person.firstName();
        case 'Last Name': return faker.person.lastName();
        case 'Email': return faker.internet.email();
        case 'Gender': return faker.person.sex();
        case 'Country': return faker.location.country();
        case 'City': return faker.location.city();
        case 'Street Address': return faker.location.streetAddress();
        case 'Phone': return faker.phone.number();
        case 'Company': return faker.company.name();
        case 'Job Title': return faker.person.jobTitle();
        case 'Date': return faker.date.past().toISOString().split('T')[0];
        case 'Number': return faker.number.int({ min: 1, max: 1000 });
        case 'Boolean': return faker.datatype.boolean();
        case 'IP Address': return faker.internet.ip();
        case 'Avatar URL': return faker.image.avatar();
        case 'Description': return faker.lorem.sentence();
        case 'Product Name': return faker.commerce.productName();
        case 'Price': return faker.commerce.price();
        case 'Color': return faker.color.human();
        case 'Custom List': {
          const list = field.options?.list || 'Option 1, Option 2, Option 3';
          const items = list.split(',').map((s: string) => s.trim());
          return items[Math.floor(Math.random() * items.length)];
        }
        default: return '';
    }
};

const downloadData = () => {
    if (generatedData.value.length === 0) return;
    
    let content = '';
    let mimeType = '';
    let ext = '';

    if (exportFormat.value === 'csv') {
      content = Papa.unparse(generatedData.value);
      mimeType = 'text/csv;charset=utf-8;';
      ext = 'csv';
    } else if (exportFormat.value === 'json') {
      content = JSON.stringify(generatedData.value, null, 2);
      mimeType = 'application/json;charset=utf-8;';
      ext = 'json';
    } else if (exportFormat.value === 'sql') {
      const tableName = 'mock_data';
      content = generatedData.value.map(row => {
        const keys = Object.keys(row).join(', ');
        const values = Object.values(row).map(v => 
          v === null ? 'NULL' : (typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v)
        ).join(', ');
        return `INSERT INTO ${tableName} (${keys}) VALUES (${values});`;
      }).join('\n');
      mimeType = 'text/plain;charset=utf-8;';
      ext = 'sql';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `mock_data_${Date.now()}.${ext}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const headers = computed(() => fields.value.map(f => f.name));
</script>

<template>
  <div class="w-full h-[calc(100vh-6rem)] flex flex-col p-2 md:p-4">
    <!-- Header Section -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 shrink-0 relative z-20">
      <div class="flex items-center gap-4">
        <router-link to="/" class="p-2.5 bg-card border border-border/50 rounded-xl text-muted-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm group">
          <ArrowLeft :size="18" class="group-hover:-translate-x-0.5 transition-transform" />
        </router-link>
        
        <div class="h-10 w-px bg-border/30 hidden lg:block"></div>

        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center ring-1 ring-indigo-500/20">
            <Database :size="20" stroke-width="2.5" />
          </div>
          <div>
            <h2 class="text-xl md:text-2xl font-black tracking-tight text-foreground">
              Mock <span class="text-indigo-500">Generator</span>
            </h2>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-700">
        <div class="flex items-center gap-2 bg-card border border-border/50 rounded-xl px-4 py-2">
            <span class="text-[9px] font-black uppercase text-muted-foreground/40 tracking-widest">Rows</span>
            <input 
              v-model.number="rowCount" 
              type="number" 
              class="w-16 bg-transparent border-none text-sm font-black focus:ring-0 outline-none p-0"
              min="1"
              max="10000"
            />
        </div>

        <select v-model="exportFormat" class="bg-card border border-border/50 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:border-indigo-500/50">
          <option value="csv">CSV</option>
          <option value="json">JSON</option>
          <option value="sql">SQL</option>
        </select>

        <button 
          @click="generateData" 
          :disabled="isGenerating"
          class="flex items-center gap-2.5 px-6 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:shadow-lg transition-all active:scale-95 group"
        >
          <Play :size="16" :class="isGenerating ? 'animate-spin' : ''" />
          <span>{{ isGenerating ? 'Generating...' : 'Generate' }}</span>
        </button>

        <button 
          v-if="generatedData.length > 0"
          @click="downloadData" 
          class="flex items-center gap-2.5 px-6 py-3 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:shadow-lg transition-all active:scale-95 group"
        >
          <Download :size="16" />
          <span>Download</span>
        </button>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="flex-1 min-h-0 flex flex-col lg:flex-row gap-6 overflow-hidden">
      <!-- Config Sidebar -->
      <div class="w-full lg:w-[400px] flex flex-col gap-5 shrink-0 h-full">
        <div class="flex-1 bg-card border border-border/50 rounded-[2.5rem] p-7 shadow-2xl flex flex-col">
          <div class="flex items-center justify-between mb-6">
            <h3 class="font-black text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                <Settings2 :size="12" class="text-indigo-500" /> Schema Design
            </h3>
            <button @click="addField" class="group p-2 bg-indigo-500/10 text-indigo-500 rounded-xl hover:bg-indigo-500 hover:text-white transition-all active:scale-95">
              <Plus :size="16" stroke-width="3" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto space-y-3 pr-2 -mr-2 scrollbar-none pb-64">
            <div 
              v-for="field in fields" 
              :key="field.id"
              class="group flex flex-col p-4 bg-muted/20 border border-border/50 rounded-2xl hover:bg-muted/30 transition-all gap-3"
            >
              <div class="flex items-center gap-3">
                <div class="cursor-grab text-muted-foreground/20 group-hover:text-muted-foreground/40 transition-colors">
                   <GripVertical :size="16" />
                </div>

                <div class="flex-1 grid grid-cols-2 gap-3 min-w-0">
                  <div class="flex flex-col">
                    <span class="text-[8px] font-black text-muted-foreground/40 uppercase mb-1">Field Name</span>
                    <input 
                      v-model="field.name" 
                      type="text" 
                      class="bg-transparent border-none p-0 text-xs font-black uppercase focus:ring-0 outline-none truncate"
                    />
                  </div>
                  <div class="flex flex-col relative">
                    <span class="text-[8px] font-black text-muted-foreground/40 uppercase mb-1">Type</span>
                    <button 
                      @click="activeSelector = activeSelector === field.id ? null : field.id"
                      class="flex items-center justify-between bg-muted/30 border border-border/50 rounded-lg px-3 py-1.5 text-xs font-bold text-indigo-500 hover:border-indigo-500/50 transition-all outline-none"
                    >
                      <span class="truncate">{{ field.type }}</span>
                      <Settings2 :size="10" class="shrink-0 ml-2 opacity-40" />
                    </button>

                    <!-- Type Selector Popover -->
                    <Transition name="popover">
                      <div v-if="activeSelector === field.id" class="absolute top-[calc(100%+8px)] right-0 w-72 bg-card border border-border/80 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[400px]">
                        <div class="p-3 border-b border-border/50 bg-muted/20">
                           <div class="relative flex items-center">
                              <SearchIcon :size="14" class="absolute left-3 text-muted-foreground/40" />
                              <input 
                                v-model="typeQuery"
                                type="text"
                                placeholder="Search types..."
                                class="w-full bg-background/50 border border-border/50 rounded-lg pl-9 pr-3 py-2 text-[11px] font-bold outline-none focus:border-indigo-500/50"
                                autofocus
                              />
                           </div>
                        </div>
                        <div class="flex-1 overflow-y-auto p-2 space-y-4 scrollbar-none">
                           <div v-for="cat in filteredCategories" :key="cat.name" class="space-y-1.5">
                              <h4 class="px-2 text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">{{ cat.name }}</h4>
                              <div class="grid grid-cols-1 gap-1">
                                 <button 
                                   v-for="t in cat.types" 
                                   :key="t.name"
                                   @click="selectType(field.id, t.name)"
                                   class="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-indigo-500 hover:text-white transition-all text-left group/item"
                                 >
                                   <div class="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center group-hover/item:bg-white/20 transition-colors">
                                      <component :is="t.icon" :size="12" />
                                   </div>
                                   <span class="text-[11px] font-bold">{{ t.name }}</span>
                                 </button>
                              </div>
                           </div>
                           <div v-if="filteredCategories.length === 0" class="py-12 text-center opacity-30">
                              <SearchIcon :size="32" class="mx-auto mb-2" />
                              <p class="text-[10px] font-black uppercase">No types found</p>
                           </div>
                        </div>
                      </div>
                    </Transition>
                  </div>
                </div>

                <button @click="removeField(field.id)" class="p-2 text-muted-foreground/40 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 :size="14" />
                </button>
              </div>

              <!-- Options Area -->
              <div class="pt-3 border-t border-border/30 flex flex-wrap items-center gap-4">
                 <div class="flex items-center gap-2">
                    <span class="text-[8px] font-black text-muted-foreground/40 uppercase">Blank %</span>
                    <div class="flex items-center gap-2 bg-background/50 border border-border/50 rounded-lg px-2 py-0.5">
                       <input 
                        v-model.number="field.blankPct" 
                        type="number" 
                        min="0" max="100"
                        class="w-10 bg-transparent border-none text-[10px] font-black focus:ring-0 outline-none p-1 text-center"
                      />
                      <span class="text-[10px] font-black opacity-20">%</span>
                    </div>
                 </div>

                 <div v-if="field.type === 'Custom List'" class="w-full mt-1 animate-in slide-in-from-top-2 duration-300">
                    <textarea 
                      @input="e => field.options = { ...field.options, list: (e.target as HTMLTextAreaElement).value }"
                      class="w-full bg-background/50 border border-border/50 rounded-xl px-3 py-2 text-[10px] font-bold outline-none focus:border-indigo-500/50 h-20 resize-none shadow-inner"
                      placeholder="Enter values separated by commas..."
                    >{{ field.options?.list }}</textarea>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Preview Area -->
      <div class="flex-1 min-w-0 bg-card border border-border/50 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col p-1.5 relative">
        <div v-if="generatedData.length === 0" class="h-full flex flex-col items-center justify-center opacity-30 text-center animate-in fade-in duration-700">
            <div class="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-6 ring-1 ring-white/10">
                <FileType :size="32" />
            </div>
            <h4 class="font-black text-lg uppercase tracking-widest mb-2">No Data Generated</h4>
            <p class="text-xs font-bold max-w-xs leading-relaxed">Define your fields and hit Generate to see a preview of your mock data.</p>
        </div>
        <div v-else class="h-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            <div class="p-4 border-b border-border/50 flex items-center justify-between shrink-0 bg-muted/5">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center ring-1 ring-emerald-500/20">
                        <TableIcon :size="16" />
                    </div>
                    <span class="text-[10px] font-black uppercase tracking-widest">Live Preview (Top 50)</span>
                </div>
                <div class="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 flex items-center gap-2">
                   <div class="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                  Rendering {{ rowCount }} rows
                </div>
            </div>
            <div class="flex-1 overflow-hidden">
                <DataTable :headers="headers" :data="generatedData.slice(0, 50)" />
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}

.popover-enter-active,
.popover-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.popover-enter-from,
.popover-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}
</style>
