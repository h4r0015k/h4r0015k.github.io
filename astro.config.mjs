// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://nikhilsahani.com',
  integrations: [sitemap()],
  output: 'static'
});
