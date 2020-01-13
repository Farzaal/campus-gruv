'use strict'
const Model = use('Model')

class UserWisePostFlag extends Model {

  static get table () {
    return 'user_wise_post_flag'
  }
  users() {
    return this.belongsTo('App/Models/User', 'user_id', 'id');
  }
  posts(){
    return this.belongsTo('App/Models/PostMaster', 'post_id', 'id');
  }
}

module.exports = UserWisePostFlag