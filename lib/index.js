const puppeteer = require('puppeteer');

async function getPic() {
  const browser = await puppeteer.launch({
    headless: false
  });

  const page = await browser.newPage();

  page.setDefaultTimeout(4000) // configurando el tiempo de espera para métodos

  await page.goto('https://e-menu.sunat.gob.pe/cl-ti-itmenu/MenuInternet.htm');
}

getPic();
