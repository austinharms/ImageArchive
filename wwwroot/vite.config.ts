import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: "wwwroot",
  build: {
    outDir: "../build/wwwroot",
    emptyOutDir: true
  },
  css: {
    modules: {
      localsConvention: "camelCaseOnly"
    }
  }
});
