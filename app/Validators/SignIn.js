'use strict'

class SignIn {
  
  get rules () {
    return {
      email: 'required|email',
      password: 'required'
    }
  }

  async fails (errorMessages) {
    return this.ctx.response.status(722).send({ errorMessages })
  }
}

module.exports = SignIn
