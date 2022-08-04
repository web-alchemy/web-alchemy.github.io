const util = require('node:util')
const path = require('node:path')
const fs = require('node:fs')
const readline = require('node:readline')

const { runCommand } = require('./src/core/run-command')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = util.promisify(rl.question).bind(rl)

async function main() {
  const slug = await question('Enter article slug (url)\n')

  if (!slug) {
    return
  }

  const categories = (await question('Enter article categories separated by comma\n') || '')
    .split(',')
    .map(s => s.trim())

  const gitUser = (() => {
    try {
      return runCommand('git config user.name').trim()
    } catch (error) {
      return ''
    }
  })()

  const authors = (await question(`Enter authors names separated by comma (default: ${gitUser})\n`) || gitUser)
    .split(',')
    .map(s => s.trim())

  const articleFolder = path.join(process.cwd(), 'src', 'data', 'articles', slug)

  fs.mkdirSync(articleFolder, {
    recursive: true
  })

  fs.writeFileSync(path.join(articleFolder, 'index.md'), '')

  let data = ''

  if (categories.length > 0) {
    data += `categories:\n${categories.map(c => `  - ${c}`).join('\n')}`
  }

  data += '\n'

  if (authors.length > 0) {
    data += `authors:\n${authors.map(c => `  - ${c}`).join('\n')}`
  }

  fs.writeFileSync(path.join(articleFolder, 'index.data.yml'), data)

  rl.close()
}

main()