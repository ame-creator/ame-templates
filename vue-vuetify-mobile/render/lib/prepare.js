const fs = require('fs-extra')
const path = require('path')
const _ = require('lodash')

const util = require('./util')
const { makeWebpackHashId, makeWebpackModuleId } = util

const originDistPath = path.join(__dirname, '../../dist')

class Prepare {
  constructor ({ components, componentsPath, destPath, publicPath }) {
    this.components = components
    this.componentsPath = componentsPath
    this.destPath = destPath
    this.publicPath = publicPath
  }

  async createComponentJs ({
    moduleName,
    moduleVersion,
    moduleId,
    webpackHashId,
    manifest
  }) {
    const sourceFilePath = path.join(
      this.componentsPath,
      moduleName,
      // moduleVersion,
      'dist/index.umd.min.js'
    )

    let content = await fs.readFile(sourceFilePath, 'utf-8')

    content = content.replace(
      /require\("vue"\)/g,
      `__webpack_require__('${manifest.vue}')`
    )

    const outputContent = `(window["webpackJsonp"] = window["webpackJsonp"]||[]).push([["${moduleName}"],{
      "${moduleId}":
      (function(module,exports, __webpack_require__){
    ${content}
      })
    }]);`

    const destFilePath = path.join(
      this.destPath,
      'js',
      `${moduleName}.${webpackHashId}.js`
    )

    await fs.writeFile(destFilePath, outputContent)
  }

  async prepare () {
    await fs.emptyDir(this.destPath)

    await fs.copy(originDistPath, this.destPath)

    const uniqueComponents = _.uniqBy(this.components, 'name')

    const manifest = {
      vue: '2b0e'
    }

    const webpackComponents = uniqueComponents.map(item => {
      return {
        componentName: item.componentName,
        moduleName: item.name,
        moduleVersion: item.version,
        moduleId: makeWebpackModuleId(),
        hashId: makeWebpackHashId(),
        npmName: `@ame-vue/${item.name}`
      }
    })

    await Promise.all(
      webpackComponents.map(async item => {
        const { moduleId, moduleName, moduleVersion, hashId } = item
        await this.createComponentJs({
          moduleName,
          moduleId,
          moduleVersion,
          webpackHashId: hashId,
          manifest
        })
      })
    )
  }
}

module.exports = Prepare
