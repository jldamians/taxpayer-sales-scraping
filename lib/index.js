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
}

getPic();
