'use strict'
const Logger = use('Logger')
const UserWiseComment = use('App/Models/UserWiseComment')

class CommentController {

  async createComment({ request, auth, response }) {
    try {
      const comment = request.only(['description', 'user_id', 'post_id'])
      const saveComment = await UserWiseComment.create(comment)
      const saveCommentJson = saveComment.toJSON()
      return response.status(200).json(saveCommentJson)
    } catch (exp) {
      console.log(exp)
      return response.status(400).json({ message: 'Unable to save comment' })
    }
  }
  
  async editComment({ request, auth, response }) {
    const { comment_id, description } = request.all() 
    if(!comment_id || !description) {
        return response.status(722).json({message: 'Missing comment_id or description'})
    }
    try {
      const comment = await UserWiseComment.query().where('id', comment_id).update({ description: description })
      return response.status(201).json({ message: 'comment edited successfully' })
    } catch (e) {
      Logger.info({ url: request.url(), Exception: e.message})
      return response.status(400).json({ message: 'Unable to edit comment' })
    }
  }
  
  async deleteComment({ request, auth, response }) {
    const { comment_id } = request.get()
    if(!comment_id) {
      return response.status(722).json({message: 'comment_id is required'})
    }
    const userComment = await UserWiseComment.find(comment_id)
    if(!userComment) {
      return response.status(404).json({ message: 'No such comment found' })
    }
    await userComment.delete()
    return response.status(200).json({ message: 'Comment deleted successfully' })
  }
}

module.exports = CommentController
