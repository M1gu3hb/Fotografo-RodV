import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { localApi } from './scripts/local-api.mjs';
import { getPageData, serializePage } from './scripts/page-data.mjs';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';

export default defineConfig({
  plugins: [react(), {
    name: 'local-vercel-api',
    configureServer(server) { server.middlewares.use(localApi); },
    configurePreviewServer(server) {
      server.middlewares.use(localApi);
      server.middlewares.use((req, res, next) => {
        const pathname = new URL(req.url || '/', 'http://localhost').pathname;
        if (pathname.startsWith('/api/') || /\.[a-z0-9]+$/i.test(pathname)) return next();
        const root = resolve('dist');
        const filename = resolve(root, `.${pathname}`, 'index.html');
        if (!filename.startsWith(root + sep)) return next();
        const found = existsSync(filename);
        res.statusCode = found ? 200 : 404;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(readFileSync(found ? filename : resolve(root, '404.html')));
      });
    },
    transformIndexHtml(html, context) {
      if (!context.server) return html;
      const page = getPageData(new URL(context.originalUrl || '/', 'http://localhost').pathname);
      return html.replace('</body>', `<script id="page-data" type="application/json">${serializePage(page)}</script></body>`);
    }
  }],
  build: {
    target: "es2022",
    cssCodeSplit: true,
    sourcemap: false,
  },
});
