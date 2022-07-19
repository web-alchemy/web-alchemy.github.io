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

function renderChildren(children) {
  return children
    .filter((child) => {
      const hasType = child.type in components
      if (!hasType) {
        console.warn(`Markdown components don't have the \`${child.type}\` type`)
      }
      return hasType
    })
    .map((child) => components[child.type](child))
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

async function render(content) {
  const tree = await parse(content)
  return components.root(tree)
}

module.exports = {
  parse,
  render
}
