module.exports = {
  eleventyComputed: {
    id: (data) => {
      const { page } = data
      const { fileSlug } = page
      return fileSlug
    },

    link: (data) => {
      const { id } = data
      return `/categories/${id}/`
    }
  }
}