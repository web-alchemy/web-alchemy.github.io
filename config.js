const ENVS = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development'
}

module.exports = Object.freeze({
  isProd: process.env.NODE_ENV === ENVS.PRODUCTION,
  get isDev() {
    return !this.isProd
  },

  folders: Object.freeze({
    src: 'src',
    dest: 'dist'
  }),

  viteManifestFileName: 'vite-manifest.json',
})