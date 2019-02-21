const puppeteer = require('puppeteer');

const IDENTITY = '10106249461'
const USERNAME = 'RASANKFO'
const PASSWORD = 'ouprolden'

async function getPic() {
  const browser = await puppeteer.launch({
    headless: false
  });

  const page = await browser.newPage();

  page.setDefaultTimeout(4000) // configurando el tiempo de espera para métodos

  await page.goto('https://e-menu.sunat.gob.pe/cl-ti-itmenu/MenuInternet.htm');

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

    await TaxpayerIdentityInput.type(IDENTITY, {
      //delay: 100
    })

    await TaxpayerUsernameInput.type(USERNAME, {
      //delay: 100
    })

    await TaxpayerPasswordInput.type(PASSWORD, {
      //delay: 100
    })

    await LoginButton.click()
  } catch (e) {
    throw e
  }

  try {
    // deshabilitamos la opción "visible", porque el iframe puede estar oculto al no haber alertas
    await page.waitFor('iframe#ifrVCE', {
      timeout: 10000,
      visible: false // default
    })

    // evaluamos y extraemos el iframe que necestiamos
    const PopupIframe = page.frames().find(frame => frame.name() === 'ifrVCE')

    try {
      await PopupIframe.waitForSelector('body.tundra', {
        timeout: 10000,
        visible: false // default
      })

      console.log('Existen alertas')
    } catch (e) {
      console.log('NO existen alertas')
    }
  } catch (e) {
    throw e
  }

  await browser.close()
}

getPic();
