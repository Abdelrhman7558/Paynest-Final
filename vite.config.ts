import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to n8n webhook to avoid CORS
      '/api/shipping': {
        target: 'https://n8n.srv1181726.hstgr.cloud',
        changeOrigin: true,
        rewrite: (_path) => '/webhook-test/Shipping-tab',
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      // Proxy for connecting shipping providers
      '/api/connect-shipping': {
        target: 'https://n8n.srv1181726.hstgr.cloud',
        changeOrigin: true,
        rewrite: (_path) => '/webhook-test/Sava-shippingAPi',
        secure: false,
      },
    },
  },
})
