'use strict'

const Bot = require('./Bot')

module.exports = async (ruc, username, password, period) => {
  const bot = new Bot(ruc, username, password, period)

  try {
    await bot.openPage()

    await bot.login()

    await bot.closePopup()

    return await bot.data()
  } catch (e) {
    throw e
  } finally {
    await bot.closePage()
  }
}
