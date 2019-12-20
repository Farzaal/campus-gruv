'use strict'
const Model = use('Model')

class UserWiseLike extends Model {

  static get table () {
    return 'user_wise_likes'
  }
  users() {
    return this.belongsTo('App/Models/User', 'user_id', 'id');
  }
  posts(){
    return this.belongsTo('App/Models/PostMaster', 'post_id', 'id');
  }
}

module.exports = UserWiseLike