const { execFileSync } = require('node:child_process')

function runCommand(command) {
  const [bin, ...args] = command.split(' ')
  return execFileSync(bin, args, {
    encoding: 'utf-8'
  })
}

module.exports = {
  runCommand
}