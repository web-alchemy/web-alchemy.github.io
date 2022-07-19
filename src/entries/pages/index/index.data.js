const formatDate = require('../../../libs/format-date')
const { getTransformedArticles } = require('../../../services/getTransformedArticles.js')

module.exports = {
  permalink: '/',

  maxArticlesToShow: 5,

  eleventyComputed: {
    articles: (data) => {
      const { collections } = data
      const { articles } = collections

      return getTransformedArticles(articles)
        .slice(0, data.maxArticlesToShow)
        .map(article => {
          article.createdAt = formatDate(article.createdAt)
          return article
        })
    },

    articlesCount: (data) => {
      return data.collections.articles.length
    }
  }
}