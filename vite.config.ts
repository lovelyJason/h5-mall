import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

import externalGlobals from "rollup-plugin-external-globals";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '127.0.0.1'
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import '@/style/global.scss';`,
      }
    },
  },
  // build: {
  //   rollupOptions: {
  //     plugins: [
  //       externalGlobals({
  //         wx: 'wx'
  //       })
  //     ]
  //   }
  // }
  
})
