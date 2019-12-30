'use strict'
const Model = use('Model')

class PostCategory extends Model {

    static get table () {
        return 'post_categories'
    }
    static scopeActive (query) {
        return query.where({active: 1})
    }
    static get hidden () {
        return ['active', 'created_at', 'updated_at']
    }
    posts() {
        return this.hasMany('App/Models/PostMaster', 'id', 'category_id')
    }
}

module.exports = PostCategory
