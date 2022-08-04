const fs = require('node:fs')
const path = require('node:path')
const gulp = require('gulp')
const EdgeJsPlugin = require('@web-alchemy/eleventy-plugin-edgejs')
const { parseHTML } = require('linkedom')
const Collection = require('./src/core/collection.js')
const { render } = require('./src/core/markdown')
const articleBodyBlocks = require('./src/transforms/article-body-blocks.js')
const config = require('./config.js')

const staticFilesExt = [
  'jpeg',
  'jpg',
  'png',
  'svg',
  'webp',
  'avif'
]

module.exports = function(eleventyConfig) {
  // copy static assets
  gulp.src('src/public/**/*.*')
    .pipe(gulp.dest('dist'))

  gulp.src(`src/data/**/*.{${staticFilesExt.join(',')}}`)
    .pipe(gulp.dest('dist'))

  eleventyConfig.addPlugin(EdgeJsPlugin, {
    extendEdgeInstance: function (edge) {
      class DevManifest {
        getResource(name) {
          return (new URL(name, 'http://localhost:3000')).toString()
        }
      }

      class ProdManifest {
        constructor(manifest) {
          this.manifest = manifest
        }

        getResource(name) {
          return '/' + this.manifest[name]?.file
        }
      }

      const manifest = config.isProd
        ? new ProdManifest(JSON.parse(fs.readFileSync(path.join(process.cwd(), config.folders.dest, config.viteManifestFileName), { encoding: 'utf-8' })))
        : new DevManifest()

      edge.global('entry', (entryName) => {
        return manifest.getResource(entryName)
      })
    },

    skipRenderCondition: function (inputContent, inputPath) {
      return !['entries', 'layouts'].some(pathSegment => inputPath.includes(pathSegment))
    }
  })

  eleventyConfig.addExtension('md', {
    compile: async function (inputContent, inputPath) {
      const html = await render(inputContent)

      return async function(data) {
        return html
      }
    }
  })

  eleventyConfig.setBrowserSyncConfig({
    server: {
      baseDir: [
        // './src',
        './dist',
      ]
    },
    // files: [
    //   'src/**/*.{css,js,edge}',
    // ],
    watch: false
  })

  eleventyConfig.setQuietMode(true)

  eleventyConfig.addCollection('people', (collectionAPI) => {
    return new Collection({
      items: collectionAPI.getFilteredByGlob('src/data/people/*/index.md')
    })
  })

  eleventyConfig.addCollection('categories', (collectionAPI) => {
    return new Collection({
      items: collectionAPI.getFilteredByGlob('src/data/categories/*/index.md')
    })
  })

  eleventyConfig.addCollection('articles', (collectionAPI) => {
    const articles = collectionAPI.getFilteredByGlob('src/data/articles/*/index.md')

    articles.sort((a, b) => b.data.createdAt - a.data.createdAt)

    return new Collection({
      items: articles
    })
  })

  eleventyConfig.addTransform('article-body-transform', async function(content, outputPath) {
    if (!outputPath || !outputPath.endsWith('.html')) {
      return content
    }

    const DOM = parseHTML(content)

    const articleBodyTransforms = [
      articleBodyBlocks
    ]

    for (const transform of articleBodyTransforms) {
      await transform(DOM, content, outputPath)
    }

    return DOM.document.toString()
  })

  return {
    dir: {
      input: config.folders.src,
      output: config.folders.dest,
      layouts: 'layouts',
      data: 'global-data'
    },
    jsDataFileSuffix: '.data',
    pathPrefix: '/',
  }
}