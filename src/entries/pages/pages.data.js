module.exports = {
  layout: 'main.edge',

  eleventyComputed: {
    pageTitle: (data) => {
      const {
        title: dataTitle,
        metaInfo,
        entryType,
        textTitle
      } = data
      const { defaultTitle } = metaInfo

      const title = entryType === 'article'
        ? textTitle
        : dataTitle

      return title
        ? title + ' | ' + defaultTitle
        : defaultTitle
    },

    pageDescription: (data) => {
      const { entryType, textDescription } = data

      return entryType === 'article'
        ? textDescription.length > 160 ? textDescription.slice(0, 160) + '…' : textDescription
        : null
    }
  },
}