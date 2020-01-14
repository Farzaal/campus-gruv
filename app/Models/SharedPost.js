'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class SharedPost extends Model {
  
  static get table () {
    return 'Shared_Posts'
}

static get hidden () {
    return ['created_at', 'updated_at']
}

post(){
  return this.belongsTo('App/Models/PostMaster', 'post_id', 'id');
}

user(){
  return this.belongsTo('App/Models/User', 'user_id', 'id');
}

}

module.exports = SharedPost
