'use strict'

function ElementNotFoundError(message) {
  this._super.call(this, message)

  this.message = message
}

// errors will inherit from a new object
// which inherits from the parent
ElementNotFoundError.prototype = Object.create(Error.prototype)

// set the constructor property back to the ElementNotFoundError
// constructor function
ElementNotFoundError.prototype.constructor = ElementNotFoundError

// "_super" is NOT part of ES5, its a convention
// defined by the developer
// set the "_super" to the error constructor function
ElementNotFoundError.prototype._super = Error

module.exports = ElementNotFoundError
