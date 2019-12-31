'use strict'

class Search {
  get rules () {
    return {
      type: 'required',
      page: 'required'
    }
  }

  async fails (errorMessages) {
    return this.ctx.response.status(722).send({ errorMessages })
  }
}

module.exports = Search
