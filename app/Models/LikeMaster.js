'use strict'
const Model = use('Model')
const Logger = use('Logger')

class LikeMaster extends Model {
  
  static get table () {
    return 'like_master'
  }
  static get hidden () {
    return ['active']
  }
  posts() {
    return this.belongsTo('App/Models/User');
  }
  likeDetail() {
    return this.hasMany('App/Models/LikeDetail','id','like_id');
  }
}

module.exports = LikeMaster
