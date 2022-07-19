const Slug = require('@11ty/eleventy/src/Filters/Slug')

module.exports = function (DOM, content, inputPath) {
  const articleContent = DOM.document.querySelector('.article__body')

  if (!articleContent) {
    return
  }

  articleContent.children.forEach((child) => {
    child.classList.add('article__block')

    child.classList.toggle('article__block-title', child.classList.contains('title'))

    child.classList.toggle('article__paragraph', child.classList.contains('paragraph'))

    child.classList.toggle('article__list', child.classList.contains('list'))

    child.classList.toggle('article__block-code', child.classList.contains('block-code'))

    if(child.classList.contains('blockquote')) {
      child.classList.add('article__blockquote')
      child.children.forEach((blockquoteChild) => {
        blockquoteChild.classList.add('blockquote__item')
      })
    }

    if (child.classList.contains('title')) {
      const titleId = Slug(child.textContent)
      child.id = titleId

      const link = DOM.document.createElement('a')
      link.classList.add('article__title-anchor', 'link')
      link.innerHTML = '<span aria-hidden="true">#</span>'
      link.href = '#' + titleId
      child.appendChild(link)
    }

    {
      const image = child.firstElementChild
      if (image?.classList?.contains('image')) {
        const figureElement = DOM.document.createElement('figure')
        figureElement.classList.add('figure', 'article__block', 'article__figure')
        image.classList.add('figure__content')
        child.parentElement.insertBefore(figureElement, child)
        child.remove()
        figureElement.appendChild(image)
      }
    }
  })
}