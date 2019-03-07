'use strict'

function LoginFormSOL(ruc, username, password) {
  let _args = {
    ruc,
    username,
    password
  }

  Object.defineProperty(this, 'ruc', {
    get: () => { return _args.ruc },
  })

  Object.defineProperty(this, 'username', {
    get: () => { return _args.username },
  })

  Object.defineProperty(this, 'password', {
    get: () => { return _args.password },
  })
}

/**
 * Inicia sesión
 * @param  {[type]} page Página web donde iniciará sesión
 */
LoginFormSOL.prototype.login = async function(page) {
  // Activamos la opción de logeo con RUC
  try {
    const RucAccessButton = await page.waitForSelector('button#btnPorRuc', {
      timeout: 5000, // Wait five seconds
      visible: true // Wait for element to be present in DOM and to be visible
    })

    await RucAccessButton.click()
  } catch (e) {
    throw new Error(
      'La opción para autenticar con RUC no está disponible'
    )
  }

  // Ingresamos los datos de acceso e iniciamos sesión
  try {
    const LoginButton = await page.waitForSelector('button#btnAceptar', {
      timeout: 5000,
      visible: true
    })

    const TaxpayerRucInput = await page.waitForSelector('input#txtRuc', {
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

    await TaxpayerRucInput.type(this.ruc)

    await TaxpayerUsernameInput.type(this.username)

    await TaxpayerPasswordInput.type(this.password)

    await LoginButton.click()
  } catch (e) {
    throw new Error(
      'Los controles de autenticación no están disponibles'
    )
  }
}

module.exports = LoginFormSOL
