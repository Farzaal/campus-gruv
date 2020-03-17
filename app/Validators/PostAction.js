'use strict'

class PostAction {
  get rules () {
    return {
      action: 'Action|required',
      apply_action: 'In|required',
      apply_to: 'required',      
    }
  }

  async fails (errorMessages) {
    return this.ctx.response.status(722).send({ errorMessages })
  }
}

module.exports = PostAction
