'use strict'

class VerifyUserOtp {
  get rules () {
    return {
      type: 'required',
      email: 'required',
      otp: 'required'
    }
  }

  async fails (errorMessages) {
    return this.ctx.response.status(722).send({ errorMessages })
  }
}

module.exports = VerifyUserOtp
