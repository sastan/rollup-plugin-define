const path = require('path')
const fs = require('fs')
const jsdom = require('jsdom')

class FixtureResourceLoader extends jsdom.ResourceLoader {
  fetch(url) {
    const { pathname } = new URL(url)

    const filename = path.resolve(__dirname, 'src', '__fixtures__', pathname.slice(1))

    return fs.promises.readFile(filename)
  }
}

module.exports = {
  preset: '@carv/snowpack-scripts',
  testEnvironmentOptions: {
    resources: new FixtureResourceLoader(),
  },
}
