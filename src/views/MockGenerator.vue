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
  FileType
} from 'lucide-vue-next';
import DataTable from '../components/shared/DataTable.vue';
import Papa from 'papaparse';

interface Field {
  id: string;
  name: string;
  type: string;
}

const rowCount = ref(100);
const fields = ref<Field[]>([
  { id: '1', name: 'id', type: 'ID' },
  { id: '2', name: 'first_name', type: 'First Name' },
  { id: '3', name: 'last_name', type: 'Last Name' },
  { id: '4', name: 'email', type: 'Email' },
  { id: '5', name: 'gender', type: 'Gender' },
  { id: '6', name: 'ip_address', type: 'IP Address' },
]);

const dataTypes = [
  'ID', 'Full Name', 'First Name', 'Last Name', 'Email', 'Gender', 
  'Country', 'City', 'Street Address', 'Phone', 'Company', 
  'Job Title', 'Date', 'Number', 'Boolean', 'IP Address', 'Avatar URL',
  'Description', 'Product Name', 'Price', 'Color'
];

const generatedData = ref<any[]>([]);
const isGenerating = ref(false);

const addField = () => {
  fields.value.push({
    id: Math.random().toString(36).substr(2, 9),
    name: `field_${fields.value.length + 1}`,
    type: 'Full Name'
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
                row[field.name] = generateValue(field.type, i + 1);
            });
            result.push(row);
        }
        generatedData.value = result;
        isGenerating.value = false;
    }, 500);
};

const generateValue = (type: string, index: number) => {
    switch (type) {
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
        default: return '';
    }
};

const downloadCSV = () => {
    if (generatedData.value.length === 0) return;
    const csv = Papa.unparse(generatedData.value);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `mock_data_${Date.now()}.csv`);
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
              class="w-20 bg-transparent border-none text-sm font-black focus:ring-0 outline-none p-0"
              min="1"
              max="10000"
            />
        </div>

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
          @click="downloadCSV" 
          class="flex items-center gap-2.5 px-6 py-3 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:shadow-lg transition-all active:scale-95 group"
        >
          <Download :size="16" />
          <span>Download CSV</span>
        </button>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="flex-1 min-h-0 flex flex-col lg:flex-row gap-6 overflow-hidden">
      <!-- Config Sidebar -->
      <div class="w-full lg:w-96 flex flex-col gap-5 shrink-0 h-full overflow-hidden">
        <div class="flex-1 bg-card border border-border/50 rounded-[2.5rem] p-7 shadow-2xl flex flex-col overflow-hidden">
          <div class="flex items-center justify-between mb-6">
            <h3 class="font-black text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                <Settings2 :size="12" class="text-indigo-500" /> Schema Design
            </h3>
            <button @click="addField" class="group p-2 bg-indigo-500/10 text-indigo-500 rounded-xl hover:bg-indigo-500 hover:text-white transition-all active:scale-95">
              <Plus :size="16" stroke-width="3" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto space-y-3 pr-2 -mr-2 scrollbar-none">
            <div 
              v-for="field in fields" 
              :key="field.id"
              class="group flex items-center gap-3 p-4 bg-muted/20 border border-border/50 rounded-2xl hover:bg-muted/30 transition-all"
            >
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
                <div class="flex flex-col">
                  <span class="text-[8px] font-black text-muted-foreground/40 uppercase mb-1">Type</span>
                  <select v-model="field.type" class="bg-transparent border-none p-0 text-xs font-bold text-indigo-500 focus:ring-0 outline-none cursor-pointer">
                    <option v-for="type in dataTypes" :key="type" :value="type">{{ type }}</option>
                  </select>
                </div>
              </div>

              <button @click="removeField(field.id)" class="p-2 text-muted-foreground/40 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 :size="14" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Preview Area -->
      <div class="flex-1 min-w-0 bg-card border border-border/50 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col p-1.5 relative">
        <div v-if="generatedData.length === 0" class="h-full flex flex-col items-center justify-center opacity-30 text-center">
            <div class="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-6">
                <FileType :size="32" />
            </div>
            <h4 class="font-black text-lg uppercase tracking-widest mb-2">No Data Generated</h4>
            <p class="text-xs font-bold max-w-xs leading-relaxed">Define your fields and hit Generate to see a preview of your mock data.</p>
        </div>
        <div v-else class="h-full flex flex-col overflow-hidden">
            <div class="p-4 border-b border-border/50 flex items-center justify-between shrink-0">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center">
                        <TableIcon :size="16" />
                    </div>
                    <span class="text-[10px] font-black uppercase tracking-widest">Live Preview (Top {{ Math.min(generatedData.length, 50) }})</span>
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
</style>
