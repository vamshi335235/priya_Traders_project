import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        strictPort: true,
        host: '0.0.0.0', // This ensures it is accessible via both localhost and 127.0.0.1
    },
})
