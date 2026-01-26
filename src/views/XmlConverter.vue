<script setup lang="ts">
import { ref } from 'vue';
import { 
  ArrowLeft, 
  ArrowRightLeft,
  FileCode,
  FileJson, 
  Copy, 
  AlertCircle,
  X 
} from 'lucide-vue-next';

const jsonInput = ref('{\n  "note": {\n    "to": "Tove",\n    "from": "Jani",\n    "heading": "Reminder",\n    "body": "Don\'t forget me this weekend!"\n  }\n}');
const xmlInput = ref('');
const error = ref<string | null>(null);
const copied = ref(false);

// --- JSON to XML ---
const toXml = (obj: any): string => {
  let xml = '';
  for (const prop in obj) {
    if (!obj.hasOwnProperty(prop)) continue;
    
    if (Array.isArray(obj[prop])) {
      for (const val of obj[prop]) {
        xml += `<${prop}>`;
        xml += typeof val === 'object' ? toXml(val) : val;
        xml += `</${prop}>`;
      }
    } else if (typeof obj[prop] === 'object') {
      xml += `<${prop}>`;
      xml += toXml(obj[prop]);
      xml += `</${prop}>`;
    } else {
      xml += `<${prop}>${obj[prop]}</${prop}>`;
    }
  }
  return xml;
};

const convertToXml = () => {
    try {
        if (!jsonInput.value.trim()) return;
        const obj = JSON.parse(jsonInput.value);
        // Basic wrapper if needed, or just convert
        let res = toXml(obj);
        // Prettify XML roughly
        res = formatXml(res);
        xmlInput.value = res;
        error.value = null;
    } catch (e: any) {
        error.value = "JSON Parse Error: " + e.message;
    }
};

const formatXml = (xml: string) => {
    let formatted = '';
    let pad = 0;
    xml.split(/>\s*</).forEach(node => {
        if (node.match(/^\/\w/)) pad -= 1;
        formatted += new Array(Math.max(0, pad) + 1).join('  ') + '<' + node + '>\n';
        if (node.match(/^<?\w[^>]*[^\/]$/) && !node.startsWith('?')) pad += 1;
    });
    return formatted.substring(1, formatted.length - 2); // cleanup hack
};


// --- XML to JSON ---
const xmlToJson = (xml: Node): any => {
    // Create the return object
    let obj: any = {};

    if (xml.nodeType === 1) { // element
        // do attributes
        if ((xml as Element).attributes.length > 0) {
            obj["@attributes"] = {};
            for (let j = 0; j < (xml as Element).attributes.length; j++) {
                const attribute = (xml as Element).attributes.item(j);
                if (attribute) obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType === 3) { // text
        obj = xml.nodeValue?.trim() || "";
    }

    // do children
    if (xml.hasChildNodes()) {
        for (let i = 0; i < xml.childNodes.length; i++) {
            const item = xml.childNodes.item(i);
            const nodeName = item.nodeName;
            
            if (nodeName === "#text") {
                const txt = item.nodeValue?.trim();
                if (txt) {
                    // If element has text only, simplify
                    if (Object.keys(obj).length === 0) return txt;
                    else obj["#text"] = txt;
                }
                continue;
            }

            if (typeof (obj[nodeName]) === "undefined") {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (typeof (obj[nodeName].push) === "undefined") {
                    const old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }
    return obj;
};

const convertToJson = () => {
    try {
        if (!xmlInput.value.trim()) return;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlInput.value, "text/xml");
        
        // Check for parse errors
        const parseError = xmlDoc.getElementsByTagName("parsererror");
        if (parseError.length > 0) {
            const firstError = parseError[0]; 
            // Although length > 0, TS HTMLCollection access can be undefined if index out of bounds (unlikely here but strict)
            const errorText = firstError?.textContent ?? "Invalid XML";
            throw new Error(errorText);
        }

        if (!xmlDoc.documentElement) {
            throw new Error("No root element found");
        }

        const json = xmlToJson(xmlDoc.documentElement);
        // Wrap with root element name
        const rootName = xmlDoc.documentElement.nodeName;
        const finalObj = { [rootName]: json };
        
        jsonInput.value = JSON.stringify(finalObj, null, 2);
        error.value = null;
    } catch (e: any) {
         error.value = "XML Parse Error: " + e.message;
    }
};

const copyJson = () => {
    navigator.clipboard.writeText(jsonInput.value).then(() => {
        copied.value = true;
        setTimeout(() => copied.value = false, 2000);
    });
};

const copyXml = () => {
    navigator.clipboard.writeText(xmlInput.value).then(() => {
        copied.value = true;
        setTimeout(() => copied.value = false, 2000);
    });
};

</script>

<template>
  <div class="w-full h-[calc(100vh-6rem)] flex flex-col p-2 md:p-4">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3 shrink-0 relative z-20">
      <div class="flex items-center gap-4">
        <router-link to="/" class="p-2.5 bg-card border border-border/50 rounded-xl text-muted-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm group">
          <ArrowLeft :size="18" class="group-hover:-translate-x-0.5 transition-transform" />
        </router-link>
        
        <div class="h-10 w-px bg-border/30 hidden lg:block"></div>

        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-cyan-500/10 text-cyan-500 rounded-xl flex items-center justify-center ring-1 ring-cyan-500/20">
            <ArrowRightLeft :size="20" stroke-width="2.5" />
          </div>
          <div>
            <h2 class="text-lg md:text-xl font-black tracking-tight text-foreground">
              JSON <span class="text-muted-foreground/40 mx-1">↔</span> <span class="text-cyan-500">XML</span>
            </h2>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 relative">
        
        <!-- JSON Edit -->
        <div class="flex-1 flex flex-col min-h-0 bg-card border border-border rounded-xl overflow-hidden shadow-lg group focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <div class="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
                <span class="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <FileJson :size="12" /> JSON
                </span>
                <div class="flex items-center gap-2">
                     <button @click="convertToXml" class="flex items-center gap-2 px-3 py-1.5 bg-cyan-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-cyan-600 transition-colors">
                        To XML <ArrowRightLeft :size="10" />
                     </button>
                     <button @click="copyJson" class="p-1.5 hover:bg-muted rounded ml-1"><Copy :size="14" /></button>
                </div>
            </div>
            <div class="flex-1 relative">
                <textarea 
                    v-model="jsonInput"
                    class="absolute inset-0 w-full h-full bg-transparent p-4 font-mono text-xs leading-relaxed outline-none resize-none"
                    placeholder="{ ... }"
                    spellcheck="false"
                ></textarea>
            </div>
        </div>

        <!-- XML Edit -->
        <div class="flex-1 flex flex-col min-h-0 bg-card border border-border rounded-xl overflow-hidden shadow-lg group focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <div class="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
                <span class="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <FileCode :size="12" /> XML
                </span>
                <div class="flex items-center gap-2">
                     <button @click="convertToJson" class="flex items-center gap-2 px-3 py-1.5 bg-cyan-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-cyan-600 transition-colors">
                        To JSON <ArrowRightLeft :size="10" />
                     </button>
                     <button @click="copyXml" class="p-1.5 hover:bg-muted rounded ml-1"><Copy :size="14" /></button>
                </div>
            </div>
            <div class="flex-1 relative">
                <textarea 
                    v-model="xmlInput"
                    class="absolute inset-0 w-full h-full bg-transparent p-4 font-mono text-xs leading-relaxed outline-none resize-none"
                    placeholder="<root>...</root>"
                    spellcheck="false"
                ></textarea>
            </div>
        </div>

        <!-- Error Overlay -->
        <div v-if="error" class="absolute inset-x-4 bottom-4 z-50 bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl backdrop-blur-md flex items-start gap-3 animate-in slide-in-from-bottom-2 duration-300">
            <AlertCircle :size="18" class="shrink-0 mt-0.5" />
            <div>
                <p class="text-[11px] font-black uppercase tracking-widest mb-1">Conversion Error</p>
                <p class="text-xs font-mono">{{ error }}</p>
            </div>
            <button @click="error = null" class="ml-auto"><X :size="14" /></button>
        </div>

    </div>
  </div>
</template>
