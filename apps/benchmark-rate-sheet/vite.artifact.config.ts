import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Standalone single-file build used only to publish a self-contained demo
// (e.g. as a Claude Artifact). Not part of the normal dev/build workflow.
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: {
      // See pdfWorkerSetup.mainthread.ts: avoids a data:-URL module Worker,
      // which has been observed to hang on iOS Safari in this build.
      'pdf-worker-setup': fileURLToPath(
        new URL('./src/lib/pdfWorkerSetup.mainthread.ts', import.meta.url),
      ),
    },
  },
  build: {
    outDir: 'dist-artifact',
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    target: 'es2018',
    modulePreload: false,
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
      },
    },
  },
})
