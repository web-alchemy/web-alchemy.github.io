module.exports = {
  buildDate: new Date(),

  siteName: 'Web Alchemy',

  defaultTitle: 'Web Alchemy - блог о веб-разработке',

  defaultLang: 'ru',

  siteBaseLink: 'https://web-alchemy.github.io',

  get RSSLink() {
    return `${this.siteBaseLink}/articles/feed/index.xml`
  }
}