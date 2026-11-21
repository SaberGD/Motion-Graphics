import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const root = path.resolve(__dirname, '..');
const m = (f: string) => path.resolve(__dirname, f);
export default defineConfig({
  root,
  server: { port: 5199, host: '127.0.0.1', strictPort: true },
  plugins: [react()],
  define: { __APP_BUILD_ID__: JSON.stringify('demo') },
  optimizeDeps: { exclude: ['firebase'] },
  resolve: {
    alias: [
      { find: /^firebase\/app$/, replacement: m('mock-app.ts') },
      { find: /^firebase\/auth$/, replacement: m('mock-auth.ts') },
      { find: /^firebase\/firestore$/, replacement: m('mock-firestore.ts') },
      { find: /^firebase\/functions$/, replacement: m('mock-functions.ts') },
      { find: '@', replacement: root },
    ],
  },
});
