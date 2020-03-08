'use strict'
const Logger = use('Logger')
const UserWiseComment = use('App/Models/UserWiseComment')
const UserWiseNotification = use('App/Models/UserWiseNotification')
const ApiService = use('App/Services/ApiService')

class CommentController {

  async createComment({ request, auth, response }) {
    const body = request.post()
    const user = await auth.getUser()
    const userJson = user.toJSON()
    const commentMsg = `${userJson.first_name} ${userJson.last_name} has commented on your post` 
    try {
      const comment = request.only(['description', 'user_id', 'post_id'])
      const user_notification = {
        post_id: body.post_id, 
        user_id: body.post_created_by,
        notification_by: userJson.id, 
        notification_message: commentMsg,
      };
      const saveComment = await UserWiseComment.create(comment)
      const saveNotification = await UserWiseNotification.create(user_notification)
      const saveCommentJson = saveComment.toJSON()
      const data = { post_id: body.post_id ,user_id: body.post_created_by, notification: commentMsg }
      const sendNotification = await ApiService.sendUserNotification(data);
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
