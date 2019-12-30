'use strict'
const PostCategory = use('App/Models/PostCategory')
const Campus = use('App/Models/Campus')

class SettingController {

    async fetchCampuses({ request, response }) {
        const campuses = await Campus.query().active().fetch()
        const campusesJson = campuses.toJSON()
        return response.status(200).json(campusesJson)
    }

    async fetchPostCategories({ request, response }) {
        const postCateogires = await PostCategory.query().active().fetch()
        const postCateogiresJson = postCateogires.toJSON()
        return response.status(200).json(postCateogiresJson)
    }
}

module.exports = SettingController
