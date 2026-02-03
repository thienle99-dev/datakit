<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import cronstrue from 'cronstrue';
import { CronExpressionParser } from 'cron-parser';

const parseExpression = CronExpressionParser.parse;
import { 
  ArrowLeft, 
  Clock, 
  Check, 
  Copy, 
  AlertCircle,
  Play,
  Settings2,
  RefreshCw,
  Globe,
  List
} from 'lucide-vue-next';

// --- Constants ---
const PRESETS = [
    { label: 'Every Minute', value: '* * * * *' },
    { label: 'Every 5 Minutes', value: '*/5 * * * *' },
    { label: 'Every 15 Minutes', value: '*/15 * * * *' },
    { label: 'Every Hour', value: '0 * * * *' },
    { label: 'Every 2 Hours', value: '0 */2 * * *' },
    { label: 'Every Day (Midnight)', value: '0 0 * * *' },
    { label: 'Every Week (Sunday)', value: '0 0 * * 0' },
    { label: 'Every Month (1st)', value: '0 0 1 * *' },
];

// --- State ---
const cronExpression = ref('* * * * *');
const nextRunsCount = ref(5);
const copied = ref(false);
const useUTC = ref(false);

// Builder State
const builderMode = ref<'simple' | 'advanced'>('simple');
const simpleFrequency = ref('every_minute'); // every_minute, every_x_minute, hourly, every_x_hour, daily, weekly, monthly, yearly
const simpleInterval = ref(5);
const simpleTime = ref('00:00');
const simpleWeekdays = ref<string[]>(['1']); // 1=Mon
const simpleDayOfMonth = ref(1);

// Advanced State (5 fields)
const advMinute = ref('*');
const advHour = ref('*');
const advDom = ref('*');
const advMonth = ref('*');
const advDow = ref('*');

// --- Computed ---

const description = computed(() => {
  if (!cronExpression.value.trim()) return '';
  try {
    return cronstrue.toString(cronExpression.value.trim());
  } catch (e) {
    return 'Invalid cron expression';
  }
});

const nextRuns = computed(() => {
    if (!cronExpression.value.trim()) return [];
    try {
        const options: any = {
            iterator: true
        };
        if (useUTC.value) {
            options.tz = 'UTC';
        }
        
        const interval = parseExpression(cronExpression.value.trim(), options);
        // interval is an iterator now because iterator:true might be needed or next() returns an object with value, done
        // Actually parseExpression returns standard object with next(). 
        // Let's stick to standard usage: parseExpression(expr, options) -> interval.
        // options for timezone is direct property 'tz'
        
        const dates = [];
        for (let i = 0; i < nextRunsCount.value; i++) {
             // interval.next() returns a CronDate
            dates.push(interval.next().toDate());
        }
        return dates;
    } catch (e) {
        return [];
    }
});

const cronParts = computed(() => {
    const parts = cronExpression.value.trim().split(/\s+/);
    // Standard cron has 5 parts: min, hour, dom, month, dow
    // Some have 6 (+seconds). 
    return parts.map((val, idx) => {
        let label = 'Unknown';
        if (parts.length === 5) {
             const labels = ['Minute', 'Hour', 'Day (Month)', 'Month', 'Weekday'];
             label = labels[idx] || '';
        } else if (parts.length === 6) {
             const labels = ['Second', 'Minute', 'Hour', 'Day (Month)', 'Month', 'Weekday'];
             label = labels[idx] || '';
        }
        return { value: val, label };
    });
});

const isError = computed(() => {
    return description.value === 'Invalid cron expression';
});

// --- Actions ---

const generateCronFromSimple = () => {
    const [hh, mm] = simpleTime.value.split(':');
    
    switch (simpleFrequency.value) {
        case 'every_minute':
            updateCron('* * * * *');
            break;
        case 'every_x_minute':
            updateCron(`*/${simpleInterval.value} * * * *`);
            break;
        case 'hourly':
            updateCron(`${mm} * * * *`);
            break;
        case 'every_x_hour':
            updateCron(`${mm} */${simpleInterval.value} * * *`);
            break;
        case 'daily':
            updateCron(`${mm} ${hh} * * *`);
            break;
        case 'weekly':
            // cron weekdays: 0-6 (Sun-Sat) or 1-7 (Mon-Sun).
            const days = simpleWeekdays.value.join(',');
            updateCron(`${mm} ${hh} * * ${days || '*'}`);
            break;
        case 'monthly':
            updateCron(`${mm} ${hh} ${simpleDayOfMonth.value} * *`);
            break;
        case 'yearly':
            updateCron(`${mm} ${hh} ${simpleDayOfMonth.value} 1 *`);
            break;
    }
};

const applyPreset = (presetValue: string) => {
    updateCron(presetValue);
};

const generateCronFromAdvanced = () => {
    updateCron(`${advMinute.value} ${advHour.value} ${advDom.value} ${advMonth.value} ${advDow.value}`);
};

const updateCron = (val: string) => {
    cronExpression.value = val;
    // Also sync advanced fields to this value for consistency
    const parts = val.split(' ');
    
    advMinute.value = parts[0] || '*';
    advHour.value = parts[1] || '*';
    advDom.value = parts[2] || '*';
    advMonth.value = parts[3] || '*';
    advDow.value = parts[4] || '*';
};

const copyCron = () => {
    navigator.clipboard.writeText(cronExpression.value);
    copied.value = true;
    setTimeout(() => copied.value = false, 2000);
};

// --- Watchers ---
watch([simpleFrequency, simpleTime, simpleWeekdays, simpleDayOfMonth, simpleInterval], () => {
    if (builderMode.value === 'simple') {
        generateCronFromSimple();
    }
});

watch([advMinute, advHour, advDom, advMonth, advDow], () => {
    if (builderMode.value === 'advanced') {
        generateCronFromAdvanced();
    }
});

// Format Helper
const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: useUTC.value ? 'UTC' : undefined,
        timeZoneName: 'short'
    }).format(date);
};

</script>

<template>
  <div class="w-full h-screen-minus-header flex flex-col p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
    
    <!-- Header -->
    <div class="flex items-center gap-4 mb-8">
        <router-link to="/" class="p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors">
          <ArrowLeft :size="20" />
        </router-link>
        
        <div class="flex items-center gap-3">
          <div class="bg-indigo-500/10 text-indigo-500 p-2 rounded-lg">
            <Clock :size="24" />
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight">Cron Parser & Builder</h1>
            <p class="text-sm text-muted-foreground">Decode cron schedules or create your own</p>
          </div>
        </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-8 min-h-0 flex-1">
        
        <!-- Left Column: Input & Results -->
        <div class="flex-1 flex flex-col gap-6">
            
            <!-- Main Input Data -->
            <div class="bg-card border border-border rounded-xl shadow-sm p-6 flex flex-col items-center justify-center gap-6 relative overflow-visible">
                <!-- Presets (Absolutely positioned top-right) -->
                <div class="absolute top-4 right-4 z-10 group">
                    <button class="p-2 text-muted-foreground hover:text-indigo-500 bg-muted/30 hover:bg-muted rounded-lg transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                         <List :size="16" /> <span class="hidden sm:inline">Presets</span>
                    </button>
                    <!-- Dropdown Menu -->
                     <div class="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-xl shadow-lg shadow-black/10 overflow-hidden hidden group-hover:block animate-in fade-in zoom-in-95 duration-200 z-50">
                        <div class="py-1">
                            <button 
                                v-for="preset in PRESETS" 
                                :key="preset.value"
                                @click="applyPreset(preset.value)"
                                class="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors flex flex-col gap-0.5"
                            >
                                <span class="font-medium">{{ preset.label }}</span>
                                <span class="text-[10px] font-mono text-muted-foreground">{{ preset.value }}</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="w-full relative mt-4">
                    <label class="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 block text-center">Cron Expression</label>
                    <div class="relative flex items-center">
                        <input 
                            v-model="cronExpression"
                            type="text" 
                            class="w-full bg-muted/30 border border-border rounded-xl px-4 py-4 text-center font-mono text-xl md:text-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-muted-foreground/30"
                            :class="{ 'border-rose-500/50 text-rose-500': isError }"
                            placeholder="* * * * *"
                        />
                        <button 
                            @click="copyCron"
                            class="absolute right-3 p-2 text-muted-foreground hover:text-indigo-500 bg-background/50 hover:bg-background rounded-lg transition-colors border border-transparent hover:border-border/50"
                        >
                            <Check v-if="copied" :size="18" class="text-emerald-500" />
                            <Copy v-else :size="18" />
                        </button>
                    </div>
                </div>

                    <!-- Visual Explainer -->
                    <div class="w-full flex flex-wrap justify-center gap-2 mt-2 mb-2">
                        <div 
                            v-for="(part, idx) in cronParts" 
                            :key="idx"
                            class="flex flex-col items-center gap-1 min-w-[60px]"
                        >
                             <div class="h-10 w-full min-w-[50px] px-3 bg-muted/50 border border-border/50 rounded-lg flex items-center justify-center font-mono font-bold text-foreground text-sm shadow-sm transition-all hover:border-indigo-500/50 hover:bg-muted">
                                {{ part.value }}
                             </div>
                             <span class="text-[10px] uppercase font-bold text-muted-foreground tracking-tight">{{ part.label }}</span>
                        </div>
                    </div>

                <!-- Human Readable -->
                <div class="text-center min-h-[1.5em]">
                    <span 
                        v-if="!isError"
                        class="text-indigo-600 dark:text-indigo-400 font-medium text-lg animate-in fade-in"
                    >
                        “{{ description }}”
                    </span>
                    <span 
                        v-else 
                        class="text-rose-500 flex items-center gap-2 font-medium"
                    >
                        <AlertCircle :size="18" /> Invalid Cron Expression
                    </span>
                </div>
            </div>

            <!-- Next Runs -->
            <div class="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex-1 min-h-[200px]">
                <div class="px-5 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
                    <span class="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Play :size="14" /> Next Executions
                    </span>
                    <div class="flex items-center gap-4">
                        <!-- UTC Toggle -->
                         <button 
                            @click="useUTC = !useUTC"
                            class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-background border border-border/50 shadow-sm transition-all"
                            :class="useUTC ? 'text-indigo-500 border-indigo-500/30' : 'text-muted-foreground'"
                         >
                            <Globe :size="12" />
                            {{ useUTC ? 'UTC' : 'Local' }}
                         </button>

                        <select v-model="nextRunsCount" class="text-xs bg-transparent border-none outline-none text-muted-foreground font-bold hover:text-foreground cursor-pointer">
                            <option :value="5">Next 5</option>
                            <option :value="10">Next 10</option>
                            <option :value="20">Next 20</option>
                        </select>
                    </div>
                </div>
                <div class="divide-y divide-border/40">
                    <div 
                        v-for="(date, i) in nextRuns" 
                        :key="i"
                        class="px-5 py-3 flex items-center justify-between group hover:bg-muted/30 transition-colors"
                    >
                        <span class="font-mono text-sm text-foreground">{{ formatDate(date) }}</span>
                        <span class="text-xs text-muted-foreground opacity-50 group-hover:opacity-100">
                             Run #{{ i + 1 }}
                        </span>
                    </div>
                    <div v-if="nextRuns.length === 0 && !isError" class="p-8 text-center text-muted-foreground opacity-50">
                        No future runs scheduled (or date is in past)
                    </div>
                </div>
            </div>

        </div>

        <!-- Right Column: Builder -->
        <div class="flex-1 flex flex-col bg-card border border-border rounded-xl shadow-sm overflow-hidden h-fit">
            <div class="border-b border-border bg-muted/20 px-1 py-1 flex p-1">
                <button 
                  @click="builderMode = 'simple'"
                  class="flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all"
                  :class="builderMode === 'simple' ? 'bg-background shadow-sm text-indigo-500' : 'text-muted-foreground hover:text-foreground'"
                >
                  Quick Builder
                </button>
                <button 
                  @click="builderMode = 'advanced'"
                  class="flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all"
                  :class="builderMode === 'advanced' ? 'bg-background shadow-sm text-indigo-500' : 'text-muted-foreground hover:text-foreground'"
                >
                  Advanced
                </button>
            </div>

            <!-- Simple Builder Mode -->
            <div v-if="builderMode === 'simple'" class="p-6 flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                
                <div class="space-y-2">
                    <label class="text-xs font-bold text-muted-foreground uppercase">Frequency</label>
                     <select v-model="simpleFrequency" class="w-full bg-muted/30 border border-border/50 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500">
                        <option value="every_minute">Every Minute (* * * * *)</option>
                        <option value="every_x_minute">Every X Minutes (*/x * * * *)</option>
                        <option value="hourly">Hourly (Minute 0)</option>
                        <option value="every_x_hour">Every X Hours (0 */x * * *)</option>
                        <option value="daily">Daily (At specific time)</option>
                        <option value="weekly">Weekly (Specific day & time)</option>
                        <option value="monthly">Monthly (Specific date & time)</option>
                        <option value="yearly">Yearly (Specific date & time)</option>
                    </select>
                </div>

                <!-- Interval Input -->
                <div v-if="['every_x_minute', 'every_x_hour'].includes(simpleFrequency)" class="space-y-2 animate-in fade-in slide-in-from-top-2">
                     <label class="text-xs font-bold text-muted-foreground uppercase">
                        {{ simpleFrequency === 'every_x_minute' ? 'Minute Interval' : 'Hour Interval' }}
                     </label>
                     <input type="number" min="1" :max="simpleFrequency === 'every_x_minute' ? 59 : 23" v-model="simpleInterval" class="w-full bg-muted/30 border border-border/50 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" />
                </div>

                <!-- Time Picker (for Daily/Weekly/Monthly/Yearly) -->
                <div v-if="simpleFrequency !== 'every_minute'" class="space-y-2">
                    <label class="text-xs font-bold text-muted-foreground uppercase">At Time</label>
                    <input type="time" v-model="simpleTime" class="w-full bg-muted/30 border border-border/50 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" />
                </div>

                <!-- Weekday Picker -->
                <div v-if="simpleFrequency === 'weekly'" class="space-y-2">
                    <label class="text-xs font-bold text-muted-foreground uppercase">On Days</label>
                    <div class="flex flex-wrap gap-2">
                        <label v-for="(day, val) in { 'Mon': '1', 'Tue': '2', 'Wed': '3', 'Thu': '4', 'Fri': '5', 'Sat': '6', 'Sun': '0' }" :key="val" class="cursor-pointer">
                            <input type="checkbox" :value="val" v-model="simpleWeekdays" class="hidden peer" />
                            <div class="px-3 py-1.5 rounded-md border border-border/50 text-xs font-medium peer-checked:bg-indigo-500 peer-checked:text-white peer-checked:border-indigo-500 hover:border-indigo-500/50 transition-all">
                                {{ day }}
                            </div>
                        </label>
                    </div>
                </div>

                <!-- Day of Month -->
                <div v-if="simpleFrequency === 'monthly' || simpleFrequency === 'yearly'" class="space-y-2">
                     <label class="text-xs font-bold text-muted-foreground uppercase">Day of Month</label>
                     <input type="number" min="1" max="31" v-model="simpleDayOfMonth" class="w-full bg-muted/30 border border-border/50 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" />
                </div>

            </div>

            <!-- Advanced Builder Mode -->
            <div v-if="builderMode === 'advanced'" class="p-6 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div class="col-span-2 p-3 bg-muted/20 rounded-lg text-xs text-muted-foreground mb-2 flex items-start gap-2">
                    <Settings2 :size="14" class="mt-0.5 shrink-0" />
                    Manually configure each crontab field. Supports ranges (1-5), steps (&#42;/5), and lists (1,2,3).
                </div>

                <div class="space-y-1">
                    <label class="text-xs font-bold text-muted-foreground uppercase">Minute</label>
                    <input type="text" v-model="advMinute" class="w-full bg-muted/30 border border-border/50 rounded-lg px-3 py-2 font-mono text-sm outline-none focus:border-indigo-500" />
                    <div class="text-[10px] text-muted-foreground">0-59</div>
                </div>

                <div class="space-y-1">
                    <label class="text-xs font-bold text-muted-foreground uppercase">Hour</label>
                    <input type="text" v-model="advHour" class="w-full bg-muted/30 border border-border/50 rounded-lg px-3 py-2 font-mono text-sm outline-none focus:border-indigo-500" />
                    <div class="text-[10px] text-muted-foreground">0-23</div>
                </div>

                <div class="space-y-1">
                    <label class="text-xs font-bold text-muted-foreground uppercase">Day of Month</label>
                    <input type="text" v-model="advDom" class="w-full bg-muted/30 border border-border/50 rounded-lg px-3 py-2 font-mono text-sm outline-none focus:border-indigo-500" />
                    <div class="text-[10px] text-muted-foreground">1-31</div>
                </div>

                <div class="space-y-1">
                    <label class="text-xs font-bold text-muted-foreground uppercase">Month</label>
                    <input type="text" v-model="advMonth" class="w-full bg-muted/30 border border-border/50 rounded-lg px-3 py-2 font-mono text-sm outline-none focus:border-indigo-500" />
                    <div class="text-[10px] text-muted-foreground">1-12 or JAN-DEC</div>
                </div>

                <div class="col-span-2 space-y-1">
                    <label class="text-xs font-bold text-muted-foreground uppercase">Weekday</label>
                    <input type="text" v-model="advDow" class="w-full bg-muted/30 border border-border/50 rounded-lg px-3 py-2 font-mono text-sm outline-none focus:border-indigo-500" />
                    <div class="text-[10px] text-muted-foreground">0-6 (Sun-Sat) or MON-SUN</div>
                </div>
                
                 <div class="col-span-2 mt-2">
                    <button @click="generateCronFromAdvanced" class="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-bold shadow transition-colors flex items-center justify-center gap-2">
                        <RefreshCw :size="14" /> Update Expression
                    </button>
                    <p class="text-[10px] text-center mt-2 text-muted-foreground">Click to apply changes to the main input</p>
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
