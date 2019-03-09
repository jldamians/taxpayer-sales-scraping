'use strict'

const LoginSOL = require('sol-login')
const PopupSOL = require('sol-popup')
const PreliminarySalesSOL = require('sol-preliminary-sales-information')

const Puppeteer = require('./Puppeteer')

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
  const loginSOL = new LoginSOL(this.ruc, this.username, this.password, this.page)

  try {
    await loginSOL.login()
  } catch (e) {
    throw e
  }
}

/**
 * Cierra las ventanas emergentes informativas y de confirmación
 */
BotSOL.prototype.closePopup = async function() {
  const popupSOL = new PopupSOL(this.page)

  try {
    await popupSOL.close()
  } catch (e) {
    throw e
  }
}

/**
 * Extrae la información del registro de ventas electrónico
 * @return {Array} Lista de comprobanes de ventas
 */
BotSOL.prototype.information = async function() {
  const preliminarySalesSOL = new PreliminarySalesSOL(this.period, this.page)

  try {
    await preliminarySalesSOL.goto()

    return await preliminarySalesSOL.information()
  } catch (e) {
    throw e
  }
}

module.exports = BotSOL
