import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('../views/ToolsView.vue'),
        },
        {
            path: '/universal-converter',
            name: 'universal-converter',
            component: () => import('../views/UniversalConverter.vue'),
        },
        {
            path: '/csv-viewer',
            name: 'csv-viewer',
            component: () => import('../views/CsvViewer.vue'),
        },
        {
            path: '/csv-cleaner',
            name: 'csv-cleaner',
            component: () => import('../views/CsvCleaner.vue'),
        },
        {
            path: '/column-selector',
            name: 'column-selector',
            component: () => import('../views/ColumnSelector.vue'),
        },
        {
            path: '/filter-sort',
            name: 'filter-sort',
            component: () => import('../views/FilterSort.vue'),
        },
        {
            path: '/merge-data',
            name: 'merge-data',
            component: () => import('../views/MergeTool.vue'),
        },
        {
            path: '/split-data',
            name: 'split-data',
            component: () => import('../views/SplitTool.vue'),
        },
        {
            path: '/data-stats',
            name: 'data-stats',
            component: () => import('../views/StatsTool.vue'),
        },
        {
            path: '/compare-data',
            name: 'compare-data',
            component: () => import('../views/CompareTool.vue'),
        },
        {
            path: '/transpose-data',
            name: 'transpose-data',
            component: () => import('../views/TransposeTool.vue'),
        },
        {
            path: '/validate-data',
            name: 'validate-data',
            component: () => import('../views/ValidateTool.vue'),
        },
        {
            path: '/reshape-data',
            name: 'reshape-data',
            component: () => import('../views/PivotTool.vue'),
        },
        {
            path: '/summarize-data',
            name: 'summarize-data',
            component: () => import('../views/AggregateTool.vue'),
        },
        {
            path: '/find-replace',
            name: 'find-replace',
            component: () => import('../views/FindReplace.vue'),
        },
        {
            path: '/mock-generator',
            name: 'mock-generator',
            component: () => import('../views/MockGenerator.vue'),
        },
        {
            path: '/skip-rows',
            name: 'skip-rows',
            component: () => import('../views/SkipRowsTool.vue'),
        },
        {
            path: '/random-sample',
            name: 'random-sample',
            component: () => import('../views/SampleTool.vue'),
        },
        {
            path: '/mask-data',
            name: 'mask-data',
            component: () => import('../views/MaskDataTool.vue'),
        },
        {
            path: '/data-to-chart',
            name: 'data-to-chart',
            component: () => import('../views/DataToChart.vue'),
        },
        {
            path: '/templates',
            name: 'templates',
            component: () => import('../views/TemplateTool.vue'),
        },
    ],
});

export default router;
