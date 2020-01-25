'use strict'
const Model = use('Model')

class UserWiseNotification extends Model {

  static get table () {
    return 'user_wise_notifications'
  }
  user() {
    return this.belongsTo('App/Models/User', 'user_id', 'id');
  }
  userNotification() {
    return this.belongsTo('App/Models/User', 'notification_by', 'id');
  }
  posts(){
    return this.belongsTo('App/Models/PostMaster', 'post_id', 'id');
  }
}

module.exports = UserWiseNotification