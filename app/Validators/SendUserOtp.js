'use strict'

class SendUserOtp {
  get rules () {
    return {
      email: 'required',
      type: 'required'
    }
  }

  async fails (errorMessages) {
    return this.ctx.response.status(722).send({ errorMessages })
  }
}

module.exports = SendUserOtp
