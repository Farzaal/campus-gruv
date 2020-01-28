'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class PostMaster extends Model {

  static get table () {
    return 'post_master'
  }
  static get hidden () {
    return ['active', 'category_id', 'campus_id', 'created_at', 'updated_at']
  }
  static scopeActive (query) {
    return query.where({active: 1})
  }
  users() {
    return this.belongsTo('App/Models/User');
  }
  campuses() {
    return this.belongsTo('App/Models/Campus');
  }
  postCategory(){
    return this.belongsTo('App/Models/PostCategory', 'category_id', 'id');
  }
  postDetail() {
    return this.hasMany('App/Models/PostDetail', 'id', 'post_id')
  }
  comments() {
    return this.hasMany('App/Models/UserWiseComment', 'id', 'post_id')
  }
  userSavedPost() {
    return this.hasMany('App/Models/UserSavedPost', 'id', 'post_id')
  }
  userWiseLike() {
    return this.hasMany('App/Models/UserWiseLike', 'id', 'post_id')
  }
  userFollowing() {
    return this.hasMany('App/Models/UserFollower', 'user_id', 'user_id')
  }
}

module.exports = PostMaster