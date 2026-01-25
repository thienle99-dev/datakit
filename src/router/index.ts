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
    ],
});

export default router;
