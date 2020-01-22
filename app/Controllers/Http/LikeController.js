'use strict'
const Logger = use('Logger')
const PostMaster = use('App/Models/PostMaster')
const UserWiseLike = use('App/Models/UserWiseLike')
const Database = use('Database')

class LikeController {

    async likePost({ request, auth, response }) {
        const body = request.post()
        const user = await auth.getUser()
        const userJson = user.toJSON()
        const likeMsg = `${userJson.first_name} ${userJson.last_name} has liked your post` 
        const trx = await Database.beginTransaction()
        try {
            await trx.table('post_master').where('id', body.post_id).increment('likes_count', 1)
            
            await trx.insert({ post_id: body.post_id, user_id: body.user_id,
            created_at: new Date(), updated_at: new Date() }).into('user_wise_likes')
            
            await trx.insert({ post_id: body.post_id, user_id: body.post_created_by, notification_message: likeMsg,
            created_at: new Date(), updated_at: new Date() }).into('user_wise_notifications')
            
            await trx.commit()
            return response.status(201).json({ message: 'Post liked successfully' })
        } catch(e) {
            Logger.info({ url: request.url(), Exception: e.message})
            await trx.rollback() 
            console.log(e);
            return response.status(400).json({ message: 'Unable to like post' })
        }
    }
    
    async unlikePost({ request, auth, response }) {
        const body = request.post()
        const user = await auth.getUser()
        const userJson = user.toJSON()
        const likeMsg = `${userJson.first_name} ${userJson.last_name} has disliked your post` 
        const trx = await Database.beginTransaction()
        try {
            await trx.table('post_master').where('id', body.post_id).decrement('likes_count', 1)
            await trx.table('user_wise_likes')
                    .where('post_id', body.post_id)
                    .where('user_id', body.user_id).delete()
            await trx.insert({ post_id: body.post_id, user_id: body.post_created_by, notification_message: likeMsg,
                    created_at: new Date(), updated_at: new Date() }).into('user_wise_notifications')
                    await trx.commit()
            return response.status(201).json({ message: 'Post disliked successfully' })
        } catch(e) {
            console.log(e)
            Logger.info({ url: request.url(), Exception: e.message})
            await trx.rollback() 
            return response.status(400).json({ message: 'Unable to dislike post' })
        }
    }
}

module.exports = LikeController
