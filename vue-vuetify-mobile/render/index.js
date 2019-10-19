
const Prepare = require('./lib/prepare')

async function render ({
  components,
  destPath,
  componentsPath,
  publicPath
}) {
  const prepare = new Prepare({
    components,
    destPath,
    componentsPath,
    publicPath
  })

  await prepare.prepare()
}

module.exports = render
