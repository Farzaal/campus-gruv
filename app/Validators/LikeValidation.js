'use strict'

class LikeValidation {
  get rules () {
    return {
      post_id: 'required',
      user_id: 'required',
    }
  }

  async fails (errorMessages) {
    return this.ctx.response.status(722).send({ errorMessages })
  }
}

module.exports = LikeValidation
