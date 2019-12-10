'use strict'
const Model = use('Model')

class PostDetail extends Model {

  static get table () {
    return 'post_detail'
  }
  static scopeActive (query) {
    return query.where({active: 1})
  }
  static get hidden () {
    return ['active']
  }
  users(){
    return this.belongsTo('App/Models/User', 'user_id', 'id');
  }
  postMaster() {
    return this.belongsTo('App/Models/PostMaster', 'post_id', 'id');
  }
}

module.exports = PostDetail