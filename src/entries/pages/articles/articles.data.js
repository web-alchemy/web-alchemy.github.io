const formatDate = require('../../../libs/format-date')
const { getTransformedArticles } = require('../../../services/getTransformedArticles.js')

module.exports = {
  permalink: '/articles/',

  title: 'Все статьи',

  eleventyComputed: {
    articles: (data) => {
      const { collections } = data
      const { articles } = collections

      return getTransformedArticles(articles)
        .slice()
        .map((article) => {
          article.createdAt = formatDate(article.createdAt)
          return article
        })
    }
  }
}