const pluginName = 'AmePlugin'

const externalModules = ['vue', 'axios']

class AmePlugin {
  apply (compiler) {
    compiler.hooks.emit.tapAsync(pluginName, (compilation, callback) => {
      const chunks = compilation.chunks

      const manifest = {}

      chunks.forEach(item => {
        if (item.id === 'app') {
          manifest.app = {
            files: item.files,
            css: item.contentHash['css/mini-extract'],
            js: item.contentHash['javascript']
          }
        }

        if (item.id === 'chunk-vendors') {
          item._modules.forEach(moduleItem => {
            const rawRequest = moduleItem.rawRequest
            if (externalModules.includes(rawRequest)) {
              manifest[rawRequest] = moduleItem.id
            }
          })
        }
      })

      const manifestStr = JSON.stringify(manifest)

      compilation.assets['manifest.json'] = {
        source: function () {
          return manifestStr
        },
        size: function () {
          return manifestStr.length
        }
      }

      callback()
    })
  }
}

module.exports = AmePlugin
