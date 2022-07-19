const config = require('../../../../config.js')
const { getTransformedArticles } = require('../../../services/getTransformedArticles.js')

const articlesMixin = {
  permalink: (data) => {
    const { link } = data
    return link + 'index.xml'
  },

  articles: (data) => {
    const { collections } = data
    const { articles } = collections

    return getTransformedArticles(articles)
      .slice()
      .map((article) => {
        article.createdAt = article.createdAt.toUTCString()
        article.updatedAt = article.updatedAt.toUTCString()
        article.categoryNames = () => article.categories.map(category => category.data.name)
        return article
      })
  },

  lastBuildDate: (data) => {
    const { articles } = data

    if (!articles) {
      return (new Date()).toUTCString()
    }

    return articles[0]?.createdAt
  }
}

module.exports = {
  layout: false,

  permalink: false,

  title: 'Статьи',

  description: 'Статьи о веб-разработке',

  link: '/articles/feed/',

  eleventyComputed: config.isProd ? articlesMixin : {}
}