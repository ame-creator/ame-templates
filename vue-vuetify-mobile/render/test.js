const path = require('path')

const render = require('./index')

const components = [
  {
    name: 'title-2',
    version: '1.0.0',
    componentName: 'Title2',
    options: {
      title: '标题啊这是'
    }
  },
  {
    name: 'detail-1',
    version: '1.0.0',
    componentName: 'Detail1',
    options: {
      title: '首席首席首席',
      tags: [
        {
          title: '哈哈',
          color: '#ea3bc2'
        },
        {
          title: '是么'
        }
      ]
    }
  }
]

render({
  components,
  destPath: path.join(__dirname, '../publish'),
  componentsPath: path.join(__dirname, '../../../ame-components'),
  publicPath: ''
})
