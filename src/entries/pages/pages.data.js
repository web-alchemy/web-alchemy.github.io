module.exports = {
  layout: 'main.edge',

  eleventyComputed: {
    pageTitle: (data) => {
      const { title, metaInfo } = data
      const { defaultTitle } = metaInfo

      return title
        ? title + ' | ' + defaultTitle
        : defaultTitle
    }
  }
}