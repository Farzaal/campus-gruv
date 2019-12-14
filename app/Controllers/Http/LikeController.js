'use strict'
const Logger = use('Logger')
const LikeMaster = use('App/Models/LikeMaster')
const LikeDetail = use('App/Models/LikeDetail')

class LikeController {

    async likePost({ request, auth, response }) {

        let likeCount = 1
        let likeMasterData = request.only(['post_id'])
        let likeDetailData = request.only(['user_id'])
        try {
            const likeMaster = await LikeMaster.findOrCreate(likeMasterData, likeMasterData)
            const likeMasterJson = likeMaster.toJSON()
            if (likeMasterJson.like_count) {
                likeCount = parseInt(likeMasterJson.like_count + 1)
            }
            likeDetailData = { ...likeDetailData, like_id: likeMasterJson.id }
            const likeDetail = await LikeDetail.create(likeDetailData)
            if (likeDetail) {
                likeMaster.like_count = likeCount
                await likeMaster.save()
            }
            return response.status(201).json({ message: 'Like Created Successfully' })
        } catch (exp) {
            console.log(exp)
            Logger.info({ url: request.url(), Exception: exp.message })
            return response.status(400).json({ message: 'Unable to like this post. Something went wrong' })
        }
    }

    async unlikePost({ request, auth, response }) {
        
        const body = request.post()
            const likeDel = await LikeDetail.query().where('like_id', body.like_id).where('user_id', body.user_id).delete()
            if(likeDel) {
                const likeMaster = await LikeMaster.find(body.like_id)
                const likeMasterJson = likeMaster.toJSON()
                const count = parseInt(likeMasterJson.like_count-1)
                likeMaster.like_count = count
                await likeMaster.save()
                return response.status(200).json({ message: 'Post dislike successfully' })
            }
            return response.status(400).json({ message: 'Unable to dislike post. Something went wrong' })
    }
}

module.exports = LikeController
