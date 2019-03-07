'use strict'

const LoginSOL = require('sol-login')
const PopupSOL = require('sol-popup')

const Puppeteer = require('./Puppeteer')
const SalesPreview = require('./SalesPreview')

function BotSOL(ruc, username, password, period) {
  let _args = {
    ruc,
    period,
    username,
    password
  }

  this._super.call(this, this.URL);

  Object.defineProperty(this, 'ruc', {
    get: () => { return _args.ruc },
  })

  Object.defineProperty(this, 'period', {
    get: () => { return _args.period },
  })

  Object.defineProperty(this, 'username', {
    get: () => { return _args.username }
  })

  Object.defineProperty(this, 'password', {
    get: () => { return _args.password }
  })
}

BotSOL.prototype = Object.create(Puppeteer.prototype)
BotSOL.prototype.constructor = BotSOL
BotSOL.prototype._super = Puppeteer

BotSOL.prototype.URL = 'https://e-menu.sunat.gob.pe/cl-ti-itmenu/MenuInternet.htm'

/**
 * Inicia sesión en el portal SOL de SUNAT
 */
BotSOL.prototype.login = async function() {
  const loginSOL = new LoginSOL(this.ruc, this.username, this.password)

  try {
    await loginSOL.login(this.page)
  } catch (e) {
    throw e
  }
}

/**
 * Cierra las ventanas emergentes informativas y de confirmación
 */
BotSOL.prototype.closePopup = async function() {
  const popupSOL = new PopupSOL()

  try {
    await popupSOL.close(this.page)
  } catch (e) {
    throw e
  }
}

/**
 * Extrae la información del registro de ventas electrónico
 * @return {Array} Lista de comprobanes de ventas
 */
BotSOL.prototype.data = async function() {
  const salesPreview = new SalesPreview(this.period)

  try {
    await salesPreview.goto(this.page)

    return await salesPreview.data()
  } catch (e) {
    throw e
  }
}

module.exports = BotSOL
