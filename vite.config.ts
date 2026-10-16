import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Relative base so the built bundle can be dropped into any folder / webview.
  base: './',
  plugins: [react(), tailwindcss()],
  server: { port: 5174, strictPort: true },
  test: { environment: 'node' },
});
