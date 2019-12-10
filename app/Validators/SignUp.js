'use strict'

class SignUp {
  
  get rules () {
    return {
      first_name: 'required',
      last_name: 'required',
      email: 'required|email',
      password: 'required',
      campus_id: 'required',
      profile_pics: 'file_ext:png,jpg|file_size:4mb|file_types:image'
    }
  }

  async fails (errorMessages) {
    return this.ctx.response.status(722).send({ errorMessages })
  }
}

module.exports = SignUp
