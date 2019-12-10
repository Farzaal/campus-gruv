'use strict'
const PostMaster = use('App/Models/PostMaster')
const PostDetail = use('App/Models/PostDetail')
const Cloudinary = use('Cloudinary')
const Logger = use('Logger')

class PostController {

    async createPost({ request, response }) {
        try {
            const postData = request.only(['user_id','category_id','title','description'])
            const post = await PostMaster.create(postData)
            const userPost = post.toJSON()
            return response.status(200).json(userPost)
        } catch(exp) {
            return response.status(400).json({ message: 'Unable to create post' })
        }
    }
    
    async postDetail({ request, response }) {
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
                    console.log(exp)
                    Logger.info({ url: request.url(), Exception: exp.message})
                }
            }
            return response.status(201).json(postDetails)
        }  
        return response.status(400).json({message})      
    }
}

module.exports = PostController
