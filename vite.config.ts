import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    svgr()
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://backend-insider.vercel.app', // ← ADICIONE O PROTOCOLO
        changeOrigin: true,
        secure: true, // para HTTPS
        rewrite: (path) => path, // mantém o caminho original
      },
    },
  },
});