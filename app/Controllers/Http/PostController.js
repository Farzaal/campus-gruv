'use strict'
const PostMaster = use('App/Models/PostMaster')
const PostDetail = use('App/Models/PostDetail')
const UserSavedPost = use('App/Models/UserSavedPost')
const Cloudinary = use('Cloudinary')
const Logger = use('Logger')
const Database = use('Database')
const R = use('ramda')


class PostController {

    async createPost({ request, auth, response }) {
        try {
            const postData = request.only(['user_id','category_id','title','description'])
            const authUser = await auth.getUser()
            const { campus_id } = authUser.toJSON()
            postData.campus_id = campus_id 
            const post = await PostMaster.create(postData)
            const userPost = post.toJSON()
            return response.status(200).json(userPost)
        } catch(exp) {
            return response.status(400).json({ message: 'Unable to create post' })
        }
    }
    
    async postDetail({ request, auth, response }) {
        const body = request.post()
        const postDetailImages = request.file('post_detail_images')
        const postMaster = PostMaster.find(body.post_id)
        let message = 'Unable to save post detail'
        let postDetails = []
        if(postDetailImages) {
            let filesCount = 1;
            if(postDetailImages['_files']) {
                filesCount = postDetailImages['_files'].length;
            }
            for(let i = 0; i < filesCount; i++) {
                try {
                    let cloudinaryMeta = await Cloudinary.uploader.upload(postDetailImages['_files'][i].tmpPath)
                    const postDetail = new PostDetail()
                    postDetail.post_id = body.post_id 
                    postDetail.user_id = body.user_id
                    postDetail.image_url = cloudinaryMeta.secure_url
                    request.post_detail_title ? body.post_detail_title = request.post_detail_title : postDetail.post_detail_title = 'No Title'  
                    await postDetail.save()
                    postDetails.push(postDetail)
                } catch(exp) {
                    Logger.info({ url: request.url(), Exception: exp.message})
                    return response.status(400).json({message: exp.message})      
                }
            }
            return response.status(201).json(postDetails)
        }  
        return response.status(400).json({message})      
    }

    async fecthUserSavedPosts({ request, auth, response }) {
        try { 
            const page = request.input('page', 1)
            const authUser = await auth.getUser()
            const authUserJson = authUser.toJSON()
            const savePostIds = await UserSavedPost.query().where('user_id', authUserJson.id).select('post_id').fetch()
            const postIds = R.pluck('post_id')(savePostIds.toJSON())
            const posts = await PostMaster.query().whereIn('id', postIds)
            .with('postDetail')
            .with('comments')
            .with('users')
            .with('postCategory')
            .with('campuses')
            .orderBy('created_at', 'DESC').paginate(page)
            const postsJson = posts.toJSON()
            return response.status(200).json(postsJson)
        } catch (e) {
            Logger.info({ url: request.url(), Exception: e.message})
            return response.status(200).json({ message: 'Something went wrong. Unable to get saved posts' })
        }
    }

    async userSavePost({ request, auth, response }) {
        try {
            const { post_id } = request.post()
            const authUser = await auth.getUser()
            const authUserJson = authUser.toJSON()
            const userSavePost = new UserSavedPost()
            userSavePost.post_id = post_id
            userSavePost.user_id = authUserJson.id
            await userSavePost.save()
            return response.status(200).json({ message: 'Post Saved Successfully' })
        } catch(e) {
            Logger.info({ url: request.url(), exception: e.message })
            return response.status(400).json({ message: 'Post already saved' })
        }
    }
}

module.exports = PostController
