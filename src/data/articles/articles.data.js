const fs = require('node:fs')
const fsp = require('node:fs/promises')
const path = require('node:path')
const config = require('../../../config.js')
const { parseAsArticle, renderChildren } = require('../../core/markdown')
const { runCommand } = require('../../core/run-command')

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

    markdownTreeData: async (data) => {
      const { page } = data
      const { inputPath } = page

      if (!inputPath) {
        return
      }

      const rawContent = await fsp.readFile(inputPath, { encoding: 'utf-8' })
      const mdData = await parseAsArticle(rawContent)
      return mdData
    },

    markdownData: async (data) => {
      const { markdownTreeData } = data

      if (!markdownTreeData) {
        return
      }

      return {
        title: markdownTreeData.title && renderChildren(markdownTreeData.title.children),
        excerpt: markdownTreeData.excerpt && renderChildren(markdownTreeData.excerpt),
        content: markdownTreeData.content && renderChildren(markdownTreeData.content)
      }
    },

    populatedCategories: (data) => {
      const { collections } = data
      const categoriesCollection = collections.categories
      const articleCategories = data.categories

      return articleCategories
        ?.map((articleCategory) => categoriesCollection.mapByFileSlug[articleCategory])
    },

    ...(config.isProd ? gitDateMixin() : fsDateMixin())
  }
}