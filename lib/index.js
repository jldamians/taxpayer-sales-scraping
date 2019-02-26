const puppeteer = require('puppeteer');

/*
  const IDENTITY = '10460033280'
  const USERNAME = 'BLEXHUGA'
  const PASSWORD = 'jlds161089'
*/


  const IDENTITY = '10106249461'
  const USERNAME = 'RASANKFO'
  const PASSWORD = 'ouprolden'

const PERIOD = '02/2019'


async function getPic() {
  const browser = await puppeteer.launch({
    headless: false
  });

  const page = await browser.newPage();

  await page.setDefaultTimeout(10000) // configurando el tiempo de espera para métodos

  try {
    await page.goto('https://e-menu.sunat.gob.pe/cl-ti-itmenu/MenuInternet.htm', {
      timeout: 30000
    });
  } catch (e) {
    throw e
  }

  try {
    const IdentityAccessButton = await page.waitForSelector('button#btnPorRuc', {
      timeout: 5000, // wait five seconds
      visible: true // wait for element to be present in DOM and to be visible
    })

    await IdentityAccessButton.click()
  } catch (e) {
    throw e
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

    await TaxpayerIdentityInput.type(IDENTITY)

    await TaxpayerUsernameInput.type(USERNAME)

    await TaxpayerPasswordInput.type(PASSWORD)

    await LoginButton.click()
  } catch (e) {
    throw e
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

        // TODO: actualmente dormimos el proceso por 5s para que termine de carga el evento
        // del elemento seleccionado. Queda pendiente ver otra forma de cerrar el segundo modal
        await PopupIframe.waitFor(1000)

        await ContinueWithoutConfirmingButton.click()
      } catch (e) {
        // NOTE: Controlar la excepción puesto que los Pop-Up son opcionales

        //throw e
      }
    } catch (e) {
      // NOTE: Controlar la excepción puesto que los Pop-Up son opcionales

      //throw e
    }
  } catch (e) {
    // TODO: Lanzar excepción cuando no se encuentre la sección de Pop-Up

    throw e
  }

  try {
    await page.waitForSelector('#nivel4_25_2_1_1_4', {
      timeout: 5000,
      visible: false
    })

    await page.evaluate(()=> {
      const PreviewElectronicSalesBook = document.querySelector('#nivel4_25_2_1_1_4')

      PreviewElectronicSalesBook.click()
    })
  } catch (e) {
    throw e
  }

  try {
    await page.waitFor('iframe#iframeApplication', {
      timeout: 10000,
      visible: false
    })

    await page.waitFor(1000)

    const ApplicationIframe = await page.$('iframe#iframeApplication')

    const frame = await ApplicationIframe.contentFrame()

    const ConditionsCheck = await frame.waitForSelector('input[name="condiciones.cbTerminos"]', {
      timeout: 10000,
      visible: true // default
    })

    await ConditionsCheck.click()

    const ContinueButton = await frame.waitForSelector('span[id="condiciones.btnContinuar"]', {
      timeout: 10000,
      visible: true // default
    })

    await ContinueButton.click()

    const PeriodInput = await frame.waitForSelector('input[name="periodoRegistroVentasConMovim"]', {
      timeout: 10000,
      visible: true // default
    })

    await PeriodInput.type(PERIOD)

    const ElectronicSalesButton = await frame.waitForSelector('span[id="inicio.btnIrRegVentas"]', {
      timeout: 10000,
      visible: true // default
    })

    await ElectronicSalesButton.click()
  } catch (e) {
    throw e
  }

  await browser.close()
}

getPic();
