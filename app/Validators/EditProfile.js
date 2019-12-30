'use strict'

class EditProfile {
  get rules () {
    return {
      campus_id: 'required',
      profile_pic: 'file_ext:png,jpg|file_size:4mb|file_types:image'
    }
  }

  async fails (errorMessages) {
    return this.ctx.response.status(722).send({ errorMessages })
  }
}

module.exports = EditProfile
