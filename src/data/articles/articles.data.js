const fs = require('node:fs')
const path = require('node:path')
const { execFileSync } = require('node:child_process')
const config = require('../../../config.js')

function runCommand(command) {
  const [bin, ...args] = command.split(' ')
  return execFileSync(bin, args, {
    encoding: 'utf-8'
  })
}

const fsDateMixin = () => ({
  createdAt: (data) => {
    const { articleFolder } = data
    if (!articleFolder) {
      return
    }
    return fs.statSync(articleFolder).birthtime
  },

  updatedAt: (data) => {
    const { articleFolder } = data
    if (!articleFolder) {
      return
    }
    return fs.statSync(articleFolder).mtime
  },
})

const gitDateMixin = () => ({
  createdAt: (data) => {
    const { articleFolder } = data
    if (!articleFolder) {
      return
    }
    const date = runCommand(`git --no-pager log --diff-filter=A --follow -1 --format="%ci" ${articleFolder}`).trim()
    return date ? new Date(date) : new Date()
  },

  updatedAt: (data) => {
    const { articleFolder } = data
    if (!articleFolder) {
      return
    }
    const date = runCommand(`git --no-pager log -n 1 --format="%ci" ${articleFolder}`)
    return new Date(date)
  },
})

module.exports = {
  eleventyComputed: {
    id: (data) => {
      const { page } = data
      const { fileSlug } = page
      return fileSlug
    },

    link: (data) => {
      const { id } = data
      return `/articles/${id}/`
    },

    articleFolder: (data) => {
      const { page } = data
      const { inputPath } = page
      return path.dirname(inputPath)
    },

    populatedCategories: (data) => {
      const { collections } = data
      const categoriesCollection = collections.categories
      const articleCategories = data.categories

      return articleCategories
        .map((articleCategory) => categoriesCollection.mapByFileSlug[articleCategory])
    },

    ...(config.isProd ? gitDateMixin() : fsDateMixin())
  }
}