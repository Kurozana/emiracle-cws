import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://kurozana.github.io',
  base: '/emiracle-cws',
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto'
  }
});
