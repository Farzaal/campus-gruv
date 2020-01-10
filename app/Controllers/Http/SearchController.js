'use strict'
const R = use('ramda')
const PostMaster = use('App/Models/PostMaster')
const User = use('App/Models/User')
const Campus = use('App/Models/Campus')

class SearchController {

    async searchPost({ request, auth, response }) {
        const body = request.get()
        const { type, page } = body
        const { campus_id } = await this.getFromAuthUser(auth)

        if(R.equals(type, 'post_all')) {
            const posts = await PostMaster.query().where('campus_id', campus_id)
                .with('postDetail')
                .with('comments.user')
                .with('users')
                .with('postCategory')
                .with('campuses')
                .orderBy('created_at', 'DESC').paginate(page)
            const postsJson = posts.toJSON()
            //console.log(postsJson,'postsJson');
            return response.status(200).json(postsJson) 
        }

        if(R.equals(type, 'post_category') && body.category_id) {
            const posts = await PostMaster.query().where('campus_id', campus_id).where('category_id', body.category_id)
            .with('postDetail')
            .with('comments')
            .with('users')
            .with('postCategory')
            .with('campuses')
            .orderBy('created_at', 'DESC').paginate(page)
            const postsJson = posts.toJSON()
            return response.status(200).json(postsJson) 
        }
        if(R.equals(type, 'post_search') && body.description) {
            const posts = await PostMaster.query().where('campus_id', campus_id).where('title', 'LIKE', `%${body.description}%`)
            .with('postDetail')
            .with('comments')
            .with('users')
            .with('postCategory')
            .with('campuses')
            .orderBy('created_at', 'DESC').paginate(page)
            const postsJson = posts.toJSON()
            return response.status(200).json(postsJson) 
        }
        return response.status(400).json({ message: 'Invalid Type or missing required param' })
    }
    
    async searchUsers({ request, auth, response }) {
        const body = request.get()
        const { type, page } = body
        const { campus_id } = await this.getFromAuthUser(auth)
        if(R.equals(type, 'post') && body.user_id) {
            const posts = await PostMaster.query().where('user_id', body.user_id)
            .with('postDetail')
            .with('comments')
            .with('users')
            .with('postCategory')
            .with('campuses')
            .orderBy('created_at', 'DESC').paginate(page)
            const postsJson = posts.toJSON()
            return response.status(200).json(postsJson) 
        }
        if(R.equals(type, 'user') && body.description) {
            const users = await User.query().where('campus_id', campus_id).where('first_name', 'LIKE', `%${body.description}%`)
            .with('campus')
            .orderBy('created_at', 'DESC').paginate(page)
            const usersJson = users.toJSON()
            return response.status(200).json(usersJson) 
        }
        return response.status(400).json({ message: 'Invalid Type or missing required param' })
    }

    async searchCampus({ request, response }) {
        const body = request.get()
        if(!body.description) {
            return response.status(722).json({ message: 'Description is required' })
        }
        const { page, description } = body
        const campuses = await Campus.query().where('description', 'LIKE', `%${description}%`).paginate(page)
        const campusJson = campuses.toJSON()
        return response.status(200).json(campusJson)
    }

    async getFromAuthUser(auth) {
        const authUser = await auth.getUser()
        const authUserJson = authUser.toJSON()
        return authUserJson
    }
}

module.exports = SearchController
