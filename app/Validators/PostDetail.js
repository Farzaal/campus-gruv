'use strict'

class PostDetail {

    get rules () {
        return {
          user_id: 'required',
          post_id: 'required',
          post_detail_images: 'file_ext:png,jpg|file_size:4mb|file_types:image'
        }
    }
    
    async fails (errorMessages) {
        return this.ctx.response.status(722).send({ errorMessages })
    }
}

module.exports = PostDetail
