'use strict'

function SalesPreviewSOL(period, page = null, workspace = null) {
  let _args = {
    period,
    page,
    workspace
  }

  Object.defineProperty(this, 'period', {
    get: () => { return _args.information.period }
  })

  Object.defineProperty(this, 'page', {
    get: () => { return _args.information.page },
    set: (value) => { _args.information.page = value }
  })

  Object.defineProperty(this, 'workspace', {
    get: () => { return _args.information.workspace },
    set: (value) => { _args.information.workspace = value }
  })
}

SalesPreviewSOL.prototype.goto = async function(page) {
  this.page = page

  try {
    await _gotoPreviewLink.bind(this)()

    this.workspace = await _getWorkspace.bind(this)()

    await _acceptConditions.bind(this)()

    await _generateSalesPreview.bind(this)()
  } catch (e) {
    throw e
  }
}

SalesPreviewSOL.prototype.data = async function() {
  return await _getSalesPreview.bind(this)()
}

/**
 * Linkea a la opción "Preliminar del Registro de Ventas Electrónico"
 */
async function _gotoPreviewLink() {
  try {
    // Esperamos que el menú "Preliminar del Registro de Ventas Electrónico"
    // esté presente en el DOM, sin importar que esté visible
    await this.page.waitForSelector('#nivel4_25_2_1_1_4', {
      timeout: 5000,
      visible: false
    })

    // Cuando un elemento presente en el DOM no es visible,
    // esta es la única forma de acceder a sus eventos (click)
    await this.page.evaluate(()=> {
      const PreviewElectronicSalesBook = document.querySelector('#nivel4_25_2_1_1_4')

      PreviewElectronicSalesBook.click()
    })
  } catch (e) {
    throw new Error(
      'El menú para acceder al registro preliminar de ventas no está disponible'
    )
  }
}

/**
 * Obtiene el espacio de trabajo desde donde extraremos los registros de ventas
 */
async function _getWorkspace() {
  try {
    // Esperamos que el iframe donde se muestra el "Preliminar del Registro de Ventas e Ingresos"
    // esté presente en el DOM, para poder acceder a los comprobantes registrados
    await this.page.waitFor('iframe#iframeApplication', {
      timeout: 10000,
      visible: true
    })

    // NOTE: Esto es necesario para que "puppeteer"
    // pueda optener correctamente el iframe
    await this.page.waitFor(1000)

    const frame = await this.page.$('iframe#iframeApplication')

    return await frame.contentFrame()
  } catch (e) {
    throw e
  }
}

/**
 * Acepta las condiciones para ser "Generador Electrónico"
 */
async function _acceptConditions() {
  try {
    // TODO: No lanzar excepción, puesto que esto es opcional, es decir puede no existir
    // Declaramos conocer los terminos y condiciones
    const ConditionsCheck = await this.workspace.waitForSelector('input[name="condiciones.cbTerminos"]', {
      timeout: 10000,
      visible: true // default
    })

    await ConditionsCheck.click()

    // TODO: No lanzar excepción, puesto que esto es opcional, es decir puede no existir
    // Aceptamos los terminos y condiciones
    const ContinueButton = await this.workspace.waitForSelector('span[id="condiciones.btnContinuar"]', {
      timeout: 10000,
      visible: true // default
    })

    await ContinueButton.click()
  } catch (e) {
    // NO generar excepción
    //throw e
  }
}

/**
 * Genera el registro preliminar de ventas electrónico
 */
async function _generateSalesPreview() {
  try {
    const PeriodInput = await this.workspace.waitForSelector('input[name="periodoRegistroVentasConMovim"]', {
      timeout: 10000,
      visible: true // default
    })

    await PeriodInput.type(Period)

    const ElectronicSalesButton = await this.workspace.waitForSelector('span[id="inicio.btnIrRegVentas"]', {
      timeout: 10000,
      visible: true // default
    })

    await ElectronicSalesButton.click()
  } catch (e) {
    throw new Error(
      'Los controles para acceder al registro de ventas no están disponibles'
    )
  }

  try {
    const PreviewElectronicSalesButton = await this.workspace.waitForSelector('span[id="inicioRVI.btnGeneraPreliminarRegVentas"]', {
      timeout: 10000,
      visible: true // default
    })

    await PreviewElectronicSalesButton.click()
  } catch (e) {
    throw new Error(
      'El control para generar el preliminar del registro de ventas no está disponible'
    )
  }
}

/**
 * Obtiene los cpe listados en el registro de ventas
 */
async function _getSalesPreview() {
  try {
    await this.workspace.waitForSelector('#rvi_tabla > table', {
      timeout: 10000,
      visible: true // default
    })

    let newElectronicSalesDocuments = await this.workspace.evaluate(() => {
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

    return newElectronicSalesDocuments.filter((cpe) => {
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

      // validando si el cpe tiene documento de referencia
      // esto es válido solo para las notas de crédito y débito
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
            exchange: _exchange(cpe.currencyCode)
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
            taxableAmount: _amount(cpe.ivapTaxable), // base imponible
            taxAmount: _amount(cpe.ivapTax) //
          },
          isc: {
            taxableAmount: 0,
            taxAmount: 0
          },
          igv: {
            taxableAmount: _amount(cpe.igvTaxable),
            taxAmount: _amount(cpe.igvTax)
          }
        },
        amounts: {
          export: _amount(cpe.exportAmount), // monto exportación
          taxable: _amount(cpe.igvTaxable), // monto gravado
          exempt: _amount(cpe.totalAmountExempt), // monto exonerado
          nonTaxable: _amount(cpe.totalAmountNonTaxable), // monto inafecto
          payable: _amount(cpe.payableAmount) // monto total
        },
        //discounts: {},
        reference
      }
    })
  } catch (e) {
    throw new Error(
      'La tabla con el preliminar del registro de ventas no está disponible'
    )
  }
}

module.exports = SalesPreviewSOL
