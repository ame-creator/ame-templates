const path = require('path')

const render = require('./index')

const components = [
  {
    name: 'title-2',
    version: '1.0.0',
    componentName: 'Title2'
  }
]

render({
  components,
  destPath: path.join(__dirname, '../publish'),
  componentsPath: path.join(__dirname, '../../../ame-components'),
  publicPath: ''
})
