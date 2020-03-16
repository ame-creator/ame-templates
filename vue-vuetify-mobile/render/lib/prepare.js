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

    this.appManifest = {
      oldJs: '',
      newJs: '',
      oldCss: '',
      newCss: ''
    }
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

  async customAppJs ({ webpackComponents, components, manifest }) {
    const hashId = manifest.app.js.slice(0, 8)
    const sourceFilePath = path.join(this.destPath, 'js', `app.${hashId}.js`)

    const content = await fs.readFile(sourceFilePath, 'utf-8')

    // 组件入口重写
    let snippet1 = ''
    let snippet2 = ''
    let snippet3 = ''
    webpackComponents.map(item => {
      snippet1 += `"${item.moduleName}":"${item.moduleName}",`
      snippet2 += `"${item.moduleName}":"${item.hashId}",`
      snippet3 += `
        ${item.componentName}: function ${item.componentName}() {
          return __webpack_require__.e("${item.moduleName}").then(__webpack_require__.t.bind(null,"${item.moduleId}", 7));
        },
      `
    })

    // 组件列表重写
    const componentsSnippet = `{
      list:${JSON.stringify(components)},components:{${snippet3}}
    }`

    const outputContent = content
      // .replace(/\"title-2\"\:\"title-2\"/, snippet1) // 组件入口替换
      // .replace(/\"title-2\"\:\"[a-z0-9]{8}\"/, snippet2) // 组件入口替换
      .replace(/"title-2":"title-2"/, snippet1) // 组件入口替换
      .replace(/"title-2":"[a-z0-9]{8}"/, snippet2) // 组件入口替换
      .replace('__AME_COMPONENTS__', componentsSnippet) // 组件列表替换
      .replace('/ame-public-path/', this.publicPath) // publicPath替换

    // app.js hashId更新
    const newAppJs = `js/app.${makeWebpackHashId()}.js`
    const newFilePath = path.join(this.destPath, newAppJs)
    this.appManifest.oldJs = `js/app.${hashId}.js`
    this.appManifest.newJs = newAppJs

    // 新app.js写入
    await fs.writeFile(newFilePath, outputContent)
    // 旧app.js删除
    await fs.remove(sourceFilePath)
  }

  async customAppCss ({ webpackComponents, manifest }) {
    const hashId = manifest.app.css.slice(0, 8)
    const sourceFilePath = path.join(this.destPath, 'css', `app.${hashId}.css`)

    let content = await fs.readFile(sourceFilePath, 'utf-8')

    await Promise.all(
      webpackComponents.map(async item => {
        const { moduleVersion, moduleName } = item

        const moduleSourceFilePath = path.join(
          this.componentsPath,
          moduleName,
          // moduleVersion,
          'dist/index.css'
        )

        const moduleContent = await fs.readFile(moduleSourceFilePath, 'utf-8')
        content += `${moduleContent}\n`
      })
    )

    // app.css hashId更新
    const newAppCss = `css/app.${makeWebpackHashId()}.css`
    const newFilePath = path.join(this.destPath, newAppCss)
    this.appManifest.oldCss = `css/app.${hashId}.css`
    this.appManifest.newCss = newAppCss

    // 新app.css写入
    await fs.writeFile(newFilePath, content)
    // 旧app.css删除
    await fs.remove(sourceFilePath)
  }

  async customHtml () {
    const sourceFilePath = path.join(this.destPath, 'index.html')

    const content = await fs.readFile(sourceFilePath, 'utf-8')

    const jsRegexp = new RegExp(this.appManifest.oldJs, 'g')
    const cssRegexp = new RegExp(this.appManifest.oldCss, 'g')

    const outputContent = content
      .replace(jsRegexp, this.appManifest.newJs)
      .replace(cssRegexp, this.appManifest.newCss)
      .replace(/\/ame-public-path\//g, this.publicPath) // publicPath替换

    await fs.writeFile(sourceFilePath, outputContent)
  }

  async prepare () {
    await fs.emptyDir(this.destPath)

    await fs.copy(originDistPath, this.destPath)

    const uniqueComponents = _.uniqBy(this.components, 'name')

    const manifest = await fs.readJson(
      path.join(originDistPath, 'manifest.json')
    )

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

    await this.customAppJs({
      webpackComponents,
      components: this.components,
      manifest
    })

    await this.customAppCss({
      webpackComponents,
      manifest
    })

    await this.customHtml()
  }
}

module.exports = Prepare
