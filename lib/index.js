const puppeteer = require('puppeteer');

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

    await TaxpayerIdentityInput.type('10106249461', {
      //delay: 100
    })

    await TaxpayerUsernameInput.type('RASANKFO', {
      //delay: 100
    })

    await TaxpayerPasswordInput.type('ouprolden', {
      //delay: 100
    })
  } catch (e) {
    throw e
  }
}

getPic();
