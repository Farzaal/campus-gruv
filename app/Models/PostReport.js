'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class PostReport extends Model {
    static get table () {
        return 'post_reports'
      }
      users() {
        return this.belongsTo('App/Models/User', 'user_id', 'id');
      }
      posts(){
        return this.belongsTo('App/Models/PostMaster', 'post_id', 'id');
      }
}

module.exports = PostReport
