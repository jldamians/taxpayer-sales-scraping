'use strict'

const puppeteer = require('puppeteer')

function Puppeteer(url) {
  let _args = {
    url
  }

  Object.defineProperty(this, 'browser', {
    get: () => { return _args.browser },
    set: (value) => { _args.browser = value }
  })

  Object.defineProperty(this, 'page', {
    get: () => { return _args.page },
    set: (value) => { _args.page = value }
  })

  Object.defineProperty(this, 'url', {
    get: () => { return _args.url },
    set: (value) => { _args.url = value }
  })
}

/**
 * Abre la página web
 * @param  {[type]} url Ruta de la página web
 */
Puppeteer.prototype.openPage = async function() {
  const env = process.env.NODE_ENV || 'development'

  this.browser = await puppeteer.launch({
    headless: env === 'development' ? false : true
  })

  this.page = await this.browser.newPage()

  try {
    await this.page.goto(this.url, {
      timeout: 10000
    })
  } catch (e) {
    throw new Error(`No se ha podido acceder a la web: ${this.url}`)
  }
}

/**
 * Cierra la página web
 */
Puppeteer.prototype.closePage = async function() {
  await this.browser.close()
}

module.exports = Puppeteer
