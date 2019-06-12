<template>
  <div id="app">
    <div class="page-container">
      <component
        v-for="item in components"
        :key="item.id"
        :is="item.name"
        v-bind="item.options"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import components from './components'

@Component({
  components: components.components
})
export default class Page extends Vue {
  components = components.list
}
</script>

<style lang="scss">
@import '~normalize.css';
@import '~@ac-vue/title-2/dist/index.css';

*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-size: 14px;
  font-family: 'Helvetica Neue', -apple-system, Helvetica, Arial, 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

body {
  background: #f5f5f7;
}

#app, .page-container {
  height: 100%;
}

.page-container {
  max-width: 600PX;
  margin: 0 auto;
  background: #fff;
}
</style>
