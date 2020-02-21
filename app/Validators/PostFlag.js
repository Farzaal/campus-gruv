'use strict'

class PostFlag {
  get rules () {
    return {
      post_id: 'required',
      reason: 'required',
    }
  }

  async fails (errorMessages) {
    return this.ctx.response.status(722).send({ errorMessages })
  }
}

module.exports = PostFlag
