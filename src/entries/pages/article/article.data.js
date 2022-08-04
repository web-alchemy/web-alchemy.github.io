const formatDate = require('../../../libs/format-date')
const { renderTreeAsText } = require('../../../core/markdown')

module.exports = {
  pagination: {
    data: 'collections.articles',
    size: 1,
    alias: 'article'
  },

  entryType: 'article',

  eleventyComputed: {
    permalink: data => {
      const { article } = data
      const { link } = article.data
      return link
    },

    title: (data) => {
      const { article } = data
      return article.data?.markdownData?.title
    },

    textTitle: (data) => {
      const { article } = data
      const { markdownTreeData } = article.data
      return renderTreeAsText(markdownTreeData?.title)
    },

    textDescription: (data) => {
      const { article } = data
      const { markdownTreeData } = article.data
      return renderTreeAsText(markdownTreeData?.excerpt ?? markdownTreeData?.content)
    },

    updatedAt: (data) => {
      const { article } = data
      return formatDate(article.data.updatedAt)
    },

    createdAt: (data) => {
      const { article } = data
      return formatDate(article.data.createdAt)
    },

    content: (data) => {
      const { article } = data
      return article.data?.markdownData?.content
    },

    excerpt: (data) => {
      const { article } = data
      return article.data?.markdownData?.excerpt
    },

    categories: (data) => {
      return () => {
        const { article } = data
        const { populatedCategories } = article.data

        return populatedCategories
          ?.map(articleCategory => ({
            id: articleCategory.data.id,
            name: articleCategory.data.name,
            link: articleCategory.data.link
          }))
      }
    },

    showUpdateDate: (data) => {
      const { article } = data
      const { createdAt, updatedAt } = article.data

      if (!createdAt && !updatedAt) {
        return false
      }

      const ONE_DAY = 1000 * 60 * 60 * 24
      const diff = Math.abs(updatedAt - createdAt)

      return diff > ONE_DAY
    }
  }
}