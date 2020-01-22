'use strict'

class LikeValidation {
  get rules () {
    return {
      post_id: 'required',
      user_id: 'required',
      post_created_by: 'required' 
    }
  }

  async fails (errorMessages) {
    return this.ctx.response.status(722).send({ errorMessages })
  }
}

module.exports = LikeValidation
