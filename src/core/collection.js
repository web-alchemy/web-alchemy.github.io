class Collection extends Array {
  constructor({ items }) {
    super()

    for (const prop of ['mapByFileSlug', 'mapByFilePathStem', 'mapByInputPath']) {
      Object.defineProperty(this, prop, {
        value: {},
        enumerable: false,
        writable: true,
        configurable: false
      })
    }

    if (items && items.length > 0) {
      for (const item of items) {
        this.push(item)
        this.mapByFileSlug[item.fileSlug] = item
        this.mapByFilePathStem[item.filePathStem] = item
        this.mapByInputPath[item.inputPath] = item
      }
    }
  }
}

module.exports = Collection