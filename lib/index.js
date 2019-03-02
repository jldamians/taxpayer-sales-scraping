'use strict'

const moment = require('moment')
const puppeteer = require('puppeteer')

const { ElementNotFoundError } = require('./errors')

const bot = async (Identity, Username, Password, Period) => {
  const browser = await puppeteer.launch({
    headless: false
  })

  const page = await browser.newPage()

  await page.setDefaultTimeout(10000) // configurando el tiempo de espera para métodos

  try {
    try {
      await page.goto('https://e-menu.sunat.gob.pe/cl-ti-itmenu/MenuInternet.htm', {
        timeout: 15000
      })
    } catch (e) {
      throw new ElementNotFoundError(
        'El formulario de login no ha cargado correctamente'
      )
    }

    try {
      const IdentityAccessButton = await page.waitForSelector('button#btnPorRuc', {
        timeout: 5000, // wait five seconds
        visible: true // wait for element to be present in DOM and to be visible
      })

      await IdentityAccessButton.click()
    } catch (e) {
      throw new ElementNotFoundError(
        'La opción para autenticar con RUC no está disponible'
      )
    }

    try {
      const LoginButton = await page.waitForSelector('button#btnAceptar', {
        timeout: 5000,
        visible: true
      })

      const TaxpayerIdentityInput = await page.waitForSelector('input#txtRuc', {
        timeout: 5000,
        visible: true
      })

      const TaxpayerUsernameInput = await page.waitForSelector('input#txtUsuario', {
        timeout: 5000,
        visible: true
      })

      const TaxpayerPasswordInput = await page.waitForSelector('input#txtContrasena', {
        timeout: 5000,
        visible: true
      })

      await TaxpayerIdentityInput.type(Identity)

      await TaxpayerUsernameInput.type(Username)

      await TaxpayerPasswordInput.type(Password)

      await LoginButton.click()
    } catch (e) {
      throw new ElementNotFoundError(
        'Los controles de autenticación no están disponibles'
      )
    }

    // NOTE: Verificamos si la autenticación ha sido realizada correctamente,
    // para ello, validamos que la sección Pop-Up haya sido creada en el DOM
    try {
      await page.waitForSelector('iframe#ifrVCE', {
        timeout: 10000,
        // Configuramos esta opción porque el iframe
        // puede estar oculto al no existir alertas
        visible: false
      })

      // Evaluamos y extraemos el iframe que necestiamos,
      // para este caso, el iframe que contiene los Pop-Up
      const PopupIframe = page.frames().find((frame) => {
        return frame.name() === 'ifrVCE'
      })

      // NOTE: Si el body del frame "ifrVCE" tiene asignada la clase "tundra",
      // se entiende que existen modales informativos abiertos
      try {
        await PopupIframe.waitForSelector('body.tundra', {
          timeout: 10000,
          visible: true // default
        })

        // NOTE: Verificamos si el Pop-Up de comunicados (IMPORTANTE)
        // está abierto, para proceder con el cierre del mismo
        try {
          const CommuniqueCloseButton = await PopupIframe.waitForSelector('#idthirdDialog > div.dijitDialogTitleBar > span.dijitDialogCloseIcon', {
            timeout: 10000,
            visible: true
          })

          await CommuniqueCloseButton.click()
        } catch (e) {
          // NOTE: Controlar la excepción puesto que los Pop-Up son opcionales

          //throw e
        }

        // NOTE: Verificamos si el Pop-Up de confirmación (CONFIRMAR SU TELÉFONO CELULAR)
        // está abierto, para proceder con el cierre del mismo
        try {
          const ContinueWithoutConfirmingButton = await PopupIframe.waitForSelector('#continuarSinRegistrarBtn', {
            timeout: 10000,
            visible: true
          })

          // TODO: actualmente dormimos el proceso por 1s para que termine de carga el evento
          // del elemento seleccionado. Queda pendiente ver otra forma de cerrar el segundo modal
          await PopupIframe.waitFor(1000)

          await ContinueWithoutConfirmingButton.click()
        } catch (e) {
          // NOTE: Controlar la excepción puesto que los Pop-Up son opcionales

          //throw e
        }
      } catch (e) {
        // NOTE: No controlar la excepción puesto que los Pop-Up son opcionales

        //throw e
      }
    } catch (e) {
      throw new ElementNotFoundError(
        'La autenticación ha sido incorrecta'
      )
    }

    try {
      // Esperamos que el menú "Preliminar del Registro de Ventas Electrónico"
      // esté presente en el DOM, sin importar que esté visible
      await page.waitForSelector('#nivel4_25_2_1_1_4', {
        timeout: 5000,
        visible: false
      })

      // Cuando un elemento presente en el DOM no es visible,
      // esta es la única forma de acceder a sus eventos (click)
      await page.evaluate(()=> {
        const PreviewElectronicSalesBook = document.querySelector('#nivel4_25_2_1_1_4')

        PreviewElectronicSalesBook.click()
      })
    } catch (e) {
      throw new ElementNotFoundError(
        'El menú para acceder al registro preliminar de ventas no está disponible'
      )
    }

    try {
      // Esperamos que el iframe donde se muestra el "Preliminar del Registro de Ventas e Ingresos"
      // esté presente en el DOM, para poder acceder a los comprobantes registrados
      await page.waitFor('iframe#iframeApplication', {
        timeout: 10000,
        visible: true
      })

      // NOTE: Esto es necesario para que "puppeteer"
      // pueda optener correctamente el iframe
      await page.waitFor(1000)

      const ApplicationIframe = await page.$('iframe#iframeApplication')

      const frame = await ApplicationIframe.contentFrame()

      // TODO: No lanzar excepción, puesto que esto es opcional, es decir puede no existir
      // Declaramos conocer los terminos y condiciones
      const ConditionsCheck = await frame.waitForSelector('input[name="condiciones.cbTerminos"]', {
        timeout: 10000,
        visible: true // default
      })

      await ConditionsCheck.click()

      // TODO: No lanzar excepción, puesto que esto es opcional, es decir puede no existir
      // Aceptamos los terminos y condiciones
      const ContinueButton = await frame.waitForSelector('span[id="condiciones.btnContinuar"]', {
        timeout: 10000,
        visible: true // default
      })

      await ContinueButton.click()

      try {
        const PeriodInput = await frame.waitForSelector('input[name="periodoRegistroVentasConMovim"]', {
          timeout: 10000,
          visible: true // default
        })

        await PeriodInput.type(Period)

        const ElectronicSalesButton = await frame.waitForSelector('span[id="inicio.btnIrRegVentas"]', {
          timeout: 10000,
          visible: true // default
        })

        await ElectronicSalesButton.click()
      } catch (e) {
        throw new ElementNotFoundError(
          'Los controles para acceder al registro de ventas no están disponibles'
        )
      }

      try {
        const PreviewElectronicSalesButton = await frame.waitForSelector('span[id="inicioRVI.btnGeneraPreliminarRegVentas"]', {
          timeout: 10000,
          visible: true // default
        })

        await PreviewElectronicSalesButton.click()
      } catch (e) {
        throw new ElementNotFoundError(
          'El control para generar el preliminar del registro de ventas no está disponible'
        )
      }

      try {
        await frame.waitForSelector('#rvi_tabla > table', {
          timeout: 10000,
          visible: true // default
        })

        let newElectronicSalesDocuments = await frame.evaluate(() => {
          const rowNodeList = Array.from(
            document.querySelectorAll('#rvi_tabla > table tr')
          )

          return rowNodeList.map((tr) => {
            const dataNodeList = Array.from(
              tr.querySelectorAll('td')
            )

            const [
              accountingPeriod,
              operationUniqueCode,
              accountingCorrelativeNumber,
              documentEmissionDate,
              documentExpirationDate,
              documentType,
              documentSerial,
              documentNumber,
              finalNumber,
              customerIdentityId,
              customerIdentityNumber,
              customerName,
              exportAmount, // Exportación
              igvTaxable,
              taxableBaseDiscount,
              totalAmountExempt, // Exonerado
              totalAmountNonTaxable, // Inafecto
              totalAmountIsc,
              igvTax,
              igvTaxDiscount,
              ivapTaxable,
              ivapTax,
              others01,
              payableAmount,
              currencyCode,
              currencyExchange,
              referenceDocumentEmissionDate,
              referenceDocumentType,
              referenceDocumentSerial,
              referenceDocumentNumber
            ] = dataNodeList.map(td => td.textContent)

            return {
              accountingPeriod,
              operationUniqueCode,
              accountingCorrelativeNumber,
              documentEmissionDate,
              documentExpirationDate,
              documentType,
              documentSerial,
              documentNumber,
              finalNumber,
              customerIdentityId,
              customerIdentityNumber,
              customerName,
              exportAmount,
              igvTaxable,
              taxableBaseDiscount,
              totalAmountExempt, // Exonerado
              totalAmountNonTaxable, // Inafecto
              totalAmountIsc,
              igvTax,
              igvTaxDiscount,
              ivapTaxable,
              ivapTax,
              others01,
              payableAmount, // Total
              currencyCode,
              currencyExchange,
              referenceDocumentEmissionDate,
              referenceDocumentType,
              referenceDocumentSerial,
              referenceDocumentNumber
            }
          })
        })

        newElectronicSalesDocuments = newElectronicSalesDocuments.filter((cpe) => {
          const documentEmissionDate = moment(cpe.documentEmissionDate, 'DD/MM/YYYY')

          const itsCorrectEmissionDate = documentEmissionDate.isValid()

          if (itsCorrectEmissionDate) {
            return true
          } else {
            return false
          }
        }).map((cpe) => {
          let reference = undefined

          const customerIdentityParts = cpe.customerIdentityId.trim().split('-')

          const documentTypeParts = cpe.documentType.trim().split('-')

          const documentEmissionDate = moment(cpe.documentEmissionDate, 'DD/MM/YYYY')

          const documentExpirationDate = moment(cpe.documentExpirationDate, 'DD/MM/YYYY')

          const itsValidDocumentReference = (
            cpe.referenceDocumentType.trim() != "-" &&
            cpe.referenceDocumentSerial.trim() != "" &&
            cpe.referenceDocumentNumber.trim() != "" &&
            cpe.referenceDocumentEmissionDate.trim() != ""
          )

          if (itsValidDocumentReference) {
            reference = {
              type: cpe.referenceDocumentType.trim(),
              serial: cpe.referenceDocumentSerial.trim(),
              number: cpe.referenceDocumentNumber.trim(),
              emission: moment(cpe.referenceDocumentEmissionDate, 'DD/MM/YYYY').format('YYYY-MM-DD')
            }
          }

          return {
            accounting: {
              period: documentEmissionDate.format('YYYYMM00'),
              correlative: cpe.accountingCorrelativeNumber,
              cuo: cpe.operationUniqueCode
            },
            document: {
              currency: {
                code: cpe.currencyCode,
                exchange: (cpe.currencyCode !== 'PEN') ? cpe.currencyExchange : 1
              },
              type: documentTypeParts[0].trim(),
              serial: cpe.documentSerial,
              number: cpe.documentNumber,
              emission: documentEmissionDate.format('YYYY-MM-DD'),
              expiration: documentExpirationDate.isValid() ? documentExpirationDate.format('YYYY-MM-DD') : undefined
            },
            customer: {
              identity: {
                id: cpe.customerIdentityNumber.trim(),
                type: customerIdentityParts[0].trim()
              },
              name: cpe.customerName.trim()
            },
            taxes: {
              ivap: {
                taxable: cpe.ivapTaxable,
                tax: cpe.ivapTax
              },
              isc: {
                taxable: 0,
                tax: 0
              },
              igv: {
                taxable: (cpe.igvTaxable != "") ? cpe.igvTaxable : 0,
                tax: (cpe.igvTax != "") ? cpe.igvTax : 0
              }
            },
            amounts: {
              export: (cpe.exportAmount != "") ? cpe.exportAmount : 0,
              taxable: cpe.igvTaxable,
              exempt: cpe.totalAmountExempt,
              nonTaxable: cpe.totalAmountNonTaxable,
              payable: cpe.payableAmount
            },
            /*discounts: {

            },*/
            reference
          }
        })
      } catch (e) {
        throw new ElementNotFoundError(
          'La tabla con el preliminar del registro de ventas no está disponible'
        )
      }
    } catch (e) {
      throw e
    }
  } catch (e) {
    throw e
  } finally {
    await browser.close()
  }
}

module.exports = bot
