'use strict'

const Promise = require('bluebird')
const LoginSOL = require('sol-login')
const PopupSOL = require('sol-popup')
const PreliminarySalesSOL = require('sol-preliminary-sales-information')

const Puppeteer = require('./Puppeteer')

/**
 * Permite acceder a los registros de venta del contribuyente
 * @param {String} ruc Número de RUC del contribuyente
 * @param {String} username Usuario SOL del contribuyente
 * @param {String} password Clave SOL del contribuyente
 * @param {String} period Periodo contable
 * @constructor
 */
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
 * Método para iniciar sesión en el portal SOL de SUNAT
 */
BotSOL.prototype.login = async function() {
  const loginSOL = new LoginSOL(this.ruc, this.username, this.password, this.page)

  try {
    await loginSOL.login()

    this.page.on('response', async (response) => {
      try {
        const request = response.request()

        // Esta petición es realizada para determinar si el contribuyente tiene campañas,
        // las cuales serán informadas en ventanas emergentes después de pasar el login
        const successfulRequest = (
          request.url().indexOf('https://e-menu.sunat.gob.pe/cl-ti-itmenu/MenuInternet.htm') != -1 &&
          response.status() == '200' &&
          request.method() == 'POST'
        )

        if (successfulRequest === true) {
          // Hemos verificado que se realiza dos peticiones a la misma url, pero con distinto contenido,
          // por ello, solo interceptaremos aquella petición cuyo contenido es "action=campana",
          // la cual se encarga con consultar las campañas activas del contribuyente
          if (request.postData() == 'action=campana') {
            // Obtenemos la respuesta de la solicitud/petición
            const responseData = await response.text()

            // Parseamos la respuesta de la solicitud/petición
            const responseInfo = JSON.parse(responseData)

            // Extraemos la campaña que determina si existirán popup's
            const campaign = responseInfo.find((current) => {
              return (
                current.nombreCampania === 'ModificaDatosRuc'
              )
            })

            if (campaign.existe === false) {
              this.page.emit('campaign-data', {
                exists: false
              })
            } else {
              const closablePopup = (
                campaign.url.indexOf('/ol-ti-itmoddatosruc/campmodificadatosruc.htm') != -1
              )

              // Cuando la campaña de modificación de datos lanza un
              // request ha "/ol-ti-itmoddatosruc/campanhas.htm",
              // la acción de cerrar el popup terminará la sesión
              const nonClosablePopup = (
                campaign.url.indexOf('/ol-ti-itmoddatosruc/campanhas.htm') != -1
              )

              if (closablePopup === true) {
                this.page.emit('campaign-data', { exists: true })
              } else if (nonClosablePopup === true) {
                this.page.emit('campaign-error', 'Importante, actualizar o confirmar los datos de contacto')
              } else {
                this.page.emit('campaign-error', `Soporte, implementar nueva url de campaña (${campaign.url})`)
              }
            }
          }
        }
      } catch(exception) {
        this.page.emit('campaign-error', exception.message)
      }
    })
  } catch (exception) {
    throw exception
  }
}

/**
 * Método que cierra las ventanas emergentes informativas y de confirmación
 */
BotSOL.prototype.closePopup = async function() {
  const popupSOL = new PopupSOL(this.page)

  try {
    const popup = await new Promise((resolve, reject) => {
      this.page
              .on('campaign-data', (data) => {
                resolve(data)
              })
              .on('campaign-error', (message) => {
                reject(new Error(message))
              })
    })

    if (popup.exists === true) {
      await popupSOL.close()
    }
  } catch (e) {
    throw e
  }
}

/**
 * Función para extraer la información del registro de ventas electrónico
 * @return {Array} Lista de comprobanes de ventas
 */
BotSOL.prototype.getInformation = async function() {
  const preliminarySalesSOL = new PreliminarySalesSOL(this.period, this.page)

  try {
    await preliminarySalesSOL.goto()

    return await preliminarySalesSOL.getInformation()
  } catch (e) {
    throw e
  }
}

module.exports = BotSOL
