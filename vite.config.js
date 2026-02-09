import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { compression } from 'vite-plugin-compression2';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
        }),
        vue({
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                },
            },
        }),
        tailwindcss(),
        compression({
            algorithm: 'gzip',
            exclude: [/\.(br)$/, /\.(gz)$/],
        }),
    ],
    
    resolve: {
        alias: {
            '@': '/resources/js',
        },
    },
    
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    // Core Alpine.js (always needed)
                    'alpine-core': ['alpinejs', '@alpinejs/collapse', '@alpinejs/intersect', '@alpinejs/persist'],
                    
                    // Charts (only for analytics pages)
                    'charts': ['apexcharts'],
                    
                    // Media libraries (only for player/upload)
                    'media': ['wavesurfer.js', 'filepond', 'filepond-plugin-image-preview'],
                    
                    // UI components (loaded on demand)
                    'ui-components': ['swiper', 'tippy.js', 'toastify-js', 'tom-select', 'simplebar'],
                    
                    // Form libraries
                    'forms': ['cleave.js', 'flatpickr'],
                    
                    // Tables (only for admin/data pages)
                    'tables': ['gridjs', 'sortablejs'],
                    
                    // Editor
                    'editor': ['quill'],
                }
            }
        },
        
        // Chunk size warnings
        chunkSizeWarningLimit: 500,
        
        // CSS code splitting
        cssCodeSplit: true,
        
        // Minification
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true, // Remove console.logs in production
                drop_debugger: true,
            }
        }
    },
    
    server: {
        host: '0.0.0.0',
        port: 5173,
        hmr: {
            host: 'localhost',
        },
    },
});
