module.exports = function (source) {
  const resourcePath = this.resourcePath

  if (/components\.ts/.test(resourcePath)) {
    return `export default __AME_COMPONENTS__`
  }

  return source
}
