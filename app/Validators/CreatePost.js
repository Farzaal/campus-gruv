'use strict'

class CreatePost {
  get rules () {
    return {
      user_id: 'required',
      category_id: 'required',
      title: 'required',
      description: 'required',
    }
  }

  async fails (errorMessages) {
    return this.ctx.response.status(722).send({ errorMessages })
  }
}

module.exports = CreatePost
