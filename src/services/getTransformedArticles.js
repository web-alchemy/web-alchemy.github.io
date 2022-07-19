function getTransformedArticles(articles) {
  return articles
    .map(articleData => ({
      id: articleData.data.id,
      title: articleData.data.title,
      link: articleData.data.link,
      createdAt: articleData.data.createdAt,
      updatedAt: articleData.data.updatedAt,
      get categories() {
        return articleData.data.populatedCategories
      },
      get content() {
        return articleData.templateContent
      }
    }))
}

module.exports = {
  getTransformedArticles
}