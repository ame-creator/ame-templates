export default {
  list: [
    {
      name: 'Title2',
      npm: '@ac-vue/title-2',
      id: 'title-2-acme',
      options: {
        title: '标题'
      }
    }
  ],
  components: {
    Title2: () => import(/* webpackChunkName: 'title-2' */ '@ac-vue/title-2')
  }
}
