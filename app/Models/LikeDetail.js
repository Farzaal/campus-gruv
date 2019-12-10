'use strict'
const Model = use('Model')

class LikeDetail extends Model {
  
  static get table () {
    return 'like_detail'
  }
  static get hidden () {
    return ['active']
  }
  likeMaster() {
    return this.belongsTo('App/Models/LikeMaster','like_id','id')
  }
}

module.exports = LikeDetail
