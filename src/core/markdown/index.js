const unifiedModule = (() => import('unified'))()
const remarkParseModule = (() => import('remark-parse'))()
const remarkGFMModule = (() => import('remark-gfm'))()

const components = {
  root(props) {
    const { children } = props
    return renderChildren(children)
  },

  html(props) {
    const { value } = props
    return value
  },

  text(props) {
    const { value } = props
    return value
  },

  emphasis(props) {
    const { children } = props
    return `<em class="emphasis">${renderChildren(children)}</em>`
  },

  strong(props) {
    const { children } = props
    return `<strong> class="strong">${renderChildren(children)}</strong>`
  },

  link(props) {
    const { children, url, title } = props
    const titleAttr = title ? `title="${title}"` : ''
    return `<a class="link" href="${url}" ${titleAttr}>${renderChildren(children)}</a>`
  },

  inlineCode(props) {
    const { value } = props
    return `<code class="inline-code">${value}</code>`
  },

  code(props) {
    const { value, lang, meta } = props
    return `<pre class="block-code"><code class="block-code__content">${value}</code></pre>`
  },

  heading(props) {
    const { children, depth } = props
    return `<h${depth} class="title title_level_${depth}">
      ${renderChildren(children)}
    </h${depth}>`
  },

  paragraph(props) {
    const { children } = props
    return `<p class="paragraph">
      ${renderChildren(children)}
    </p>`
  },

  list(props) {
    const { children, ordered, start, spread } = props
    const tag = ordered ? 'ol' : 'ul'
    const startValue = start !== null && start !== undefined && start !== 1 ? start : ''
    return `<${tag} class="list" ${startValue}>
      ${renderChildren(children)}
    </${tag}>`
  },

  listItem(props) {
    const { children, spread, checked } = props
    return `<li class="list__item">
      ${renderChildren(children)}
    </li>`
  },

  image(props) {
    const { title, url, alt } = props
    const attrs = { src: url, alt, title }
    const serializedAttrs = Object.entries(attrs)
      .filter(([key, value]) => Boolean(value))
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ')
    return `<img class="image" ${serializedAttrs}/>`
  },

  thematicBreak(props) {
    return `<hr class="thematic-break" />`
  },

  blockquote(props) {
    const { children } = props

    return `<blockquote class="blockquote">${renderChildren(children)}</blockquote>`
  },

  table(props) {
    const { children, align } = props
    const [headRow, ...bodyRows] = children
    const hasHead = headRow.children.every((cell) => cell.children.length !== 0)

    // TODO: refactor
    if (hasHead) {
      headRow.children.forEach((child) => {
        child.__isHead = true
      })
    }

    const head = hasHead
      ? `
        <thead class="table__head">
          ${this.tableRow(headRow)}
        </thead>
      `
      : ''

    const body = `<tbody class="table__body">${renderChildren(bodyRows)}</tbody>`

    return `<table class="table">
      ${head}
      ${body}
    </table>`
  },

  tableRow(props) {
    const { children } = props
    return `<tr class="table__row">${renderChildren(children)}</tr>`
  },

  tableCell(props) {
    const { children, __isHead } = props
    const tag = __isHead ? 'th' : 'td'
    return `<${tag} class="table__cell">
      ${renderChildren(children)}
    </${tag}>`
  }
}

const textComponents = new Proxy({}, {
  get() {
    return (child) => {
      if (child.children) {
        return renderChildren(child.children, textComponents)
      } else if (typeof child.value !== 'undefined') {
        return child.value
      } else {
        return ''
      }
    }
  },

  has() {
    return true
  }
})

function renderChildren(children, mdComponents = components) {
  return children
    .filter((child) => {
      const hasType = child.type in mdComponents
      if (!hasType) {
        console.warn(`Markdown components don't have the \`${child.type}\` type`)
      }
      return hasType
    })
    .map((child) => mdComponents[child.type](child))
    .join('')
}

async function parse(content) {
  const [
    { unified },
    { default: remarkParse },
    { default: remarkGfm }
  ] = await Promise.all([
    unifiedModule,
    remarkParseModule,
    remarkGFMModule
  ])
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .parse(content)
}

function renderTree(tree, mdComponents = components) {
  if (tree.type) {
    return mdComponents[tree.type](tree)
  } else if (Array.isArray(tree)) {
    return renderChildren(tree, mdComponents)
  } else {
    throw new Error('Invalid structure of markdown tree')
  }
}

function renderTreeAsText(tree) {
  return renderTree(tree, textComponents)
}

async function parseAsArticle(content) {
  const tree = await parse(content)
  const { children } = tree
  const firstChild = children[0]
  const hasTitle = firstChild.type === 'heading' && firstChild?.depth === 1
  const hasExcerpt = hasTitle && children[1].type === 'thematicBreak'
  const excerptElements = []
  let index = 1
  if (hasExcerpt) {
    while (children[++index]?.type !== 'thematicBreak') {
      excerptElements.push(children[index])
    }
    index++
  }
  const restChildren = children.slice(index)
  return {
    ...(hasTitle && { title: firstChild }),
    excerpt: excerptElements,
    content: restChildren
  }
}

async function render(content) {
  const tree = await parse(content)
  return renderTree(tree)
}

module.exports = {
  parse,
  parseAsArticle,
  render,
  renderTree,
  renderTreeAsText,
  renderChildren
}
