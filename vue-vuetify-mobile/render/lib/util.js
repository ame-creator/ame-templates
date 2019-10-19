const generate = require('nanoid/generate')

const alphabet = '0123456789abcdef'

function makeWebpackModuleId () {
  return generate(alphabet, 5)
}

function makeWebpackHashId () {
  return generate(alphabet, 8)
}

module.exports = {
  makeWebpackModuleId,
  makeWebpackHashId
}
