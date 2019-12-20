'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class PostMaster extends Model {

  static get table () {
    return 'post_master'
  }
  static get hidden () {
    return ['active']
  }
  static scopeActive (query) {
    return query.where({active: 1})
  }
  users() {
    return this.belongsTo('App/Models/User');
  }
  category(){
    return this.belongsTo('App/Models/DefinitionTypeDetail', 'category_id', 'id');
  }
  postDetail() {
    return this.hasMany('App/Models/PostDetail', 'id', 'post_id')
  }
}

module.exports = PostMaster