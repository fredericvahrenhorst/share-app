/* eslint-disable */
import legacy from '@vitejs/plugin-legacy';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import eslint from 'vite-plugin-eslint';
import { defineConfig } from 'vite';
import dotenv from "dotenv";
/* eslint-enable */
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        legacy(),
        eslint(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    define: {
        'process.env': JSON.stringify(dotenv.config({ path: '.env' }).parsed),
    },
});
