'use strict'

class UnlikePost {
  get rules () {
    return {
      like_id: 'required',
      user_id: 'required',
    }
  }

  async fails (errorMessages) {
    return this.ctx.response.status(722).send({ errorMessages })
  }
}

module.exports = UnlikePost
