const path =  require('node:path')
const { defineConfig } = require('vite')
const config = require('./config.js')

const entriesMap = {
  'main.css': 'entries/styles/main.css'
}

export default defineConfig({
  root: path.join(__dirname, config.folders.src),
  publicDir: false,
  build: {
    outDir: path.join(__dirname, config.folders.dest),
    write: config.isProd,
    emptyOutDir: false,
    manifest: config.viteManifestFileName,
    rollupOptions: {
      get input() {
        return Object.entries(entriesMap).reduce((map, [entryName, entryValue]) => {
          map[entryName] = config.isProd ? config.folders.src + '/' + entryValue : entryValue
          return map
        }, {})
      }
    }
  },
  server: {
    port: 3000
  }
})